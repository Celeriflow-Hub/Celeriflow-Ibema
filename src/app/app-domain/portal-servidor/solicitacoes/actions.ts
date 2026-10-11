"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");
const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("FERIAS"), start: date, days: z.coerce.number().int().refine((d) => [10, 15, 20, 30].includes(d), "Escolha 10, 15, 20 ou 30 dias."), justification: z.string().max(500).optional() }),
  z.object({ kind: z.literal("LICENCA"), leaveType: z.string().min(3).max(80), start: date, end: date, justification: z.string().max(500).optional() }),
  z.object({
    kind: z.literal("ATUALIZACAO_CADASTRAL"),
    email: z.string().email("E-mail inválido.").or(z.literal("")).optional(),
    phone: z.string().max(20).optional(),
    bankCode: z.string().regex(/^\d{0,3}$/, "Banco: até 3 dígitos.").optional(),
    bankAgency: z.string().max(10).optional(),
    bankAccount: z.string().max(20).optional(),
    justification: z.string().max(500).optional(),
  }),
]);

export async function createPortalRequest(input: Record<string, string>): Promise<{ error?: string; ok?: boolean }> {
  try {
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
    const access = await getEmployeePortalAccess();
    if (access.status !== "AVAILABLE") return { error: "Seu usuário não possui vínculo funcional ativo." };
    const { kind, justification, ...rest } = parsed.data;
    if (kind === "LICENCA" && "end" in rest && rest.end < rest.start) return { error: "A data final deve ser posterior à inicial." };
    const payload = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== "" && v !== undefined));
    if (kind === "ATUALIZACAO_CADASTRAL" && !Object.keys(payload).length) return { error: "Informe ao menos um dado para atualizar." };
    const db = access.context.prisma;
    const pending = await db.employeePortalRequest.count({ where: { employeeId: access.employee.id, kind, status: "PENDENTE" } });
    if (pending) return { error: "Já existe uma solicitação deste tipo em análise." };
    const created = await db.employeePortalRequest.create({ data: { employeeId: access.employee.id, kind, payload, justification: justification || null } });
    await writeAuditEvent(db, { actorUsuarioId: access.context.user.id, eventType: auditEventTypes.formSubmit, targetType: "EMPLOYEE_PORTAL_REQUEST", targetId: created.id });
    revalidatePath("/portal-servidor/solicitacoes");
    return { ok: true };
  } catch (error) {
    console.error("createPortalRequest", error);
    return { error: "Não foi possível registrar a solicitação." };
  }
}

export async function cancelPortalRequest(id: string): Promise<{ error?: string }> {
  const access = await getEmployeePortalAccess();
  if (access.status !== "AVAILABLE") return { error: "Sem vínculo funcional ativo." };
  const r = await access.context.prisma.employeePortalRequest.updateMany({ where: { id, employeeId: access.employee.id, status: "PENDENTE" }, data: { status: "CANCELADA" } });
  if (!r.count) return { error: "Solicitação não pode ser cancelada." };
  revalidatePath("/portal-servidor/solicitacoes");
  return {};
}
