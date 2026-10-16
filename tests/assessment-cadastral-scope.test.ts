import assert from "node:assert/strict";
import test from "node:test";
import { createPlanningExecutionFixture } from "./helpers/planning-execution-fixture";
import { configureTaxFinancialMapping, createTaxAssessment } from "../src/lib/tributacao";
import { createParametrizedAssessment } from "../src/lib/tributacao/s2-service";

test("IPTU/ISS: titular comum não autoriza lançar imóvel ou inscrição de outra origem municipal", async () => {
  const f = await createPlanningExecutionFixture();
  try {
    await f.db.financialYear.update({ where: { id: "ano" }, data: { status: "Aberto" } });
    await f.db.tax.create({ data: { id: "tax", name: "Tributo municipal", taxType: "Imposto" } });
    await configureTaxFinancialMapping(f.db, f.actor, { taxId: "tax", revenueNatureId: "receita", resourceSourceId: "livre", defaultBankAccountId: "banco" });
    await f.db.taxpayer.create({ data: { id: "payer", taxpayerType: "PF", status: "Ativo" } });
    for (const id of ["same", "other", "legacy"]) await f.db.realEstate.create({ data: { id, municipalInsc: id, taxpayerId: "payer" } });
    for (const id of ["same", "other"]) await f.db.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: id, category: "PROPERTY_PROFILE", title: "Origem conferida", data: { governmentEntityId: id === "same" ? "ente" : "outro-ente", budgetUnitId: id === "same" ? "ug" : "outra-ug" } } });
    await f.db.economicRegistration.create({ data: { id: "company-other", municipalInsc: "COMPANY-OTHER", taxpayerId: "payer", status: "Ativo" } });
    await f.db.taxRegistryEntry.create({ data: { entityType: "ECONOMIC_REGISTRATION", entityId: "company-other", category: "ECONOMIC_PROFILE", title: "Origem conferida", data: { governmentEntityId: "outro-ente", budgetUnitId: "outra-ug" } } });
    const base = { year: 2026, taxId: "tax", taxpayerId: "payer", taxableBase: "100", rate: "2", competence: new Date("2026-01-01") };
    await assert.rejects(createTaxAssessment(f.db, f.actor, { ...base, realEstateId: "other" }), /outra origem municipal/);
    await assert.rejects(createTaxAssessment(f.db, f.actor, { ...base, economicRegistrationId: "company-other" }), /outra origem municipal/);
    await assert.rejects(createTaxAssessment(f.db, { ...f.actor, allowedBudgetUnitIds: ["ug"] }, { ...base, realEstateId: "legacy" }), /sem origem conciliada/);
    assert.equal(await f.db.taxAssessment.count(), 0);
    await createTaxAssessment(f.db, { ...f.actor, allowedBudgetUnitIds: ["ug"] }, { ...base, realEstateId: "same" });
    await f.db.taxParameter.create({ data: { id: "parameter", taxId: "tax", code: "ANUAL", name: "Regra anual", calculationType: "PERCENTUAL_BASE", effectiveFrom: new Date("2026-01-01"), configuration: { formula: "PERCENTUAL_BASE", rate: "2" } } });
    await f.db.taxRegistryEntry.create({ data: { entityType: "TAX_PARAMETER", entityId: "parameter", category: "PARAMETER_SCOPE", title: "Origem da regra", data: { governmentEntityId: "ente", budgetUnitId: "ug" } } });
    const parameterized = { taxId: "tax", parameterId: "parameter", taxpayerId: "payer", taxableBase: "100", competence: base.competence, originKey: "cross-origin" };
    await assert.rejects(createParametrizedAssessment(f.db, f.actor, { ...parameterized, realEstateId: "other" }), /outra origem municipal/);
    await assert.rejects(createParametrizedAssessment(f.db, f.actor, { ...parameterized, economicRegistrationId: "company-other" }), /outra origem municipal/);
    assert.equal(await f.db.taxIntegrationEvent.count({ where: { idempotencyKey: "ASSESSMENT:cross-origin" } }), 0);
    await createParametrizedAssessment(f.db, { ...f.actor, allowedBudgetUnitIds: ["ug"] }, { ...parameterized, realEstateId: "same" });
    assert.equal(await f.db.taxAssessment.count(), 2);
  } finally { await f.close(); }
});
