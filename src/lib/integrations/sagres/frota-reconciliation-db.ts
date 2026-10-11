import type { Prisma, PrismaClient } from "@prisma/client";
import { parseCompetence } from "./engine";
import { readCertifiedFleetSagresMonth } from "./frota-history-certify";
import {
  reconcileFleetFuelLedger,
  type CertifiedFuelRow,
  type FuelLedgerRow,
} from "./frota-reconciliation";

function day(date: Date): string { return date.toISOString().slice(0, 10); }

/**
 * Read-only diagnostic based on the actual operational ledger in the supplied
 * competence, never present-day active membership. The monthly certification
 * is integrity-checked before its immutable fuel snapshot is compared.
 *
 * This diagnostic is not a TCE homologation and is never sent automatically.
 */
export async function reconcileFleetMonth(
  db: PrismaClient | Prisma.TransactionClient,
  competence: string,
  compareCertified = false,
) {
  const period = parseCompetence(competence);
  if (!period) throw new Error("Competência inválida.");
  const window = { gte: period.start, lt: period.end };
  const [fuel, monthlyOrders, expenses] = await Promise.all([
    db.fleetConsumption.findMany({
      where: { type: "COMBUSTIVEL", occurredAt: window },
      select: {
        id: true, unitId: true, material: true, measurementUnit: true,
        quantity: true, occurredAt: true, origin: true, cost: true, reference: true,
      },
    }),
    db.fleetFuelOrder.findMany({
      where: { status: "ABASTECIDA", filledAt: window },
      select: {
        id: true, code: true, unitId: true, status: true, consumptionId: true,
        litersFilled: true, pricePerLiter: true,
      },
    }),
    db.fleetExpense.findMany({
      where: { nature: "COMBUSTIVEL", occurredAt: window },
      select: {
        id: true, unitId: true, nature: true, sourceType: true,
        sourceId: true, sourceKey: true, amount: true,
      },
    }),
  ]);
  const fuelRows: FuelLedgerRow[] = fuel.map(c => ({
    id: c.id, unitId: c.unitId, material: c.material, measurementUnit: c.measurementUnit,
    quantity: Number(c.quantity), occurredAt: day(c.occurredAt), origin: c.origin,
    cost: c.cost === null ? null : Number(c.cost), reference: c.reference,
  }));
  // An order issued earlier but filled in this period should be included.
  const missingOrderConsumptions = fuelRows
    .filter(c => ["PORTAL_POSTO", "ORDEM_ABASTECIMENTO"].includes(c.origin))
    .map(c => c.id);
  const linkedOrders = missingOrderConsumptions.length
    ? await db.fleetFuelOrder.findMany({
      where: {
        consumptionId: { in: missingOrderConsumptions },
        id: { notIn: monthlyOrders.map(o => o.id) },
      },
      select: {
        id: true, code: true, unitId: true, status: true,
        consumptionId: true, litersFilled: true, pricePerLiter: true,
      },
    })
    : [];
  let certified: CertifiedFuelRow[] | undefined;
  let certifiedRevision: number | null = null;
  if (compareCertified) {
    // Certified comparisons are only invoked with the full Prisma client,
    // never inside a transaction that has not yet committed certification.
    const revision = await readCertifiedFleetSagresMonth(db as PrismaClient, competence);
    const payload = revision.payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
        !("fuelRecords" in payload) || !Array.isArray(payload.fuelRecords)) {
      throw new Error("A revisão certificada não contém o extrato de combustível esperado.");
    }
    const parsed: CertifiedFuelRow[] = [];
    for (const row of payload.fuelRecords) {
      if (!row || typeof row !== "object" || Array.isArray(row) ||
          typeof row.id !== "string" || typeof row.unitId !== "string" ||
          typeof row.material !== "string" || typeof row.measurementUnit !== "string" ||
          typeof row.quantity !== "number" || typeof row.occurredAt !== "string") {
        throw new Error("Extrato certificado contém campos inválidos.");
      }
      // Older certified versions may omit these newer metadata fields.
      if (("cost" in row && row.cost !== null &&
            (typeof row.cost !== "number" || !Number.isFinite(row.cost))) ||
          ("origin" in row && typeof row.origin !== "string") ||
          ("reference" in row && row.reference !== null && typeof row.reference !== "string")) {
        throw new Error("Metadados financeiros certificados inválidos.");
      }
      parsed.push({
        id: row.id, unitId: row.unitId, material: row.material,
        measurementUnit: row.measurementUnit, quantity: row.quantity,
        occurredAt: row.occurredAt,
        ...("cost" in row ? { cost: row.cost as number | null } : {}),
        ...("origin" in row ? { origin: row.origin as string } : {}),
        ...("reference" in row ? { reference: row.reference as string | null } : {}),
      });
    }
    certified = parsed;
    certifiedRevision = revision.version;
  }
  const result = reconcileFleetFuelLedger({
    current: fuelRows,
    orders: [...monthlyOrders, ...linkedOrders].map(o => ({
      ...o, litersFilled: o.litersFilled === null ? null : Number(o.litersFilled),
      pricePerLiter: o.pricePerLiter === null ? null : Number(o.pricePerLiter),
    })),
    expenses: expenses.map(e => ({ ...e, amount: e.amount === null ? null : Number(e.amount) })),
    certified,
  });
  return { competence, certifiedRevision, ...result };
}
