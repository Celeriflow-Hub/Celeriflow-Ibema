import type { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";
import { documentHash, newValidationCode, type EmployeeDocumentKind, type PayslipLine } from "./documents";

export const PORTAL_AVAILABLE_PAYROLL_STATUSES = ["Fechada", "Paga"];

/** Contracheque do próprio servidor — somente competências fechadas/pagas. */
export async function loadPayslip(db: PrismaClient, employeeId: string, payrollId: string) {
  const payroll = await db.payroll.findFirst({
    where: { id: payrollId, status: { in: PORTAL_AVAILABLE_PAYROLL_STATUSES } },
    select: { id: true, competence: true, type: true, status: true, closedAt: true, snapshotHash: true },
  });
  if (!payroll) return null;
  const items = await db.payrollItem.findMany({
    where: { payrollId, employeeId },
    select: { value: true, reference: true, event: { select: { code: true, name: true, type: true } } },
    orderBy: { event: { code: "asc" } },
  });
  const lines: PayslipLine[] = items.map((i) => ({ code: i.event.code, name: i.event.name, type: i.event.type, value: i.value, reference: i.reference }));
  return { payroll, lines };
}

/** Competências disponíveis do servidor (mais recente primeiro). */
export async function listEmployeePayrolls(db: PrismaClient, employeeId: string) {
  return db.payroll.findMany({
    where: { status: { in: PORTAL_AVAILABLE_PAYROLL_STATUSES }, items: { some: { employeeId } } },
    select: { id: true, competence: true, type: true, status: true, closedAt: true },
    orderBy: [{ closedAt: "desc" }, { createdAt: "desc" }],
  });
}

/** Lançamentos do ano, por competência, para ficha financeira e informe. */
export async function loadEmployeeYear(db: PrismaClient, employeeId: string, year: string) {
  const payrolls = await db.payroll.findMany({
    where: { competence: { endsWith: `/${year}` }, status: { in: PORTAL_AVAILABLE_PAYROLL_STATUSES }, items: { some: { employeeId } } },
    select: {
      competence: true, type: true,
      items: { where: { employeeId }, select: { value: true, event: { select: { code: true, name: true, type: true } } } },
    },
  });
  return payrolls
    .map((p) => ({ competence: p.competence, type: p.type, lines: p.items.map((i) => ({ code: i.event.code, name: i.event.name, type: i.event.type, value: i.value })) as PayslipLine[] }))
    .sort((a, b) => a.competence.localeCompare(b.competence));
}

export async function issueEmployeeDocument(db: PrismaClient, input: { kind: EmployeeDocumentKind; employeeId: string; reference: string; summary: Record<string, unknown> }) {
  const hash = documentHash({ kind: input.kind, employeeId: input.employeeId, reference: input.reference, summary: input.summary });
  const code = newValidationCode();
  const issue = await db.employeeDocumentIssue.create({
    data: { code, kind: input.kind, employeeId: input.employeeId, reference: input.reference, hashSha256: hash, summary: input.summary as object },
  });
  return issue;
}

export function qrSvg(url: string) {
  return QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M" });
}
