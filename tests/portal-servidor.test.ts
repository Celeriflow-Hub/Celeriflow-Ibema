import { test } from "node:test";
import assert from "node:assert/strict";
import { consignableMargin, documentHash, newValidationCode, payslipTotals, VALIDATION_CODE_PATTERN, maskCpf } from "../src/lib/portal-servidor/documents";
import { resolveLoginIdentifier } from "../src/lib/portal-servidor/login-id";

const lines = [
  { code: "CF001", name: "Vencimento base", type: "Vencimento", value: 3000 },
  { code: "CF100", name: "INSS", type: "Desconto", value: 250 },
  { code: "CF110", name: "IRRF", type: "Desconto", value: 50 },
  { code: "CF120", name: "Consignado", type: "Desconto", value: 300 },
  { code: "CF901", name: "Base previdenciária", type: "Base", value: 3000 },
];

test("totais do contracheque ignoram bases", () => {
  const t = payslipTotals(lines);
  assert.equal(t.gross, 3000); assert.equal(t.discounts, 600); assert.equal(t.net, 2400);
});

test("margem consignável 35% sobre bruto - previdência - IRRF", () => {
  const m = consignableMargin(lines);
  assert.equal(m.base, 2700); assert.equal(m.limit, 945); assert.equal(m.used, 300); assert.equal(m.available, 645);
});

test("código de validação e hash", () => {
  assert.match(newValidationCode(), VALIDATION_CODE_PATTERN);
  assert.equal(documentHash({ a: 1 }), documentHash({ a: 1 }));
  assert.equal(maskCpf("123.456.789-01"), "***.456.789-**");
});

test("login por CPF vira e-mail técnico", () => {
  const r = resolveLoginIdentifier("123.456.789-01");
  assert.ok(r.isCpf); assert.match(r.email, /^12345678901@servidor\./);
  assert.equal(resolveLoginIdentifier("a@b.gov.br").isCpf, false);
});
