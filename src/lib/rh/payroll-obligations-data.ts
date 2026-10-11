import type { PrismaClient } from "@prisma/client";
import { totalsByEmployee, type ObligationEmployee, type ObligationItem } from "./payroll-obligations";

const employeeSelect = {
  id: true, name: true, cpf: true, registration: true, pisPasep: true, socialSecurityRegime: true, salaryBase: true,
  bankCode: true, bankAgency: true, bankAccount: true, secretariat: { select: { name: true } }, role: { select: { name: true } },
} as const;

type Loaded = { id: string; employee: { id: string; name: string; cpf: string | null; registration: string | null; pisPasep: string | null; socialSecurityRegime: string; salaryBase: number; bankCode: string | null; bankAgency: string | null; bankAccount: string | null; secretariat: { name: string } | null; role: { name: string } | null }; employeeId: string; value: number; event: { code: string; name: string; type: string } };

function toObligation(items: Loaded[]) {
  const employees = new Map<string, ObligationEmployee>();
  for (const i of items) {
    const e = i.employee;
    employees.set(e.id, { id: e.id, name: e.name, cpf: e.cpf, registration: e.registration, pisPasep: e.pisPasep, regime: e.socialSecurityRegime, secretariat: e.secretariat?.name ?? null, role: e.role?.name ?? null, bankCode: e.bankCode, bankAgency: e.bankAgency, bankAccount: e.bankAccount, salaryBase: e.salaryBase });
  }
  const obligationItems: ObligationItem[] = items.map((i) => ({ employeeId: i.employeeId, code: i.event.code, name: i.event.name, type: i.event.type, value: i.value }));
  return { employees: [...employees.values()], items: obligationItems };
}

export async function loadPayrollObligations(db: PrismaClient, payrollId: string) {
  const payroll = await db.payroll.findUnique({
    where: { id: payrollId },
    include: { items: { include: { event: true, employee: { select: employeeSelect } } } },
  });
  if (!payroll) return null;
  const { employees, items } = toObligation(payroll.items as unknown as Loaded[]);
  return { payroll, items, rows: totalsByEmployee(employees, items).sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function loadYearPayrolls(db: PrismaClient, year: string) {
  const payrolls = await db.payroll.findMany({
    where: { competence: { endsWith: `/${year}` } },
    include: { items: { include: { event: true, employee: { select: employeeSelect } } } },
  });
  return payrolls.map((p) => {
    const { employees, items } = toObligation(p.items as unknown as Loaded[]);
    return { type: p.type, rows: totalsByEmployee(employees, items) };
  });
}
