import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@prisma/client";
import { createPlanningExecutionFixture } from "./helpers/planning-execution-fixture";
import { confirmTaxPayment, configureTaxFinancialMapping, createTaxAssessment, generateTaxGuide, enrollAssessmentInActiveDebt, createDebtInstallmentPlan } from "../src/lib/tributacao";
import { getBankAccountBalance } from "../src/lib/financeiro";
import { applyTaxCredit, approveRefundRequest, createParametrizedAssessment, generatePartialTaxGuide, getAssessmentAccount, processCollectionReturn, registerCreditEvent } from "../src/lib/tributacao/s2-service";
import { executeTaxRefund } from "../src/lib/tributacao/credit-finance";
import { reverseTaxPayment } from "../src/lib/tributacao/payment-reversal";
import { reverseTaxCreditMovement } from "../src/lib/tributacao/credit-reversal";
import { taxAssessmentAccessFilter } from "../src/lib/tributacao/scope";

type Fixture = Awaited<ReturnType<typeof createPlanningExecutionFixture>>;
async function scenario(body: (fixture: Fixture) => Promise<void>) {
  const mode = process.env.CELERIFLOW_ACCOUNTING_MODE;
  process.env.CELERIFLOW_ACCOUNTING_MODE = "POC";
  let fixture: Fixture | undefined;
  try {
    fixture = await createPlanningExecutionFixture();
    await fixture.db.financialYear.update({ where: { id: "ano" }, data: { status: "Aberto" } });
    await fixture.db.tax.create({ data: { id: "tax-chain", name: "Tributo de ensaio", taxType: "Taxa", isActive: true } });
    await fixture.db.taxpayer.create({ data: { id: "taxpayer-chain", taxpayerType: "PJ", companyId: "empresa", status: "Ativo" } });
    await configureTaxFinancialMapping(fixture.db, fixture.actor, { taxId: "tax-chain", revenueNatureId: "receita", resourceSourceId: "livre", defaultBankAccountId: "banco" });
    await body(fixture);
  } finally {
    await fixture?.close();
    if (mode === undefined) delete process.env.CELERIFLOW_ACCOUNTING_MODE;
    else process.env.CELERIFLOW_ACCOUNTING_MODE = mode;
  }
}

test("P1: motor parametrizado preserva ente/UG e valida escopo e conteúdo também no replay", async () => scenario(async (f) => {
  await f.db.taxParameter.create({ data: { id: "parameter-chain", taxId: "tax-chain", code: "POC", name: "Regra de ensaio", calculationType: "PERCENTUAL_BASE", configuration: { formula: "PERCENTUAL_BASE", rate: 4 }, effectiveFrom: new Date("2026-01-01"), isActive: true } });
  const input = { taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", competence: new Date("2026-03-01"), originKey: "chain-assessment" };
  const assessment = await createParametrizedAssessment(f.db, f.actor, input);
  assert.equal((assessment.calculationSnapshot as Prisma.JsonObject).financialYearId, "ano");
  assert.equal((assessment.calculationSnapshot as Prisma.JsonObject).governmentEntityId, "ente");
  assert.equal((assessment.calculationSnapshot as Prisma.JsonObject).budgetUnitId, "ug");
  assert.equal(await f.db.taxGuide.count({ where: { assessment: taxAssessmentAccessFilter(["ug-restrita"]) } }), 0);
  assert.equal(await f.db.taxAssessment.count({ where: taxAssessmentAccessFilter(["ug"]) }), 1);
  assert.equal(await f.db.taxAssessment.count({ where: taxAssessmentAccessFilter([]) }), 0);
  assert.equal((await createParametrizedAssessment(f.db, f.actor, input)).id, assessment.id);
  await assert.rejects(createParametrizedAssessment(f.db, f.actor, { ...input, taxableBase: "200.00" }), /outros dados/i);
  const other = { ...f.actor, allowedBudgetUnitIds: ["ug-restrita"] };
  await assert.rejects(createParametrizedAssessment(f.db, other, input), /autorizadas/i);
  await assert.rejects(generatePartialTaxGuide(f.db, other, { assessmentId: assessment.id, amount: "2.00", dueDate: new Date("2026-03-31") }), /autorizadas/i);
  const eventInput = { assessmentId: assessment.id, eventType: "IMPUGNACAO" as const, reason: "Ensaio", idempotencyKey: "chain-event" };
  const event = await registerCreditEvent(f.db, f.actor, eventInput);
  assert.equal((await registerCreditEvent(f.db, f.actor, eventInput)).id, event.id);
  await assert.rejects(registerCreditEvent(f.db, other, eventInput), /autorizadas/i);
  await assert.rejects(registerCreditEvent(f.db, f.actor, { ...eventInput, reason: "Outro motivo" }), /outros dados/i);
  await assert.rejects(configureTaxFinancialMapping(f.db, other, { taxId: "tax-chain", revenueNatureId: "receita", resourceSourceId: "livre", defaultBankAccountId: "banco" }), /autorizadas/i);
  await f.db.taxParameter.create({ data: { id: "parameter-overlap", taxId: "tax-chain", code: "POC-OVERLAP", name: "Regra sobreposta", calculationType: "PERCENTUAL_BASE", configuration: { formula: "PERCENTUAL_BASE", rate: 8 }, effectiveFrom: new Date("2026-02-01"), isActive: true } });
  await assert.rejects(createParametrizedAssessment(f.db, f.actor, { ...input, originKey: "overlapping-rule" }), /sobrepostas/i);
  assert.equal(await f.db.taxAssessment.count(), 1);
}));

test("P2: débito de exercício encerrado é arrecadado no corrente sem reabrir a origem", async () => scenario(async (f) => {
  const assessment = await createTaxAssessment(f.db, f.actor, { year: 2026, taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", rate: "4" });
  const guide = await generateTaxGuide(f.db, f.actor, { assessmentId: assessment.id, dueDate: new Date("2026-03-31") });
  await f.db.financialYear.update({ where: { id: "ano" }, data: { status: "Encerrado" } });
  await f.db.financialYear.create({ data: { id: "current-tax-year", year: 2027, governmentEntityId: "ente", startDate: new Date("2027-01-01"), endDate: new Date("2027-12-31T23:59:59.999Z"), status: "Aberto" } });
  const input = { guideId: guide.id, amountPaid: "4.00", paymentDate: new Date("2027-02-01"), paymentMethod: "Manual", idempotencyKey: "historical-tax-payment" };
  await confirmTaxPayment(f.db, f.actor, input);
  assert.equal((await f.db.revenue.findFirstOrThrow()).financialYearId, "current-tax-year");
  assert.equal((await f.db.treasuryMovement.findFirstOrThrow()).financialYearId, "current-tax-year");
  assert.equal((await f.db.taxAssessment.findUniqueOrThrow({ where: { id: assessment.id } })).year, 2026);
  assert.equal((await f.db.financialYear.findUniqueOrThrow({ where: { id: "ano" } })).status, "Encerrado");
  assert.equal((await confirmTaxPayment(f.db, f.actor, input)).id, guide.id);
  await assert.rejects(confirmTaxPayment(f.db, f.actor, { ...input, amountPaid: "3.00" }), /outros dados/i);
  await assert.rejects(confirmTaxPayment(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, input), /autorizadas/i);
  assert.equal(await f.db.revenue.count(), 1);
}));

test("P2: inscrição considera apenas saldo e parcelamento/replay preservam autorização", async () => scenario(async (f) => {
  const assessment = await createTaxAssessment(f.db, f.actor, { year: 2026, taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", rate: "10" });
  const guide = await generateTaxGuide(f.db, f.actor, { assessmentId: assessment.id, dueDate: new Date("2026-03-31") });
  await confirmTaxPayment(f.db, f.actor, { guideId: guide.id, amountPaid: "4.00", paymentDate: new Date("2026-03-01"), paymentMethod: "Manual", idempotencyKey: "partial-debt" });
  await assert.rejects(enrollAssessmentInActiveDebt(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, assessment.id), /autorizadas/i);
  const debt = await enrollAssessmentInActiveDebt(f.db, f.actor, assessment.id);
  assert.equal(debt.originalValueDecimal!.toFixed(2), "6.00");
  assert.equal((await enrollAssessmentInActiveDebt(f.db, f.actor, assessment.id)).id, debt.id);
  await assert.rejects(enrollAssessmentInActiveDebt(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, assessment.id), /autorizadas/i);
  const input = { activeDebtId: debt.id, installmentsCount: 4, firstDueDate: new Date("2026-04-01"), downPayment: "0.01" };
  await assert.rejects(createDebtInstallmentPlan(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, input), /autorizadas/i);
  const plan = await createDebtInstallmentPlan(f.db, f.actor, input);
  const schedules = await f.db.debtInstallmentSchedule.findMany({ where: { debtInstallmentId: plan.id } });
  assert.equal(schedules.reduce((sum, row) => sum.plus(row.valueDecimal), new Prisma.Decimal("0.01")).toFixed(2), "6.00");
  await assert.rejects(createDebtInstallmentPlan(f.db, f.actor, input), /parcelamento ativo/i);
  assert.equal(await f.db.activeDebt.count(), 1);
  assert.equal(await f.db.debtInstallment.count(), 1);
}));

test("P2: falha no crédito excedente reverte toda a baixa; retry e replay não duplicam a cadeia", async () => scenario(async (f) => {
  const assessment = await createTaxAssessment(f.db, f.actor, { year: 2026, taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", rate: "4" });
  const guide = await generateTaxGuide(f.db, f.actor, { assessmentId: assessment.id, dueDate: new Date("2026-03-31") });
  const before = await f.db.accountingTransaction.count();
  await f.pg.exec(`CREATE FUNCTION fail_credit_p2() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.category='TAX_CREDIT' THEN RAISE EXCEPTION 'P2 injected credit failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER fail_credit_p2 BEFORE INSERT ON "TaxRegistryEntry" FOR EACH ROW EXECUTE FUNCTION fail_credit_p2();`);
  const input = { idempotencyKey: "atomic-return", guideNumber: guide.guideNumber!, amount: "5.00", occurredAt: new Date("2026-03-01"), status: "CONFIRMADO" as const };
  await assert.rejects(processCollectionReturn(f.db, f.actor, input), /injected credit failure/i);
  assert.equal(await f.db.taxPayment.count(), 0);
  assert.equal(await f.db.revenue.count(), 0);
  assert.equal(await f.db.treasuryMovement.count(), 0);
  assert.equal(await f.db.taxRevenueIntegrationEvent.count(), 0);
  assert.equal(await f.db.accountingTransaction.count(), before);
  assert.equal((await f.db.taxGuide.findUniqueOrThrow({ where: { id: guide.id } })).status, "Emitida");
  await f.pg.exec('DROP TRIGGER fail_credit_p2 ON "TaxRegistryEntry"');
  const returned = await processCollectionReturn(f.db, f.actor, input);
  assert.equal((await processCollectionReturn(f.db, f.actor, input)).id, returned.id);
  assert.equal(await f.db.taxPayment.count(), 1);
  assert.equal(await f.db.revenue.count(), 1);
  const credit = await f.db.taxRegistryEntry.findFirstOrThrow({ where: { category: "TAX_CREDIT" } });
  assert.equal((credit.data as Prisma.JsonObject).available, "1.00");
  assert.equal((credit.data as Prisma.JsonObject).budgetUnitId, "ug");
  assert.equal((await getBankAccountBalance(f.db, "banco", new Date("2026-03-02"))).toFixed(2), "5.00");
  assert.equal(await f.db.accountingTransaction.count({ where: { eventType: "TAX_COLLECTION_EXCESS" } }), 1);
  await assert.rejects(processCollectionReturn(f.db, f.actor, { ...input, amount: "6.00" }), /outros dados/i);
  await assert.rejects(processCollectionReturn(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, input), /autorizadas/i);
  assert.equal(await f.db.taxRegistryEntry.count({ where: { category: "TAX_CREDIT" } }), 1);
}));

test("P2: estorno da arrecadação e excedente é atômico, inverte partidas e reabre saldo sem apagar histórico", async () => scenario(async (f) => {
  const assessment = await createTaxAssessment(f.db, f.actor, { year: 2026, taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", rate: "4" });
  const guide = await generateTaxGuide(f.db, f.actor, { assessmentId: assessment.id, dueDate: new Date("2026-03-31") });
  await processCollectionReturn(f.db, f.actor, { guideNumber: guide.guideNumber!, amount: "7.00", occurredAt: new Date("2026-03-01"), status: "CONFIRMADO", idempotencyKey: "reversal-origin" });
  const payment = await f.db.taxPayment.findFirstOrThrow();
  const input = { paymentId: payment.id, date: new Date("2026-03-02"), reason: "Retorno bancário incorreto", idempotencyKey: "reverse-origin" };
  await assert.rejects(reverseTaxPayment(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, input), /autorizadas/i);
  await f.pg.exec(`CREATE FUNCTION fail_payment_reversal() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.status='Estornado' THEN RAISE EXCEPTION 'injected reversal failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER fail_payment_reversal BEFORE UPDATE ON "TaxPayment" FOR EACH ROW EXECUTE FUNCTION fail_payment_reversal();`);
  await assert.rejects(reverseTaxPayment(f.db, f.actor, input), /injected reversal failure/i);
  assert.equal((await getBankAccountBalance(f.db, "banco", input.date)).toFixed(2), "7.00");
  assert.equal((await f.db.taxRegistryEntry.findFirstOrThrow({ where: { category: "TAX_CREDIT" } })).status, "DISPONIVEL");
  assert.equal(await f.db.revenueReversal.count(), 0);
  await f.pg.exec(`DROP TRIGGER fail_payment_reversal ON "TaxPayment"; DROP FUNCTION fail_payment_reversal();`);
  const event = await reverseTaxPayment(f.db, f.actor, input);
  assert.equal((await reverseTaxPayment(f.db, f.actor, input)).id, event.id);
  await assert.rejects(reverseTaxPayment(f.db, f.actor, { ...input, reason: "Outro fundamento" }), /outros dados/i);
  assert.equal((await getBankAccountBalance(f.db, "banco", input.date)).toFixed(2), "0.00");
  assert.equal((await f.db.taxGuide.findUniqueOrThrow({ where: { id: guide.id } })).status, "Emitida");
  assert.equal((await f.db.taxPayment.findUniqueOrThrow({ where: { id: payment.id } })).status, "Estornado");
  assert.equal((await f.db.revenue.findFirstOrThrow()).stage, "ESTORNADA");
  assert.equal((await f.db.taxRegistryEntry.findFirstOrThrow({ where: { category: "TAX_CREDIT" } })).status, "ESTORNADO");
  assert.equal(await f.db.accountingTransaction.count({ where: { reversalOfId: { not: null } } }), 2);
  assert.equal(await f.db.revenue.count(), 1);
  assert.equal(await f.db.revenueReversal.count(), 1);
}));

test("P2: restituição paga reduz a obrigação e o caixa uma vez, com autorização e replay", async () => scenario(async (f) => {
  const assessment = await createTaxAssessment(f.db, f.actor, { year: 2026, taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", rate: "4" });
  const guide = await generateTaxGuide(f.db, f.actor, { assessmentId: assessment.id, dueDate: new Date("2026-03-31") });
  await processCollectionReturn(f.db, f.actor, { idempotencyKey: "refund-ingress", guideNumber: guide.guideNumber!, amount: "6.00", occurredAt: new Date("2026-03-01"), status: "CONFIRMADO" });
  const credit = await f.db.taxRegistryEntry.findFirstOrThrow({ where: { category: "TAX_CREDIT" } });
  const requested = await applyTaxCredit(f.db, f.actor, { creditId: credit.id, operation: "RESTITUIR", amount: "2.00", reason: "Devolver excedente", idempotencyKey: "refund-request" });
  const requestId = String((requested.result as Prisma.JsonObject).movementId);
  await assert.rejects(approveRefundRequest(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, { requestId, approved: true, reason: "Aprovação" }), /autorizadas/i);
  await approveRefundRequest(f.db, f.actor, { requestId, approved: true, reason: "Aprovação" });
  const input = { requestId, bankAccountId: "banco", proofDocumentId: "documento-fiscal", date: new Date("2026-03-02"), idempotencyKey: "refund-paid" };
  const event = await executeTaxRefund(f.db, f.actor, input);
  assert.equal((await executeTaxRefund(f.db, f.actor, input)).id, event.id);
  await assert.rejects(executeTaxRefund(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, input), /autorizadas/i);
  await assert.rejects(executeTaxRefund(f.db, f.actor, { ...input, date: new Date("2026-03-03") }), /outros dados/i);
  assert.equal((await getBankAccountBalance(f.db, "banco", input.date)).toFixed(2), "4.00");
  assert.equal((await f.db.taxRegistryEntry.findUniqueOrThrow({ where: { id: requestId } })).status, "RESTITUIDA");
  assert.equal(await f.db.revenue.count(), 1);
  assert.equal(await f.db.accountingTransaction.count({ where: { eventType: "TAX_CREDIT_REFUNDED" } }), 1);
}));

test("P2: compensação extingue saldo sem nova arrecadação e a guia cobra somente o restante", async () => scenario(async (f) => {
  const initial = await createTaxAssessment(f.db, f.actor, { year: 2026, taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", rate: "4" });
  const guide = await generateTaxGuide(f.db, f.actor, { assessmentId: initial.id, dueDate: new Date("2026-03-31") });
  await processCollectionReturn(f.db, f.actor, { idempotencyKey: "compensation-ingress", guideNumber: guide.guideNumber!, amount: "6.00", occurredAt: new Date("2026-03-01"), status: "CONFIRMADO" });
  const credit = await f.db.taxRegistryEntry.findFirstOrThrow({ where: { category: "TAX_CREDIT" } });
  const target = await createTaxAssessment(f.db, f.actor, { year: 2026, taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", rate: "4" });
  const input = { creditId: credit.id, operation: "COMPENSAR" as const, amount: "2.00", assessmentId: target.id, reason: "Compensar débito", idempotencyKey: "compensation" };
  const event = await applyTaxCredit(f.db, f.actor, input);
  assert.equal((await applyTaxCredit(f.db, f.actor, input)).id, event.id);
  await assert.rejects(applyTaxCredit(f.db, f.actor, { ...input, amount: "1.00" }), /outros dados/i);
  assert.equal((await getAssessmentAccount(f.db, target.id)).position.balance.toFixed(2), "2.00");
  const remainder = await generateTaxGuide(f.db, f.actor, { assessmentId: target.id, dueDate: new Date("2026-11-01") });
  assert.equal(remainder.totalValueDecimal!.toFixed(2), "2.00");
  assert.equal(await f.db.revenue.count(), 1);
  assert.equal((await getBankAccountBalance(f.db, "banco", new Date("2026-11-02"))).toFixed(2), "6.00");
  await confirmTaxPayment(f.db, f.actor, { guideId: remainder.id, amountPaid: "2.00", paymentDate: new Date("2026-11-01"), paymentMethod: "Manual", idempotencyKey: "compensation-remainder" });
  assert.equal((await f.db.taxAssessment.findUniqueOrThrow({ where: { id: target.id } })).status, "Pago");
  const originPayment = await f.db.taxPayment.findFirstOrThrow({ where: { guideId: guide.id } });
  const collectionReversal = { paymentId: originPayment.id, date: new Date("2026-12-01"), reason: "Reversão da origem indevida", idempotencyKey: "used-credit-collection-reversal" };
  await assert.rejects(reverseTaxPayment(f.db, f.actor, collectionReversal), /já utilizado/i);
  const inverse = { movementId: String((event.result as Prisma.JsonObject).movementId), date: new Date("2026-12-01"), reason: "Compensação aplicada indevidamente", idempotencyKey: "compensation-reversal" };
  await assert.rejects(reverseTaxCreditMovement(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, inverse), /autorizadas/i);
  const reversed = await reverseTaxCreditMovement(f.db, f.actor, inverse);
  assert.equal((await reverseTaxCreditMovement(f.db, f.actor, inverse)).id, reversed.id);
  await assert.rejects(reverseTaxCreditMovement(f.db, f.actor, { ...inverse, reason: "Outro fundamento de reversão" }), /outros dados/i);
  assert.equal((await getAssessmentAccount(f.db, target.id)).position.balance.toFixed(2), "2.00");
  assert.equal((await f.db.taxAssessment.findUniqueOrThrow({ where: { id: target.id } })).status, "Parcial");
  assert.equal((await getBankAccountBalance(f.db, "banco", inverse.date)).toFixed(2), "8.00");
  await reverseTaxPayment(f.db, f.actor, collectionReversal);
  assert.equal((await getBankAccountBalance(f.db, "banco", inverse.date)).toFixed(2), "2.00");
}));

test("P2: reversão de crédito transferido e restituição não paga recompõe saldo sem movimentar caixa", async () => scenario(async (f) => {
  const assessment = await createTaxAssessment(f.db, f.actor, { year: 2026, taxId: "tax-chain", taxpayerId: "taxpayer-chain", taxableBase: "100.00", rate: "4" });
  const guide = await generateTaxGuide(f.db, f.actor, { assessmentId: assessment.id, dueDate: new Date("2026-03-31") });
  await processCollectionReturn(f.db, f.actor, { guideNumber: guide.guideNumber!, amount: "7.00", occurredAt: new Date("2026-03-01"), status: "CONFIRMADO", idempotencyKey: "credit-undo-origin" });
  const credit = await f.db.taxRegistryEntry.findFirstOrThrow({ where: { category: "TAX_CREDIT" } });
  await f.db.taxpayer.create({ data: { id: "credit-destination", taxpayerType: "PJ", companyId: "empresa", status: "Ativo" } });
  const transferred = await applyTaxCredit(f.db, f.actor, { creditId: credit.id, operation: "TRANSFERIR", amount: "2.00", destinationTaxpayerId: "credit-destination", reason: "Transferência de ensaio", idempotencyKey: "credit-transfer" });
  const destination = await f.db.taxRegistryEntry.findFirstOrThrow({ where: { category: "TAX_CREDIT", source: "TRANSFERENCIA" } });
  const refund = await applyTaxCredit(f.db, f.actor, { creditId: destination.id, operation: "RESTITUIR", amount: "1.00", reason: "Restituição de ensaio", idempotencyKey: "destination-refund" });
  const inverseTransfer = { movementId: String((transferred.result as Prisma.JsonObject).movementId), date: new Date("2026-12-01"), reason: "Transferência indevida", idempotencyKey: "undo-transfer" };
  await assert.rejects(reverseTaxCreditMovement(f.db, f.actor, inverseTransfer), /já utilizado/i);
  const inverseRefund = { movementId: String((refund.result as Prisma.JsonObject).movementId), date: new Date("2026-12-01"), reason: "Solicitação indevida", idempotencyKey: "undo-refund" };
  const restoredRefund = await reverseTaxCreditMovement(f.db, f.actor, inverseRefund);
  assert.equal((await reverseTaxCreditMovement(f.db, f.actor, inverseRefund)).id, restoredRefund.id);
  const restoredTransfer = await reverseTaxCreditMovement(f.db, f.actor, inverseTransfer);
  assert.equal((await reverseTaxCreditMovement(f.db, f.actor, inverseTransfer)).id, restoredTransfer.id);
  const origin = await f.db.taxRegistryEntry.findUniqueOrThrow({ where: { id: credit.id } });
  assert.equal((origin.data as Prisma.JsonObject).available, "3.00");
  assert.equal((await f.db.taxRegistryEntry.findUniqueOrThrow({ where: { id: destination.id } })).status, "ESTORNADO");
  assert.equal((await getBankAccountBalance(f.db, "banco", inverseTransfer.date)).toFixed(2), "7.00");
  assert.equal(await f.db.accountingTransaction.count({ where: { reversalOfId: { not: null } } }), 0);
}));
