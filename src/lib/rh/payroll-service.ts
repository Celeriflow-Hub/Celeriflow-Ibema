import { createHash } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { calculatePayroll, normalizePayrollType, type EmployeeInput, type VariableKind } from "./payroll-engine";

export class PayrollServiceError extends Error {}

type Db = PrismaClient;

async function ensureEvent(db: Db, cache: Map<string, string>, code: string, name: string, type: string) {
  const key = `CF${code}`;
  if (cache.has(key)) return cache.get(key)!;
  const event = await db.payrollEvent.upsert({
    where: { code: key },
    update: {},
    create: { code: key, name, type, formula: "Motor de cálculo CeleriFlow" },
  });
  cache.set(key, event.id);
  return event.id;
}

function monthsWorkedInYear(admission: Date | null, competence: string) {
  const year = Number(competence.split("/")[1]);
  const month = Number(competence.split("/")[0]) || 12;
  if (!admission || admission.getFullYear() < year) return month === 12 ? 12 : month;
  const start = admission.getMonth() + (admission.getDate() <= 15 ? 0 : 1);
  return Math.max(0, Math.min(12, (month === 12 ? 12 : month) - start));
}

/** Recalcula todos os servidores ativos de uma folha aberta e grava as rubricas. */
export async function calculatePayrollRun(db: Db, payrollId: string, actor?: string) {
  const payroll = await db.payroll.findUnique({ where: { id: payrollId } });
  if (!payroll) throw new PayrollServiceError("Folha não encontrada.");
  if (payroll.status !== "Aberta") throw new PayrollServiceError("A folha está fechada. Reabra a competência para recalcular.");
  const type = normalizePayrollType(payroll.type);

  const [employees, variables, advances] = await Promise.all([
    db.employee.findMany({
      where: { isActive: true },
      include: { dependents: true, benefits: { where: { status: "Ativo" }, include: { benefitConfig: true } } },
      orderBy: { name: "asc" },
    }),
    db.payrollVariable.findMany({ where: { payrollId } }),
    type === "13º Salário"
      ? db.payrollItem.findMany({ where: { event: { code: "CF060" }, payroll: { competence: { endsWith: payroll.competence.split("/")[1] } } } })
      : Promise.resolve([]),
  ]);

  const inputs: EmployeeInput[] = employees.map((e) => ({
    id: e.id,
    name: e.name,
    salaryBase: e.salaryBase,
    contractedHours: e.contractedHours,
    regime: e.socialSecurityRegime === "RPPS" ? "RPPS" : "RGPS",
    irrfDependents: e.dependents.filter((d) => d.irrfDependent).length,
    monthsWorked: monthsWorkedInYear(e.admissionDate, payroll.competence),
    thirteenthAdvancePaid: advances.filter((a) => a.employeeId === e.id).reduce((s, a) => s + a.value, 0),
    benefits: type === "Mensal" ? e.benefits.map((b) => ({ name: b.benefitConfig.name, value: b.customValue ?? b.benefitConfig.baseValue })) : [],
    variables: variables
      .filter((v) => v.employeeId === e.id)
      .map((v) => ({ kind: v.kind as VariableKind, quantity: v.quantity, value: v.value, note: v.note })),
    vacationDays: variables.find((v) => v.employeeId === e.id && v.kind === "FERIAS_DIAS")?.quantity,
    terminationDaysWorked: variables.find((v) => v.employeeId === e.id && v.kind === "DIAS_TRABALHADOS")?.quantity,
    complementValue: variables.filter((v) => v.employeeId === e.id && v.kind === "COMPLEMENTO").reduce((s, v) => s + v.value, 0) || undefined,
  }));

  const result = calculatePayroll(inputs, type);
  const cache = new Map<string, string>();
  const items: Prisma.PayrollItemCreateManyInput[] = [];
  for (const employee of result.results) {
    for (const rubric of employee.rubrics) {
      const eventId = await ensureEvent(db, cache, rubric.code, rubric.name, rubric.type);
      items.push({ payrollId, employeeId: employee.employeeId, eventId, value: rubric.value, reference: rubric.reference ?? null });
    }
  }

  const warnings = result.results.flatMap((r) => r.warnings.map((w) => `${r.name}: ${w}`));
  await db.$transaction([
    db.payrollItem.deleteMany({ where: { payrollId } }),
    db.payrollItem.createMany({ data: items }),
    db.payroll.update({
      where: { id: payrollId },
      data: { grossValue: result.gross, discountValue: result.discounts, totalValue: result.net, calculatedAt: new Date() },
    }),
    db.payrollAuditLog.create({
      data: { payrollId, action: "CALCULO", actor, details: { servidores: result.results.length, bruto: result.gross, liquido: result.net, avisos: warnings } },
    }),
  ]);
  return { employees: result.results.length, gross: result.gross, net: result.net, warnings };
}

/** Fecha a competência gravando um retrato imutável (snapshot) com código de conferência. */
export async function closePayrollRun(db: Db, payrollId: string, actor?: string) {
  const payroll = await db.payroll.findUnique({
    where: { id: payrollId },
    include: { items: { include: { event: true, employee: { select: { name: true, cpf: true, registration: true } } }, orderBy: [{ employeeId: "asc" }, { eventId: "asc" }] } },
  });
  if (!payroll) throw new PayrollServiceError("Folha não encontrada.");
  if (payroll.status !== "Aberta") throw new PayrollServiceError("A folha já está fechada.");
  if (!payroll.calculatedAt || !payroll.items.length) throw new PayrollServiceError("Calcule a folha antes de fechar.");

  const snapshot = {
    competencia: payroll.competence,
    tipo: payroll.type,
    bruto: payroll.grossValue,
    descontos: payroll.discountValue,
    liquido: payroll.totalValue,
    itens: payroll.items.map((i) => ({
      servidor: i.employee.name, cpf: i.employee.cpf, matricula: i.employee.registration,
      rubrica: i.event.code, descricao: i.event.name, tipo: i.event.type, valor: i.value, referencia: i.reference,
    })),
  };
  const hash = createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
  await db.$transaction([
    db.payroll.update({ where: { id: payrollId }, data: { status: "Fechada", closedAt: new Date(), closedBy: actor, snapshot, snapshotHash: hash } }),
    db.payrollAuditLog.create({ data: { payrollId, action: "FECHAMENTO", actor, details: { hash } } }),
  ]);
  return { hash };
}

/** Reabertura controlada: exige justificativa e preserva o snapshot anterior na auditoria. */
export async function reopenPayrollRun(db: Db, payrollId: string, reason: string, actor?: string) {
  if (reason.trim().length < 10) throw new PayrollServiceError("Informe uma justificativa com pelo menos 10 caracteres.");
  const payroll = await db.payroll.findUnique({ where: { id: payrollId } });
  if (!payroll) throw new PayrollServiceError("Folha não encontrada.");
  if (payroll.status === "Paga") throw new PayrollServiceError("Folha já paga não pode ser reaberta.");
  if (payroll.status !== "Fechada") throw new PayrollServiceError("Só é possível reabrir uma folha fechada.");
  await db.$transaction([
    db.payroll.update({ where: { id: payrollId }, data: { status: "Aberta", closedAt: null, closedBy: null, snapshot: Prisma.DbNull, snapshotHash: null } }),
    db.payrollAuditLog.create({
      data: { payrollId, action: "REABERTURA", actor, reason: reason.trim(), details: { hashAnterior: payroll.snapshotHash, snapshotAnterior: (payroll.snapshot ?? null) as Prisma.InputJsonValue | null } },
    }),
  ]);
}
