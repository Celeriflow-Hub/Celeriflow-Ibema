import { Prisma, type PrismaClient } from "@prisma/client";
import { parseCompetence } from "./engine";
import type { CapturaSituationCode } from "./captura-frota-situation";

export class FleetHistoryError extends Error {}
export type FleetHistoryActor = { actorId: string; departmentId: string | null; administrator: boolean };
export type FleetHistoryUnit = {
  unitId: string; code: string; plate: string | null; category: "VEICULO" | "MAQUINA";
  fuelType: string; departmentId: string | null; evidenceRef: string;
};
const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export function validHistoryCompetence(competence: string) {
  const result = parseCompetence(competence);
  if (!result) throw new FleetHistoryError("Competência inválida.");
  return result;
}
export function dateOnly(date: Date) { return date.toISOString().slice(0, 10); }
export function historyDate(text: string) {
  if (!RE_DATE.test(text)) throw new FleetHistoryError("Data inválida.");
  const parsed = new Date(text + "T00:00:00Z");
  if (dateOnly(parsed) !== text) throw new FleetHistoryError("Data inválida.");
  return parsed;
}
export function requireHistoryText(text: string, description: string, max = 250) {
  const result = text.trim();
  if (!result || result.length > max) throw new FleetHistoryError(description + " obrigatório (até " + max + " caracteres).");
  return result;
}
export function assertHistoryScope(actor: FleetHistoryActor, departmentId: string | null) {
  if (!actor.administrator && (!actor.departmentId || actor.departmentId !== departmentId)) {
    throw new FleetHistoryError("Registro fora do setor autorizado.");
  }
}
export async function lockHistoryDraft(tx: Prisma.TransactionClient, competence: string) {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetSagresMonth" WHERE "competence" = ${competence} FOR UPDATE`;
  if (!rows.length) throw new FleetHistoryError("Abra a competência antes de registrar o histórico.");
  const month = await tx.fleetSagresMonth.findUniqueOrThrow({ where: { competence } });
  if (month.status !== "RASCUNHO") throw new FleetHistoryError("Competência certificada. Solicite reabertura justificada.");
  return month;
}
export async function historyEvent(tx: Prisma.TransactionClient, monthId: string, actorId: string, action: string, detail: Prisma.InputJsonValue) {
  await tx.fleetSagresMonthEvent.create({ data: { monthId, actorId, action, detail } });
}
/** All months start empty; never guess history from a present-day unit status. */
export async function openFleetHistoryMonth(db: PrismaClient, competence: string, actor: FleetHistoryActor) {
  validHistoryCompetence(competence);
  if (!actor.administrator) throw new FleetHistoryError("Somente administrador pode abrir uma competência municipal.");
  return db.$transaction(async tx => {
    const month = await tx.fleetSagresMonth.create({ data: { competence, createdById: actor.actorId } });
    await historyEvent(tx, month.id, actor.actorId, "ABERTURA", { competence });
    return month;
  });
}
export async function addFleetHistoryUnit(db: PrismaClient, competence: string, input: FleetHistoryUnit, actor: FleetHistoryActor) {
  validHistoryCompetence(competence);
  const code = requireHistoryText(input.code, "Código", 40);
  const fuelType = requireHistoryText(input.fuelType, "Combustível", 60);
  const evidenceRef = requireHistoryText(input.evidenceRef, "Comprovação");
  const plate = input.plate?.trim().toUpperCase() || null;
  if (!["VEICULO", "MAQUINA"].includes(input.category)) throw new FleetHistoryError("Categoria inválida.");
  assertHistoryScope(actor, input.departmentId);
  return db.$transaction(async tx => {
    const month = await lockHistoryDraft(tx, competence);
    const original = await tx.fleetUnit.findUnique({ where: { id: input.unitId }, select: { id: true, departmentId: true } });
    if (!original) throw new FleetHistoryError("Veículo/máquina não encontrado.");
    assertHistoryScope(actor, original.departmentId);
    if (await tx.fleetSagresMonthUnit.count({ where: { monthId: month.id, unitId: input.unitId } })) {
      throw new FleetHistoryError("Veículo já registrado nesta competência.");
    }
    const unit = await tx.fleetSagresMonthUnit.create({
      data: {
        monthId: month.id, unitId: input.unitId, code, plate, category: input.category,
        fuelType, departmentId: input.departmentId, evidenceRef, createdById: actor.actorId,
      },
    });
    await historyEvent(tx, month.id, actor.actorId, "VEICULO_INCLUIDO", {
      unitId: unit.unitId, code, plate, category: input.category, departmentId: input.departmentId, evidenceRef,
    });
    return unit;
  });
}
export async function recordFleetHistorySituation(
  db: PrismaClient, competence: string, unitId: string,
  entry: { date: string; status: CapturaSituationCode; evidenceRef: string },
  actor: FleetHistoryActor,
) {
  const period = validHistoryCompetence(competence), date = historyDate(entry.date);
  if (date < period.start || date >= period.end) throw new FleetHistoryError("Situação fora da competência.");
  if (!["1", "2", "3", "4"].includes(entry.status)) throw new FleetHistoryError("Código de situação inválido.");
  const evidenceRef = requireHistoryText(entry.evidenceRef, "Comprovação");
  return db.$transaction(async tx => {
    const month = await lockHistoryDraft(tx, competence);
    const unit = await tx.fleetSagresMonthUnit.findUnique({ where: { monthId_unitId: { monthId: month.id, unitId } } });
    if (!unit) throw new FleetHistoryError("Inclua primeiro o veículo na competência.");
    assertHistoryScope(actor, unit.departmentId);
    const previous = await tx.fleetSagresMonthSituation.findUnique({ where: { monthUnitId_date: { monthUnitId: unit.id, date } } });
    const situation = await tx.fleetSagresMonthSituation.upsert({
      where: { monthUnitId_date: { monthUnitId: unit.id, date } },
      create: { monthUnitId: unit.id, date, status: entry.status, evidenceRef, recordedById: actor.actorId },
      update: { status: entry.status, evidenceRef, recordedById: actor.actorId, recordedAt: new Date() },
    });
    await historyEvent(tx, month.id, actor.actorId, previous ? "SITUACAO_CORRIGIDA" : "SITUACAO_REGISTRADA", {
      unitId, date: entry.date, status: entry.status, evidenceRef,
      ...(previous ? { previous: { status: previous.status, evidenceRef: previous.evidenceRef, recordedById: previous.recordedById } } : {}),
    });
    return situation;
  });
}
export async function removeFleetHistoryUnit(db: PrismaClient, competence: string, unitId: string, actor: FleetHistoryActor, reason: string) {
  validHistoryCompetence(competence);
  const note = requireHistoryText(reason, "Justificativa");
  return db.$transaction(async tx => {
    const month = await lockHistoryDraft(tx, competence);
    const unit = await tx.fleetSagresMonthUnit.findUnique({ where: { monthId_unitId: { monthId: month.id, unitId } }, include: { situations: true } });
    if (!unit) throw new FleetHistoryError("Veículo não incluído nesta competência.");
    assertHistoryScope(actor, unit.departmentId);
    await tx.fleetSagresMonthSituation.deleteMany({ where: { monthUnitId: unit.id } });
    await tx.fleetSagresMonthUnit.delete({ where: { id: unit.id } });
    await historyEvent(tx, month.id, actor.actorId, "VEICULO_REMOVIDO", {
      unitId, note, code: unit.code, plate: unit.plate,
      situations: unit.situations.map(s => ({ date: dateOnly(s.date), status: s.status, evidenceRef: s.evidenceRef })),
    });
  });
}
export async function removeFleetHistorySituation(
  db: PrismaClient, competence: string, unitId: string, dateValue: string, actor: FleetHistoryActor, reason: string,
) {
  const period = validHistoryCompetence(competence), date = historyDate(dateValue);
  if (date < period.start || date >= period.end) throw new FleetHistoryError("Data fora da competência.");
  const note = requireHistoryText(reason, "Justificativa");
  return db.$transaction(async tx => {
    const month = await lockHistoryDraft(tx, competence);
    const unit = await tx.fleetSagresMonthUnit.findUnique({ where: { monthId_unitId: { monthId: month.id, unitId } } });
    if (!unit) throw new FleetHistoryError("Veículo não incluído nesta competência.");
    assertHistoryScope(actor, unit.departmentId);
    const previous = await tx.fleetSagresMonthSituation.findUnique({ where: { monthUnitId_date: { monthUnitId: unit.id, date } } });
    if (!previous) throw new FleetHistoryError("Situação não encontrada.");
    await tx.fleetSagresMonthSituation.delete({ where: { id: previous.id } });
    await historyEvent(tx, month.id, actor.actorId, "SITUACAO_REMOVIDA", {
      unitId, date: dateValue, status: previous.status, evidenceRef: previous.evidenceRef, note,
    });
  });
}
export async function readFleetHistoryMonth(db: PrismaClient, competence: string) {
  validHistoryCompetence(competence);
  return db.fleetSagresMonth.findUnique({
    where: { competence },
    include: {
      units: { include: { situations: { orderBy: { date: "asc" } } }, orderBy: { code: "asc" } },
      revisions: { orderBy: { version: "desc" } },
      events: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
}
