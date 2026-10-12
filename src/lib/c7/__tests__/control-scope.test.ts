import assert from "node:assert/strict";
import { test } from "node:test";
import { createPlanningAccountingFixture } from "../../../../tests/helpers/planning-accounting-fixture";
import { createInternalControlFinding, createInternalControlPlan, resolveInternalControlFinding } from "../operations-service";

test("Controle Interno restringe criação, apontamento e resolução à UG do plano", async () => {
  const fixture = await createPlanningAccountingFixture();
  try {
    const { db } = fixture;
    const actor = { usuarioId: "ana", allowedBudgetUnitIds: ["ug"] };
    const other = { usuarioId: "beatriz", allowedBudgetUnitIds: ["ug-restrita"] };
    const input = { title: "Plano de ensaio", reference: "POC P1", budgetUnitId: "ug" };
    const plan = await createInternalControlPlan(db, actor, input);
    assert.equal(plan.budgetUnitId, "ug");
    await assert.rejects(createInternalControlPlan(db, other, input), /unidades gestoras autorizadas/i);
    await assert.rejects(createInternalControlPlan(db, actor, { ...input, budgetUnitId: undefined }), /unidades gestoras autorizadas/i);
    await assert.rejects(createInternalControlPlan(db, { usuarioId: "ana" }, { ...input, budgetUnitId: "unbound-ug" }), /vinculada à entidade/i);
    const findingInput = { planId: plan.id, title: "Apontamento de ensaio", description: "Evidência de isolamento" };
    await assert.rejects(createInternalControlFinding(db, other, findingInput), /unidades gestoras autorizadas/i);
    const finding = await createInternalControlFinding(db, actor, findingInput);
    await assert.rejects(resolveInternalControlFinding(db, other, finding.id), /unidades gestoras autorizadas/i);
    assert.equal((await db.internalControlFinding.findUniqueOrThrow({ where: { id: finding.id } })).status, "PENDENTE");
    assert.equal((await resolveInternalControlFinding(db, actor, finding.id)).status, "RESOLVIDO");
    assert.equal(await db.internalControlPlan.count({ where: { budgetUnitId: { in: other.allowedBudgetUnitIds } } }), 0);
  } finally { await fixture.close(); }
});
