"use server";

import { revalidatePath } from "next/cache";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { parseEmployeeImport, type ImportIssue } from "@/lib/rh/payroll-obligations";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";

export type ImportResult = { error?: string; issues?: ImportIssue[]; created?: number; updated?: number; dryRun?: boolean; valid?: number };

/** Importa servidores da base anterior. Em modo simulação só retorna as inconsistências. */
export async function importServidores(text: string, dryRun: boolean): Promise<ImportResult> {
  try {
    if (text.length > 5_000_000) return { error: "Arquivo muito grande (máx. 5 MB)." };
    const { prisma, user } = await getTenantContextForModuleOperation("RH", "create");
    const existing = await prisma.employee.findMany({ where: { cpf: { not: null } }, select: { cpf: true } });
    const { rows, issues } = parseEmployeeImport(text, new Set(existing.map((e) => e.cpf!)));
    if (dryRun || !rows.length) return { issues, valid: rows.length, dryRun: true };
    let created = 0, updated = 0;
    for (const r of rows) {
      const data = { name: r.name, registration: r.registration, salaryBase: r.salaryBase, socialSecurityRegime: r.regime, admissionDate: r.admissionDate, bankCode: r.bankCode, bankAgency: r.bankAgency, bankAccount: r.bankAccount, pisPasep: r.pisPasep, email: r.email };
      const found = await prisma.employee.findUnique({ where: { cpf: r.cpf! }, select: { id: true } });
      await prisma.$transaction(async (tx) => {
        const emp = found ? await tx.employee.update({ where: { id: found.id }, data }) : await tx.employee.create({ data: { ...data, cpf: r.cpf } });
        await writeAuditEvent(tx, { actorUsuarioId: user.id, eventType: auditEventTypes.administrativeMutation, targetType: "EMPLOYEE", targetId: emp.id });
      });
      if (found) updated++; else created++;
    }
    revalidatePath("/rh/servidores");
    return { issues, created, updated, valid: rows.length };
  } catch (error) {
    console.error("Importação de servidores:", error);
    return { error: "Falha ao importar a base de servidores." };
  }
}
