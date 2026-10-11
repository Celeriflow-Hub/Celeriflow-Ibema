import test from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { allocatePayrollAmount, calculateContractRubrics, calculateContribution, evaluatePayrollFormula, payrollPeriod, type PayrollRubricInput } from "../src/lib/rh/calculation-engine";
import { parsePayrollMovementImport } from "../src/lib/rh/movement-import";
import { calculateDailyBenefit, hrBenefitRuleSchema } from "../src/lib/rh/benefit-calculation";
import { selectRemunerationAverage } from "../src/lib/rh/remuneration-average";
import { calculateConsignmentMargin } from "../src/lib/rh/consignment-margin";
import { dependentEligibilityPolicySchema, evaluateDependentEligibility } from "../src/lib/rh/dependent-eligibility";
import { validateTimeBankBalances } from "../src/lib/rh/time-bank";

test("fórmula Decimal preserva precisão, precedência e rejeita execução/ciclos", () => {
  const resolve = (name: string) => { if (name === "SALARIO_BASE") return new Prisma.Decimal("1000.01"); throw new Error("Base ausente"); };
  assert.equal(evaluatePayrollFormula("SALARIO_BASE * (1 + 10 / 100)", resolve).toFixed(3), "1100.011");
  for (const formula of ["process.exit()", "A; B", "1 / 0", "(1 + 2", "1 2", "", "1+", "1%2"]) assert.throws(() => evaluatePayrollFormula(formula, resolve));
  const rubric: PayrollRubricInput = { code: "SALARIO", name: "Salário", type: "PROVENTO", calculationMethod: "FORMULA_CONTROLADA", formulaExpression: "SALARIO_BASE * DIAS / 30", calculationBaseCode: null, fixedValue: null, percentageRate: null, incidences: [{ incidenceType: "RGPS", isIncluded: true }] };
  const calculated = calculateContractRubrics({ salary: "3000.01", days: 15, monthlyHours: 220, rubrics: [rubric], movements: {} });
  assert.equal(calculated.net.toFixed(2), "1500.01");
  assert.equal(calculated.bases.RGPS.toFixed(2), "1500.01");
  assert.throws(() => calculateContractRubrics({ salary: "1", days: 30, monthlyHours: 220, rubrics: [{ ...rubric, formulaExpression: "SALARIO" }], movements: {} }), /cíclica/);
});

test("previdência progressiva, teto compartilhado e rateio fecham os centavos", () => {
  const bands = [{ lowerLimit: "0", upperLimit: "1000", employeeRate: "10" }, { lowerLimit: "1000", upperLimit: null, employeeRate: "20" }];
  const amount = calculateContribution(new Prisma.Decimal("3000"), bands, "PROGRESSIVA", "2000");
  assert.equal(amount.toFixed(2), "300.00");
  const shares = allocatePayrollAmount(new Prisma.Decimal("0.01"), [new Prisma.Decimal(1), new Prisma.Decimal(1), new Prisma.Decimal(1)]);
  assert.equal(shares.reduce((a, b) => a.add(b), new Prisma.Decimal(0)).toFixed(2), "0.01");
  const many = allocatePayrollAmount(new Prisma.Decimal("0.02"), Array.from({ length: 4 }, () => new Prisma.Decimal(1)));
  assert.deepEqual(many.map(value => value.toFixed(2)), ["0.01", "0.01", "0.00", "0.00"]);
  assert.throws(() => calculateContribution(new Prisma.Decimal("3000"), [{ lowerLimit: "1", upperLimit: null, employeeRate: "10" }], "PROGRESSIVA", null), /incompletas/);
  assert.throws(() => allocatePayrollAmount(new Prisma.Decimal(1), [new Prisma.Decimal(0)]), /base válida/);
});

test("competências civis validam mês e ano sem depender do fuso", () => {
  assert.equal(payrollPeriod("02/2028").end.toISOString(), "2028-02-29T23:59:59.999Z");
  for (const value of ["13/2026", "00/2026", "2026-01", "01/0000"]) assert.throws(() => payrollPeriod(value));
});

test("layout de importação preserva aspas, separadores e observações multilinha", () => {
  const rows = parsePayrollMovementImport('matricula;rubrica;valor;inicio;fim;referencia;observacao\nA;EXTRA;10,01;2026-10-01;2026-10-31;1;"Ato; com ""aspas""\ne continuação"');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].amount, "10.01");
  assert.equal(rows[0].notes, 'Ato; com "aspas"\ne continuação');
  assert.throws(() => parsePayrollMovementImport("nome;valor\nA;1"), /Cabeçalho/);
});

test("VT diário exclui afastamentos sem duplicar dias e limita o desconto do servidor", () => {
  const policy = hrBenefitRuleSchema.parse({ kind: "TRANSPORTE", benefitConfigId: "vt", rubricCode: "VT", posting: "DESCONTO", dailyValue: "10.00", weekdays: [1, 2, 3, 4, 5], excludeVacation: true, excludeLeaveTypes: ["Licença"], maxEmployeeDiscountRate: "6" });
  const input = { policy, from: new Date("2026-11-01"), until: new Date("2026-11-30"), admittedAt: new Date("2026-01-01"), endsAt: null, salary: new Prisma.Decimal(1000), absences: [{ from: new Date("2026-11-02"), until: new Date("2026-11-06"), reason: "Licença" }, { from: new Date("2026-11-04"), until: new Date("2026-11-06"), reason: "Sobreposição" }], customValue: null };
  const result = calculateDailyBenefit(input);
  assert.equal(result.total.toFixed(2), "160.00");
  assert.equal(result.employee.toFixed(2), "60.00");
  assert.equal(result.entity.toFixed(2), "100.00");
  assert.throws(() => calculateDailyBenefit({ ...input, customValue: new Prisma.Decimal(1) }), /autorização/);
});

test("média das 80% maiores expõe seleção e arredondamento sem excluir períodos implicitamente", () => {
  const values = [100, 500, 200, 400, 300].map((amount, index) => ({ month: `${index + 1}/2026`, amount: new Prisma.Decimal(amount) }));
  const result = selectRemunerationAverage(values, new Prisma.Decimal(80), "CEIL");
  assert.equal(result.average.toFixed(2), "350.00");
  assert.equal(result.selected.length, 4);
  assert.equal(result.excluded[0].amount.toFixed(2), "100.00");
  assert.throws(() => selectRemunerationAverage(values, new Prisma.Decimal(0), "CEIL"));
});

test("margem consignável agrega vínculos e valida rubricas sem duplicar o limite", () => {
  const policy = { origin: "MARGEM_CONSIGNAVEL", remunerationRubricCodes: ["SALARIO"], compulsoryDeductionRubricCodes: ["PREVIDENCIA"], consignmentRubricCodes: ["CONSIGNADO"], legalReference: "Política demonstrativa" };
  const rows = ["A", "B"].map(contractId => ({ contractId, items: [{ code: "SALARIO", type: "PROVENTO", value: "1000.01" }, { code: "PREVIDENCIA", type: "DESCONTO", value: "100.00" }, { code: "CONSIGNADO", type: "DESCONTO", value: "200.00" }] }));
  const margin = calculateConsignmentMargin(rows, policy, "30");
  assert.equal(margin.base, "1800.02");
  assert.equal(margin.limit, "540.01");
  assert.equal(margin.used, "400.00");
  assert.equal(margin.available, "140.01");
  assert.equal(margin.excess, "0.00");
  assert.equal(calculateConsignmentMargin(rows, policy, "10").excess, "220.00");
  assert.throws(() => calculateConsignmentMargin(rows, { ...policy, consignmentRubricCodes: ["PREVIDENCIA"] }, "30"));
  assert.throws(() => calculateConsignmentMargin(rows, { ...policy, remunerationRubricCodes: ["AUSENTE"] }, "30"), /não encontrada/);
  assert.throws(() => calculateConsignmentMargin(rows, { ...policy, remunerationRubricCodes: ["PREVIDENCIA"], compulsoryDeductionRubricCodes: [] }, "30"), /incompatível/);
  assert.throws(() => calculateConsignmentMargin(rows, policy, "101"), /percentual/);
});

test("dependentes respeitam idade civil e validade documental no fim da competência", () => {
  const policy = dependentEligibilityPolicySchema.parse({ relationships: [{ relationship: "Filho", maxAgeYears: 14 }], requiredDocumentTypes: ["ESCOLA"], acceptedDocumentStatuses: ["Válido"], allowDocumentsWithoutExpiry: false, legalReference: "Política sintética" });
  const candidate = { id: "dependent", personId: "child", relationship: "Filho", person: { id: "child", birthDate: new Date("2012-06-01"), status: "Ativo" } };
  const document = { id: "school", personId: "child", documentType: "ESCOLA", status: "Válido", validUntil: new Date("2027-05-31T23:59:59.999Z") };
  assert.equal(evaluateDependentEligibility(candidate, [document], policy, payrollPeriod("05/2027")).eligible, true);
  const june = evaluateDependentEligibility(candidate, [document], policy, payrollPeriod("06/2027"));
  assert.equal(june.eligible, false);
  assert.equal(june.age, 15);
  assert.equal(june.reasons.length, 2);
  assert.equal(evaluateDependentEligibility(candidate, [{ ...document, status: "Pendente" }], policy, payrollPeriod("05/2027")).eligible, false);
  assert.equal(evaluateDependentEligibility(candidate, [{ ...document, validUntil: null }], policy, payrollPeriod("05/2027")).eligible, false);
});

test("banco de horas preserva precisão e não financia débito com crédito futuro", () => {
  const credit = { date: new Date("2026-10-01"), quantity: "2.0001" };
  const debit = { date: new Date("2026-10-02"), quantity: "-1.0001" };
  assert.equal(validateTimeBankBalances([debit, credit], "10").toString(), "1");
  assert.throws(() => validateTimeBankBalances([{ ...debit, date: new Date("2026-09-30") }, credit], "10"), /créditos futuros/);
  assert.throws(() => validateTimeBankBalances([credit], "1"), /limite da política/);
});
