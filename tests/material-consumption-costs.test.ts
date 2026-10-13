import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@prisma/client";
import { createPlanningAccountingFixture } from "./helpers/planning-accounting-fixture";
import { configureMunicipalCosts, recordMunicipalCostSource } from "../src/lib/financeiro/cost-ledger";
import { reduceStockMunicipalCosts } from "../src/lib/financeiro/cost-stock-bridge";
import { readMunicipalCosts } from "../src/lib/financeiro/cost-overview";
import { cancelSettlementMunicipalCosts } from "../src/lib/financeiro/cost-settlement-bridge";

const actor = { usuarioId: "ana", allowedBudgetUnitIds: ["ug", "ug-restrita"] };
const date = new Date("2026-06-01T12:00:00Z");

test("materiais: devoluções sucessivas conservam os centavos do consumo e memória Decimal", async () => {
  const f = await createPlanningAccountingFixture();
  try {
    await f.db.financialYear.update({ where: { id: "ano" }, data: { status: "Aberto" } });
    await f.db.usuarioUnidadeGestora.create({ data: { usuarioId: actor.usuarioId, budgetUnitId: "ug" } });
    await configureMunicipalCosts(f.db, actor, { financialYearId: "ano", enabled: true, sourceTypes: ["STOCK_CONSUMPTION"], effectiveFrom: new Date("2026-01-01"), reason: "Consumo conciliado da fixture" });
    const original = await f.db.materialMovement.create({ data: { id: "consumo", type: "Saída", operation: "REGULAR", warehouseId: "almoxarifado", materialId: "material", quantity: 3, quantityDecimal: "3", unitValue: 0.016667, unitValueDecimal: "0.016667", totalValueDecimal: "0.05", settlementId: "comprovacao", reason: "CONSUMO_ORCAMENTARIO:Consumo municipal", date } });
    const source = await f.db.$transaction(tx => recordMunicipalCostSource(tx, actor, { financialYearId: "ano", budgetUnitId: "ug", sourceType: "STOCK_CONSUMPTION", sourceId: original.id, expenseDate: date, amount: new Prisma.Decimal("0.05"), dimensions: {}, evidence: { movementId: original.id, settlementId: original.settlementId } }));
    assert.ok(source);
    await assert.rejects(f.db.$transaction(tx => cancelSettlementMunicipalCosts(tx, actor, "comprovacao")), /consumo.*material/);
    for (const n of [1, 2, 3]) await f.db.$transaction(async tx => {
      const correction = await tx.materialMovement.create({ data: { id: `return-${n}`, type: "Entrada", operation: "RETURN", warehouseId: "almoxarifado", materialId: "material", quantity: 1, quantityDecimal: "1", unitValueDecimal: "0.016667", totalValueDecimal: "0.02", returnedMovementId: original.id, reason: "Retorno parcial", date } });
      await reduceStockMunicipalCosts(tx, actor, original, correction);
    });
    const reductions = await f.db.municipalCostSourceReduction.findMany({ orderBy: { idempotencyKey: "asc" } });
    assert.deepEqual(reductions.map(reduction => reduction.amount.toFixed(2)), ["0.02", "0.01", "0.02"]);
    const view = await readMunicipalCosts(f.db, actor, "ano");
    assert.equal(view.sources[0].amount, "0.05"); assert.equal(view.sources[0].netAmount, "0.00"); assert.equal(view.sources[0].pending, "0.00");
    assert.equal((await f.db.materialMovement.findUniqueOrThrow({ where: { id: original.id } })).quantityDecimal?.toFixed(6), "3.000000");
    await assert.rejects(f.db.$transaction(async tx => {
      const excess = await tx.materialMovement.create({ data: { id: "excess", type: "Entrada", operation: "RETURN", warehouseId: "almoxarifado", materialId: "material", quantity: 1, quantityDecimal: "1", returnedMovementId: original.id, reason: "Excesso", date } });
      await reduceStockMunicipalCosts(tx, actor, original, excess);
    }), /supera/);
    assert.equal(await f.db.materialMovement.count({ where: { id: "excess" } }), 0);
    await f.db.$transaction(tx => cancelSettlementMunicipalCosts(tx, actor, "comprovacao"));
    assert.equal((await f.db.municipalCostSource.findUniqueOrThrow({ where: { id: source.id } })).status, "CANCELLED");
  } finally { await f.close(); }
});
