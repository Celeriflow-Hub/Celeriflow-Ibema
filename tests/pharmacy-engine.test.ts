import { test } from "node:test";
import assert from "node:assert/strict";
import { competenceRange, coverageDays, csv, expiryStatus, isValidPortaria344, lossReason, normalizeCatmat, prescriptionTypeFor, stockLevel } from "../src/lib/saude/pharmacy-engine";

test("validade e estoque", () => {
  const today = new Date("2026-09-01T12:00:00Z");
  assert.equal(expiryStatus(new Date("2026-08-31"), today).status, "VENCIDO");
  assert.equal(expiryStatus(new Date("2026-09-20"), today).status, "VENCE_30");
  assert.equal(expiryStatus(new Date("2026-11-15"), today).status, "VENCE_90");
  assert.equal(expiryStatus(null, today).status, "SEM_VALIDADE");
  assert.equal(stockLevel(5, 10, 100), "ABAIXO_MINIMO");
  assert.equal(stockLevel(0, 10, 100), "ZERADO");
  assert.equal(coverageDays(300, 300, 30), 30);
});

test("Portaria 344, CATMAT e perdas", () => {
  assert.equal(isValidPortaria344("b1"), true);
  assert.equal(isValidPortaria344("Z9"), false);
  assert.match(prescriptionTypeFor("A1"), /amarela/);
  assert.match(prescriptionTypeFor("B1"), /azul/);
  assert.equal(normalizeCatmat("267500"), "BR0267500");
  assert.throws(() => normalizeCatmat("abc"));
  assert.equal(lossReason("BAIXA_ASSISTENCIAL:Produto vencido"), "Vencimento");
});

test("arquivos", () => {
  assert.equal(csv([["a;b", 1]]), '\uFEFF"a;b";1\r\n');
  assert.equal(competenceRange("2026-02").days, 28);
  assert.throws(() => competenceRange("2026-13"));
});
