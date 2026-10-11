"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import { uploadFile } from "@/lib/platform/blob";
import { cnhAllows, cnhStatus, validateReading, type MeterType } from "@/lib/frotas/gestao-engine";
import { parseChecklist } from "@/lib/frotas/portal";

class UserError extends Error {}
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => { const v = str(f, k).replace(",", "."); return v === "" ? null : Number(v); };

/** O motorista é resolvido só pela sessão: usuário → servidor (CPF) → cadastro de motorista. */
export async function resolveDriver() {
  const context = await getTenantContextForModule("PORTAL_SERVIDOR");
  if (!context.user.employeeId) return { context, driver: null, departmentId: null };
  const employee = await context.prisma.employee.findUnique({ where: { id: context.user.employeeId }, select: { id: true, cpf: true, departmentId: true, isActive: true } });
  if (!employee?.isActive || !employee.departmentId) return { context, driver: null, departmentId: null };
  const cpf = employee.cpf?.replace(/\D/g, "");
  const driver = await context.prisma.fleetDriver.findFirst({
    where: {
      active: true,
      OR: [{ employeeId: employee.id }, ...(cpf ? [{ cpf }] : [])],
    },
  });
  return { context, driver: driver && (!driver.departmentId || driver.departmentId === employee.departmentId) ? driver : null, departmentId: employee.departmentId };
}

async function photo(f: FormData, key: string) {
  const file = f.get(key);
  if (!(file instanceof File) || file.size === 0) return null;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new UserError("Envie uma foto JPG, PNG ou WebP de até 5 MB.");
  try { return (await uploadFile(file)).url; } catch { throw new UserError("Não foi possível enviar a foto agora. Tente novamente ou registre sem foto."); }
}

async function run(fn: () => Promise<void>) {
  let q = "ok=1";
  try { await fn(); } catch (e) { q = `erro=${encodeURIComponent(e instanceof UserError ? e.message : "Não foi possível registrar. Confira os dados.")}`; }
  revalidatePath("/portal-frota");
  redirect(`/portal-frota?${q}`);
}

export async function driverDepart(f: FormData) {
  await run(async () => {
    const { context, driver, departmentId } = await resolveDriver();
    if (!driver || !departmentId) throw new UserError("Seu cadastro de motorista não possui setor ativo vinculado.");
    const unitId = str(f, "unitId");
    const reading = num(f, "reading");
    if (reading == null || !Number.isFinite(reading)) throw new UserError("Informe uma leitura válida do painel.");
    const { items, failures } = parseChecklist(f);
    const destination = str(f, "destination"), purpose = str(f, "purpose");
    if (!destination || !purpose) throw new UserError("Informe destino e finalidade.");
    // Upload before acquiring database locks; a failed transaction may leave a
    // private orphan image, but can never create a partial trip record.
    const startPhotoUrl = await photo(f, "photo");
    const trip = await context.prisma.$transaction(async tx => {
      // The administrative and portal paths lock driver first, then vehicle.
      const lockedDriver = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetDriver" WHERE "id" = ${driver.id} FOR UPDATE`;
      if (!lockedDriver.length) throw new UserError("Motorista não encontrado.");
      const currentDriver = await tx.fleetDriver.findUniqueOrThrow({ where: { id: driver.id } });
      if (!currentDriver.active || cnhStatus(currentDriver.cnhExpiresAt).status === "VENCIDA") throw new UserError("Motorista inativo ou com CNH vencida.");
      const lockedUnit = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetUnit" WHERE "id" = ${unitId} FOR UPDATE`;
      if (!lockedUnit.length) throw new UserError("Veículo não encontrado.");
      const unit = await tx.fleetUnit.findUniqueOrThrow({ where: { id: unitId } });
      if (unit.status !== "ATIVO" || unit.operationalStatus === "EM_MANUTENCAO" || unit.departmentId !== departmentId) {
        throw new UserError("Selecione um veículo ativo e autorizado para seu setor.");
      }
      if (!cnhAllows(currentDriver.cnhCategory, unit.category)) throw new UserError(`Sua categoria (${currentDriver.cnhCategory}) não habilita para este veículo.`);
      if (await tx.fleetTrip.findFirst({ where: { OR: [{ unitId }, { driverId: driver.id }], returnedAt: null } })) throw new UserError("O veículo ou você já tem uma viagem em aberto.");
      const problem = validateReading(unit.currentReading == null ? null : Number(unit.currentReading), reading, unit.meterType as MeterType);
      if (problem) throw new UserError(problem);
      return tx.fleetTrip.create({ data: { unitId, driverId: driver.id, destination, purpose, departedAt: new Date(), startReading: reading, checklist: items, startPhotoUrl, origin: "PORTAL", notes: failures.length ? `Checklist com pendências: ${failures.join(", ")}` : null, createdById: context.user.id } });
    });
    await writeAuditEvent(context.prisma, { actorUsuarioId: context.user.id, eventType: auditEventTypes.formSubmit, targetType: "FLEET_TRIP", targetId: trip.id });
  });
}

export async function driverArrive(f: FormData) {
  await run(async () => {
    const { context, driver } = await resolveDriver();
    if (!driver) throw new UserError("Seu cadastro de motorista não foi encontrado.");
    const tripId = str(f, "tripId"), reading = num(f, "reading");
    if (reading == null || !Number.isFinite(reading) || reading < 0) throw new UserError("Informe a leitura de chegada.");
    const previous = await context.prisma.fleetTrip.findFirst({ where: { id: tripId, driverId: driver.id }, select: { unitId: true } });
    if (!previous) throw new UserError("Viagem não encontrada.");
    const endPhotoUrl = await photo(f, "photo");
    const note = str(f, "notes");
    await context.prisma.$transaction(async tx => {
      const lockedDriver = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetDriver" WHERE "id" = ${driver.id} FOR UPDATE`;
      if (!lockedDriver.length) throw new UserError("Motorista não encontrado.");
      const lockedUnit = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetUnit" WHERE "id" = ${previous.unitId} FOR UPDATE`;
      if (!lockedUnit.length) throw new UserError("Veículo não encontrado.");
      const trip = await tx.fleetTrip.findFirst({ where: { id: tripId, driverId: driver.id, returnedAt: null } });
      if (!trip) throw new UserError("Viagem já encerrada ou não encontrada.");
      const unit = await tx.fleetUnit.findUniqueOrThrow({ where: { id: trip.unitId } });
      const problem = validateReading(unit.currentReading == null ? Number(trip.startReading) : Number(unit.currentReading), reading, unit.meterType as MeterType);
      if (reading < Number(trip.startReading) || problem) throw new UserError(problem ?? "A leitura de chegada não pode ser menor que a de saída.");
      const updated = await tx.fleetTrip.updateMany({
        where: { id: trip.id, returnedAt: null },
        data: { returnedAt: new Date(), endReading: reading, endPhotoUrl, notes: [trip.notes, note].filter(Boolean).join(" · ") || null },
      });
      if (updated.count !== 1) throw new UserError("Esta viagem já foi encerrada.");
      await tx.fleetUnit.update({ where: { id: trip.unitId }, data: { currentReading: reading } });
    });
    await writeAuditEvent(context.prisma, { actorUsuarioId: context.user.id, eventType: auditEventTypes.formSubmit, targetType: "FLEET_TRIP", targetId: tripId });
  });
}
