import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createExpenseRequest } from "@/lib/financeiro";
import { AccessError, assertBudgetUnitAccess, canPerformModuleOperation, type AppContext } from "@/lib/platform/tenant-context";
import { assertPayrollBudgetScope } from "./payroll-access";
import { enqueueHrIntegration } from "./workforce-service";

const targetSchema = z.object({ appropriationId: z.string().min(1), supplierId: z.string().min(1), secretariatId: z.string().min(1) }).strict();
const policySchema = z.object({ origin: z.literal("FOLHA_SOLICITACOES_DESPESA"), legalReference: z.string().min(3), mappings: z.array(z.object({ costCenterId: z.string().nullable(), gross: targetSchema, employer: targetSchema.optional() }).strict()).min(1) }).strict();
type PlanLine = z.infer<typeof targetSchema> & { key: string; costCenterId: string | null; component: "GROSS" | "EMPLOYER"; value: string };
const planLineSchema = targetSchema.extend({ key: z.string(), costCenterId: z.string().nullable(), component: z.enum(["GROSS", "EMPLOYER"]), value: z.string() });
const preparedSchema = z.object({ runId: z.string(), ruleId: z.string(), date: z.string(), legalReference: z.string(), lines: z.array(planLineSchema) });

export function planPayrollExpenses(statements: { gross: Prisma.Decimal; employer: Prisma.Decimal; snapshot: Prisma.JsonValue }[], rawPolicy: unknown): PlanLine[] {
  const policy = policySchema.parse(rawPolicy);
  if (new Set(policy.mappings.map(mapping => mapping.costCenterId)).size !== policy.mappings.length) throw new Error("Centro de custo duplicado no mapeamento financeiro.");
  const groups = new Map<string | null, { gross: Prisma.Decimal; employer: Prisma.Decimal }>();
  for (const statement of statements) {
    const { contract } = z.object({ contract: z.object({ costCenterId: z.string().nullable() }) }).parse(statement.snapshot);
    const current = groups.get(contract.costCenterId) || { gross: new Prisma.Decimal(0), employer: new Prisma.Decimal(0) };
    current.gross = current.gross.add(statement.gross); current.employer = current.employer.add(statement.employer); groups.set(contract.costCenterId, current);
  }
  const lines: PlanLine[] = [];
  for (const [costCenterId, group] of [...groups.entries()].sort(([a], [b]) => (a || "").localeCompare(b || ""))) {
    const mapping = policy.mappings.find(mapping => mapping.costCenterId === costCenterId);
    if (!mapping) throw new Error(`Mapeamento financeiro ausente para o centro ${costCenterId || "SEM_CENTRO"}.`);
    for (const component of ["GROSS", "EMPLOYER"] as const) {
      const value = component === "GROSS" ? group.gross : group.employer;
      if (value.isZero()) continue;
      if (!value.isFinite() || value.lt(0)) throw new Error("Componente financeiro negativo exige fluxo compensatório.");
      const target = component === "GROSS" ? mapping.gross : mapping.employer;
      if (!target) throw new Error("Encargos patronais exigem classificação própria no mapeamento.");
      lines.push({ ...target, key: JSON.stringify([costCenterId, component]), costCenterId, component, value: value.toFixed(2) });
    }
  }
  return lines;
}

/** Native Expense requests use a durable plan and independent idempotent steps.
 * A failure after one successful request is recoverable without duplicating it.
 * This does not bypass reservation, approval, accounting or payment gates. */
export async function dispatchPayrollExpenseRequests(context: AppContext, raw: unknown) {
  if (!canPerformModuleOperation(context.user, "RH", "update") || !canPerformModuleOperation(context.user, "FINANCEIRO", "create")) throw new AccessError("Integração exige alteração RH e criação no Financeiro.", 403);
  const input = z.object({ runId: z.string().min(1), ruleId: z.string().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), mode: z.enum(["PREVIA", "APLICAR"]) }).strict().parse(raw);
  const date = new Date(`${input.date}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== input.date) throw new Error("Data financeira inválida.");
  const db = context.prisma;
  const run = await db.hrPayrollRun.findUniqueOrThrow({ where: { id: input.runId }, include: { statements: true } });
  await assertPayrollBudgetScope(context, run.payrollId);
  if (run.mode !== "OFICIAL" || run.status !== "FECHADA") throw new Error("Integração exige cálculo oficial fechado.");
  const sourceKey = `FINANCEIRO:DESPESAS:${run.id}`;
  const existing = await db.hrIntegrationEvent.findUnique({ where: { sourceKey } });
  let prepared: z.infer<typeof preparedSchema>;
  if (existing) {
    prepared = preparedSchema.parse(existing.payload);
    if (prepared.ruleId !== input.ruleId || prepared.date !== input.date) throw new Error("Plano financeiro já preparado com outra classificação/data. Preserve a origem e use conciliação própria.");
  } else {
    const rule = await db.hrPayrollRule.findUniqueOrThrow({ where: { id: input.ruleId }, include: { ruleSet: true } });
    if (!rule.isActive || rule.ruleSet.status !== "ATIVA" || rule.ruleSetId !== run.ruleSetId) throw new Error("Mapeamento ativo do mesmo conjunto da folha é obrigatório.");
    const policy = policySchema.parse(rule.value);
    prepared = { runId: run.id, ruleId: rule.id, date: input.date, legalReference: policy.legalReference, lines: planPayrollExpenses(run.statements, policy) };
  }
  for (const line of prepared.lines) {
    const appropriation = await db.budgetAppropriation.findUniqueOrThrow({ where: { id: line.appropriationId }, include: { budgetUnit: { select: { secretariatId: true } } } });
    assertBudgetUnitAccess(context.user, appropriation.budgetUnitId);
    if (appropriation.budgetUnit.secretariatId !== line.secretariatId) throw new Error("Secretaria do mapeamento difere da unidade da dotação.");
    const supplier = await db.supplier.findUniqueOrThrow({ where: { id: line.supplierId } });
    if (supplier.status !== "Ativo") throw new Error("Credor/fornecedor inativo no mapeamento financeiro.");
  }
  if (input.mode === "PREVIA") return { applied: false, lines: prepared.lines, expenseIds: [] as string[] };
  if (run.scope !== "PRODUCAO") throw new Error("Folha demonstrativa/homologação não pode gerar despesas no Financeiro real.");
  if (!existing) {
    const set = await db.hrPayrollRuleSet.findUniqueOrThrow({ where: { id: run.ruleSetId } });
    if (set.scope !== "PRODUCAO" || set.isDemo || !set.approvedAt || set.approvedAt > new Date() || !set.legalReference) throw new Error("Despesas reais exigem parâmetros oficiais aprovados e fundamento legal.");
  }
  const event = await db.$transaction(tx => enqueueHrIntegration(tx, { sourceKey, domain: "FINANCEIRO", environment: run.scope, eventType: "SOLICITACOES_DESPESA_FOLHA", payload: prepared }));
  await db.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "PROCESSANDO", attempts: { increment: 1 } } });
  try {
    const expenseIds: string[] = [];
    for (const line of prepared.lines) {
      const idempotencyKey = `RH:RUN:${run.id}:DESPESA:${line.key}`;
      const previous = await db.expense.findUnique({ where: { idempotencyKey } });
      if (previous && (previous.sourceId !== run.id || previous.appropriationId !== line.appropriationId || previous.supplierId !== line.supplierId || previous.secretariatId !== line.secretariatId || !previous.valueDecimal?.eq(line.value))) throw new Error("Despesa existente diverge do plano imutável da folha.");
      const expense = await createExpenseRequest(db, { usuarioId: context.user.id, employeeId: context.user.employeeId, allowedBudgetUnitIds: context.user.allowedBudgetUnitIds }, { date, description: `Folha ${run.id} · ${line.component} · ${line.costCenterId || "SEM_CENTRO"} · ${prepared.legalReference}`, value: line.value, appropriationId: line.appropriationId, supplierId: line.supplierId, secretariatId: line.secretariatId, sourceModule: "RH", sourceType: "PAYROLL_RUN", sourceId: run.id, eventType: "FOLHA_FECHADA", idempotencyKey });
      expenseIds.push(expense.id);
    }
    await db.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "CONCLUIDA", result: { expenseIds, committed: false, paid: false } } });
    return { applied: true, lines: prepared.lines, expenseIds };
  } catch (error) {
    await db.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "AGUARDANDO_RETRY", result: { message: error instanceof Error ? error.message : "Falha na criação de despesa." } } });
    throw error;
  }
}
