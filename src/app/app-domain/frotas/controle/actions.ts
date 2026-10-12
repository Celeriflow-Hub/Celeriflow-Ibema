"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import { fleetScope, FleetError } from "@/lib/frotas/service";
import { deleteFleetAttachment, FLEET_ATTACHMENT_OWNER_TYPES, uploadFleetAttachment, type FleetAttachmentOwnerType } from "@/lib/frotas/attachments";
import { authorizationCode, driverEligibility, fineStatusAfterPayment, gateTransition, policyOn, scheduleConflict } from "@/lib/frotas/tr-rules";

class UserError extends Error {}
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => { const v = str(f, k).replace(",", "."); return v === "" ? null : Number(v); };
const req = (f: FormData, k: string, label: string) => { const v = str(f, k); if (!v) throw new UserError(`Informe ${label}.`); return v; };
const day = (v: string) => new Date(`${v}T12:00:00.000Z`);
type Ctx = Awaited<ReturnType<typeof getTenantContextForModuleOperation>>;

async function scopedUnit(ctx: Ctx, id: string) {
  const scope = fleetScope(ctx);
  const unit = await ctx.prisma.fleetUnit.findUnique({ where: { id } });
  if (!unit || (!scope.administrator && unit.departmentId !== scope.departmentId)) throw new UserError("Veículo não encontrado ou fora do seu setor.");
  return unit;
}

async function eligibleDriver(ctx: Ctx, id: string | null, on: Date) {
  if (!id) return null;
  const d = await ctx.prisma.fleetDriver.findUnique({ where: { id } });
  if (!d) throw new UserError("Motorista não encontrado.");
  const problem = driverEligibility({ cnhNumber: d.cnhNumber, cnhExpiresAt: d.cnhExpiresAt, points: d.cnhPoints, active: d.active }, on);
  if (problem) throw new UserError(problem);
  return d;
}

async function run(tab: string, op: "create" | "update", fn: (ctx: Ctx) => Promise<{ type: string; id: string }>) {
  let message = "ok=1";
  try {
    const ctx = await getTenantContextForModuleOperation("FROTAS", op);
    const target = await fn(ctx);
    await writeAuditEvent(ctx.prisma, { actorUsuarioId: ctx.user.id, eventType: auditEventTypes.formSubmit, targetType: target.type, targetId: target.id });
  } catch (error) {
    const text = error instanceof UserError || error instanceof FleetError ? error.message : error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" ? "Já existe um registro com esse identificador." : error instanceof Error && "status" in error ? error.message : "Não foi possível salvar. Confira os dados.";
    message = `erro=${encodeURIComponent(text)}`;
  }
  revalidatePath("/frotas/controle");
  redirect(`/frotas/controle?aba=${tab}&${message}`);
}

/** 1.568/1.585/1.601 — dados complementares do veículo. */
export async function saveVehicleDetails(f: FormData) {
  await run("cadastro", "update", async (ctx) => {
    const unit = await scopedUnit(ctx, req(f, "unitId", "o veículo"));
    const tank = num(f, "tankCapacity");
    if (tank != null && !(tank > 0)) throw new UserError("Capacidade do tanque inválida.");
    const meter = str(f, "meterType");
    await ctx.prisma.fleetUnit.update({ where: { id: unit.id }, data: {
      species: str(f, "species") || null, color: str(f, "color") || null, tankCapacity: tank, fipeCode: str(f, "fipeCode") || null,
      acquisitionDate: str(f, "acquisitionDate") ? day(str(f, "acquisitionDate")) : null,
      ...(meter === "SEM_MARCADOR" && unit.currentReading == null ? { meterType: "SEM_MARCADOR" } : {}),
    } });
    return { type: "FLEET_UNIT", id: unit.id };
  });
}

/** 1.598/1.599 — terceirizado e pontuação. */
export async function saveDriverPoints(f: FormData) {
  await run("motoristas", "update", async (ctx) => {
    const id = req(f, "driverId", "o motorista");
    const points = num(f, "cnhPoints") ?? 0;
    if (!Number.isInteger(points) || points < 0) throw new UserError("Pontuação inválida.");
    await ctx.prisma.fleetDriver.update({ where: { id }, data: { cnhPoints: points, outsourced: str(f, "outsourced") === "on" } });
    return { type: "FLEET_DRIVER", id };
  });
}

/** 1.574/1.592/1.605 — agenda. */
export async function createSchedule(f: FormData) {
  await run("agenda", "create", async (ctx) => {
    const unit = await scopedUnit(ctx, req(f, "unitId", "o veículo"));
    const startsAt = new Date(req(f, "startsAt", "o início")), endsAt = new Date(req(f, "endsAt", "o término"));
    const driverId = str(f, "driverId") || null;
    await eligibleDriver(ctx, driverId, startsAt);
    return ctx.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "FleetUnit" WHERE "id" = ${unit.id} FOR UPDATE`;
      const existing = await tx.fleetSchedule.findMany({ where: { OR: [{ unitId: unit.id }, ...(driverId ? [{ driverId }] : [])], endsAt: { gt: startsAt }, startsAt: { lt: endsAt } } });
      const problem = scheduleConflict({ unitId: unit.id, driverId, startsAt, endsAt, status: "AGENDADO" }, existing);
      if (problem) throw new UserError(problem);
      const s = await tx.fleetSchedule.create({ data: { unitId: unit.id, driverId, departmentId: unit.departmentId, kind: req(f, "kind", "o tipo"), purpose: req(f, "purpose", "o motivo e a finalidade"), destination: str(f, "destination") || null, startsAt, endsAt, createdById: ctx.user.id } });
      return { type: "FLEET_SCHEDULE", id: s.id };
    });
  });
}

export async function cancelSchedule(f: FormData) {
  await run("agenda", "update", async (ctx) => {
    const s = await ctx.prisma.fleetSchedule.findUnique({ where: { id: req(f, "id", "o agendamento") } });
    if (!s) throw new UserError("Agendamento não encontrado.");
    await scopedUnit(ctx, s.unitId);
    await ctx.prisma.fleetSchedule.update({ where: { id: s.id }, data: { status: "CANCELADO" } });
    return { type: "FLEET_SCHEDULE", id: s.id };
  });
}

/** 1.575/1.595 — guarita. */
export async function registerGate(f: FormData) {
  await run("guarita", "create", async (ctx) => {
    const unit = await scopedUnit(ctx, req(f, "unitId", "o veículo"));
    const kind = str(f, "kind") === "ENTRADA" ? "ENTRADA" : "SAIDA";
    const reading = num(f, "reading");
    let driverId = str(f, "driverId") || null;
    return ctx.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "FleetUnit" WHERE "id" = ${unit.id} FOR UPDATE`;
      const last = await tx.fleetGateEvent.findFirst({ where: { unitId: unit.id }, orderBy: { occurredAt: "desc" } });
      const problem = gateTransition(last ? { kind: last.kind as "SAIDA" | "ENTRADA", reading: last.reading == null ? null : Number(last.reading) } : null, { kind, reading }, unit.meterType as "HODOMETRO");
      if (problem) throw new UserError(problem);
      if (kind === "SAIDA") { if (!driverId) throw new UserError("Informe o motorista que retira o veículo."); await eligibleDriver(ctx, driverId, new Date()); }
      else driverId = last?.driverId ?? null;
      const e = await tx.fleetGateEvent.create({ data: { unitId: unit.id, driverId, kind, reading, notes: str(f, "notes") || null, createdById: ctx.user.id } });
      if (reading != null) await tx.fleetUnit.update({ where: { id: unit.id }, data: { currentReading: reading } });
      return { type: "FLEET_GATE", id: e.id };
    });
  });
}

/** 1.571 — bateria; a troca encerra a anterior. */
export async function installBattery(f: FormData) {
  await run("baterias", "create", async (ctx) => {
    const unit = await scopedUnit(ctx, req(f, "unitId", "o veículo"));
    const installedAt = day(req(f, "installedAt", "a data"));
    const cost = num(f, "cost");
    return ctx.prisma.$transaction(async (tx) => {
      await tx.fleetBattery.updateMany({ where: { unitId: unit.id, removedAt: null }, data: { removedAt: installedAt } });
      const b = await tx.fleetBattery.create({ data: { unitId: unit.id, identifier: req(f, "identifier", "a identificação"), brand: req(f, "brand", "a marca"), installedAt, cost, createdById: ctx.user.id } });
      if (cost && cost > 0) await tx.fleetExpense.create({ data: { unitId: unit.id, nature: "MANUTENCAO", amount: cost, occurredAt: installedAt, description: `Troca de bateria ${b.identifier}`, sourceType: "BATERIA", sourceId: b.id, sourceKey: `BATERIA:${b.id}`, createdById: ctx.user.id } });
      return { type: "FLEET_BATTERY", id: b.id };
    });
  });
}

/** 1.586/1.596 — seguros obrigatório e facultativo. */
export async function savePolicy(f: FormData) {
  await run("seguros", "create", async (ctx) => {
    const unit = await scopedUnit(ctx, req(f, "unitId", "o veículo"));
    const startsAt = day(req(f, "startsAt", "o início")), endsAt = day(req(f, "endsAt", "o fim"));
    if (endsAt < startsAt) throw new UserError("Fim da vigência anterior ao início.");
    const p = await ctx.prisma.fleetInsurancePolicy.create({ data: { unitId: unit.id, kind: str(f, "kind") === "OBRIGATORIO" ? "OBRIGATORIO" : "FACULTATIVO", insurer: req(f, "insurer", "a seguradora"), policyNumber: req(f, "policyNumber", "a apólice"), startsAt, endsAt, premium: num(f, "premium"), createdById: ctx.user.id } });
    return { type: "FLEET_POLICY", id: p.id };
  });
}

/** 1.573/1.580/1.581/1.582 — autorização de serviço e despesa. */
export async function issueServiceAuthorization(f: FormData) {
  await run("autorizacoes", "create", async (ctx) => {
    const unit = await scopedUnit(ctx, req(f, "unitId", "o veículo"));
    const limit = num(f, "amountLimit");
    if (!(limit && limit > 0)) throw new UserError("Informe o valor limite.");
    const year = new Date().getUTCFullYear();
    const seq = (await ctx.prisma.fleetServiceAuthorization.count({ where: { code: { startsWith: `AS-${year}-` } } })) + 1;
    const a = await ctx.prisma.fleetServiceAuthorization.create({ data: { code: authorizationCode("SERVICO", seq, year), unitId: unit.id, driverId: str(f, "driverId") || null, destination: str(f, "destination") || null, supplierName: req(f, "supplierName", "o fornecedor"), supplierCnpj: str(f, "supplierCnpj") || null, description: req(f, "description", "o serviço"), amountLimit: limit, procurementKind: str(f, "procurementKind") || null, procurementRef: str(f, "procurementRef") || null, validUntil: str(f, "validUntil") ? day(str(f, "validUntil")) : null, createdById: ctx.user.id } });
    return { type: "FLEET_SERVICE_AUTH", id: a.id };
  });
}

export async function executeServiceAuthorization(f: FormData) {
  await run("autorizacoes", "update", async (ctx) => {
    const id = req(f, "id", "a autorização");
    const amount = num(f, "amountActual");
    if (!(amount && amount > 0)) throw new UserError("Informe o valor executado.");
    return ctx.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetServiceAuthorization" WHERE "id" = ${id} FOR UPDATE`;
      if (!locked.length) throw new UserError("Autorização não encontrada.");
      const a = await tx.fleetServiceAuthorization.findUniqueOrThrow({ where: { id } });
      await scopedUnit(ctx, a.unitId);
      if (a.status !== "EMITIDA") throw new UserError("Autorização já utilizada ou cancelada.");
      if (amount > Number(a.amountLimit)) throw new UserError("Valor acima do limite autorizado.");
      const exp = await tx.fleetExpense.create({ data: { unitId: a.unitId, nature: "MANUTENCAO", amount, occurredAt: new Date(), description: `${a.code} · ${a.description}${a.procurementRef ? ` · ${a.procurementKind ?? ""} ${a.procurementRef}` : ""}`, sourceType: "AUTORIZACAO_SERVICO", sourceId: a.id, sourceKey: `AUTORIZACAO_SERVICO:${a.id}`, createdById: ctx.user.id } });
      await tx.fleetServiceAuthorization.update({ where: { id }, data: { status: "EXECUTADA", amountActual: amount, executedAt: new Date(), expenseId: exp.id } });
      return { type: "FLEET_SERVICE_AUTH", id };
    });
  });
}

/** 1.588 — multa com CTB, cidade e motorista; soma pontos ao motorista. */
export async function registerFine(f: FormData) {
  await run("multas", "create", async (ctx) => {
    const unit = await scopedUnit(ctx, req(f, "unitId", "o veículo"));
    const code = req(f, "ctbCode", "a infração");
    const inf = await ctx.prisma.fleetCtbInfraction.findUnique({ where: { code } });
    if (!inf) throw new UserError("Infração não encontrada na tabela do CTB.");
    const driverId = str(f, "driverId") || null;
    return ctx.prisma.$transaction(async (tx) => {
      const fine = await tx.fleetFine.create({ data: { unitId: unit.id, driverId, aitNumber: req(f, "aitNumber", "o número do auto"), infraction: `${inf.code} — ${inf.description}`, ctbCode: inf.code, city: req(f, "city", "a cidade da infração"), occurredAt: day(req(f, "occurredAt", "a data")), dueAt: str(f, "dueAt") ? day(str(f, "dueAt")) : null, amount: inf.amount, points: inf.points, createdById: ctx.user.id } });
      if (driverId) await tx.fleetDriver.update({ where: { id: driverId }, data: { cnhPoints: { increment: inf.points } } });
      return { type: "FLEET_FINE", id: fine.id };
    });
  });
}

/** 1.590 — pagamento da multa. */
export async function payFine(f: FormData) {
  await run("multas", "update", async (ctx) => {
    const fine = await ctx.prisma.fleetFine.findUnique({ where: { id: req(f, "id", "a multa") } });
    if (!fine) throw new UserError("Multa não encontrada.");
    await scopedUnit(ctx, fine.unitId);
    const paid = num(f, "paidAmount") ?? 0;
    const total = paid + Number(fine.paidAmount ?? 0);
    let status: string;
    try { status = fineStatusAfterPayment(Number(fine.amount), total); } catch { throw new UserError("Valor pago inválido."); }
    await ctx.prisma.fleetFine.update({ where: { id: fine.id }, data: { paidAmount: total, paidAt: day(req(f, "paidAt", "a data do pagamento")), paymentReference: str(f, "paymentReference") || null, status } });
    return { type: "FLEET_FINE", id: fine.id };
  });
}

/** 1.569/1.612 — ocorrência/avaria com coordenada. */
export async function registerOccurrence(f: FormData) {
  await run("sinistros", "create", async (ctx) => {
    const unit = await scopedUnit(ctx, req(f, "unitId", "o veículo"));
    const lat = num(f, "latitude"), lng = num(f, "longitude");
    if ((lat != null && (lat < -90 || lat > 90)) || (lng != null && (lng < -180 || lng > 180))) throw new UserError("Coordenada inválida.");
    const o = await ctx.prisma.fleetOccurrence.create({ data: { unitId: unit.id, type: str(f, "type") || "AVARIA", occurredAt: day(req(f, "occurredAt", "a data")), description: req(f, "description", "a descrição"), involvedValue: num(f, "involvedValue"), latitude: lat, longitude: lng, createdById: ctx.user.id } });
    return { type: "FLEET_OCCURRENCE", id: o.id };
  });
}

/** 1.613–1.617 — sinistro a partir da ocorrência, com apólice automática. */
export async function openClaim(f: FormData) {
  await run("sinistros", "create", async (ctx) => {
    const occ = await ctx.prisma.fleetOccurrence.findUnique({ where: { id: req(f, "occurrenceId", "a ocorrência") } });
    if (!occ) throw new UserError("Ocorrência não encontrada.");
    await scopedUnit(ctx, occ.unitId);
    const resp = str(f, "responsibility");
    if (!["PROPRIO", "TERCEIROS", "OUTROS"].includes(resp)) throw new UserError("Informe a responsabilidade.");
    const policies = await ctx.prisma.fleetInsurancePolicy.findMany({ where: { unitId: occ.unitId } });
    const policy = policyOn(policies, occ.occurredAt);
    const parties = [{ plate: str(f, "partyPlate"), owner: str(f, "partyOwner"), driver: str(f, "partyDriver") }].filter((p) => p.plate || p.owner || p.driver);
    const c = await ctx.prisma.fleetClaim.create({ data: { occurrenceId: occ.id, unitId: occ.unitId, responsibility: resp, insurer: policy?.insurer ?? null, policyNumber: policy?.policyNumber ?? null, workshopName: str(f, "workshopName") || null, workshopCnpj: str(f, "workshopCnpj") || null, parties, createdById: ctx.user.id } });
    return { type: "FLEET_CLAIM", id: c.id };
  });
}

export async function saveDestination(f: FormData) {
  await run("agenda", "create", async (ctx) => {
    const d = await ctx.prisma.fleetDestination.create({ data: { name: req(f, "name", "o destino"), city: str(f, "city") || null, distanceKm: num(f, "distanceKm") } });
    return { type: "FLEET_DESTINATION", id: d.id };
  });
}

/** 1.578 — upload de anexo (veículo, motorista, multa, sinistro ou autorização), validando extensão e 20 MB. */
export async function uploadFleetAttachmentAction(f: FormData) {
  await run("anexos", "create", async (ctx) => {
    const scope = fleetScope(ctx);
    const [ownerType, ownerId] = str(f, "ownerRef").split("|");
    if (!(FLEET_ATTACHMENT_OWNER_TYPES as readonly string[]).includes(ownerType)) throw new UserError("Selecione o registro para anexar o arquivo.");
    if (!ownerId) throw new UserError("Selecione o registro para anexar o arquivo.");
    const file = f.get("file");
    if (!(file instanceof File)) throw new UserError("Selecione um arquivo.");
    const row = await ctx.prisma.$transaction((tx) => uploadFleetAttachment(tx, scope, { ownerType: ownerType as FleetAttachmentOwnerType, ownerId, file }));
    return { type: "FLEET_ATTACHMENT", id: row.id };
  });
}

/** Exclusão de anexo: somente quem enviou (ou administrador), dentro do setor do registro. */
export async function deleteFleetAttachmentAction(f: FormData) {
  await run("anexos", "update", async (ctx) => {
    const scope = fleetScope(ctx);
    const row = await ctx.prisma.$transaction((tx) => deleteFleetAttachment(tx, scope, req(f, "id", "o anexo")));
    return { type: "FLEET_ATTACHMENT", id: row.id };
  });
}
