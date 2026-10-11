/**
 * Motor de cálculo da Folha de Pagamento (Sprint 3).
 * Funções puras: recebem dados do servidor, lançamentos variáveis e tabelas,
 * e devolvem as rubricas calculadas. Nada aqui acessa o banco.
 */

export type PayrollType = "Mensal" | "Complementar" | "Adiantamento 13º" | "13º Salário" | "Férias" | "Rescisão";
export const PAYROLL_TYPES: PayrollType[] = ["Mensal", "Complementar", "Adiantamento 13º", "13º Salário", "Férias", "Rescisão"];

export type SocialSecurityRegime = "RGPS" | "RPPS";

export type ProgressiveBracket = { upTo: number | null; rate: number };
export type IrrfBracket = { upTo: number | null; rate: number; deduction: number };

export type PayrollTables = {
  label: string;
  /** INSS (RGPS) progressivo por faixa; o teto é o limite da última faixa. */
  inss: ProgressiveBracket[];
  /** Alíquota do RPPS municipal (servidor). */
  rppsRate: number;
  irrf: IrrfBracket[];
  irrfDependentDeduction: number;
  irrfSimplifiedDiscount: number;
  /** Redução do IR (Lei 15.270/2025): isenção até `fullUpTo`, redução linear até `partialUpTo`. */
  irrfReduction?: { fullUpTo: number; partialUpTo: number; constant: number; factor: number };
  /** Margem consignável máxima sobre a remuneração líquida de descontos obrigatórios. */
  consignableMargin: number;
};

/** Tabelas padrão — parametrizáveis; confirmar valores oficiais da vigência antes da produção. */
export const DEFAULT_PAYROLL_TABLES: PayrollTables = {
  label: "Vigência 2026 (padrão do sistema)",
  inss: [
    { upTo: 1518.0, rate: 0.075 },
    { upTo: 2793.88, rate: 0.09 },
    { upTo: 4190.83, rate: 0.12 },
    { upTo: 8157.41, rate: 0.14 },
  ],
  rppsRate: 0.14,
  irrf: [
    { upTo: 2428.8, rate: 0, deduction: 0 },
    { upTo: 2826.65, rate: 0.075, deduction: 182.16 },
    { upTo: 3751.05, rate: 0.15, deduction: 394.16 },
    { upTo: 4664.68, rate: 0.225, deduction: 675.49 },
    { upTo: null, rate: 0.275, deduction: 908.73 },
  ],
  irrfDependentDeduction: 189.59,
  irrfSimplifiedDiscount: 607.2,
  irrfReduction: { fullUpTo: 5000, partialUpTo: 7350, constant: 978.62, factor: 0.133145 },
  consignableMargin: 0.35,
};

export type VariableKind =
  | "FALTA_DIAS"
  | "HORA_EXTRA_50"
  | "HORA_EXTRA_100"
  | "ADICIONAL_PERCENTUAL"
  | "ADICIONAL_VALOR"
  | "CONSIGNADO"
  | "OUTRO_DESCONTO"
  | "FERIAS_DIAS"
  | "DIAS_TRABALHADOS"
  | "COMPLEMENTO";

export const VARIABLE_KINDS: { kind: VariableKind; label: string; unit: "dias" | "horas" | "%" | "R$" }[] = [
  { kind: "FALTA_DIAS", label: "Faltas", unit: "dias" },
  { kind: "HORA_EXTRA_50", label: "Horas extras 50%", unit: "horas" },
  { kind: "HORA_EXTRA_100", label: "Horas extras 100%", unit: "horas" },
  { kind: "ADICIONAL_PERCENTUAL", label: "Adicional (% do salário)", unit: "%" },
  { kind: "ADICIONAL_VALOR", label: "Adicional (valor)", unit: "R$" },
  { kind: "CONSIGNADO", label: "Consignado", unit: "R$" },
  { kind: "OUTRO_DESCONTO", label: "Outro desconto", unit: "R$" },
  { kind: "FERIAS_DIAS", label: "Dias de férias (folha de férias/rescisão)", unit: "dias" },
  { kind: "DIAS_TRABALHADOS", label: "Dias trabalhados (rescisão)", unit: "dias" },
  { kind: "COMPLEMENTO", label: "Valor complementar", unit: "R$" },
];

export type PayrollVariableInput = { kind: VariableKind; quantity?: number; value?: number; note?: string | null };

export type EmployeeInput = {
  id: string;
  name: string;
  salaryBase: number;
  contractedHours?: number;
  regime: SocialSecurityRegime;
  irrfDependents: number;
  /** Meses trabalhados no ano, para 13º (1–12). */
  monthsWorked?: number;
  /** Dias de férias no período (padrão 30). */
  vacationDays?: number;
  /** Valor já pago de adiantamento de 13º (desconta no 13º final). */
  thirteenthAdvancePaid?: number;
  /** Dias trabalhados no mês da rescisão. */
  terminationDaysWorked?: number;
  /** Complemento informado para folha complementar. */
  complementValue?: number;
  benefits?: { name: string; value: number }[];
  variables?: PayrollVariableInput[];
};

export type RubricType = "Vencimento" | "Desconto" | "Base";
export type CalculatedRubric = { code: string; name: string; type: RubricType; value: number; reference?: string };

export type EmployeeResult = {
  employeeId: string;
  name: string;
  rubrics: CalculatedRubric[];
  gross: number;
  discounts: number;
  net: number;
  bases: { previdencia: number; irrf: number };
  warnings: string[];
};

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculateInss(base: number, brackets: ProgressiveBracket[]): number {
  let previous = 0;
  let total = 0;
  for (const bracket of brackets) {
    const ceiling = bracket.upTo ?? Infinity;
    if (base <= previous) break;
    total += (Math.min(base, ceiling) - previous) * bracket.rate;
    previous = ceiling;
  }
  return round2(total);
}

export function calculateRpps(base: number, rate: number): number {
  return round2(Math.max(0, base) * rate);
}

/**
 * IRRF mensal: compara dedução legal (previdência + dependentes) com o desconto
 * simplificado e usa o mais vantajoso; aplica a redução da Lei 15.270/2025.
 */
export function calculateIrrf(
  taxableGross: number,
  socialSecurity: number,
  dependents: number,
  tables: PayrollTables,
): { tax: number; base: number } {
  const legal = socialSecurity + dependents * tables.irrfDependentDeduction;
  const deduction = Math.max(legal, tables.irrfSimplifiedDiscount);
  const base = round2(Math.max(0, taxableGross - deduction));
  const bracket = tables.irrf.find((b) => b.upTo === null || base <= b.upTo)!;
  let tax = Math.max(0, base * bracket.rate - bracket.deduction);
  const reduction = tables.irrfReduction;
  if (reduction && tax > 0) {
    if (taxableGross <= reduction.fullUpTo) tax = 0;
    else if (taxableGross <= reduction.partialUpTo) {
      tax = Math.max(0, tax - Math.max(0, reduction.constant - reduction.factor * taxableGross));
    }
  }
  return { tax: round2(tax), base };
}

function sumKind(variables: PayrollVariableInput[], kind: VariableKind, field: "quantity" | "value") {
  return variables.filter((v) => v.kind === kind).reduce((s, v) => s + (Number(v[field]) || 0), 0);
}

/** Calcula as rubricas de um servidor para o tipo de folha informado. */
export function calculateEmployee(employee: EmployeeInput, type: PayrollType, tables: PayrollTables = DEFAULT_PAYROLL_TABLES): EmployeeResult {
  const rubrics: CalculatedRubric[] = [];
  const warnings: string[] = [];
  const variables = employee.variables ?? [];
  const salary = Math.max(0, employee.salaryBase || 0);
  const hours = employee.contractedHours && employee.contractedHours > 0 ? employee.contractedHours : 220;
  const hourly = salary / hours;
  const add = (code: string, name: string, rubricType: RubricType, value: number, reference?: string) => {
    const v = round2(value);
    if (v > 0) rubrics.push({ code, name, type: rubricType, value: v, reference });
  };
  if (salary <= 0 && type !== "Complementar") warnings.push("Servidor sem salário base cadastrado.");

  let taxable = 0;
  let irrfSeparate = false; // 13º tem tributação exclusiva

  if (type === "Mensal" || type === "Rescisão") {
    const days = type === "Rescisão" ? Math.min(30, Math.max(0, employee.terminationDaysWorked ?? 30)) : 30;
    const proportional = (salary / 30) * days;
    add("001", "Vencimento base", "Vencimento", proportional, `${days} dias`);
    const absences = type === "Mensal" ? sumKind(variables, "FALTA_DIAS", "quantity") : 0;
    const he50 = sumKind(variables, "HORA_EXTRA_50", "quantity");
    const he100 = sumKind(variables, "HORA_EXTRA_100", "quantity");
    const addPct = sumKind(variables, "ADICIONAL_PERCENTUAL", "quantity");
    const addVal = sumKind(variables, "ADICIONAL_VALOR", "value");
    add("010", "Horas extras 50%", "Vencimento", he50 * hourly * 1.5, `${he50}h`);
    add("011", "Horas extras 100%", "Vencimento", he100 * hourly * 2, `${he100}h`);
    add("020", "Adicional (percentual)", "Vencimento", (salary * addPct) / 100, `${addPct}%`);
    add("021", "Adicional (valor)", "Vencimento", addVal);
    add("050", "Faltas", "Desconto", (salary / 30) * absences, `${absences} dias`);
    taxable = rubrics.filter((r) => r.type === "Vencimento").reduce((s, r) => s + r.value, 0) - (salary / 30) * absences;

    if (type === "Rescisão") {
      const months = Math.min(12, Math.max(0, employee.monthsWorked ?? 0));
      const vacDays = employee.vacationDays ?? 0;
      const thirteenth = (salary / 12) * months;
      const vacation = (salary / 30) * vacDays;
      add("030", "13º proporcional (rescisão)", "Vencimento", thirteenth, `${months}/12`);
      add("031", "Férias indenizadas", "Vencimento", vacation, `${vacDays} dias`);
      add("032", "1/3 constitucional de férias", "Vencimento", vacation / 3);
      // Férias indenizadas não têm incidência previdenciária nem IRRF.
      taxable += thirteenth;
    }
  } else if (type === "Férias") {
    const days = employee.vacationDays ?? 30;
    const vacation = (salary / 30) * days;
    add("040", "Férias", "Vencimento", vacation, `${days} dias`);
    add("041", "1/3 constitucional de férias", "Vencimento", vacation / 3);
    taxable = vacation + vacation / 3;
  } else if (type === "Adiantamento 13º") {
    const months = Math.min(12, Math.max(1, employee.monthsWorked ?? 12));
    add("060", "Adiantamento 13º salário", "Vencimento", ((salary / 12) * months) / 2, `${months}/12`);
    taxable = 0; // sem incidências no adiantamento
  } else if (type === "13º Salário") {
    const months = Math.min(12, Math.max(1, employee.monthsWorked ?? 12));
    const full = (salary / 12) * months;
    add("061", "13º salário", "Vencimento", full, `${months}/12`);
    add("062", "Desconto adiantamento 13º", "Desconto", employee.thirteenthAdvancePaid ?? 0);
    taxable = full;
    irrfSeparate = true;
  } else if (type === "Complementar") {
    add("070", "Diferença complementar", "Vencimento", employee.complementValue ?? 0);
    taxable = employee.complementValue ?? 0;
    if (!employee.complementValue) warnings.push("Folha complementar sem valor informado.");
  }

  for (const benefit of employee.benefits ?? []) add("090", benefit.name, "Desconto", benefit.value, "Benefício");

  taxable = round2(Math.max(0, taxable));
  const previdencia = employee.regime === "RPPS" ? calculateRpps(taxable, tables.rppsRate) : calculateInss(taxable, tables.inss);
  if (previdencia > 0) add(employee.regime === "RPPS" ? "101" : "100", employee.regime === "RPPS" ? "RPPS — previdência própria" : "INSS", "Desconto", previdencia, employee.regime);

  const irrf = calculateIrrf(taxable, previdencia, employee.irrfDependents, tables);
  add("110", irrfSeparate ? "IRRF sobre 13º (exclusivo)" : "IRRF", "Desconto", irrf.tax, `${employee.irrfDependents} dep.`);
  if (irrf.base > 0) rubrics.push({ code: "900", name: "Base de cálculo IRRF", type: "Base", value: irrf.base });
  if (taxable > 0) rubrics.push({ code: "901", name: "Base previdenciária", type: "Base", value: taxable });

  // Consignados limitados à margem consignável.
  const consigned = sumKind(variables, "CONSIGNADO", "value");
  if (consigned > 0) {
    const grossSoFar = rubrics.filter((r) => r.type === "Vencimento").reduce((s, r) => s + r.value, 0);
    const margin = round2(Math.max(0, (grossSoFar - previdencia - irrf.tax) * tables.consignableMargin));
    const applied = Math.min(consigned, margin);
    if (applied < consigned) warnings.push(`Consignado limitado à margem de ${(tables.consignableMargin * 100).toFixed(0)}% (R$ ${margin.toFixed(2)}).`);
    add("120", "Consignado", "Desconto", applied);
  }
  add("130", "Outros descontos", "Desconto", sumKind(variables, "OUTRO_DESCONTO", "value"));

  const gross = round2(rubrics.filter((r) => r.type === "Vencimento").reduce((s, r) => s + r.value, 0));
  const discounts = round2(rubrics.filter((r) => r.type === "Desconto").reduce((s, r) => s + r.value, 0));
  const net = round2(gross - discounts);
  if (net < 0) warnings.push("Líquido negativo: revise os descontos.");
  return { employeeId: employee.id, name: employee.name, rubrics, gross, discounts, net, bases: { previdencia: taxable, irrf: irrf.base }, warnings };
}

export function calculatePayroll(employees: EmployeeInput[], type: PayrollType, tables: PayrollTables = DEFAULT_PAYROLL_TABLES) {
  const results = employees.map((e) => calculateEmployee(e, type, tables));
  return {
    results,
    gross: round2(results.reduce((s, r) => s + r.gross, 0)),
    discounts: round2(results.reduce((s, r) => s + r.discounts, 0)),
    net: round2(results.reduce((s, r) => s + r.net, 0)),
  };
}

export function normalizePayrollType(value: string | null | undefined): PayrollType {
  const v = (value ?? "").trim();
  if (PAYROLL_TYPES.includes(v as PayrollType)) return v as PayrollType;
  if (/13/.test(v) && /adiant/i.test(v)) return "Adiantamento 13º";
  if (/13/.test(v)) return "13º Salário";
  if (/f[ée]rias/i.test(v)) return "Férias";
  if (/rescis/i.test(v)) return "Rescisão";
  if (/complement/i.test(v)) return "Complementar";
  return "Mensal";
}
