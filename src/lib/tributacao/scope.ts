import { Prisma, type PrismaClient } from "@prisma/client";
import type { TaxActor } from "./index";

type Db = PrismaClient | Prisma.TransactionClient;

export function taxScopeSnapshot(value?: Prisma.JsonValue | null) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export async function taxAssessmentCompensatedValue(db: Db, assessmentId: string) {
  const movements = await db.taxRegistryEntry.findMany({ where: { entityType: "TAX_ASSESSMENT", entityId: assessmentId, category: "CREDIT_MOVEMENT", status: "EFETIVADO" }, select: { data: true } });
  return movements.reduce((sum, movement) => {
    const data = taxScopeSnapshot(movement.data);
    return data.operation === "COMPENSAR" ? sum.plus(new Prisma.Decimal(String(data.amount))) : sum;
  }, new Prisma.Decimal(0));
}

/** Legacy rows without recorded origin remain available to the technical administrator. */
export function taxAssessmentAccessFilter(budgetUnitIds?: string[]): Prisma.TaxAssessmentWhereInput {
  if (!budgetUnitIds) return {};
  if (!budgetUnitIds.length) return { id: { in: [] } };
  return { OR: budgetUnitIds.map((budgetUnitId) => ({ calculationSnapshot: { path: ["budgetUnitId"], equals: budgetUnitId } })) };
}

export function activeDebtAccessFilter(budgetUnitIds?: string[]): Prisma.ActiveDebtWhereInput {
  if (!budgetUnitIds) return {};
  if (!budgetUnitIds.length) return { id: { in: [] } };
  return { OR: [{ budgetUnitId: { in: budgetUnitIds } }, { budgetUnitId: null, assessment: taxAssessmentAccessFilter(budgetUnitIds) }] };
}

export async function resolveTaxAssessmentScope(db: Db, actor: TaxActor, taxId: string, snapshot?: Prisma.JsonValue | null) {
  const stored = taxScopeSnapshot(snapshot);
  const mapping = typeof stored.budgetUnitId === "string" ? null : await db.taxFinancialMapping.findUnique({ where: { taxId }, select: { defaultBankAccount: { select: { budgetUnitId: true } } } });
  const budgetUnitId = typeof stored.budgetUnitId === "string" ? stored.budgetUnitId : mapping?.defaultBankAccount.budgetUnitId ?? null;
  if (actor.allowedBudgetUnitIds && (!budgetUnitId || !actor.allowedBudgetUnitIds.includes(budgetUnitId))) throw new Error("Lançamento tributário fora das unidades gestoras autorizadas.");
  const binding = budgetUnitId ? await db.planningEntityUnit.findUnique({ where: { budgetUnitId }, select: { governmentEntityId: true } }) : null;
  if (budgetUnitId && !binding) throw new Error("Unidade gestora arrecadadora sem entidade vinculada.");
  if (typeof stored.governmentEntityId === "string" && stored.governmentEntityId !== binding?.governmentEntityId) throw new Error("A entidade atual da UG diverge do lançamento tributário; concilie o vínculo histórico.");
  return { budgetUnitId, governmentEntityId: binding?.governmentEntityId ?? null };
}

export async function resolveTaxFinancialYear(db: Db, year: number, scope: { governmentEntityId: string | null }, requireOpen = true) {
  const financialYear = await db.financialYear.findFirst({ where: { year, governmentEntityId: scope.governmentEntityId } });
  if (!financialYear) throw new Error(`O exercício financeiro ${year} não está configurado.`);
  if (requireOpen && financialYear.status !== "Aberto") throw new Error(`O exercício financeiro ${year} não está aberto para operação tributária.`);
  return financialYear;
}
