import assert from "node:assert/strict";
import test from "node:test";
import {
  accountingEntries, annualIncome, employerCharges, generateCnab240, generateEsocialRemuneration, isValidCpf,
  netByBank, parseEmployeeImport, provisions, totalsByEmployee, type ObligationEmployee, type ObligationItem,
} from "@/lib/rh/payroll-obligations";

const emp = (id: string, extra: Partial<ObligationEmployee> = {}): ObligationEmployee => ({
  id, name: `Servidor ${id}`, cpf: "529.982.247-25", registration: `M${id}`, pisPasep: null, regime: "RGPS", secretariat: "Saúde",
  role: null, bankCode: "001", bankAgency: "1234", bankAccount: "56789", salaryBase: 3000, ...extra,
});
const items: ObligationItem[] = [
  { employeeId: "1", code: "CF001", name: "Vencimento", type: "Vencimento", value: 3000 },
  { employeeId: "1", code: "CF100", name: "INSS", type: "Desconto", value: 253.41 },
  { employeeId: "1", code: "CF901", name: "Base", type: "Base", value: 3000 },
  { employeeId: "2", code: "CF001", name: "Vencimento", type: "Vencimento", value: 2000 },
  { employeeId: "2", code: "CF101", name: "RPPS", type: "Desconto", value: 280 },
  { employeeId: "2", code: "CF901", name: "Base", type: "Base", value: 2000 },
];
const rows = totalsByEmployee([emp("1"), emp("2", { regime: "RPPS", bankCode: null, bankAccount: null })], items);

test("totais, bancos, encargos e provisões", () => {
  assert.equal(rows[0].net, 2746.59);
  assert.equal(netByBank(rows).length, 2);
  const c = employerCharges(rows);
  assert.equal(c.total, 3000 * 0.22 + 2000 * 0.14);
  assert.equal(provisions(rows).thirteenth, 500);
  const acc = accountingEntries(rows, c);
  assert.equal(acc.at(-1)!.valor, rows[0].net + rows[1].net);
});

test("CNAB 240 com linhas de 240 posições e servidor sem conta excluído", () => {
  const r = generateCnab240(rows, { bankCode: "001", agency: "1", account: "2", paymentDate: new Date(2026, 9, 5) });
  const lines = r.content.split("\r\n").filter(Boolean);
  assert.deepEqual(lines.map((l) => l.length), lines.map(() => 240));
  assert.equal(r.count, 1);
  assert.deepEqual(r.skipped, ["Servidor 2"]);
  assert.equal(lines.length, 5);
});

test("eSocial separa RGPS (S-1200) e RPPS (S-1202)", () => {
  const x = generateEsocialRemuneration(rows, items, "10/2026");
  assert.ok(x.includes("<evtRemun") && x.includes("<evtRmnRPPS") && x.includes("<perApur>2026-10</perApur>"));
});

test("informe anual separa 13º", () => {
  const a = annualIncome([{ type: "Mensal", rows }, { type: "13º Salário", rows }]);
  assert.equal(a.length, 1); // mesmo CPF nos dois servidores de teste
  assert.equal(a[0].thirteenth, 5000);
});

test("importação aponta CPF inválido, duplicado e sem banco", () => {
  assert.ok(isValidCpf("529.982.247-25") && !isValidCpf("111.111.111-11"));
  const csv = "nome;cpf;salario_base;banco;conta\nAna;529.982.247-25;1.518,00;001;123\nBia;111.111.111-11;1000;;\nAna 2;52998224725;1000;;";
  const { rows: ok, issues } = parseEmployeeImport(csv);
  assert.equal(ok.length, 1);
  assert.equal(ok[0].salaryBase, 1518);
  assert.ok(issues.some((i) => i.line === 3 && i.field === "cpf"));
  assert.ok(issues.some((i) => i.line === 4 && i.message.includes("repetido")));
});
