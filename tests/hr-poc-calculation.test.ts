import test from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { calculateIncomeTax, INCOME_TAX_2026_BANDS, INCOME_TAX_2026_REDUCTION } from "../src/lib/rh/income-tax";
import { calculateContribution, calculateContractRubrics, HR_PAYROLL_TYPES } from "../src/lib/rh/calculation-engine";
import { countThirteenthAvos, pocSpecialParametersSchema, preparePocSpecialRubrics } from "../src/lib/rh/poc-special-payroll";
import { calculateTravelAllowance } from "../src/lib/rh/travel-allowance";
import { calculateServiceAcquisitions } from "../src/lib/rh/service-rights";
import { calculateServiceTimeAllowance } from "../src/lib/rh/service-time-allowance";
import { vacationDaysForAbsences } from "../src/lib/rh/vacation-entitlement";

test("casos ouro T11–T15: RGPS e IRRF 2026, redução pela renda antes de deduções", () => {
  const bands = [{ lowerLimit: "0", upperLimit: "1621", employeeRate: "7.5" }, { lowerLimit: "1621", upperLimit: "2902.84", employeeRate: "9" }, { lowerLimit: "2902.84", upperLimit: "4354.27", employeeRate: "12" }, { lowerLimit: "4354.27", upperLimit: null, employeeRate: "14" }];
  assert.equal(calculateContribution(new Prisma.Decimal(4400), bands, "PROGRESSIVA", "8475.55").toFixed(2), "417.51");
  assert.equal(calculateContribution(new Prisma.Decimal(1621), bands, "PROGRESSIVA", "8475.55").toFixed(2), "121.58");
  const tax = (income: string, legal = "509.60", referenceDate = "2026-10-31") => calculateIncomeTax({ income, legalDeductions: legal, simplifiedDeduction: "607.20", bands: INCOME_TAX_2026_BANDS, referenceDate, reductionPolicy: INCOME_TAX_2026_REDUCTION });
  const gold = tax("5000");
  assert.equal(gold.base, "4392.80"); assert.equal(gold.preliminary, "312.89"); assert.equal(gold.reduction, "312.89"); assert.equal(gold.tax, "0.00");
  assert.equal(tax("6000").reduction, "179.75");
  assert.equal(tax("7350").reduction, "0.00");
  assert.equal(tax("7350.01").reduction, "0.00");
  assert.equal(tax("7500").tax, "986.79");
  assert.equal(tax("5100", "525").reduction, "299.58", "redução usa 5100, não base após deduções");
  assert.equal(tax("5000", "509.60", "2025-12-31").reduction, "0.00");
  assert.equal(tax("5000", "800").deductionMethod, "LEGAIS");
  assert.throws(() => tax("-1"), /inválidas/);
});

test("RRA multiplica tabela por meses sem aplicar redução mensal", () => {
  const result = calculateIncomeTax({ income: "18000", legalDeductions: "0", simplifiedDeduction: "0", bands: INCOME_TAX_2026_BANDS, referenceDate: "2026-10-31", rraMonths: 6, reductionPolicy: INCOME_TAX_2026_REDUCTION });
  assert.equal(result.preliminary, "335.04"); assert.equal(result.tax, "335.04"); assert.equal(result.reduction, "0.00");
});

test("oito folhas especiais POC e avos civis têm fórmulas específicas", () => {
  const codes = ["POC_COMPLEMENTO", "POC_FERIAS", "POC_TERCO", "POC_DECIMO_13", "POC_SALDO", "POC_RRA", "POC_ADIANTAMENTO", "POC_ADIANTAMENTO_13", "POC_FERIAS_IND", "POC_TERCO_IND", "POC_ABATIMENTO"];
  const rubrics = codes.map(code => ({ code, name: code, type: code === "POC_ABATIMENTO" ? "DESCONTO" : "PROVENTO", calculationMethod: "MANUAL", formulaExpression: null, calculationBaseCode: null, fixedValue: null, percentageRate: null, incidences: [] }));
  const parameters = pocSpecialParametersSchema.parse({ reason: "Caso ouro fictício documental", avos: 8, vacationDays: 30, variableAmount: "150", previousAdvance: "0" });
  const expected: Record<string, string> = { "Complementar": "150.00", "Rescisão": "13200.00", "RRA": "18000.00", "Férias": "5866.67", "1ª parcela 13º": "1466.67", "13º": "2933.33", "Diferença 13º": "2933.33", "Adiantamento salarial": "1760.00" };
  for (const payrollType of HR_PAYROLL_TYPES.filter(type => type !== "Mensal")) {
    const prepared = preparePocSpecialRubrics({ payrollType, competence: "10/2026", salary: "4400", admittedAt: new Date("2020-01-01"), endsAt: null, parameters, rubrics });
    const result = calculateContractRubrics({ salary: "4400", days: 30, monthlyHours: 200, movements: prepared.movements, rubrics: prepared.rubrics });
    assert.equal(result.gross.toFixed(2), expected[payrollType], payrollType);
  }
  assert.equal(countThirteenthAvos(new Date("2026-01-17"), new Date("2026-02-28"), null), 2);
  assert.equal(countThirteenthAvos(new Date("2026-01-18"), new Date("2026-02-28"), null), 1);
  assert.equal(countThirteenthAvos(new Date("2026-01-01"), new Date("2026-12-31"), new Date("2026-02-14")), 1);
});

test("quinquênios civis incluem bissextos, suspensão e convenção explícita para 29/02", () => {
  const start = new Date("2020-01-01"), policy = { origin: "LICENCA_PREMIO", acquisitionDays: 1825, acquisitionYears: 5, entitlementDays: 90, minSplitDays: 15, maxSplits: 6, allowsCash: true, maxCashDays: 45, absences: [{ type: "Licença", effect: "SUSPENDER" }], legalReference: "POC histórico Ibema" };
  assert.equal(calculateServiceAcquisitions(start, new Date("2024-12-30"), policy, []).periods.length, 0);
  const acquired = calculateServiceAcquisitions(start, new Date("2024-12-31"), policy, []);
  assert.equal(acquired.periods.length, 1); assert.equal(acquired.periods[0].countedDays, 1827);
  const absent = [{ type: "Licença", startDate: new Date("2024-12-01"), endDate: new Date("2024-12-02") }];
  assert.equal(calculateServiceAcquisitions(start, new Date("2025-01-01"), policy, absent).periods.length, 0);
  assert.equal(calculateServiceAcquisitions(start, new Date("2025-01-02"), policy, absent).periods.length, 1);
  const ats = { origin: "ATS", rubricCode: "ATS", basis: "SALARIO_TEMPORAL", tiers: [{ minimumDays: 0, minimumYears: 0, rate: "0" }, { minimumDays: 1825, minimumYears: 5, rate: "5" }], absences: [], legalReference: "Regra demonstrativa civil" };
  const calc = (date: string, admittedAt = start) => calculateServiceTimeAllowance(ats, { admittedAt, through: new Date(date), salary: "4400", creditedDays: 0, absences: [] });
  assert.equal(calc("2024-12-31").amount, "0.00");
  assert.equal(calc("2025-01-01").amount, "220.00");
  assert.equal(calc("2025-02-27", new Date("2020-02-29")).amount, "0.00");
  assert.equal(calc("2025-02-28", new Date("2020-02-29")).amount, "220.00");
});

test("diárias da cartilha: limites 8/12/24h, distância e truncamento explicitados", () => {
  const policy = { origin: "DIARIAS_POC", rates: { DF: "540.53", CAPITAL: "405.39", INTERIOR: "337.83", INTERNACIONAL: "130" }, minimumDistanceKm: 70, rounding: "DOWN", legalReference: "Cartilha Ibema; premissas POC", estimated: true };
  const input = { requestKey: "travel", contractId: "contract", ruleId: "rule", destination: "Cascavel", destinationType: "INTERIOR", departureAt: "2026-10-20T07:00:00-03:00", returnAt: "2026-10-20T18:00:00-03:00", distanceKm: "100", overnight: "NAO", exchangeRate: "1", purpose: "Capacitação fictícia POC", vehiclePlate: "POC-0001" };
  assert.equal(calculateTravelAllowance(policy, input).amountBRL, "168.91");
  assert.equal(calculateTravelAllowance(policy, { ...input, distanceKm: "70" }).amountBRL, "0.00");
  assert.equal(calculateTravelAllowance(policy, { ...input, returnAt: "2026-10-20T15:00:00-03:00" }).quantity, "0");
  assert.equal(calculateTravelAllowance(policy, { ...input, returnAt: "2026-10-20T19:00:00-03:00", overnight: "SIM" }).quantity, "0.5");
  assert.equal(calculateTravelAllowance(policy, { ...input, returnAt: "2026-10-20T20:00:00-03:00", overnight: "SIM" }).quantity, "1");
  assert.equal(calculateTravelAllowance(policy, { ...input, returnAt: "2026-10-21T07:00:00-03:00" }).quantity, "1");
  assert.equal(calculateTravelAllowance(policy, { ...input, destinationType: "INTERNACIONAL", exchangeRate: "5" }).amountBRL, "325.00");
});

test("mescla de férias resolve fronteiras 6/15/24/33 em política demonstrativa explícita", () => {
  const policy = { origin: "FALTAS_FERIAS_POC", estimated: true, legalReference: "Ibema histórico + Campina art. 109; >=33 estimado", attendanceStatuses: ["Falta"], bands: [{ minimumAbsences: 0, maximumAbsences: 5, days: 30 }, { minimumAbsences: 6, maximumAbsences: 14, days: 24 }, { minimumAbsences: 15, maximumAbsences: 23, days: 18 }, { minimumAbsences: 24, maximumAbsences: 32, days: 12 }, { minimumAbsences: 33, maximumAbsences: null, days: 0 }] };
  assert.deepEqual([0, 5, 6, 14, 15, 23, 24, 32, 33, 99].map(count => vacationDaysForAbsences(policy, count)), [30, 30, 24, 24, 18, 18, 12, 12, 0, 0]);
});
