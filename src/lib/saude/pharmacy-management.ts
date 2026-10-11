import type { Prisma } from "@prisma/client";
import type { AppContext } from "@/lib/platform/tenant-context";
import { competenceRange, coverageDays, expiryStatus, lossReason, prescriptionTypeFor, stockLevel } from "./pharmacy-engine";

type Ctx = Pick<AppContext, "prisma" | "user">;
function unitScope(ctx: Ctx) { return ctx.user.hasHealthAccessScope ? ctx.user.allowedHealthUnitIds || [] : undefined; }
function warehouseWhere(ctx: Ctx): Prisma.WarehouseWhereInput { const ids = unitScope(ctx); return { healthUnitId: ids ? { in: ids } : { not: null } }; }

export async function stockPosition(ctx: Ctx, competence: string) {
  const { start, end, days } = competenceRange(competence);
  const [stocks, policies, consumed] = await Promise.all([
    ctx.prisma.materialStock.findMany({ where: { quantity: { gt: 0 }, material: { healthProfile: { isActive: true } }, warehouse: warehouseWhere(ctx) }, include: { material: { include: { healthProfile: true } }, warehouse: true }, orderBy: [{ expirationDate: "asc" }], take: 3000 }),
    ctx.prisma.healthStockPolicy.findMany({ where: { isActive: true, warehouse: warehouseWhere(ctx) } }),
    ctx.prisma.medicineDispensation.groupBy({ by: ["warehouseId", "medicineId"], where: { date: { gte: start, lt: end }, warehouse: warehouseWhere(ctx) }, _sum: { quantity: true } }),
  ]);
  const medicines = await ctx.prisma.medicine.findMany({ where: { id: { in: consumed.map((c) => c.medicineId) } }, select: { id: true, materialId: true } });
  const matOf = new Map(medicines.map((m) => [m.id, m.materialId]));
  const consumedBy = new Map<string, number>();
  for (const c of consumed) { const k = `${c.warehouseId}|${matOf.get(c.medicineId)}`; consumedBy.set(k, (consumedBy.get(k) ?? 0) + Number(c._sum.quantity ?? 0)); }
  const policyBy = new Map(policies.map((p) => [`${p.warehouseId}|${p.materialId}`, p]));
  const totals = new Map<string, number>();
  for (const s of stocks) { const k = `${s.warehouseId}|${s.materialId}`; totals.set(k, (totals.get(k) ?? 0) + s.quantity); }
  const lots = stocks.map((s) => ({ id: s.id, material: s.material.name, materialId: s.materialId, catmat: s.material.healthProfile?.catmatCode ?? null, list344: s.material.healthProfile?.portaria344List ?? null, warehouse: s.warehouse.name, warehouseId: s.warehouseId, batch: s.batchNumber, expiration: s.expirationDate, quantity: s.quantity, value: (s.unitCost ?? 0) * s.quantity, blocked: !!s.blockedAt, ...expiryStatus(s.expirationDate) }));
  const products = [...totals.entries()].map(([k, qty]) => {
    const [warehouseId, materialId] = k.split("|"), lot = lots.find((l) => l.warehouseId === warehouseId && l.materialId === materialId)!, p = policyBy.get(k), used = consumedBy.get(k) ?? 0;
    return { warehouseId, materialId, material: lot.material, catmat: lot.catmat, warehouse: lot.warehouse, quantity: qty, min: p?.minQuantity ?? 0, max: p?.maxQuantity ?? 0, level: stockLevel(qty, p?.minQuantity ?? 0, p?.maxQuantity ?? 0), consumed: used, coverage: coverageDays(qty, used, days) };
  }).sort((a, b) => a.material.localeCompare(b.material));
  const belowMin = policies.filter((p) => p.minQuantity > 0 && (totals.get(`${p.warehouseId}|${p.materialId}`) ?? 0) < p.minQuantity);
  return { lots, products, belowMinCount: belowMin.length, zeroedPolicies: belowMin.filter((p) => !totals.has(`${p.warehouseId}|${p.materialId}`)).map((p) => p.materialId) };
}

export async function dispensations(ctx: Ctx, competence: string, controlledOnly = false) {
  const { start, end } = competenceRange(competence);
  const ids = unitScope(ctx);
  const rows = await ctx.prisma.medicineDispensation.findMany({
    where: { date: { gte: start, lt: end }, ...(ids ? { unitId: { in: ids } } : {}), ...(controlledOnly ? { OR: [{ medicine: { isControlled: true } }, { medicine: { material: { healthProfile: { portaria344List: { not: null } } } } }] } : {}) },
    include: { medicine: { include: { material: { include: { healthProfile: true } } } }, batch: true, stock: true, unit: true, patient: { include: { person: true } }, dispensedByProfessional: { select: { employee: { select: { name: true } } } } },
    orderBy: { date: "asc" }, take: 20000,
  });
  return rows.map((r) => {
    const list = r.medicine.material?.healthProfile?.portaria344List ?? null;
    return { id: r.id, date: r.date, medicine: r.medicine.name, presentation: r.medicine.presentation, catmat: r.medicine.material?.healthProfile?.catmatCode ?? null, list344: list, prescriptionType: prescriptionTypeFor(list), batch: r.stock?.batchNumber || r.batch?.batchNumber || null, expiration: r.stock?.expirationDate ?? r.batch?.expirationDate ?? null, quantity: r.quantity, unitCost: r.stock?.unitCost ?? null, unit: r.unit.name, cnes: r.unit.cnes, patient: r.patient.person.fullName, cns: r.patient.cns, cpf: r.patient.person.cpf, professional: r.dispensedByProfessional?.employee.name ?? null };
  });
}

export async function consumptionSummary(ctx: Ctx, competence: string) {
  const rows = await dispensations(ctx, competence);
  const map = new Map<string, { medicine: string; catmat: string | null; quantity: number; patients: Set<string>; value: number }>();
  for (const r of rows) { const m = map.get(r.medicine) ?? { medicine: r.medicine, catmat: r.catmat, quantity: 0, patients: new Set(), value: 0 }; m.quantity += r.quantity; m.patients.add(r.cns ?? r.cpf ?? r.patient); m.value += (r.unitCost ?? 0) * r.quantity; map.set(r.medicine, m); }
  return [...map.values()].map((m) => ({ ...m, patients: m.patients.size, value: Math.round(m.value * 100) / 100 })).sort((a, b) => b.quantity - a.quantity);
}

export async function losses(ctx: Ctx, competence: string) {
  const { start, end } = competenceRange(competence);
  const rows = await ctx.prisma.materialMovement.findMany({ where: { date: { gte: start, lt: end }, reason: { startsWith: "BAIXA_ASSISTENCIAL:" }, warehouse: warehouseWhere(ctx) }, include: { material: true, warehouse: true, stock: true }, orderBy: { date: "asc" }, take: 5000 });
  return rows.map((r) => ({ date: r.date, material: r.material.name, warehouse: r.warehouse.name, batch: r.stock?.batchNumber ?? null, quantity: Math.abs(r.quantity), value: Math.round(Math.abs(r.quantity) * (r.unitValue ?? r.stock?.unitCost ?? 0) * 100) / 100, category: lossReason(r.reason), reason: (r.reason ?? "").replace(/^BAIXA_ASSISTENCIAL:/, "") }));
}
