import test from "node:test";
import assert from "node:assert/strict";
import { createSiaficRequestHash, siaficDemoEnvelopeSchema } from "../src/lib/siafic/contract";
import { createSupplierWithSiaficEvent, saveContractWithSiaficEvent } from "../src/lib/siafic/source";
import { configureSiaficDemoEnvironment, createSiaficTestDatabase, seedSiaficSourceFixture } from "./helpers/siafic-test-environment";

test("SIAFIC DEMO · outbox transacional e snapshots imutaveis", { timeout: 180000 }, async (t) => {
  const cleanupEnvironment = configureSiaficDemoEnvironment("http://127.0.0.1:4010");
  const database = await createSiaficTestDatabase();
  try {
    const fixture = await seedSiaficSourceFixture(database.prisma, "http://127.0.0.1:4010");
    const actor = { usuarioId: fixture.actor.id };

    await t.test("CLC-008 · fornecedor cria snapshot, versao e entrega pendente", async () => {
      const result = await createSupplierWithSiaficEvent(database.prisma, actor, {
        companyId: fixture.company.id,
        category: "Materiais",
        businessBranch: "Papelaria DEMO",
      });
      assert.equal(result.eventIds.length, 1);
      const event = await database.prisma.siaficOutboxEvent.findUniqueOrThrow({
        where: { id: result.eventIds[0] },
        include: { delivery: true },
      });
      const envelope = siaficDemoEnvelopeSchema.parse(event.payload);
      assert.equal(envelope.entityType, "PERSON");
      assert.equal(envelope.entityId, result.supplier.id);
      assert.equal(envelope.entityVersion, 1);
      assert.equal(event.payloadHash, createSiaficRequestHash(envelope));
      assert.equal(event.delivery?.status, "PENDING");
    });

    await t.test("CLC-052/075 · contrato referencia fornecedor canonicamente", async () => {
      const supplier = await database.prisma.supplier.findFirstOrThrow({ where: { companyId: fixture.company.id } });
      const result = await saveContractWithSiaficEvent(database.prisma, actor, {
        number: "CT-M-TESTE/2026",
        object: "Contrato sintetico de materiais SIAFIC",
        initialValue: 2260,
        updatedValue: 2260,
        startDate: new Date("2026-09-01T12:00:00.000Z"),
        endDate: new Date("2026-09-30T12:00:00.000Z"),
        status: "Vigente",
        processId: fixture.process.id,
        supplierId: supplier.id,
        secretariatId: fixture.secretariat.id,
        sourceBudgetUnitId: fixture.budgetUnit.id,
      });
      assert.equal(result.eventIds.length, 1);
      const event = await database.prisma.siaficOutboxEvent.findUniqueOrThrow({ where: { id: result.eventIds[0] } });
      const envelope = siaficDemoEnvelopeSchema.parse(event.payload);
      assert.equal(envelope.entityType, "INSTRUMENT");
      assert.equal(envelope.payload.parties[0].sourcePersonId, supplier.id);
      assert.equal(envelope.payload.initialAmount, "2260.00");
      assert.equal(envelope.payload.items[0].quantity, "100.0000");
    });

    await t.test("T23 · falha local reverte fornecedor e evento juntos", async () => {
      const company = await database.prisma.company.create({ data: { corporateName: "Falha atomica DEMO", cnpj: "99123456789012" } });
      const before = await database.prisma.supplier.count();
      await database.memory.exec(`
        CREATE FUNCTION siafic_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Falha SIAFIC de teste'; END $$;
        CREATE TRIGGER siafic_fail_outbox BEFORE INSERT ON "SiaficOutboxEvent" FOR EACH ROW EXECUTE FUNCTION siafic_test_failure();
      `);
      await assert.rejects(createSupplierWithSiaficEvent(database.prisma, actor, { companyId: company.id }), /Falha SIAFIC de teste/);
      await database.memory.exec('DROP TRIGGER siafic_fail_outbox ON "SiaficOutboxEvent"; DROP FUNCTION siafic_test_failure();');
      assert.equal(await database.prisma.supplier.count(), before);
      assert.equal(await database.prisma.supplier.count({ where: { companyId: company.id } }), 0);
    });
  } finally {
    cleanupEnvironment();
    await database.close();
  }
});
