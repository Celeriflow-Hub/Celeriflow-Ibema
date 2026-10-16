import assert from "node:assert/strict";
import test from "node:test";
import { createPlanningExecutionFixture } from "./helpers/planning-execution-fixture";
import { readCadastralRelationships } from "../src/lib/tributacao/cadastral-relationships";

test("Cadastros: referência distingue observação, vigência, aprovação e origem sem ressuscitar versões expiradas", async () => {
  const f = await createPlanningExecutionFixture();
  try {
    await f.db.realEstate.create({ data: { id: "property", municipalInsc: "REF-1" } });
    await f.db.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: "property", category: "PROPERTY_PROFILE", title: "Origem conciliada", data: { governmentEntityId: "ente", budgetUnitId: "ug" } } });
    const base = { entityType: "REAL_ESTATE", entityId: "property", category: "AREA", title: "Área complementar", actorUsuarioId: "ana", data: { governmentEntityId: "ente", budgetUnitId: "ug", value: "10" } };
    const first = await f.db.taxRegistryEntry.create({ data: { ...base, version: 1, createdAt: new Date("2026-01-01"), effectiveFrom: new Date("2025-01-01") } });
    const second = await f.db.taxRegistryEntry.create({ data: { ...base, version: 2, createdAt: new Date("2026-02-01"), effectiveFrom: new Date("2026-01-01"), reviewedAt: new Date("2026-03-01"), reviewedByUsuarioId: "ana", status: "ATIVO", data: { ...base.data, value: "20" } } });
    await f.db.taxRegistryEntry.create({ data: { ...base, version: 3, createdAt: new Date("2026-03-10"), effectiveFrom: new Date("2026-01-01"), reviewedAt: new Date("2026-04-01"), status: "REJEITADO" } });
    const actor = { ...f.actor, allowedBudgetUnitIds: ["ug"] };
    const at = (date: string) => readCadastralRelationships(f.db, actor, { entityType: "REAL_ESTATE", entityId: "property", at: new Date(date) });
    assert.equal((await at("2025-12-01")).position.length, 0, "Vigência retroativa não cria passado observado.");
    const february = await at("2026-02-15");
    assert.equal(february.position[0].id, first.id);
    assert.equal(february.history.find(row => row.id === second.id)?.referenceStatus, "PENDENTE_VALIDACAO");
    assert.equal((await at("2026-05-01")).position[0].id, second.id, "Rejeição da proposta seguinte preserva a posição aprovada.");
    const future = await f.db.taxRegistryEntry.create({ data: { ...base, version: 4, createdAt: new Date("2026-05-01"), effectiveFrom: new Date("2026-07-01"), effectiveUntil: new Date("2026-08-01"), data: { ...base.data, value: "40" } } });
    assert.equal((await at("2026-06-01")).position[0].id, second.id, "Versão futura não encerra prematuramente a anterior.");
    assert.equal((await at("2026-07-15")).position[0].id, future.id);
    assert.equal((await at("2026-09-01")).position.length, 0, "Expiração da última versão não reativa a anterior.");
    await f.db.taxRegistryEntry.create({ data: { ...base, title: "Outra origem", createdAt: new Date("2026-01-01"), data: { governmentEntityId: "outro", budgetUnitId: "outra" } } });
    await f.db.taxRegistryEntry.create({ data: { ...base, title: "Legado", createdAt: new Date("2026-01-01"), data: { value: "Sem origem" } } });
    assert.equal((await at("2026-07-15")).history.some(row => ["Outra origem", "Legado"].includes(row.title)), false);
    const administrator = await readCadastralRelationships(f.db, { ...f.actor, allowedBudgetUnitIds: undefined }, { entityType: "REAL_ESTATE", entityId: "property", at: new Date("2026-07-15") });
    assert.equal(administrator.history.find(row => row.title === "Legado")?.originKnown, false);
    await assert.rejects(readCadastralRelationships(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, { entityType: "REAL_ESTATE", entityId: "property", at: new Date() }), /autorizada/);
  } finally { await f.close(); }
});
