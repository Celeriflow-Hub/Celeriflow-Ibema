import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createPlanningExecutionFixture } from "./helpers/planning-execution-fixture";
import { createPropertyWithProfile, publishPropertyRegistrationPolicy } from "../src/lib/tributacao/property-profile";
import { createPropertySubunit } from "../src/lib/tributacao/property-subunits";
import { reorganizeProperties } from "../src/lib/tributacao/property-operations";
import { readPropertyStructure } from "../src/lib/tributacao/property-structure";
import { readCadastralRelationships } from "../src/lib/tributacao/cadastral-relationships";
import { taxScopeSnapshot } from "../src/lib/tributacao/scope";

test("IPTU: desmembramento/remembramento conserva perfis, unidades e vínculos por data sem mover débitos", async () => {
  const f = await createPlanningExecutionFixture();
  try {
    for (const name of ["20261015100000_tax_property_cadastral_history", "20261015110000_real_estate_cadastral_history", "20261015140000_property_edit_restrictions", "20261015150000_property_profiles_and_registration"]) await f.pg.exec(await readFile(`prisma/migrations-ibema/${name}/migration.sql`, "utf8"));
    await f.db.taxpayer.create({ data: { id: "owner", taxpayerType: "PF", status: "Ativo" } });
    await f.db.processType.create({ data: { id: "type", name: "Cadastro" } });
    await f.db.subject.create({ data: { id: "subject", name: "Cadastro", processTypeId: "type" } });
    await f.db.process.create({ data: { id: "process", protocolNumber: "REORGANIZATION", description: "Remanejamento das unidades", processTypeId: "type", subjectId: "subject" } });
    await publishPropertyRegistrationPolicy(f.db, f.actor, { governmentEntityId: "ente", budgetUnitId: "ug", expectedVersion: 0, segments: [{ key: "number", label: "Inscrição", width: 4, numeric: true }], separator: "", requireProcess: true, restrictRiskAreas: false, legalBasis: "Composição conferida" });
    const address = { street: "Rua", number: "1", complement: "", neighborhood: "Centro", city: "Município", state: "PR", zipCode: "" };
    const land = await createPropertyWithProfile(f.db, f.actor, { profile: { propertyId: "NEW", expectedVersion: 0, expectedUpdatedAt: new Date().toISOString(), governmentEntityId: "ente", budgetUnitId: "ug", kind: "Terreno", parentId: null, unitMode: null, owners: [{ taxpayerId: "owner", sharePercent: "100", primary: true }], inscriptionParts: { number: "1" }, correspondenceAddress: address, latitude: null, longitude: null, floors: 0, frontSetback: "0", sideSetback: "0", riskArea: false, environmentalProtection: false, documentIds: [], processId: "process", reason: "Inclusão do terreno" }, cadastral: { registration: "MAT-1", streetName: "Rua", streetId: null, neighborhoodId: null, number: "1", complement: "", lot: "1", block: "1", landArea: 100, builtArea: 0, propertyUse: "Residencial", fiscalZone: "Z1" } });
    const unitIds: string[] = [];
    for (const [index, builtArea] of [10, 20].entries()) unitIds.push((await createPropertySubunit(f.db, f.actor, { parentId: land.id, municipalInsc: `000${index + 2}`, unitLabel: `Unidade ${index + 1}`, builtArea, unitLandArea: 10, unitMode: "ENGLOBADA", processId: "process", reason: "Inclusão da unidade" })).id);
    await f.db.taxpayer.create({ data: { id: "new-owner", taxpayerType: "PF", status: "Ativo" } });
    await f.db.$transaction(async tx => {
      const position = await tx.taxRegistryEntry.findFirstOrThrow({ where: { entityId: unitIds[0], category: "FISCAL_OWNERSHIP", status: "ATIVO" } });
      await tx.taxRegistryEntry.update({ where: { id: position.id }, data: { status: "HISTORICO", effectiveUntil: new Date() } });
      await tx.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: unitIds[0], category: "FISCAL_OWNERSHIP", title: "Titularidade posterior ao perfil", version: position.version + 1, actorUsuarioId: f.actor.usuarioId, processId: "process", data: { governmentEntityId: "ente", budgetUnitId: "ug", owners: [{ taxpayerId: "new-owner", sharePercent: "100" }], primaryTaxpayerId: "new-owner" } } });
      await tx.$queryRaw`SELECT set_config('celeriflow.cadastral_actor',${f.actor.usuarioId},true), set_config('celeriflow.cadastral_process','process',true)`;
      await tx.realEstate.update({ where: { id: unitIds[0] }, data: { taxpayerId: "new-owner" } });
    });
    const before = new Date();
    const landBefore = await f.db.realEstate.findUniqueOrThrow({ where: { id: land.id } });
    const unitRows = await f.db.realEstate.findMany({ where: { id: { in: unitIds } }, orderBy: { municipalInsc: "asc" } });
    const base = { governmentEntityId: "ente", budgetUnitId: "ug", processId: "process", reason: "Desmembramento documentado", operation: "SPLIT" as const, sources: [{ id: land.id, updatedAt: landBefore.updatedAt.toISOString() }], destinations: [{ inscription: "0010", landArea: "60", builtArea: "0", propertyType: "Terreno" as const, taxpayerId: null }, { inscription: "0011", landArea: "40", builtArea: "0", propertyType: "Terreno" as const, taxpayerId: null }], unitAssignments: unitRows.map((unit, index) => ({ unitId: unit.id, expectedUpdatedAt: unit.updatedAt.toISOString(), expectedProfileVersion: 1, destinationInscription: index === 0 ? "0010" : "0011" })) };
    await assert.rejects(reorganizeProperties(f.db, f.actor, { ...base, unitAssignments: [] }), /cada unidade/);
    await assert.rejects(reorganizeProperties(f.db, f.actor, { ...base, unitAssignments: base.unitAssignments.map(row => ({ ...row, expectedProfileVersion: 9 })) }), /Perfil da unidade/);
    await assert.rejects(reorganizeProperties(f.db, { ...f.actor, allowedBudgetUnitIds: [] }, base), /autorizado/);
    await f.pg.exec(`CREATE FUNCTION fail_relink() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.title='REORGANIZATION_UNIT_RELINK' THEN RAISE EXCEPTION 'relink rollback'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_relink BEFORE INSERT ON "TaxRegistryEntry" FOR EACH ROW EXECUTE FUNCTION fail_relink();`);
    await assert.rejects(reorganizeProperties(f.db, f.actor, base), /relink rollback/);
    assert.equal(await f.db.realEstate.count({ where: { municipalInsc: { in: ["0010", "0011"] } } }), 0);
    assert.equal((await f.db.realEstate.findUniqueOrThrow({ where: { id: land.id } })).status, "Ativo");
    await f.pg.exec('DROP TRIGGER fail_relink ON "TaxRegistryEntry"; DROP FUNCTION fail_relink();');
    const divided = await reorganizeProperties(f.db, f.actor, base);
    assert.equal((await f.db.realEstate.findUniqueOrThrow({ where: { id: unitIds[0] } })).taxpayerId, "new-owner", "Remanejamento não restaura titularidade antiga do perfil após transferência.");
    for (const [index, destination] of divided.created.entries()) {
      const profile = await f.db.taxRegistryEntry.findFirstOrThrow({ where: { entityId: destination.id, category: "PROPERTY_PROFILE" } });
      assert.equal(taxScopeSnapshot(profile.data).governmentEntityId, "ente");
      assert.deepEqual(taxScopeSnapshot(profile.data).correspondenceAddress, address);
      const structure = await readPropertyStructure(f.db, f.actor, destination.id);
      assert.equal(structure?.units.length, 1);
      assert.equal(structure?.totalUnitBuiltArea, index === 0 ? "10.000000" : "20.000000");
    }
    const prior = await readCadastralRelationships(f.db, f.actor, { entityType: "REAL_ESTATE", entityId: unitRows[0].id, at: before });
    assert.equal(taxScopeSnapshot(prior.position.find(row => row.category === "UNIDADE")?.data).parentId, land.id);
    const current = await readCadastralRelationships(f.db, f.actor, { entityType: "REAL_ESTATE", entityId: unitRows[0].id, at: new Date() });
    assert.equal(taxScopeSnapshot(current.position.find(row => row.category === "UNIDADE")?.data).parentId, divided.created[0].id);
    const pieces = await f.db.realEstate.findMany({ where: { id: { in: divided.created.map(row => row.id) } } });
    const updatedUnits = await f.db.realEstate.findMany({ where: { id: { in: unitIds } } });
    const merge = { ...base, operation: "MERGE" as const, sources: pieces.map(row => ({ id: row.id, updatedAt: row.updatedAt.toISOString() })), destinations: [{ inscription: "0020", landArea: "100", builtArea: "0", propertyType: "Terreno" as const, taxpayerId: null, profileSourceId: divided.created[1].id }], unitAssignments: updatedUnits.map(row => ({ unitId: row.id, expectedUpdatedAt: row.updatedAt.toISOString(), expectedProfileVersion: 2, destinationInscription: "0020" })) };
    const merged = await reorganizeProperties(f.db, f.actor, merge);
    assert.equal((await readPropertyStructure(f.db, f.actor, merged.created[0].id))?.totalUnitBuiltArea, "30.000000");
    assert.equal((await readPropertyStructure(f.db, f.actor, divided.created[0].id))?.units.length, 0);
    assert.equal(await f.db.taxRegistryEntry.count({ where: { entityId: unitRows[0].id, category: "PROPERTY_PROFILE" } }), 3);
    assert.equal(await f.db.realEstate.count({ where: { id: land.id } }), 1);
  } finally { await f.close(); }
});
