import { Prisma, type PrismaClient } from "@prisma/client";
import { assertAccountingPeriodOpen, postAccountingTransactionInTransaction } from "@/lib/financeiro";
import { TaxError, type TaxActor } from "./index";
import { assertTaxCreditScope } from "./credit-finance";
import { resolveTaxAssessmentScope, resolveTaxFinancialYear, taxScopeSnapshot, taxAssessmentCompensatedValue } from "./scope";

export async function reverseTaxCreditMovement(db: PrismaClient, actor: TaxActor, input: {
  movementId: string; date: Date; reason: string; idempotencyKey: string;
}) {
  if (!input.reason.trim() || !input.idempotencyKey.trim() || !Number.isFinite(input.date.getTime())) throw new TaxError("Informe fundamento, chave e data válidos para reversão do crédito.");
  return db.$transaction(async (tx) => {
    const key = `TAX_CREDIT_REVERSAL:${input.idempotencyKey.trim()}`;
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))::text`;
    const movement = await tx.taxRegistryEntry.findUniqueOrThrow({ where: { id: input.movementId } });
    const data = taxScopeSnapshot(movement.data);
    const scope = await assertTaxCreditScope(tx, actor, movement.data);
    const prior = await tx.taxIntegrationEvent.findUnique({ where: { idempotencyKey: key } });
    if (prior) {
      const payload = taxScopeSnapshot(prior.payload);
      if (payload.movementId !== movement.id || payload.date !== input.date.toISOString() || payload.reason !== input.reason.trim()) throw new TaxError("Movimento já revertido com outros dados.");
      return prior;
    }
    const year = await resolveTaxFinancialYear(tx, input.date.getUTCFullYear(), scope);
    if (input.date < year.startDate || input.date > year.endDate) throw new TaxError("Reversão fora da vigência do exercício.");
    await assertAccountingPeriodOpen(tx, year.id, input.date);
    if (typeof data.sourceCreditId !== "string") throw new TaxError("Movimento sem crédito de origem conciliado.");
    await tx.$queryRaw`SELECT id FROM "TaxRegistryEntry" WHERE id = ${data.sourceCreditId} FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM "TaxRegistryEntry" WHERE id = ${movement.id} FOR UPDATE`;
    const current = await tx.taxRegistryEntry.findUniqueOrThrow({ where: { id: movement.id } });
    if (current.status !== movement.status) throw new TaxError("Movimento alterado; atualize antes de reverter.");
    if (!((movement.category === "CREDIT_MOVEMENT" && movement.status === "EFETIVADO" && ["COMPENSAR", "TRANSFERIR"].includes(String(data.operation))) || (movement.category === "REFUND_REQUEST" && ["PENDENTE_APROVACAO", "APROVADA_AGUARDANDO_TESOURARIA"].includes(movement.status)))) throw new TaxError("Movimento não está disponível para reversão; restituição paga exige estorno de tesouraria próprio.");
    const credit = await tx.taxRegistryEntry.findUniqueOrThrow({ where: { id: data.sourceCreditId } });
    await assertTaxCreditScope(tx, actor, credit.data);
    const origin = taxScopeSnapshot(credit.data);
    const amount = new Prisma.Decimal(String(data.amount));
    const available = new Prisma.Decimal(String(origin.available));
    const total = new Prisma.Decimal(String(origin.amount));
    if (!amount.isFinite() || amount.lte(0) || !available.isFinite() || !total.isFinite() || available.plus(amount).gt(total) || credit.status === "ESTORNADO") throw new TaxError("Saldo de origem incompatível com a reversão do movimento.");
    let transactionId: string | null = null;
    if (data.operation === "COMPENSAR") {
      if (typeof data.accountingTransactionId !== "string" || movement.entityType !== "TAX_ASSESSMENT") throw new TaxError("Compensação sem partida ou débito conciliado.");
      await tx.$queryRaw`SELECT id FROM "TaxAssessment" WHERE id = ${movement.entityId} FOR UPDATE`;
      const assessment = await tx.taxAssessment.findUniqueOrThrow({ where: { id: movement.entityId } });
      const destination = await resolveTaxAssessmentScope(tx, actor, assessment.taxId, assessment.calculationSnapshot);
      if (destination.budgetUnitId !== scope.budgetUnitId || assessment.taxpayerId !== credit.entityId) throw new TaxError("Destino da compensação diverge da origem.");
      const original = await tx.accountingTransaction.findUniqueOrThrow({ where: { id: data.accountingTransactionId }, include: { entries: true } });
      if (input.date < original.date) throw new TaxError("A reversão não pode anteceder a compensação.");
      const transaction = await postAccountingTransactionInTransaction(tx, actor, {
        financialYearId: year.id, ...scope, date: input.date, history: `Reversão da compensação ${movement.id}: ${input.reason.trim()}`,
        sourceModule: "TRIBUTACAO", sourceType: "TAX_CREDIT_COMPENSATION_REVERSAL", sourceId: movement.id, eventType: "TAX_CREDIT_COMPENSATION_REVERSED", idempotencyKey: `${key}:ACCOUNTING`, reversalOfId: original.id,
        lines: original.entries.map((entry) => { if (!entry.valueDecimal) throw new TaxError("Partida original sem Decimal conciliado."); return { accountId: entry.accountId, type: entry.type === "Débito" ? "Crédito" as const : "Débito" as const, value: entry.valueDecimal }; }),
      });
      transactionId = transaction.id;
      await tx.taxRegistryEntry.update({ where: { id: movement.id }, data: { status: "ESTORNADO" } });
      const payments = await tx.taxPayment.findMany({ where: { guide: { assessmentId: assessment.id }, status: "Confirmado" }, select: { amountPaidDecimal: true } });
      const extinguished = payments.reduce((sum, payment) => { if (!payment.amountPaidDecimal) throw new TaxError("Pagamento sem Decimal conciliado."); return sum.plus(payment.amountPaidDecimal); }, await taxAssessmentCompensatedValue(tx, assessment.id));
      const assessmentTotal = assessment.finalValueDecimal ?? assessment.originalValueDecimal;
      if (!assessmentTotal) throw new TaxError("Débito sem Decimal conciliado.");
      await tx.taxAssessment.update({ where: { id: assessment.id }, data: { status: extinguished.gte(assessmentTotal) ? "Pago" : extinguished.gt(0) ? "Parcial" : "Lançado" } });
    } else if (data.operation === "TRANSFERIR") {
      const destinations = await tx.taxRegistryEntry.findMany({ where: { category: "TAX_CREDIT", source: "TRANSFERENCIA", data: { path: ["movementId"], equals: movement.id } } });
      if (destinations.length !== 1) throw new TaxError("Transferência sem crédito de destino único.");
      const destination = destinations[0];
      await tx.$queryRaw`SELECT id FROM "TaxRegistryEntry" WHERE id = ${destination.id} FOR UPDATE`;
      const currentDestination = await tx.taxRegistryEntry.findUniqueOrThrow({ where: { id: destination.id } });
      await assertTaxCreditScope(tx, actor, currentDestination.data);
      const balance = taxScopeSnapshot(currentDestination.data);
      if (currentDestination.status !== "DISPONIVEL" || !new Prisma.Decimal(String(balance.available)).eq(amount) || !new Prisma.Decimal(String(balance.amount)).eq(amount)) throw new TaxError("Crédito transferido já utilizado; reverta primeiro os movimentos do destino.");
      await tx.taxRegistryEntry.update({ where: { id: destination.id }, data: { status: "ESTORNADO", data: { ...balance, available: "0.00", reversedAt: input.date.toISOString() } } });
    }
    await tx.taxRegistryEntry.update({ where: { id: movement.id }, data: { status: "ESTORNADO", data: { ...data, status: "ESTORNADO", reversedAt: input.date.toISOString(), reversalTransactionId: transactionId, reversalReason: input.reason.trim() } } });
    await tx.taxRegistryEntry.update({ where: { id: credit.id }, data: { status: "DISPONIVEL", data: { ...origin, available: available.plus(amount).toFixed(2) } } });
    const event = await tx.taxIntegrationEvent.create({ data: { integrationCode: "TAX_CREDIT", eventType: "CREDIT_MOVEMENT_REVERSED", idempotencyKey: key, status: "PROCESSADO", evidenceLevel: "L1", taxpayerId: credit.entityId, payload: { movementId: movement.id, creditId: credit.id, date: input.date.toISOString(), reason: input.reason.trim(), ...scope }, result: { transactionId, restored: amount.toFixed(2) }, processedAt: new Date() } });
    await tx.taxAuditLog.create({ data: { action: "REVERSE_CREDIT_MOVEMENT", entityType: "TaxRegistryEntry", entityId: movement.id, authorUsuarioId: actor.usuarioId, authorEmployeeId: actor.employeeId, payload: { eventId: event.id, restored: amount.toFixed(2), transactionId } } });
    return event;
  }, { timeout: 60000 });
}
