import { Prisma } from "@prisma/client";
import type { TaxActor } from "./index";
import { postAccountingEventInTransaction, postAccountingTransactionInTransaction } from "@/lib/financeiro";
import { recognizedTaxProfile } from "./accrual-accounting";
import { assertTaxCreditScope } from "./credit-finance";
import { resolveTaxFinancialYear, taxAssessmentCompensatedValue, taxScopeSnapshot } from "./scope";

const source = "ITBI_SETTLED_REVISION";

export async function settledItbiExcessCredits(tx: Prisma.TransactionClient, assessmentId: string) {
  return tx.taxRegistryEntry.findMany({ where: { category: "TAX_CREDIT", source, status: { not: "ESTORNADO" }, data: { path: ["originAssessmentId"], equals: assessmentId } }, orderBy: { id: "asc" } });
}

/** A paid revision recognizes a liability; it never fabricates another cash receipt. */
export async function recognizeSettledItbiExcess(tx: Prisma.TransactionClient, actor: TaxActor, input: {
  assessmentId: string; declarationId: string; documentId: string; newValue: Prisma.Decimal; settled: Prisma.Decimal; date: Date; key: string; reason: string;
}) {
  const assessment = await tx.taxAssessment.findUniqueOrThrow({ where: { id: input.assessmentId }, include: { tax: true } });
  const declaration = await tx.itbiDeclaration.findUniqueOrThrow({ where: { id: input.declarationId } });
  if (assessment.tax.name.toUpperCase() !== "ITBI" || declaration.assessmentId !== assessment.id || !declaration.processId) throw new Error("Destinação do excesso exige processo ITBI vinculado ao crédito revisado.");
  const proof = await tx.processDocument.findFirst({ where: { processId: declaration.processId, documentId: input.documentId, document: { status: "Válido" } } });
  if (!proof) throw new Error("Vincule documento GED válido da decisão de excesso ao processo ITBI.");
  const existing = await settledItbiExcessCredits(tx, assessment.id);
  const already = existing.reduce((sum, row) => sum.plus(String(taxScopeSnapshot(row.data).amount)), new Prisma.Decimal(0));
  const amount = Prisma.Decimal.max(0, input.settled.minus(input.newValue)).minus(already);
  if (amount.lt(0)) throw new Error("A revisão reduziria crédito de excesso já reconhecido. Regularize sua destinação antes de aumentar o imposto.");
  if (amount.isZero()) return;
  const profile = await recognizedTaxProfile(tx, actor, assessment.id, input.date);
  if (!profile) throw new Error("Revisão de ITBI liquidado exige posição contábil original conciliada, sem reconhecimento retroativo presumido.");
  const year = await resolveTaxFinancialYear(tx, input.date.getUTCFullYear(), profile);
  const payments = await tx.taxPayment.findMany({ where: { guide: { assessmentId: assessment.id }, status: "Confirmado" }, include: { revenueIntegration: { include: { revenue: { include: { treasuryMovement: true } } } } }, orderBy: [{ paymentDate: "desc" }, { id: "asc" }] });
  const compensations = await tx.taxRegistryEntry.findMany({ where: { entityType: "TAX_ASSESSMENT", entityId: assessment.id, category: "CREDIT_MOVEMENT", status: "EFETIVADO", data: { path: ["operation"], equals: "COMPENSAR" } }, orderBy: [{ createdAt: "desc" }, { id: "asc" }] });
  const origins: { id: string; kind: "PAYMENT" | "COMPENSATION"; amount: Prisma.Decimal; bankAccountId: string; resourceSourceId: string; treasuryMovementId: string }[] = [];
  for (const payment of payments) {
    const revenue = payment.revenueIntegration?.revenue;
    if (!payment.amountPaidDecimal || !payment.bankAccountId || !revenue?.treasuryMovement || revenue.stage !== "ARRECADADA" || revenue.budgetUnitId !== profile.budgetUnitId || revenue.treasuryMovement.bankAccountId !== payment.bankAccountId) throw new Error("Arrecadação original do excesso sem banco, fonte ou posição financeira conciliada.");
    origins.push({ id: payment.id, kind: "PAYMENT", amount: payment.amountPaidDecimal, bankAccountId: payment.bankAccountId, resourceSourceId: revenue.resourceSourceId, treasuryMovementId: revenue.treasuryMovement.id });
  }
  for (const movement of compensations) {
    const data = taxScopeSnapshot(movement.data);
    if (typeof data.sourceCreditId !== "string") throw new Error("Compensação do ITBI sem crédito de origem conciliado.");
    const credit = await tx.taxRegistryEntry.findUniqueOrThrow({ where: { id: data.sourceCreditId } });
    await assertTaxCreditScope(tx, actor, credit.data);
    const origin = taxScopeSnapshot(credit.data);
    if (typeof origin.bankAccountId !== "string" || typeof origin.resourceSourceId !== "string" || typeof origin.ingressMovementId !== "string" || typeof data.accountingTransactionId !== "string") throw new Error("Compensação original sem reconhecimento financeiro conciliado.");
    origins.push({ id: movement.id, kind: "COMPENSATION", amount: new Prisma.Decimal(String(data.amount)), bankAccountId: origin.bankAccountId, resourceSourceId: origin.resourceSourceId, treasuryMovementId: origin.ingressMovementId });
  }
  let remaining = amount;
  for (const origin of origins) {
    if (remaining.isZero()) break;
    const reserved = existing.filter(row => taxScopeSnapshot(row.data).originSettlementId === origin.id).reduce((sum, row) => sum.plus(String(taxScopeSnapshot(row.data).amount)), new Prisma.Decimal(0));
    const available = origin.amount.minus(reserved);
    if (available.lt(0)) throw new Error("Destinações anteriores excedem a liquidação original do ITBI.");
    const value = Prisma.Decimal.min(remaining, available); if (value.isZero()) continue;
    const bank = await tx.bankAccount.findUniqueOrThrow({ where: { id: origin.bankAccountId } });
    if (bank.budgetUnitId !== profile.budgetUnitId) throw new Error("Banco do excesso diverge da UG do ITBI.");
    const credit = await tx.taxRegistryEntry.create({ data: { entityType: "TAXPAYER", entityId: assessment.taxpayerId, category: "TAX_CREDIT", source, title: "Excesso reconhecido em decisão de ITBI liquidado", status: "DISPONIVEL", actorUsuarioId: actor.usuarioId, processId: declaration.processId, documentId: input.documentId, data: { governmentEntityId: profile.governmentEntityId, budgetUnitId: profile.budgetUnitId, amount: value.toFixed(2), available: value.toFixed(2), originAssessmentId: assessment.id, originDeclarationId: declaration.id, originSettlementId: origin.id, originSettlementKind: origin.kind, resourceSourceId: origin.resourceSourceId, bankAccountId: origin.bankAccountId, recognitionKind: "RECLASSIFICATION_WITHOUT_CASH", ingressMovementId: origin.treasuryMovementId, decisionKey: input.key, reason: input.reason } } });
    const transaction = await postAccountingEventInTransaction(tx, actor, { financialYearId: year.id, governmentEntityId: profile.governmentEntityId, budgetUnitId: profile.budgetUnitId, date: input.date, value, eventCode: "TAX_COLLECTION_EXCESS", debitAccountId: profile.receivableAccountId, history: `Obrigação a restituir por revisão do ITBI ${declaration.declarationNumber}: ${input.reason}`, sourceModule: "TRIBUTACAO", sourceType: "ITBI_SETTLED_EXCESS", sourceId: credit.id, idempotencyKey: `${input.key}:EXCESS:${origin.id}` });
    const entries = await tx.accountingEntry.findMany({ where: { transactionId: transaction.id }, include: { account: true } });
    if (entries.length !== 2 || !entries.some(entry => entry.accountId === profile.receivableAccountId && entry.type === "Débito" && entry.valueDecimal?.eq(value)) || !entries.some(entry => entry.account.type === "Passivo" && entry.type === "Crédito" && entry.valueDecimal?.eq(value))) throw new Error("Configure o excesso com contrapartida única de obrigação a restituir, distinta do direito tributário.");
    const liability = entries.find(entry => entry.type === "Crédito")!;
    await tx.taxRegistryEntry.update({ where: { id: credit.id }, data: { data: { ...taxScopeSnapshot(credit.data), ingressTransactionId: transaction.id, liabilityAccountId: liability.accountId, financialYearId: year.id } } });
    await tx.taxAuditLog.create({ data: { action: "RECOGNIZE_SETTLED_ITBI_EXCESS", entityType: "TaxRegistryEntry", entityId: credit.id, authorUsuarioId: actor.usuarioId, authorEmployeeId: actor.employeeId, payload: { assessmentId: assessment.id, declarationId: declaration.id, transactionId: transaction.id, amount: value.toFixed(2), originSettlementId: origin.id, cashEffect: "NONE" } } });
    remaining = remaining.minus(value);
  }
  if (!remaining.isZero()) throw new Error("Liquidações conciliadas insuficientes para destinar integralmente o excesso do ITBI.");
}

/** The original settlement can only be reversed after its derived credits are unused. */
export async function reverseSettledItbiExcess(tx: Prisma.TransactionClient, actor: TaxActor, input: { date: Date; reason: string; key: string } & ({ settlementId: string; assessmentId?: never } | { assessmentId: string; settlementId?: never })) {
  const payment = input.settlementId ? await tx.taxPayment.findUnique({ where: { id: input.settlementId }, select: { guide: { select: { assessmentId: true } } } }) : null;
  const movement = !payment && input.settlementId ? await tx.taxRegistryEntry.findUnique({ where: { id: input.settlementId } }) : null;
  const assessmentId = input.assessmentId ?? payment?.guide.assessmentId ?? (movement?.entityType === "TAX_ASSESSMENT" ? movement.entityId : null);
  if (!assessmentId) return;
  const credits = await settledItbiExcessCredits(tx, assessmentId);
  for (const credit of credits) {
    await tx.$queryRaw`SELECT id FROM "TaxRegistryEntry" WHERE id=${credit.id} FOR UPDATE`;
    const current = await tx.taxRegistryEntry.findUniqueOrThrow({ where: { id: credit.id } });
    const data = taxScopeSnapshot(current.data); const scope = await assertTaxCreditScope(tx, actor, current.data);
    const amount = new Prisma.Decimal(String(data.amount));
    if (current.status !== "DISPONIVEL" || !new Prisma.Decimal(String(data.available)).eq(amount)) throw new Error("Excesso da revisão ITBI já utilizado; reverta sua compensação, transferência ou restituição antes da liquidação original.");
    const original = await tx.accountingTransaction.findUniqueOrThrow({ where: { id: String(data.ingressTransactionId) }, include: { entries: true } });
    if (input.date < original.date) throw new Error("O estorno não pode anteceder o reconhecimento do excesso do ITBI.");
    const year = await resolveTaxFinancialYear(tx, input.date.getUTCFullYear(), scope);
    const reversal = await postAccountingTransactionInTransaction(tx, actor, { financialYearId: year.id, ...scope, date: input.date, history: input.reason, sourceModule: "TRIBUTACAO", sourceType: "ITBI_SETTLED_EXCESS_REVERSAL", sourceId: credit.id, eventType: "ITBI_SETTLED_EXCESS_REVERSED", idempotencyKey: `${input.key}:EXCESS:${credit.id}`, reversalOfId: original.id, lines: original.entries.map(entry => { if (!entry.valueDecimal) throw new Error("Partida do excesso sem Decimal conciliado."); return { accountId: entry.accountId, originalEntryId: entry.id, type: entry.type === "Débito" ? "Crédito" as const : "Débito" as const, value: entry.valueDecimal }; }) });
    await tx.taxRegistryEntry.update({ where: { id: credit.id }, data: { status: "ESTORNADO", data: { ...data, available: "0.00", reversalTransactionId: reversal.id, reversedAt: input.date.toISOString() } } });
  }
  const first = credits[0];
  if (!first) return;
  const data = taxScopeSnapshot(first.data);
  if (typeof data.originDeclarationId !== "string" || !first.documentId) throw new Error("Excesso de ITBI sem decisão original conciliada.");
  return { assessmentId, declarationId: data.originDeclarationId, documentId: first.documentId };
}

/** Recompute the liability after reversing any settlement, including one not allocated to excess. */
export async function restoreResidualSettledItbiExcess(tx: Prisma.TransactionClient, actor: TaxActor, input: {
  assessmentId: string; declarationId: string; documentId: string; date: Date; key: string; reason: string;
}) {
  const assessment = await tx.taxAssessment.findUniqueOrThrow({ where: { id: input.assessmentId } });
  if (!assessment.finalValueDecimal) throw new Error("ITBI revisado sem valor Decimal conciliado.");
  const payments = await tx.taxPayment.findMany({ where: { guide: { assessmentId: assessment.id }, status: "Confirmado" }, select: { amountPaidDecimal: true } });
  const settled = payments.reduce((sum, row) => { if (!row.amountPaidDecimal) throw new Error("Pagamento de ITBI sem Decimal conciliado."); return sum.plus(row.amountPaidDecimal); }, await taxAssessmentCompensatedValue(tx, assessment.id));
  if (settled.gt(assessment.finalValueDecimal)) await recognizeSettledItbiExcess(tx, actor, { ...input, newValue: assessment.finalValueDecimal, settled });
}
