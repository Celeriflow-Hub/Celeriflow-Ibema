"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import { generatePortalToken } from "@/lib/frotas/portal";
import { fleetScope } from "@/lib/frotas/service";
import { confirmFuelOrderOnce, FuelOrderError } from "@/lib/frotas/fuel-order";
import { requireValidCpf, requireValidCnpj } from "@/lib/identifiers/brazilian-identifiers";
import { cnhAllows, cnhStatus, newFuelOrderCode, quotaCheck, validateReading, type MeterType } from "@/lib/frotas/gestao-engine";
import { fuelBalanceCheck } from "@/lib/frotas/gestao-engine";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => { const v = str(f, k).replace(",", "."); return v === "" ? null : Number(v); };
const req = (f: FormData, k: string, label: string) => { const v = str(f, k); if (!v) throw new UserError(`Informe ${label}.`); return v; };
class UserError extends Error {}

/** The server action must apply the same departmental scope as the Frota pages. */
function assertScopedUnit(unit: { departmentId: string | null } | null, scope: ReturnType<typeof fleetScope>) {
  if (!unit || (!scope.administrator && unit.departmentId !== scope.departmentId)) {
    throw new UserError("Veículo não encontrado ou fora do seu setor.");
  }
}

async function run(tab: string, op: "create" | "update", fn: (ctx: Awaited<ReturnType<typeof getTenantContextForModuleOperation>>) => Promise<{ type: string; id: string } | void>) {
  let message = "ok=1";
  try {
    const ctx = await getTenantContextForModuleOperation("FROTAS", op);
    const target = await fn(ctx);
    if (target) await writeAuditEvent(ctx.prisma, { actorUsuarioId: ctx.user.id, eventType: auditEventTypes.formSubmit, targetType: target.type, targetId: target.id });
  } catch (error) {
    const text = error instanceof UserError || error instanceof FuelOrderError ? error.message : error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" ? "Já existe um registro com esse identificador." : error instanceof Error && "status" in error ? error.message : "Não foi possível salvar. Confira os dados.";
    message = `erro=${encodeURIComponent(text)}`;
  }
  revalidatePath("/frotas/gestao");
  redirect(`/frotas/gestao?aba=${tab}&${message}`);
}

export async function saveMeter(f: FormData) {
  await run("veiculos", "update", async (ctx) => {
    const { prisma } = ctx, scope = fleetScope(ctx);
    const id = req(f, "unitId", "o veículo");
    const meterType = str(f, "meterType") === "HORIMETRO" ? "HORIMETRO" : "HODOMETRO";
    const reading = num(f, "currentReading"), expected = num(f, "expectedConsumption");
    if (reading != null && (!Number.isFinite(reading) || reading < 0)) throw new UserError("Leitura inválida.");
    if (expected != null && (!Number.isFinite(expected) || expected <= 0)) throw new UserError("Consumo esperado inválido.");
    await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetUnit" WHERE "id" = ${id} FOR UPDATE`;
      if (!locked.length) throw new UserError("Veículo não encontrado.");
      const unit = await tx.fleetUnit.findUniqueOrThrow({ where: { id } });
      assertScopedUnit(unit, scope);
      if (reading != null) {
        const problem = validateReading(unit.currentReading == null ? null : Number(unit.currentReading), reading, meterType as MeterType);
        if (problem) throw new UserError(problem);
      }
      if (meterType !== unit.meterType && unit.currentReading != null) throw new UserError("Altere o tipo de medidor somente mediante procedimento de correção de histórico.");
      await tx.fleetUnit.update({ where: { id }, data: { meterType, currentReading: reading ?? unit.currentReading, fuelType: str(f, "fuelType") || null, expectedConsumption: expected, costCenter: str(f, "costCenter") || null } });
    });
    return { type: "FLEET_UNIT", id };
  });
}

export async function saveDriver(f: FormData) {
  await run("motoristas", "create", async ({ prisma, user }) => {
    const expires = new Date(`${req(f, "cnhExpiresAt", "a validade da CNH")}T12:00:00Z`);
    if (Number.isNaN(expires.getTime())) throw new UserError("Validade da CNH inválida.");
    const d = await prisma.fleetDriver.create({ data: { name: req(f, "name", "o nome"), cpf: requireValidCpf(req(f, "cpf", "o CPF")), cnhNumber: req(f, "cnhNumber", "o número da CNH"), cnhCategory: req(f, "cnhCategory", "a categoria").toUpperCase(), cnhExpiresAt: expires, departmentId: user.departmentId ?? null, createdById: user.id, balanceId: balance?.id } });
    return { type: "FLEET_DRIVER", id: d.id };
  });
}

export async function saveStation(f: FormData) {
  await run("postos", "create", async ({ prisma }) => {
    const s = await prisma.fleetFuelStation.create({ data: { name: req(f, "name", "o nome do posto"), cnpj: requireValidCnpj(req(f, "cnpj", "o CNPJ")), contractRef: str(f, "contractRef") || null, pricePerLiter: num(f, "pricePerLiter") } });
    return { type: "FLEET_FUEL_STATION", id: s.id };
  });
}

export async function saveQuota(f: FormData) {
  await run("cotas", "create", async (ctx) => {
    const { prisma } = ctx, scope = fleetScope(ctx);
    const unitId = req(f, "unitId", "o veículo"), period = req(f, "period", "a competência"), litersLimit = num(f, "litersLimit");
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) throw new UserError("Competência inválida.");
    if (litersLimit == null || !Number.isFinite(litersLimit) || litersLimit <= 0) throw new UserError("Informe o limite em litros.");
    return prisma.$transaction(async (tx) => {
      // A edição de cota usa a mesma trava das emissões para não reduzir
      // o limite abaixo do combustível já autorizado na competência.
      const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetUnit" WHERE "id" = ${unitId} FOR UPDATE`;
      if (!locked.length) throw new UserError("Veículo não encontrado.");
      const unit = await tx.fleetUnit.findUniqueOrThrow({ where: { id: unitId } });
      assertScopedUnit(unit, scope);
      const year = Number(period.slice(0, 4)), month = Number(period.slice(5, 7));
      const start = new Date(year, month - 1, 1), end = new Date(year, month, 1);
      const orders = await tx.fleetFuelOrder.findMany({
        where: { unitId, status: { in: ["EMITIDA", "ABASTECIDA"] }, issuedAt: { gte: start, lt: end } },
        select: { litersAuthorized: true, litersFilled: true },
      });
      const committed = orders.reduce((sum, order) => sum + Number(order.litersFilled ?? order.litersAuthorized), 0);
      if (litersLimit < committed) throw new UserError("A nova cota não pode ser inferior ao volume já autorizado ou abastecido.");
      const q = await tx.fleetFuelQuota.upsert({
        where: { unitId_period: { unitId, period } },
        create: { unitId, period, litersLimit },
        update: { litersLimit },
      });
      return { type: "FLEET_FUEL_QUOTA", id: q.id };
    });
  });
}

function periodOf(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export async function saveFuelBalance(f: FormData) {
  await run("combustivel", "create", async (ctx) => {
    const { prisma } = ctx;
    const contractId = req(f, "contractId", "o contrato");
    const fuelType = req(f, "fuelType", "o tipo de combustível");
    const quantity = num(f, "quantityContracted");
    if (quantity == null || quantity <= 0) throw new UserError("Informe a quantidade contratada.");
    await prisma.fleetFuelBalance.upsert({
      where: { contractId_fuelType: { contractId, fuelType } },
      create: { contractId, fuelType, quantityContracted: quantity, alertThreshold: num(f, "alertThreshold") ?? 100 },
      update: { quantityContracted: quantity, alertThreshold: num(f, "alertThreshold") ?? 100 },
    });
    return { type: "FLEET_FUEL_BALANCE", id: contractId + fuelType };
  });
}

export async function issueFuelOrder(f: FormData) {
  await run("ordens", "create", async (ctx) => {
    const { prisma, user } = ctx, scope = fleetScope(ctx);
    const unitId = req(f, "unitId", "o veículo"), stationId = req(f, "stationId", "o posto"), liters = num(f, "liters");
    if (liters == null || !Number.isFinite(liters) || liters <= 0) throw new UserError("Informe os litros autorizados.");
    const driverId = str(f, "driverId") || null;
    const now = new Date();
    const period = periodOf(now);
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return prisma.$transaction(async (tx) => {
      // Serializar emissões do mesmo veículo antes de conferir sua cota.
      const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetUnit" WHERE "id" = ${unitId} FOR UPDATE`;
      if (!locked.length) throw new UserError("Veículo não encontrado.");
      const unit = await tx.fleetUnit.findUniqueOrThrow({ where: { id: unitId } });
      assertScopedUnit(unit, scope);
      if (unit.status !== "ATIVO") throw new UserError("Selecione um veículo ativo.");
      const station = await tx.fleetFuelStation.findUniqueOrThrow({ where: { id: stationId } });
      if (!station.active) throw new UserError("Posto inativo.");
      if (driverId) {
        const driver = await tx.fleetDriver.findUniqueOrThrow({ where: { id: driverId } });
        if (!driver.active || (!scope.administrator && driver.departmentId !== scope.departmentId) || cnhStatus(driver.cnhExpiresAt).status === "VENCIDA" || !cnhAllows(driver.cnhCategory, unit.category)) {
          throw new UserError("Motorista inativo, com CNH vencida ou categoria incompatível.");
        }
      }
      const quota = await tx.fleetFuelQuota.findUnique({ where: { unitId_period: { unitId, period } } });
      const used = await tx.fleetFuelOrder.findMany({
        where: { unitId, status: { in: ["EMITIDA", "ABASTECIDA"] }, issuedAt: { gte: periodStart, lt: periodEnd } },
        select: { litersAuthorized: true, litersFilled: true },
      });
      const usedLiters = used.reduce((sum, order) => sum + Number(order.litersFilled ?? order.litersAuthorized), 0);
      const check = quotaCheck(quota ? Number(quota.litersLimit) : null, usedLiters, liters);
      const balance = await tx.fleetFuelBalance.findFirst({ where: { fuelType: str(f, "fuelType") || unit.fuelType || "DIESEL", active: true } });
      if (balance) {
        const bCheck = fuelBalanceCheck(Number(balance.quantityContracted), Number(balance.quantityConsumed), liters);
        if (!bCheck.allowed) throw new UserError(`Saldo de contrato insuficiente: restam ${bCheck.remaining} L.`);
      }
      if (!check.allowed) throw new UserError(`Cota mensal excedida: restam ${check.remaining} L para ${unit.code}.`);
      const order = await tx.fleetFuelOrder.create({
        data: { code: newFuelOrderCode(now), unitId, driverId, stationId, fuelType: str(f, "fuelType") || unit.fuelType || "DIESEL", litersAuthorized: liters, portalToken: generatePortalToken(), createdById: user.id, balanceId: balance?.id },
      });
      return { type: "FLEET_FUEL_ORDER", id: order.id };
    });
  });
}

export async function confirmFuelOrder(f: FormData) {
  await run("ordens", "update", async (ctx) => {
    const { prisma, user } = ctx, scope = fleetScope(ctx);
    const id = req(f, "orderId", "a ordem"), liters = num(f, "litersFilled"), reading = num(f, "reading");
    if (liters == null || reading == null) throw new UserError("Informe os litros abastecidos e a leitura do medidor.");
    const receipt = await confirmFuelOrderOnce(prisma, {
      orderId: id,
      liters,
      reading,
      pricePerLiter: num(f, "pricePerLiter"),
      actorId: user.id,
      confirmedVia: "ADMIN",
      allowedDepartmentId: scope.administrator ? null : scope.departmentId,
    });
    return { type: "FLEET_FUEL_ORDER", id: receipt.orderId };
  });
}

export async function startTrip(f: FormData) {
  await run("viagens", "create", async (ctx) => {
    const { prisma, user } = ctx, scope = fleetScope(ctx);
    const unitId = req(f, "unitId", "o veículo"), driverId = req(f, "driverId", "o motorista");
    const destination = req(f, "destination", "o destino"), purpose = req(f, "purpose", "a finalidade");
    const selectedReading = num(f, "startReading");
    if (selectedReading != null && !Number.isFinite(selectedReading)) throw new UserError("Leitura inválida.");

    return prisma.$transaction(async (tx) => {
      // Serialize starts involving the same driver, even with different vehicles.
      const driverLock = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetDriver" WHERE "id" = ${driverId} FOR UPDATE`;
      if (!driverLock.length) throw new UserError("Motorista não encontrado.");
      const driver = await tx.fleetDriver.findUniqueOrThrow({ where: { id: driverId } });
      if (!driver.active || (!scope.administrator && driver.departmentId !== scope.departmentId)) throw new UserError("Motorista inativo ou fora do seu setor.");
      if (cnhStatus(driver.cnhExpiresAt).status === "VENCIDA") throw new UserError("A CNH do motorista está vencida.");

      const vehicleLock = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetUnit" WHERE "id" = ${unitId} FOR UPDATE`;
      if (!vehicleLock.length) throw new UserError("Veículo não encontrado.");
      const unit = await tx.fleetUnit.findUniqueOrThrow({ where: { id: unitId } });
      assertScopedUnit(unit, scope);
      if (unit.status !== "ATIVO" || unit.operationalStatus === "EM_MANUTENCAO") throw new UserError("Veículo indisponível.");
      if (!cnhAllows(driver.cnhCategory, unit.category)) throw new UserError(`A categoria ${driver.cnhCategory} não habilita para ${unit.category}.`);

      const open = await tx.fleetTrip.findFirst({ where: { returnedAt: null, OR: [{ unitId }, { driverId }] }, select: { id: true } });
      if (open) throw new UserError("O veículo ou o motorista já tem uma viagem em aberto.");
      const start = selectedReading ?? (unit.currentReading == null ? null : Number(unit.currentReading));
      if (start == null) throw new UserError("Informe a leitura de saída.");
      const problem = validateReading(unit.currentReading == null ? null : Number(unit.currentReading), start, unit.meterType as MeterType);
      if (problem) throw new UserError(problem);
      const trip = await tx.fleetTrip.create({ data: { unitId, driverId, destination, purpose, departedAt: new Date(), startReading: start, createdById: user.id } });
      return { type: "FLEET_TRIP", id: trip.id };
    });
  });
}

export async function finishTrip(f: FormData) {
  await run("viagens", "update", async (ctx) => {
    const { prisma } = ctx, scope = fleetScope(ctx);
    const id = req(f, "tripId", "a viagem"), end = num(f, "endReading");
    if (end == null || !Number.isFinite(end) || end < 0) throw new UserError("Informe uma leitura de chegada válida.");
    const existing = await prisma.fleetTrip.findUnique({ where: { id }, select: { driverId: true, unitId: true } });
    if (!existing) throw new UserError("Viagem não encontrada.");

    return prisma.$transaction(async (tx) => {
      // All trip operations acquire driver lock before vehicle lock.
      const driverLock = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetDriver" WHERE "id" = ${existing.driverId} FOR UPDATE`;
      if (!driverLock.length) throw new UserError("Motorista não encontrado.");
      const vehicleLock = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetUnit" WHERE "id" = ${existing.unitId} FOR UPDATE`;
      if (!vehicleLock.length) throw new UserError("Veículo não encontrado.");
      const unit = await tx.fleetUnit.findUniqueOrThrow({ where: { id: existing.unitId } });
      assertScopedUnit(unit, scope);

      const trip = await tx.fleetTrip.findUniqueOrThrow({ where: { id } });
      if (trip.returnedAt) throw new UserError("Esta viagem já foi encerrada.");
      const start = Number(trip.startReading);
      if (end < start) throw new UserError("A leitura de chegada não pode ser inferior à de saída.");
      const problem = validateReading(unit.currentReading == null ? start : Number(unit.currentReading), end, unit.meterType as MeterType);
      if (problem) throw new UserError(problem);
      const updated = await tx.fleetTrip.updateMany({
        where: { id, returnedAt: null },
        data: { returnedAt: new Date(), endReading: end, notes: str(f, "notes") || null },
      });
      if (updated.count !== 1) throw new UserError("Esta viagem já foi encerrada.");
      await tx.fleetUnit.update({ where: { id: existing.unitId }, data: { currentReading: end } });
      return { type: "FLEET_TRIP", id };
    });
  });
}

export async function saveTire(f: FormData) {
  await run("pneus", "create", async (ctx) => {
    const { prisma } = ctx, scope = fleetScope(ctx);
    const unitId = str(f, "unitId") || null;
    if (!unitId && !scope.administrator) throw new UserError("Somente o administrador pode cadastrar pneu sem veículo vinculado.");
    const unit = unitId ? await prisma.fleetUnit.findUnique({ where: { id: unitId } }) : null;
    if (unitId) assertScopedUnit(unit, scope);
    const lifeKm = num(f, "lifeKm") ?? 50000, cost = num(f, "cost");
    if (!Number.isInteger(lifeKm) || lifeKm <= 0 || (cost != null && (!Number.isFinite(cost) || cost < 0))) throw new UserError("Vida útil ou custo inválido.");
    const t = await prisma.fleetTire.create({ data: { unitId, fireNumber: req(f, "fireNumber", "o número de fogo"), brand: req(f, "brand", "a marca"), size: req(f, "size", "a medida"), position: str(f, "position") || null, status: unitId ? "EM_USO" : "ESTOQUE", installedAt: unitId ? new Date() : null, installReading: unit?.currentReading ?? null, lifeKm, cost } });
    return { type: "FLEET_TIRE", id: t.id };
  });
}

export async function saveFine(f: FormData) {
  await run("multas", "create", async (ctx) => {
    const { prisma, user } = ctx, scope = fleetScope(ctx);
    const unitId = req(f, "unitId", "o veículo");
    const unit = await prisma.fleetUnit.findUnique({ where: { id: unitId } });
    assertScopedUnit(unit, scope);
    const driverId = str(f, "driverId") || null;
    if (driverId) {
      const driver = await prisma.fleetDriver.findUnique({ where: { id: driverId } });
      if (!driver || (!scope.administrator && driver.departmentId !== scope.departmentId)) throw new UserError("Motorista fora do seu setor.");
    }
    const amount = num(f, "amount");
    if (!amount || amount <= 0) throw new UserError("Informe o valor da multa.");
    const due = str(f, "dueAt");
    const m = await prisma.fleetFine.create({ data: { unitId, driverId, aitNumber: req(f, "aitNumber", "o número do auto"), infraction: req(f, "infraction", "a infração"), occurredAt: new Date(`${req(f, "occurredAt", "a data")}T12:00:00Z`), amount, points: num(f, "points") ?? 0, dueAt: due ? new Date(`${due}T12:00:00Z`) : null, createdById: user.id } });
    return { type: "FLEET_FINE", id: m.id };
  });
}

export async function updateFineStatus(f: FormData) {
  await run("multas", "update", async (ctx) => {
    const { prisma } = ctx, scope = fleetScope(ctx);
    const id = req(f, "fineId", "a multa"), status = str(f, "status");
    const fine = await prisma.fleetFine.findUnique({ where: { id } });
    if (!fine) throw new UserError("Multa não encontrada.");
    const unit = await prisma.fleetUnit.findUnique({ where: { id: fine.unitId } });
    assertScopedUnit(unit, scope);
    if (!["PAGA", "RECURSO", "RESSARCIDA_CONDUTOR", "CANCELADA"].includes(status)) throw new UserError("Situação inválida.");
    await prisma.fleetFine.update({ where: { id }, data: { status } });
    return { type: "FLEET_FINE", id };
  });
}

export async function generateWorkshopToken(f: FormData) {
  await run("oficinas", "update", async (ctx) => {
    const { prisma } = ctx, scope = fleetScope(ctx);
    const id = req(f, "workOrderId", "a ordem de serviço");
    const cnpjRaw = req(f, "workshopCnpj", "o CNPJ da oficina");
    const name = req(f, "workshopName", "o nome da oficina").slice(0, 120);
    const cnpj = requireValidCnpj(cnpjRaw);
    await prisma.$transaction(async tx => {
      const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetWorkOrder" WHERE "id" = ${id} FOR UPDATE`;
      if (!locked.length) throw new UserError("Ordem de serviço não encontrada.");
      const order = await tx.fleetWorkOrder.findUniqueOrThrow({ where: { id } });
      const unit = await tx.fleetUnit.findUnique({ where: { id: order.unitId } });
      assertScopedUnit(unit, scope);
      if (order.status === "CONCLUIDA") throw new UserError("A OS já está concluída.");
      if (await tx.fleetWorkshopReport.count({ where: { workOrderId: id, status: { in: ["RECEBIDO", "CONFERIDO"] } } })) {
        throw new UserError("Esta ordem já possui registro aguardando análise ou conferido.");
      }
      // A new token explicitly revokes the previous workshop authorization.
      await tx.fleetWorkOrder.update({ where: { id }, data: { portalToken: generatePortalToken(), workshopCnpj: cnpj, workshopName: name } });
    });
    return { type: "FLEET_WORK_ORDER", id };
  });
}

export async function reviewWorkshopReport(f: FormData) {
  await run("oficinas", "update", async (ctx) => {
    const { prisma } = ctx, scope = fleetScope(ctx);
    const id = req(f, "reportId", "o registro"), status = str(f, "status");
    if (!["CONFERIDO", "RECUSADO"].includes(status)) throw new UserError("Situação inválida.");
    const report = await prisma.fleetWorkshopReport.findUnique({
      where: { id }, select: { workOrderId: true },
    });
    if (!report) throw new UserError("Registro não encontrado.");
    return prisma.$transaction(async tx => {
      // The portal and order finalization also lock this work order first.
      const lock = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetWorkOrder" WHERE "id" = ${report.workOrderId} FOR UPDATE`;
      if (!lock.length) throw new UserError("OS não encontrada.");
      const order = await tx.fleetWorkOrder.findUniqueOrThrow({ where: { id: report.workOrderId } });
      const unit = await tx.fleetUnit.findUnique({ where: { id: order.unitId } });
      assertScopedUnit(unit, scope);
      if (order.status === "CONCLUIDA") throw new UserError("A OS já está concluída.");
      if (status === "CONFERIDO" && await tx.fleetWorkshopReport.count({
        where: { workOrderId: order.id, status: "CONFERIDO", id: { not: id } },
      })) {
        throw new UserError("A OS já possui relatório conferido. Resolva a divergência antes de continuar.");
      }
      const updated = await tx.fleetWorkshopReport.updateMany({
        where: { id, status: "RECEBIDO" }, data: { status },
      });
      if (updated.count !== 1) throw new UserError("Este relatório já foi analisado.");
      return { type: "FLEET_WORKSHOP_REPORT", id };
    });
  });
}
