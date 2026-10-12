import assert from "node:assert/strict";
import test from "node:test";
import { createPlanningExecutionFixture } from "./helpers/planning-execution-fixture";
import { createRevenue, createTreasuryTransfer, getBankAccountBalance, postAccountingTransaction } from "../src/lib/financeiro";
import { recordAssetDisposal } from "../src/lib/patrimonio/asset-lifecycle";

type Fixture = Awaited<ReturnType<typeof createPlanningExecutionFixture>>;
async function scenario(body: (fixture: Fixture) => Promise<void>) {
  const mode = process.env.CELERIFLOW_ACCOUNTING_MODE;
  process.env.CELERIFLOW_ACCOUNTING_MODE = "POC";
  let fixture: Fixture | undefined;
  try {
    fixture = await createPlanningExecutionFixture();
    await fixture.db.financialYear.update({ where: { id: "ano" }, data: { status: "Aberto" } });
    await body(fixture);
  } finally {
    await fixture?.close();
    if (mode === undefined) delete process.env.CELERIFLOW_ACCOUNTING_MODE;
    else process.env.CELERIFLOW_ACCOUNTING_MODE = mode;
  }
}

test("P3: transferência valida saldo, competência, autorização e replay sem duplicar caixa", async () => scenario(async (f) => {
  await f.db.bankAccount.create({ data: { id: "destination", bankName: "Banco destino", agency: "1", accountNumber: "2", accountType: "Corrente", budgetUnitId: "ug", resourceSourceId: "livre", currentBalance: 0, currentBalanceDecimal: 0, isActive: true } });
  await createRevenue(f.db, f.actor, { date: new Date("2026-03-01"), value: "10.00", revenueNatureId: "receita", resourceSourceId: "livre", bankAccountId: "banco", sourceModule: "TEST", sourceType: "P3_FUNDING", eventType: "RECEIPT", idempotencyKey: "p3-funding" });
  const input = { date: new Date("2026-03-02"), value: "4.00", sourceBankAccountId: "banco", destinationBankAccountId: "destination", idempotencyKey: "transfer-p3" };
  const transfer = await createTreasuryTransfer(f.db, f.actor, input);
  assert.equal((await createTreasuryTransfer(f.db, f.actor, input)).id, transfer.id);
  await assert.rejects(createTreasuryTransfer(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, input), /autorizad/i);
  await assert.rejects(createTreasuryTransfer(f.db, f.actor, { ...input, value: "5.00" }), /outros dados/i);
  await assert.rejects(createTreasuryTransfer(f.db, f.actor, { ...input, value: "7.00", idempotencyKey: "overdraft" }), /insuficiente/i);
  assert.equal((await getBankAccountBalance(f.db, "banco", input.date)).toFixed(2), "6.00");
  assert.equal((await getBankAccountBalance(f.db, "destination", input.date)).toFixed(2), "4.00");
  await f.db.monthlyAccountingClose.create({ data: { financialYearId: "ano", competence: new Date("2026-04-01"), status: "FECHADO" } });
  await assert.rejects(createTreasuryTransfer(f.db, f.actor, { ...input, date: new Date("2026-04-02"), idempotencyKey: "closed-month" }), /nao esta aberta/i);
  assert.equal(await f.db.treasuryTransfer.count(), 1);
}));

test("P4: alienação usa a cadeia canônica e mês fechado reverte baixa, receita e tesouraria", async () => scenario(async (f) => {
  await f.db.assetCategory.create({ data: { id: "category-p4", name: "Equipamentos de ensaio", code: "P4", lifeSpan: 60 } });
  for (const id of ["asset-p4", "asset-closed-p4"]) await f.db.asset.create({ data: { id, patrimonyNumber: id, name: id, acquisitionDate: new Date("2026-01-01"), acquisitionValue: 4, currentValue: 4, categoryId: "category-p4", status: "Ativo" } });
  const financial = { budgetUnitId: "ug", bankAccountId: "banco", revenueNatureId: "receita", resourceSourceId: "livre" };
  const input = { assetId: "asset-p4", date: new Date("2026-03-01"), type: "Alienação" as const, reason: "Leilão", justification: "Processo de ensaio", disposalValue: 4, actor: f.actor, financial };
  await assert.rejects(recordAssetDisposal(f.db, { ...input, actor: { ...f.actor, allowedBudgetUnitIds: [] } }), /autorizad/i);
  await assert.rejects(recordAssetDisposal(f.db, { ...input, financial: { budgetUnitId: "ug" } }), /explicitamente/i);
  const result = await recordAssetDisposal(f.db, input);
  const revenue = await f.db.revenue.findUniqueOrThrow({ where: { id: result.alienationRevenueId! } });
  assert.equal(revenue.budgetUnitId, "ug");
  assert.equal(revenue.financialYearId, "ano");
  assert.equal(revenue.sourceId, result.id);
  assert.equal(await f.db.accountingTransaction.count({ where: { sourceModule: "PATRIMONIO", sourceType: "ASSET_ALIENATION" } }), 1);
  assert.equal((await getBankAccountBalance(f.db, "banco", input.date)).toFixed(2), "4.00");
  await f.db.monthlyAccountingClose.create({ data: { financialYearId: "ano", competence: new Date("2026-04-01"), status: "FECHADO" } });
  await assert.rejects(recordAssetDisposal(f.db, { ...input, assetId: "asset-closed-p4", date: new Date("2026-04-02") }), /nao esta aberta/i);
  assert.equal((await f.db.asset.findUniqueOrThrow({ where: { id: "asset-closed-p4" } })).status, "Ativo");
  assert.equal(await f.db.assetWriteOff.count(), 1);
  assert.equal(await f.db.revenue.count(), 1);
  assert.equal(await f.db.treasuryMovement.count(), 1);
}));

test("P1: classificação publicada recusa conta sintética mesmo sem filhos locais", async () => scenario(async (f) => {
  await f.db.planningCatalogVersion.create({ data: { id: "official-p1", year: 2026, label: "Classificação de ensaio", sourceHash: "p1-test", normativeReference: "Metadados explícitos", createdById: "ana", entries: { create: { kind: "ACCOUNT", code: "1.1.1.1.1.01.00.00.00.00.00.00", name: "Conta não escriturável", degree: 6, canonicalId: "debito", attributes: { postingAllowed: false, balanceNature: "D", effectiveFrom: "2026-01-01", effectiveUntil: "2026-12-31" } } } } });
  await f.db.planningCatalogVersion.update({ where: { id: "official-p1" }, data: { status: "PUBLISHED" } });
  const input = { financialYearId: "ano", governmentEntityId: "ente", budgetUnitId: "ug", date: new Date("2026-03-01"), history: "Tentativa em conta sintética", lines: [{ accountId: "debito", type: "Débito" as const, value: "2.00" }, { accountId: "credito", type: "Crédito" as const, value: "2.00" }] };
  await assert.rejects(postAccountingTransaction(f.db, f.actor, input), /sintética/i);
  assert.equal(await f.db.accountingTransaction.count({ where: { history: input.history } }), 0);
}));
