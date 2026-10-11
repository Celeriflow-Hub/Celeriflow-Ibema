import type { PrismaClient } from "@prisma/client";
import { parseCompetence, type SagresRecord } from "./engine";
import type { SagresLayoutCode } from "./layouts";

type Db = Pick<PrismaClient, "payroll" | "fleetConsumption" | "fleetFuelOrder" | "department" | "medicineDispensation">;

async function payrollRecords(db: Db, competence: string): Promise<SagresRecord[]> {
  const period = parseCompetence(competence)!;
  const payrolls = await db.payroll.findMany({
    where: { competence: period.payrollLabel },
    include: { items: { include: { event: true, employee: { include: { role: true, secretariat: true } } } } },
  });
  const byEmployee = new Map<string, SagresRecord & { vencimentos: number; descontos: number }>();
  for (const payroll of payrolls) {
    for (const item of payroll.items) {
      const key = `${payroll.id}:${item.employeeId}`;
      const employee = item.employee;
      const current = byEmployee.get(key) ?? {
        cpf: employee.cpf,
        matricula: employee.registration,
        nome: employee.name,
        cargo: employee.role?.name,
        lotacao: employee.secretariat?.name,
        tipoFolha: payroll.type,
        vencimentos: 0,
        descontos: 0,
      };
      if (item.event.type === "Vencimento") current.vencimentos += item.value;
      else if (item.event.type === "Desconto") current.descontos += item.value;
      byEmployee.set(key, current);
    }
  }
  return [...byEmployee.values()].map((row) => ({ ...row, liquido: row.vencimentos - row.descontos }));
}

async function fleetRecords(db: Db, competence: string): Promise<SagresRecord[]> {
  const period = parseCompetence(competence)!;
  const rows = await db.fleetConsumption.findMany({
    where: { occurredAt: { gte: period.start, lt: period.end } },
    include: { unit: true },
    orderBy: { occurredAt: "asc" },
  });
  const refs = rows.map((r) => r.reference).filter((r): r is string => !!r);
  const [orders, departments] = await Promise.all([
    refs.length ? db.fleetFuelOrder.findMany({ where: { code: { in: refs } }, include: { station: true } }) : Promise.resolve([]),
    db.department.findMany({ select: { id: true, name: true } }),
  ]);
  const orderByCode = new Map(orders.map((o) => [o.code, o]));
  const deptName = new Map(departments.map((d) => [d.id, d.name]));
  return rows.map((row) => {
    const order = row.reference ? orderByCode.get(row.reference) : undefined;
    return {
      codigoVeiculo: row.unit.code,
      placa: row.unit.plate,
      descricao: row.unit.name,
      data: row.occurredAt,
      tipo: row.type,
      material: row.material,
      quantidade: Number(row.quantity),
      unidade: row.measurementUnit,
      valor: row.cost === null ? null : Number(row.cost),
      fornecedor: row.supplierName,
      cnpjFornecedor: order?.station.cnpj ?? null,
      secretaria: deptName.get(row.unit.departmentId ?? "") ?? null,
      tipoMedidor: row.unit.meterType === "HORIMETRO" ? "HORA" : "KM",
      leitura: order?.reading == null ? null : Number(order.reading),
      documento: row.reference,
    };
  });
}
async function pharmacyRecords(db: Db, competence: string): Promise<SagresRecord[]> {
  const period = parseCompetence(competence)!;
  const rows = await db.medicineDispensation.findMany({
    where: { date: { gte: period.start, lt: period.end } },
    include: { medicine: { include: { material: { include: { healthProfile: true } } } }, batch: true, stock: true, unit: true, patient: { include: { person: true } } },
    orderBy: { date: "asc" },
  });
  return rows.map((row) => ({
    data: row.date,
    medicamento: row.medicine.name,
    apresentacao: row.medicine.presentation,
    lote: row.stock?.batchNumber || row.batch?.batchNumber || null,
    quantidade: row.quantity,
    unidadeSaude: row.unit.name,
    paciente: row.patient.cns ?? row.patient.person.cpf?.replace(/\D/g, "") ?? null,
    controlado: row.medicine.isControlled || row.medicine.material?.healthProfile?.portaria344List ? "S" : "N",
    catmat: row.medicine.material?.healthProfile?.catmatCode ?? null,
    listaPortaria344: row.medicine.material?.healthProfile?.portaria344List ?? null,
    validade: row.stock?.expirationDate ?? row.batch?.expirationDate ?? null,
    cnes: row.unit.cnes,
    valorUnitario: row.stock?.unitCost ?? null,
  }));
}

export function loadSagresRecords(db: Db, layout: SagresLayoutCode, competence: string) {
  if (layout === "MENSAL_FOLHA") return payrollRecords(db, competence);
  if (layout === "FROTA") return fleetRecords(db, competence);
  return pharmacyRecords(db, competence);
}
