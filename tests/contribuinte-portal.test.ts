import test from "node:test";
import assert from "node:assert/strict";
import { buildPixBrCode, evaluateFiscalSituation, readSession, signSession } from "../src/lib/tributacao/contribuinte-engine";

test("Pix BR Code tem estrutura EMV e CRC", () => {
  const code = buildPixBrCode({ key: "08929648000159", name: "Prefeitura Municipal de Cacimba de Dentro", city: "Cacimba de Dentro", amount: 123.4, txid: "DAM-2026-0001" });
  assert.ok(code.startsWith("000201"));
  assert.ok(code.includes("br.gov.bcb.pix"));
  assert.ok(code.includes("5406123.40"));
  assert.match(code, /6304[0-9A-F]{4}$/);
});

test("situação fiscal: negativa, efeito de negativa e positiva", () => {
  const past = new Date("2020-01-01");
  assert.equal(evaluateFiscalSituation([{ kind: "GUIA", status: "Paga", dueDate: past, balance: 0 }]).situation, "NEGATIVA");
  assert.equal(evaluateFiscalSituation([{ kind: "DIVIDA_ATIVA", status: "Parcelada", balance: 50 }]).situation, "POSITIVA_EFEITO_NEGATIVA");
  assert.equal(evaluateFiscalSituation([{ kind: "GUIA", status: "Emitida", dueDate: past, balance: 10 }]).situation, "POSITIVA");
  assert.equal(evaluateFiscalSituation([{ kind: "GUIA", status: "Emitida", dueDate: new Date(Date.now() + 864e5), balance: 10 }]).situation, "NEGATIVA");
});

test("sessão assinada expira e rejeita adulteração", () => {
  const t = signSession("abc", "s", 1, 0);
  assert.equal(readSession(t, "s", 1000), "abc");
  assert.equal(readSession(t, "s", 120_000), null);
  assert.equal(readSession(t.replace("abc", "xyz"), "s", 1000), null);
});
