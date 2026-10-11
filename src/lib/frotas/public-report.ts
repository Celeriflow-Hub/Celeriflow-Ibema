import type { PrismaClient } from "@prisma/client";

type PublicDb = Pick<PrismaClient, "fleetUnit" | "fleetConsumption" | "fleetExpense" | "department">;

export function publicFleetMonth(competence: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(competence)) throw new Error("Competência inválida.");
  const [year, month] = competence.split("-").map(Number);
  return { start: new Date(Date.UTC(year, month - 1, 1)), end: new Date(Date.UTC(year, month, 1)) };
}

/**
 * The public projection deliberately contains no driver IDs, trip destinations,
 * tokens, photos, or other operational/personal data. It is automatically built
 * from the operational Fleet tables, never maintained independently.
 */
export async function loadPublicFleetReport(db: PublicDb, competence: string, departmentId = "") {
  const { start, end } = publicFleetMonth(competence);
  const [departments, units] = await Promise.all([
    db.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.fleetUnit.findMany({
      where: { status: "ATIVO", ...(departmentId ? { departmentId } : {}) },
      select: { id: true, code: true, name: true, category: true, plate: true, year: true, departmentId: true },
      orderBy: { code: "asc" },
    }),
  ]);
  const ids = units.map(u => u.id);
  const window = { gte: start, lt: end };
  const [fuel, maintenance, fuelUnknown, maintenanceUnknown] = await Promise.all([
    db.fleetConsumption.groupBy({
      by: ["unitId"], where: { unitId: { in: ids }, type: "COMBUSTIVEL", occurredAt: window },
      _sum: { quantity: true, cost: true },
    }),
    db.fleetExpense.groupBy({
      by: ["unitId"], where: { unitId: { in: ids }, nature: "MANUTENCAO", occurredAt: window },
      _sum: { amount: true },
    }),
    db.fleetConsumption.count({ where: { unitId: { in: ids }, type: "COMBUSTIVEL", occurredAt: window, cost: null } }),
    db.fleetExpense.count({ where: { unitId: { in: ids }, nature: "MANUTENCAO", occurredAt: window, amount: null } }),
  ]);
  const departmentById = new Map(departments.map(d => [d.id, d.name]));
  const fuelByUnit = new Map(fuel.map(x => [x.unitId, x._sum]));
  const maintenanceByUnit = new Map(maintenance.map(x => [x.unitId, x._sum]));
  const rows = units.map(u => ({
    code: u.code,
    name: u.name,
    category: u.category,
    plate: u.plate,
    year: u.year,
    department: departmentById.get(u.departmentId ?? "") ?? "Não informado",
    liters: Number(fuelByUnit.get(u.id)?.quantity ?? 0),
    fuelCost: !fuelByUnit.has(u.id) ? 0 : fuelByUnit.get(u.id)?.cost == null ? null : Number(fuelByUnit.get(u.id)?.cost),
    maintenanceCost: !maintenanceByUnit.has(u.id) ? 0 : maintenanceByUnit.get(u.id)?.amount == null ? null : Number(maintenanceByUnit.get(u.id)?.amount),
  }));
  return {
    competence,
    departments,
    rows,
    totals: {
      activeVehicles: rows.length,
      liters: rows.reduce((sum, row) => sum + row.liters, 0),
      fuelCostKnown: rows.reduce((sum, row) => sum + (row.fuelCost ?? 0), 0),
      maintenanceCostKnown: rows.reduce((sum, row) => sum + (row.maintenanceCost ?? 0), 0),
      fuelUnknown,
      maintenanceUnknown,
    },
  };
}

function safeCell(value: unknown) {
  let text = String(value ?? "").replace(/\r|\n/g, " ").trim();
  // Excel and other spreadsheet applications treat these leading characters
  // as formulas even inside quoted CSV fields.
  if (/^[=+\-@\t]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export function publicFleetCsv(report: Awaited<ReturnType<typeof loadPublicFleetReport>>) {
  const columns = ["Código", "Veículo", "Categoria", "Placa", "Ano", "Secretaria/setor", "Litros", "Combustível (R$ conhecidos)", "Manutenção (R$ conhecidos)"];
  const lines = report.rows.map(r => [
    r.code, r.name, r.category, r.plate ?? "", r.year ?? "", r.department,
    r.liters.toFixed(3), r.fuelCost == null ? "" : r.fuelCost.toFixed(2),
    r.maintenanceCost == null ? "" : r.maintenanceCost.toFixed(2),
  ].map(safeCell).join(";"));
  return "\uFEFF" + [columns.map(safeCell).join(";"), ...lines].join("\r\n") + "\r\n";
}
