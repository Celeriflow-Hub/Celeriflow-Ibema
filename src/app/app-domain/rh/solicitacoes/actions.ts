"use server";

import { revalidatePath } from "next/cache";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";

const day = (s: string) => new Date(`${s}T00:00:00.000Z`);

/** Decide uma solicitação do Portal do Servidor. Usado em <form action>: lança erro em falha. */
export async function decidePortalRequest(formData: FormData): Promise<void> {
  const context = await getTenantContextForModuleOperation("RH", "update");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500) || null;
  if (!["APROVADA", "INDEFERIDA"].includes(decision)) throw new Error("Decisão inválida.");
  if (decision === "INDEFERIDA" && !note) throw new Error("Informe o motivo do indeferimento.");

  await context.prisma.$transaction(async (tx) => {
    const req = await tx.employeePortalRequest.findUnique({ where: { id } });
    if (!req || req.status !== "PENDENTE") throw new Error("Solicitação não está pendente.");
    const p = req.payload as Record<string, string>;
    if (decision === "APROVADA") {
      if (req.kind === "FERIAS") {
        const start = day(p.start);
        const days = Number(p.days) || 30;
        const end = new Date(start.getTime() + (days - 1) * 86_400_000);
        const acqEnd = new Date(start.getTime() - 86_400_000);
        const acqStart = new Date(Date.UTC(acqEnd.getUTCFullYear() - 1, acqEnd.getUTCMonth(), acqEnd.getUTCDate() + 1));
        await tx.vacation.create({ data: { employeeId: req.employeeId, acquisitionStart: acqStart, acquisitionEnd: acqEnd, enjoymentStart: start, enjoymentEnd: end, days, status: "Programada" } });
      } else if (req.kind === "LICENCA") {
        await tx.leave.create({ data: { employeeId: req.employeeId, type: p.leaveType, startDate: day(p.start), endDate: day(p.end), reason: req.justification ?? "Solicitada pelo Portal do Servidor", status: "Ativa" } });
      } else if (req.kind === "ATUALIZACAO_CADASTRAL") {
        const allowed = ["email", "phone", "bankCode", "bankAgency", "bankAccount"] as const;
        const data = Object.fromEntries(allowed.filter((k) => p[k]).map((k) => [k, p[k]]));
        await tx.employee.update({ where: { id: req.employeeId }, data });
      }
    }
    await tx.employeePortalRequest.update({ where: { id }, data: { status: decision, decisionNote: note, decidedBy: context.user.id, decidedAt: new Date() } });
    await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.formSubmit, targetType: "EMPLOYEE_PORTAL_REQUEST", targetId: id });
  });
  revalidatePath("/rh/solicitacoes");
}
