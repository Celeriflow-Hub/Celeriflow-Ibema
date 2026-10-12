import { test } from "node:test";
import assert from "node:assert/strict";
import { createPlanningAccountingFixture } from "../../../../tests/helpers/planning-accounting-fixture";
import { authorizeAccountingMonthClose, authorizeAccountingMonthReopen, finalizeAnnualAccountingClose, postAccountingTransaction, prepareAnnualAccountingClose, requestAccountingMonthClose, requestAccountingMonthReopen } from "../index";
import { generateBalanceteContabil, generateDiarioContabil, generateRazaoContabil } from "../relatorios-legais";

test("contabilidade filtra Diario, Razao e Balancete pela entidade e UG sem misturar movimentos", async () => {
  const fixture = await createPlanningAccountingFixture();
  try {
    const { db } = fixture;
    await fixture.rules();
    const date = new Date("2026-04-15T12:00:00.000Z");
    const posted = await postAccountingTransaction(db, { usuarioId: "ana", employeeId: "servidora-ana", allowedBudgetUnitIds: ["ug"] }, {
      financialYearId: "ano", governmentEntityId: "ente", budgetUnitId: "ug", date: new Date("2026-01-01T00:00:00.000Z"),
      history: "Abertura contábil com escopo", sourceModule: "PLANEJAMENTO", sourceType: "PLANNING_BUDGET", eventType: "PLANNING_BUDGET_OPENING_EXPENSE",
      idempotencyKey: "scope:posted:opening", lines: [{ accountId: "debito", type: "Débito", value: "5.00" }, { accountId: "credito", type: "Crédito", value: "5.00" }],
    });
    assert.equal(posted.governmentEntityId, "ente");
    assert.equal(posted.budgetUnitId, "ug");
    await assert.rejects(postAccountingTransaction(db, { usuarioId: "ana", employeeId: "servidora-ana", allowedBudgetUnitIds: ["ug"] }, {
      financialYearId: "ano", governmentEntityId: "ente", budgetUnitId: "ug-restrita", date: new Date("2026-01-01T00:00:00.000Z"),
      history: "Unidade fora do perfil", sourceModule: "PLANEJAMENTO", sourceType: "PLANNING_BUDGET", eventType: "PLANNING_BUDGET_OPENING_EXPENSE",
      idempotencyKey: "scope:posted:denied", lines: [{ accountId: "debito", type: "Débito", value: "6.00" }, { accountId: "credito", type: "Crédito", value: "6.00" }],
    }));
    for (const [index, budgetUnitId, value] of [[1, "ug", "125.00"], [2, "ug-restrita", "40.00"]] as const) {
      await db.accountingTransaction.create({
        data: {
          id: `scoped-transaction-${index}`,
          governmentEntityId: "ente",
          budgetUnitId,
          financialYearId: "ano",
          date,
          history: `Escopo de teste ${index}`,
          status: "POSTADO",
          authorUsuarioId: "ana",
          authorEmployeeId: "servidora-ana",
          postedAt: date,
          sourceModule: "FINANCEIRO",
          sourceType: "TEST_SCOPE",
          sourceId: `scope-${index}`,
          eventType: "TEST_SCOPE",
          idempotencyKey: `scope:${index}`,
          entries: { create: [
            { id: `scoped-debit-${index}`, date, value: Number(value), valueDecimal: value, type: "Débito", history: "Teste de escopo", accountId: "debito", authorId: "servidora-ana" },
            { id: `scoped-credit-${index}`, date, value: Number(value), valueDecimal: value, type: "Crédito", history: "Teste de escopo", accountId: "credito", authorId: "servidora-ana" },
          ] },
        },
      });
    }

    const municipality = await generateDiarioContabil(db, { financialYearId: "ano", governmentEntityId: "ente" });
    const unit = await generateDiarioContabil(db, { financialYearId: "ano", governmentEntityId: "ente", budgetUnitId: "ug" });
    assert.equal(municipality.length, 3);
    assert.equal(unit.length, 2);
    assert.equal(unit.some((transaction) => transaction.history === "Escopo de teste 1"), true);
    assert.deepEqual(await generateDiarioContabil(db, { financialYearId: "ano", budgetUnitId: "ug-restrita", budgetUnitIds: ["ug"] }), []);

    const ledger = await generateRazaoContabil(db, { financialYearId: "ano", budgetUnitId: "ug-restrita", accountId: "debito" });
    assert.equal(ledger.length, 1);
    assert.equal(ledger[0].value, 40);

    const trial = await generateBalanceteContabil(db, { financialYearId: "ano", budgetUnitId: "ug" });
    assert.equal(trial.find((account) => account.id === "debito")?.debitTotal, 130);
    assert.equal(trial.find((account) => account.id === "credito")?.creditTotal, 130);

    await assert.rejects(db.accountingTransaction.create({
      data: {
        id: "scoped-invalid-transaction", governmentEntityId: "ente", budgetUnitId: "unbound-ug", financialYearId: "ano", date,
        history: "Unidade incompatível", status: "POSTADO", authorUsuarioId: "ana", authorEmployeeId: "servidora-ana",
        entries: { create: [
          { date, value: 1, valueDecimal: "1.00", type: "Débito", history: "x", accountId: "debito", authorId: "servidora-ana" },
          { date, value: 1, valueDecimal: "1.00", type: "Crédito", history: "x", accountId: "credito", authorId: "servidora-ana" },
        ] },
      },
    }));
  } finally { await fixture.close(); }
});

test("fechar e reabrir a Prefeitura não fecha a Câmara no mesmo ano", async () => {
  const fixture = await createPlanningAccountingFixture();
  try {
    const { db } = fixture;
    await fixture.rules();
    await db.governmentEntity.create({ data: { id: "camara", code: "CAMARA", name: "Câmara de ensaio", type: "CAMARA" } });
    await db.budgetUnit.create({ data: { id: "ug-camara", code: "LEG.01", name: "Câmara", secretariatId: "secretaria" } });
    await db.planningEntityUnit.create({ data: { governmentEntityId: "camara", budgetUnitId: "ug-camara" } });
    await db.financialYear.create({ data: { id: "ano-camara", governmentEntityId: "camara", year: 2026, status: "Aberto", startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31T23:59:59.999Z") } });
    await db.financialYear.update({ where: { id: "ano" }, data: { status: "Aberto" } });
    await db.bankAccount.create({ data: { id: "banco-camara", bankName: "Banco de ensaio", agency: "0001", accountNumber: "LEG-01", budgetUnitId: "ug-camara" } });
    await db.bankStatementItem.create({ data: { bankAccountId: "banco-camara", date: new Date("2026-01-10"), direction: "Entrada", valueDecimal: "1.00", status: "Pendente" } });
    const requester = { usuarioId: "ana", employeeId: "servidora-ana" };
    const authorizer = { usuarioId: "beatriz", employeeId: "servidora-ana" };
    const january = new Date("2026-01-01");
    await assert.rejects(requestAccountingMonthClose(db, requester, "ano-camara", january), /pendencias/i);
    await requestAccountingMonthClose(db, requester, "ano", january);
    await assert.rejects(authorizeAccountingMonthClose(db, requester, "ano", january), /solicitante nao pode autorizar/i);
    await authorizeAccountingMonthClose(db, authorizer, "ano", january);
    const posting = { date: new Date("2026-01-15"), history: "Postagem de isolamento", lines: [{ accountId: "debito", type: "Débito" as const, value: "10.00" }, { accountId: "credito", type: "Crédito" as const, value: "10.00" }] };
    await assert.rejects(postAccountingTransaction(db, requester, { ...posting, financialYearId: "ano", governmentEntityId: "ente", budgetUnitId: "ug" }), /competencia contabil nao esta aberta/i);
    await postAccountingTransaction(db, requester, { ...posting, financialYearId: "ano-camara", governmentEntityId: "camara", budgetUnitId: "ug-camara" });
    await assert.rejects(postAccountingTransaction(db, requester, { ...posting, financialYearId: "ano-camara", governmentEntityId: "ente", budgetUnitId: "ug" }), /entidade.*exercício/i);
    await requestAccountingMonthReopen(db, requester, "ano", january, "Correção de ensaio por entidade.");
    await authorizeAccountingMonthReopen(db, authorizer, "ano", january);
    await postAccountingTransaction(db, requester, { ...posting, financialYearId: "ano", governmentEntityId: "ente", budgetUnitId: "ug" });
    for (let month = 0; month < 12; month++) {
      const competence = new Date(Date.UTC(2026, month, 1));
      await requestAccountingMonthClose(db, requester, "ano", competence);
      await authorizeAccountingMonthClose(db, authorizer, "ano", competence);
    }
    await prepareAnnualAccountingClose(db, requester, "ano");
    await assert.rejects(finalizeAnnualAccountingClose(db, requester, "ano"), /quem preparou.*nao pode conclui-lo/i);
    await finalizeAnnualAccountingClose(db, authorizer, "ano");
    assert.equal((await db.financialYear.findUniqueOrThrow({ where: { id: "ano" } })).status, "Encerrado");
    assert.equal((await db.financialYear.findUniqueOrThrow({ where: { id: "ano-camara" } })).status, "Aberto");
    assert.equal(await db.monthlyAccountingClose.count({ where: { financialYearId: "ano-camara" } }), 0);
    assert.equal(await db.annualAccountingClose.count({ where: { financialYearId: "ano-camara" } }), 0);
  } finally { await fixture.close(); }
});
