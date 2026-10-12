import type { PrismaClient } from "@prisma/client";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";

export class C7OperationError extends Error {}

type Actor = { usuarioId: string; allowedBudgetUnitIds?: string[] };

function assertPlanScope(actor: Actor, budgetUnitId: string | null) {
  if (actor.allowedBudgetUnitIds && (!budgetUnitId || !actor.allowedBudgetUnitIds.includes(budgetUnitId))) throw new C7OperationError("Plano de controle fora das unidades gestoras autorizadas.");
}

function required(value: string | undefined, label: string) {
  const normalized = value?.trim();
  if (!normalized) throw new C7OperationError(`${label} é obrigatório.`);
  return normalized;
}

function optionalDate(value?: Date) {
  if (!value) return undefined;
  if (Number.isNaN(value.valueOf())) throw new C7OperationError("Data inválida.");
  return value;
}

export async function createInternalControlPlan(db: PrismaClient, actor: Actor, input: { title: string; reference: string; dueAt?: Date; budgetUnitId?: string }) {
  const title = required(input.title, "Título do plano");
  const reference = required(input.reference, "Referência");
  const dueAt = optionalDate(input.dueAt);
  const budgetUnitId = input.budgetUnitId?.trim() || null;
  assertPlanScope(actor, budgetUnitId);
  if (budgetUnitId && !await db.planningEntityUnit.findUnique({ where: { budgetUnitId }, select: { governmentEntityId: true } })) throw new C7OperationError("A unidade gestora do plano deve estar vinculada à entidade.");
  return db.internalControlPlan.create({ data: { title, reference, dueAt, budgetUnitId, ownerId: required(actor.usuarioId, "Usuário responsável") } });
}

export async function createInternalControlFinding(db: PrismaClient, actor: Actor, input: { planId: string; title: string; description: string; responsibleId?: string; evidenceDocumentId?: string; dueAt?: Date }) {
  const planId = required(input.planId, "Plano de controle");
  const title = required(input.title, "Título do apontamento");
  const description = required(input.description, "Descrição do apontamento");
  const dueAt = optionalDate(input.dueAt);
  return db.$transaction(async (tx) => {
    const [plan, responsible, evidence] = await Promise.all([
      tx.internalControlPlan.findUnique({ where: { id: planId }, select: { id: true, status: true, budgetUnitId: true } }),
      input.responsibleId?.trim() ? tx.employee.findFirst({ where: { id: input.responsibleId.trim(), isActive: true }, select: { id: true } }) : null,
      input.evidenceDocumentId?.trim() ? tx.document.findFirst({ where: { id: input.evidenceDocumentId.trim(), status: "Válido" }, select: { id: true } }) : null,
    ]);
    if (!plan || plan.status !== "ABERTO") throw new C7OperationError("O apontamento exige um plano de controle aberto.");
    assertPlanScope(actor, plan.budgetUnitId);
    if (input.responsibleId?.trim() && !responsible) throw new C7OperationError("Servidor responsável não encontrado ou inativo.");
    if (input.evidenceDocumentId?.trim() && !evidence) throw new C7OperationError("A evidência deve apontar para um documento GED válido.");
    const finding = await tx.internalControlFinding.create({
      data: { planId, title, description, dueAt, responsibleId: responsible?.id, evidenceDocumentId: evidence?.id },
    });
    await writeAuditEvent(tx, { actorUsuarioId: required(actor.usuarioId, "Usuário responsável"), eventType: auditEventTypes.internalControlFindingRegistered, targetType: "INTERNAL_CONTROL_FINDING", targetId: finding.id });
    return finding;
  });
}

export async function resolveInternalControlFinding(db: PrismaClient, actor: Actor, findingId: string) {
  const id = required(findingId, "Apontamento");
  return db.$transaction(async (tx) => {
    const finding = await tx.internalControlFinding.findUnique({ where: { id }, select: { id: true, status: true, plan: { select: { budgetUnitId: true } } } });
    if (!finding || finding.status === "RESOLVIDO") throw new C7OperationError("Apontamento não encontrado ou já resolvido.");
    assertPlanScope(actor, finding.plan.budgetUnitId);
    const resolved = await tx.internalControlFinding.update({ where: { id }, data: { status: "RESOLVIDO", resolvedAt: new Date() } });
    await writeAuditEvent(tx, { actorUsuarioId: required(actor.usuarioId, "Usuário responsável"), eventType: auditEventTypes.internalControlFindingRegistered, targetType: "INTERNAL_CONTROL_FINDING", targetId: resolved.id });
    return resolved;
  });
}
