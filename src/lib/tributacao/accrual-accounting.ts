import { Prisma } from "@prisma/client";
import { postAccountingTransactionInTransaction, type FinanceActor } from "@/lib/financeiro";
import { resolveTaxAssessmentScope, resolveTaxFinancialYear, taxScopeSnapshot } from "./scope";

type Profile = { receivableAccountId: string; revenueAccountId: string; deductionAccountId: string; lossAccountId: string; budgetUnitId: string; governmentEntityId: string; catalogVersionId: string };
function profile(value: Prisma.JsonValue): Profile {
  const data = taxScopeSnapshot(value);
  const fields = ["receivableAccountId", "revenueAccountId", "deductionAccountId", "lossAccountId", "budgetUnitId", "governmentEntityId", "catalogVersionId"] as const;
  if (fields.some(field => typeof data[field] !== "string" || !data[field])) throw new Error("Perfil contábil tributário incompleto.");
  return Object.fromEntries(fields.map(field => [field, data[field]])) as Profile;
}

/** Recognition is opt-in by immutable municipal profile; historical assessments are never backfilled implicitly. */
export async function recognizeTaxAssessmentInTransaction(tx: Prisma.TransactionClient, actor: FinanceActor, assessmentId: string) {
  const assessment = await tx.taxAssessment.findUniqueOrThrow({ where: { id: assessmentId } });
  const origin = await resolveTaxAssessmentScope(tx, actor, assessment.taxId, assessment.calculationSnapshot);
  if (!origin.budgetUnitId || !origin.governmentEntityId) return;
  const scope = { budgetUnitId: origin.budgetUnitId, governmentEntityId: origin.governmentEntityId };
  const date = assessment.competence ?? (assessment.year === new Date().getUTCFullYear() ? new Date() : new Date(Date.UTC(assessment.year, 0, 1, 12)));
  const profiles = await tx.taxRegistryEntry.findMany({ where: { entityType: "TAX", entityId: assessment.taxId, category: "ACCOUNTING_PROFILE", status: "ATIVO", effectiveFrom: { lte: date }, OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: date } }], data: { path: ["budgetUnitId"], equals: scope.budgetUnitId } } });
  const superseded = new Set(profiles.map(entry => taxScopeSnapshot(entry.data).supersedesEntryId).filter((id): id is string => typeof id === "string"));
  const current = profiles.filter(entry => !superseded.has(entry.id));
  if (!current.length && !profiles.length) return;
  if (current.length !== 1) throw new Error("Perfis contábeis tributários sobrepostos para a UG.");
  const selected = profile(current[0].data);
  if (selected.budgetUnitId !== scope.budgetUnitId || selected.governmentEntityId !== scope.governmentEntityId) throw new Error("Perfil tributário fora do ente de origem.");
  const catalog = await tx.planningCatalogVersion.findUniqueOrThrow({ where: { id: selected.catalogVersionId }, include: { entries: true } });
  const accounts = [selected.receivableAccountId, selected.revenueAccountId, selected.deductionAccountId, selected.lossAccountId];
  if (catalog.status !== "PUBLISHED" || catalog.year !== date.getUTCFullYear() || new Set(accounts).size !== 4 || accounts.some(id => !catalog.entries.some(entry => entry.kind === "ACCOUNT" && entry.canonicalId === id && taxScopeSnapshot(entry.attributes).operational === true && taxScopeSnapshot(entry.attributes).pocOnly === false))) throw new Error("Perfil tributário sem quatro contas municipais publicadas e vigentes.");
  const year = await resolveTaxFinancialYear(tx, date.getUTCFullYear(), scope);
  const value = assessment.finalValueDecimal;
  if (!value || value.lte(0)) throw new Error("Constituição tributária sem valor Decimal positivo.");
  const transaction = await postAccountingTransactionInTransaction(tx, actor, { financialYearId: year.id, ...scope, date, history: `Constituição patrimonial do lançamento ${assessment.assessmentNumber}`, sourceModule: "TRIBUTACAO", sourceType: "TAX_ASSESSMENT", sourceId: assessment.id, eventType: "TAX_ASSESSMENT_RECOGNIZED", idempotencyKey: `TAX_ASSESSMENT:${assessment.id}:RECOGNIZED`, lines: [{ accountId: selected.receivableAccountId, type: "Débito", value }, { accountId: selected.revenueAccountId, type: "Crédito", value }] });
  await tx.taxRegistryEntry.create({ data: { entityType: "TAX_ASSESSMENT", entityId: assessment.id, category: "ACCOUNTING_POSITION", title: "Direito tributário reconhecido", status: "ATIVO", source: "CONTABILIDADE", actorUsuarioId: actor.usuarioId, data: { ...selected, profileEntryId: current[0].id, recognitionTransactionId: transaction.id, recognizedAt: date.toISOString(), originalValue: value.toFixed(2) } } });
}

/** Returns the frozen profile from the recognition, rather than today's routing configuration. */
export async function recognizedTaxProfile(tx: Prisma.TransactionClient, actor: FinanceActor, assessmentId: string, date: Date) {
  const assessment = await tx.taxAssessment.findUniqueOrThrow({ where: { id: assessmentId } });
  const scope = await resolveTaxAssessmentScope(tx, actor, assessment.taxId, assessment.calculationSnapshot);
  const positions = await tx.taxRegistryEntry.findMany({ where: { entityType: "TAX_ASSESSMENT", entityId: assessmentId, category: "ACCOUNTING_POSITION", status: "ATIVO" } });
  if (!positions.length) return null;
  if (positions.length !== 1) throw new Error("Reconhecimento patrimonial tributário ambíguo.");
  const data = taxScopeSnapshot(positions[0].data);
  const selected = profile(positions[0].data);
  const original = typeof data.recognitionTransactionId === "string" ? await tx.accountingTransaction.findUnique({ where: { id: data.recognitionTransactionId }, include: { entries: true } }) : null;
  if (selected.budgetUnitId !== scope.budgetUnitId || selected.governmentEntityId !== scope.governmentEntityId || !original || original.status !== "POSTADO" || original.sourceId !== assessment.id || original.eventType !== "TAX_ASSESSMENT_RECOGNIZED" || original.budgetUnitId !== scope.budgetUnitId || original.governmentEntityId !== scope.governmentEntityId || date < original.date || original.entries.length !== 2 || !original.entries.some(entry => entry.accountId === selected.receivableAccountId && entry.type === "Débito" && entry.valueDecimal?.eq(String(data.originalValue))) || !original.entries.some(entry => entry.accountId === selected.revenueAccountId && entry.type === "Crédito" && entry.valueDecimal?.eq(String(data.originalValue)))) throw new Error("Direito tributário sem partida original conciliada ou data compatível.");
  return selected;
}

export async function postTaxAssessmentAdjustment(tx: Prisma.TransactionClient, actor: FinanceActor, input: { assessmentId: string; date: Date; delta: Prisma.Decimal; kind: "REVISION" | "BENEFIT" | "EXTINCTION"; idempotencyKey: string; reason: string }) {
  const selected = await recognizedTaxProfile(tx, actor, input.assessmentId, input.date);
  if (!selected || input.delta.isZero()) return null;
  const year = await resolveTaxFinancialYear(tx, input.date.getUTCFullYear(), selected);
  const increase = input.delta.gt(0);
  if (increase && input.kind !== "REVISION") throw new Error("Benefício ou extinção não pode aumentar o direito.");
  const value = input.delta.abs();
  return postAccountingTransactionInTransaction(tx, actor, { financialYearId: year.id, budgetUnitId: selected.budgetUnitId, governmentEntityId: selected.governmentEntityId, date: input.date, history: input.reason, sourceModule: "TRIBUTACAO", sourceType: "TAX_ASSESSMENT_ADJUSTMENT", sourceId: input.assessmentId, eventType: `TAX_ASSESSMENT_${input.kind}`, idempotencyKey: input.idempotencyKey, lines: [{ accountId: increase ? selected.receivableAccountId : input.kind === "EXTINCTION" ? selected.lossAccountId : selected.deductionAccountId, type: "Débito", value }, { accountId: increase ? selected.revenueAccountId : selected.receivableAccountId, type: "Crédito", value }] });
}

export async function taxCollectionReceivableAccount(tx: Prisma.TransactionClient, actor: FinanceActor, input: { sourceModule: string; sourceType: string; sourceId?: string; date: Date }) {
  if (input.sourceModule !== "TRIBUTARIO" || input.sourceType !== "TAX_PAYMENT" || !input.sourceId) return undefined;
  const payment = await tx.taxPayment.findUniqueOrThrow({ where: { id: input.sourceId }, include: { guide: true } });
  return (await recognizedTaxProfile(tx, actor, payment.guide.assessmentId, input.date))?.receivableAccountId;
}
