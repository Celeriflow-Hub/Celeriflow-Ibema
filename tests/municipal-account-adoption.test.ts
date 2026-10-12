import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@prisma/client";
import { assertPublishedAccountClassification } from "../src/lib/financeiro/account-catalog";

test("Classificação municipal sucede referência imutável e opera fora do modo de ensaio; versões conflitantes continuam recusadas", async () => {
  const mode = process.env.CELERIFLOW_ACCOUNTING_MODE;
  process.env.CELERIFLOW_ACCOUNTING_MODE = "MUNICIPAL";
  try {
    const attributes = { postingAllowed: true, balanceNature: "D", effectiveFrom: "2026-01-01", effectiveUntil: "2026-12-31" };
    const reference = { id: "reference-entry", canonicalId: "cash", version: { year: 2026 }, attributes: { ...attributes, pocOnly: true } };
    const municipal = { id: "municipal-entry", canonicalId: "cash", version: { year: 2026 }, attributes: { ...attributes, operational: true, pocOnly: false, predecessorEntryId: reference.id } };
    const bindings = [reference];
    const tx = { planningCatalogEntry: { findMany: async () => bindings } } as unknown as Prisma.TransactionClient;
    await assert.rejects(assertPublishedAccountClassification(tx, [{ id: "cash" }], new Date("2026-03-01")), /modo POC/i);
    bindings.push(municipal);
    await assertPublishedAccountClassification(tx, [{ id: "cash" }], new Date("2026-03-01"));
    assert.equal(reference.attributes.pocOnly, true);
    bindings.push({ ...municipal, id: "conflicting-municipal-entry" });
    await assert.rejects(assertPublishedAccountClassification(tx, [{ id: "cash" }], new Date("2026-03-01")), /versão vigente única/i);
  } finally {
    if (mode === undefined) delete process.env.CELERIFLOW_ACCOUNTING_MODE;
    else process.env.CELERIFLOW_ACCOUNTING_MODE = mode;
  }
});
