import assert from "node:assert/strict";
import test from "node:test";
import { calculateEmployee, calculateInss, calculateIrrf, DEFAULT_PAYROLL_TABLES as T } from "@/lib/rh/payroll-engine";

const close = (a: number, b: number, d = 0.1) => assert.ok(Math.abs(a - b) <= d, `${a} ≈ ${b}`);

test("INSS progressivo", () => {
  assert.equal(calculateInss(1518, T.inss), 113.85);
  assert.equal(calculateInss(3000, T.inss), 253.41);
  assert.equal(calculateInss(20000, T.inss), calculateInss(8157.41, T.inss));
});
test("IRRF isento até R$ 5.000 e integral acima de R$ 7.350", () => {
  assert.equal(calculateIrrf(5000, 500, 0, T).tax, 0);
  close(calculateIrrf(10000, 900, 0, T).tax, (10000 - 900) * 0.275 - 908.73, 0.01);
});
test("RPPS, faltas, horas extras e consignado limitado", () => {
  const r = calculateEmployee({ id: "1", name: "A", salaryBase: 3000, regime: "RPPS", irrfDependents: 0,
    variables: [{ kind: "FALTA_DIAS", quantity: 2 }, { kind: "HORA_EXTRA_50", quantity: 10 }, { kind: "CONSIGNADO", value: 5000 }] }, "Mensal");
  const base = 3000 - 200 + (3000 / 220) * 1.5 * 10;
  close(r.rubrics.find((x) => x.code === "101")!.value, base * 0.14);
  assert.ok(r.warnings.some((w) => w.includes("margem")));
  assert.ok(r.net > 0);
});
test("13º final desconta adiantamento; férias com 1/3", () => {
  const d = calculateEmployee({ id: "1", name: "A", salaryBase: 2400, regime: "RGPS", irrfDependents: 0, monthsWorked: 12, thirteenthAdvancePaid: 1200 }, "13º Salário");
  assert.equal(d.rubrics.find((x) => x.code === "062")!.value, 1200);
  assert.equal(calculateEmployee({ id: "1", name: "A", salaryBase: 3000, regime: "RGPS", irrfDependents: 0 }, "Férias").gross, 4000);
});
