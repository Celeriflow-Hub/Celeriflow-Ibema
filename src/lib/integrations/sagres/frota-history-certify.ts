import { createHash } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { prepareCapturaFleetMonth } from "./captura-frota-prepare";
import { reconcileFleetMonth } from "./frota-reconciliation-db";
import type { CapturaSituationCode } from "./captura-frota-situation";
import {
  type FleetHistoryActor, FleetHistoryError, dateOnly, historyEvent,
  lockHistoryDraft, readFleetHistoryMonth, requireHistoryText, validHistoryCompetence,
} from "./frota-history";

type HistoricalMonth = NonNullable<Awaited<ReturnType<typeof readFleetHistoryMonth>>>;
type HistoricalUnit = HistoricalMonth["units"][number];

/** Deterministic hashing also works after PostgreSQL jsonb reorders object keys. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object") {
    const data = value as Record<string, unknown>;
    return "{" + Object.keys(data).sort().map(k => JSON.stringify(k) + ":" + canonical(data[k])).join(",") + "}";
  }
  return JSON.stringify(value) ?? "null";
}
function digest(payload: unknown) { return createHash("sha256").update(canonical(payload)).digest("hex"); }
function unitSnapshot(unit: HistoricalUnit) {
  return {
    unitId: unit.unitId, code: unit.code, plate: unit.plate, category: unit.category,
    fuelType: unit.fuelType, departmentId: unit.departmentId, evidenceRef: unit.evidenceRef,
    createdById: unit.createdById,
    situations: unit.situations.map(s => ({
      date: dateOnly(s.date), status: s.status, evidenceRef: s.evidenceRef, recordedById: s.recordedById,
    })).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
function reportInputs(month: { units: HistoricalUnit[] }) {
  const units = month.units.map(u => ({ id: u.unitId, code: u.code, plate: u.plate, category: u.category, fuelType: u.fuelType }));
  const situations = month.units.flatMap(u => u.situations.map(s => ({
    unitId: u.unitId, date: dateOnly(s.date), status: s.status as CapturaSituationCode,
  })));
  return { units, situations };
}
async function fuelRecords(db: PrismaClient | Prisma.TransactionClient, competence: string) {
  const period = validHistoryCompetence(competence);
  const data = await db.fleetConsumption.findMany({
    where: { type: "COMBUSTIVEL", occurredAt: { gte: period.start, lt: period.end } },
    select: { id: true, unitId: true, material: true, measurementUnit: true, quantity: true, occurredAt: true, cost: true, origin: true, reference: true },
  });
  return data.map(c => ({
    id: c.id, unitId: c.unitId, material: c.material, measurementUnit: c.measurementUnit,
    quantity: Number(c.quantity), occurredAt: dateOnly(c.occurredAt),
    cost: c.cost === null ? null : Number(c.cost), origin: c.origin, reference: c.reference,
  })).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id));
}
export async function previewFleetSagresMonth(db: PrismaClient, competence: string) {
  const month = await readFleetHistoryMonth(db, competence);
  if (!month) throw new FleetHistoryError("Abra a competência antes da prévia.");
  const data = reportInputs(month);
  const fuel = await fuelRecords(db, competence);
  const check = prepareCapturaFleetMonth(competence, data.units, data.situations,
    fuel.map(f => ({ ...f, occurredAt: new Date(f.occurredAt + "T00:00:00Z") })));
  const issues = [...check.issues];
  if (!month.units.length) issues.push({ unitId: "", message: "Relação mensal de frota vazia." });
  return { month, ready: check.ready && !!month.units.length && issues.length === 0, issues, payload: check.payload };
}

/**
 * Certification is administrator-only. Lock, validate and snapshot inputs and
 * generated packet in the SAME transaction; edits cannot bypass the month lock.
 */
export async function certifyFleetSagresMonth(db: PrismaClient, competence: string, actor: FleetHistoryActor, note: string) {
  if (!actor.administrator) throw new FleetHistoryError("Apenas o administrador certifica declarações municipais.");
  validHistoryCompetence(competence);
  const certificationNote = requireHistoryText(note, "Termo de certificação", 1000);
  return db.$transaction(async tx => {
    const month = await lockHistoryDraft(tx, competence);
    const rows = await tx.fleetSagresMonth.findUniqueOrThrow({
      where: { competence }, include: { units: { include: { situations: true } } },
    });
    if (!rows.units.length) throw new FleetHistoryError("Não há frota informada nesta competência.");
    const source = reportInputs(rows as HistoricalMonth);
    const fuel = await fuelRecords(tx, competence);
    const packet = prepareCapturaFleetMonth(competence, source.units, source.situations,
      fuel.map(f => ({ ...f, occurredAt: new Date(f.occurredAt + "T00:00:00Z") })));
    if (!packet.ready || packet.issues.length || !packet.payload) {
      throw new FleetHistoryError("Pendências do SAGRES: " + packet.issues.slice(0, 4).map(x => x.message).join(" | "));
    }
    // Audit orders, internal consumption expenses and duplicate appropriation
    // before freezing the certified source ledger. Reconciliation is read-only.
    const reconciliation = await reconcileFleetMonth(tx, competence);
    if (!reconciliation.balanced) {
      throw new FleetHistoryError("Conciliação da Frota pendente: " +
        reconciliation.issues.slice(0, 4).map(i => i.message + " (" + i.reference + ")").join(" | "));
    }
    const payload = {
      competence, units: rows.units.map(unitSnapshot).sort((a, b) => a.code.localeCompare(b.code) || a.unitId.localeCompare(b.unitId)),
      fuelRecords: fuel, packet: packet.payload,
    };
    const sha256 = digest(payload), version = month.revision + 1;
    const revision = await tx.fleetSagresMonthRevision.create({
      data: {
        monthId: month.id, version, payload: payload as Prisma.InputJsonValue,
        sha256, certifiedById: actor.actorId, certificationNote,
      },
    });
    await tx.fleetSagresMonth.update({
      where: { id: month.id },
      data: { status: "CERTIFICADO", revision: version, certifiedById: actor.actorId, certifiedAt: new Date(), certificationNote },
    });
    await historyEvent(tx, month.id, actor.actorId, "CERTIFICADO", { revision: version, sha256 });
    return revision;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
export async function readCertifiedFleetSagresMonth(db: PrismaClient, competence: string) {
  const month = await readFleetHistoryMonth(db, competence);
  if (!month || month.status !== "CERTIFICADO") throw new FleetHistoryError("Competência sem certificação atual.");
  const revision = month.revisions.find(r => r.version === month.revision);
  if (!revision) throw new FleetHistoryError("A revisão certificada não foi encontrada.");
  if (digest(revision.payload) !== revision.sha256) throw new FleetHistoryError("Falha de integridade na revisão certificada.");
  return revision;
}
export async function reopenFleetSagresMonth(db: PrismaClient, competence: string, actor: FleetHistoryActor, reason: string) {
  if (!actor.administrator) throw new FleetHistoryError("Apenas o administrador pode reabrir a competência.");
  validHistoryCompetence(competence);
  const note = requireHistoryText(reason, "Motivo da reabertura", 1000);
  return db.$transaction(async tx => {
    const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetSagresMonth" WHERE "competence" = ${competence} FOR UPDATE`;
    if (!locked.length) throw new FleetHistoryError("Competência não encontrada.");
    const month = await tx.fleetSagresMonth.findUniqueOrThrow({ where: { competence } });
    if (month.status !== "CERTIFICADO") throw new FleetHistoryError("Esta competência já está aberta.");
    await tx.fleetSagresMonth.update({
      where: { id: month.id },
      data: { status: "RASCUNHO", certifiedById: null, certifiedAt: null, certificationNote: null },
    });
    await historyEvent(tx, month.id, actor.actorId, "REABERTURA", { preservedRevision: month.revision, reason: note });
  });
}
