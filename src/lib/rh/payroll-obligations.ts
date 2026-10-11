/**
 * Sprint 4 — Obrigações, relatórios e exportações da folha.
 * Funções puras (sem banco) para facilitar testes: recebem as linhas já
 * carregadas da folha e devolvem relatórios, arquivos CNAB, eSocial e DIRF.
 */
import { municipality } from "@/lib/platform/municipality";
import { round2 } from "./payroll-engine";

export type ObligationEmployee = {
  id: string;
  name: string;
  cpf: string | null;
  registration: string | null;
  pisPasep: string | null;
  regime: string; // RGPS | RPPS
  secretariat: string | null;
  role: string | null;
  bankCode: string | null;
  bankAgency: string | null;
  bankAccount: string | null;
  salaryBase: number;
};
export type ObligationItem = { employeeId: string; code: string; name: string; type: string; value: number };

/** Alíquotas patronais presumidas — confirmar com a contabilidade da Prefeitura. */
export const EMPLOYER_RATES = { rgpsPatronal: 0.2, rat: 0.02, rppsPatronal: 0.14 };

export type EmployeeTotals = ObligationEmployee & { gross: number; discounts: number; net: number; inss: number; rpps: number; irrf: number; prevBase: number; irrfBase: number };

const digits = (v: string | null | undefined) => (v ?? "").replace(/\D/g, "");
const code = (c: string) => c.replace(/^CF/, "");

export function totalsByEmployee(employees: ObligationEmployee[], items: ObligationItem[]): EmployeeTotals[] {
  return employees
    .map((e) => {
      const own = items.filter((i) => i.employeeId === e.id);
      const sum = (pred: (i: ObligationItem) => boolean) => round2(own.filter(pred).reduce((s, i) => s + i.value, 0));
      const gross = sum((i) => i.type === "Vencimento");
      const discounts = sum((i) => i.type === "Desconto");
      return {
        ...e, gross, discounts, net: round2(gross - discounts),
        inss: sum((i) => code(i.code) === "100"), rpps: sum((i) => code(i.code) === "101"),
        irrf: sum((i) => code(i.code) === "110"), prevBase: sum((i) => code(i.code) === "901"), irrfBase: sum((i) => code(i.code) === "900"),
      };
    })
    .filter((t) => t.gross > 0 || t.discounts > 0);
}

export function rubricSummary(items: ObligationItem[]) {
  const map = new Map<string, { code: string; name: string; type: string; total: number; count: number }>();
  for (const i of items) {
    const row = map.get(i.code) ?? { code: code(i.code), name: i.name, type: i.type, total: 0, count: 0 };
    row.total = round2(row.total + i.value); row.count++;
    map.set(i.code, row);
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}

function groupBy(rows: EmployeeTotals[], key: (r: EmployeeTotals) => string) {
  const map = new Map<string, { group: string; employees: number; gross: number; discounts: number; net: number }>();
  for (const r of rows) {
    const g = key(r);
    const row = map.get(g) ?? { group: g, employees: 0, gross: 0, discounts: 0, net: 0 };
    row.employees++; row.gross = round2(row.gross + r.gross); row.discounts = round2(row.discounts + r.discounts); row.net = round2(row.net + r.net);
    map.set(g, row);
  }
  return [...map.values()].sort((a, b) => a.group.localeCompare(b.group));
}
export const netByBank = (rows: EmployeeTotals[]) => groupBy(rows, (r) => (r.bankCode ? `Banco ${r.bankCode}` : "Sem conta bancária"));
export const bySecretariat = (rows: EmployeeTotals[]) => groupBy(rows, (r) => r.secretariat ?? "Sem lotação");

export function employerCharges(rows: EmployeeTotals[], rates = EMPLOYER_RATES) {
  const rgpsBase = round2(rows.filter((r) => r.regime !== "RPPS").reduce((s, r) => s + r.prevBase, 0));
  const rppsBase = round2(rows.filter((r) => r.regime === "RPPS").reduce((s, r) => s + r.prevBase, 0));
  const lines = [
    { name: "INSS patronal (RGPS)", base: rgpsBase, rate: rates.rgpsPatronal, value: round2(rgpsBase * rates.rgpsPatronal) },
    { name: "RAT/FAP (RGPS)", base: rgpsBase, rate: rates.rat, value: round2(rgpsBase * rates.rat) },
    { name: "Contribuição patronal RPPS", base: rppsBase, rate: rates.rppsPatronal, value: round2(rppsBase * rates.rppsPatronal) },
  ];
  return { lines, total: round2(lines.reduce((s, l) => s + l.value, 0)) };
}

/** Provisões mensais de 13º (1/12) e férias + 1/3 (1/12 × 4/3). */
export function provisions(rows: EmployeeTotals[]) {
  const base = round2(rows.reduce((s, r) => s + r.salaryBase, 0));
  const thirteenth = round2(base / 12);
  const vacation = round2((base / 12) * (4 / 3));
  return { base, thirteenth, vacation, total: round2(thirteenth + vacation) };
}

/** Proposta de empenho/liquidação da folha para o módulo financeiro. */
export function accountingEntries(rows: EmployeeTotals[], charges: ReturnType<typeof employerCharges>) {
  const gross = round2(rows.reduce((s, r) => s + r.gross, 0));
  const rgps = round2(rows.reduce((s, r) => s + r.inss, 0));
  const rpps = round2(rows.reduce((s, r) => s + r.rpps, 0));
  const irrf = round2(rows.reduce((s, r) => s + r.irrf, 0));
  const net = round2(rows.reduce((s, r) => s + r.net, 0));
  return [
    { natureza: "3.1.90.11", descricao: "Vencimentos e vantagens fixas — pessoal civil", valor: gross },
    { natureza: "3.1.91.13", descricao: "Obrigações patronais", valor: charges.total },
    { natureza: "Retenção", descricao: "INSS retido dos servidores (repasse RGPS)", valor: rgps },
    { natureza: "Retenção", descricao: "Contribuição RPPS retida (repasse ao instituto)", valor: rpps },
    { natureza: "Retenção", descricao: "IRRF retido (receita própria do município)", valor: irrf },
    { natureza: "Outras consignações", descricao: "Consignados e demais descontos", valor: round2(gross - net - rgps - rpps - irrf) },
    { natureza: "Pagamento", descricao: "Líquido a pagar aos servidores", valor: net },
  ];
}

// ---------- CSV ----------
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = typeof v === "number" ? v.toFixed(2).replace(".", ",") : (v ?? "");
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}

// ---------- CNAB 240 (FEBRABAN, pagamento de salários — segmento A) ----------
const num = (v: string | number, len: number) => digits(String(v)).slice(-len).padStart(len, "0");
const alpha = (v: string | null | undefined, len: number) =>
  (v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9 ]/g, " ").slice(0, len).padEnd(len, " ");
const ddmmyyyy = (d: Date) => `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${d.getFullYear()}`;
const cents = (v: number, len: number) => num(Math.round(v * 100), len);

export type CnabOptions = { bankCode: string; agency: string; account: string; agreement?: string; paymentDate: Date; sequence?: number };

function assertLine(line: string) {
  if (line.length !== 240) throw new Error(`Linha CNAB com ${line.length} posições.`);
  return line;
}

export function generateCnab240(rows: EmployeeTotals[], opt: CnabOptions) {
  const bank = num(opt.bankCode, 3);
  const cnpj = num(municipality.cnpj, 14);
  const name = alpha(municipality.legalName, 30);
  const now = new Date();
  const payable = rows.filter((r) => r.net > 0 && r.bankCode && r.bankAccount);
  const skipped = rows.filter((r) => r.net > 0 && !(r.bankCode && r.bankAccount)).map((r) => r.name);
  const lines: string[] = [];
  const agencyAccount = num(opt.agency, 5) + " " + num(opt.account, 12) + " " + " ";

  lines.push(assertLine(bank + "0000" + "0" + " ".repeat(9) + "2" + cnpj + alpha(opt.agreement, 20) + agencyAccount + name + alpha("BANCO", 30) + " ".repeat(10) + "1" + ddmmyyyy(now) + "000000" + num(opt.sequence ?? 1, 6) + "089" + "00000" + " ".repeat(69)));
  lines.push(assertLine(bank + "0001" + "1" + "C" + "30" + "01" + "045" + " " + "2" + cnpj + alpha(opt.agreement, 20) + agencyAccount + name + " ".repeat(40) + alpha(municipality.address, 30) + "00000" + " ".repeat(15) + alpha(municipality.name, 20) + num(municipality.zipCode, 8) + alpha(municipality.state, 2) + " ".repeat(8) + " ".repeat(10)));

  let seq = 0;
  let total = 0;
  for (const r of payable) {
    seq++;
    total += r.net;
    const [ag, acc] = [num(r.bankAgency ?? "", 5), num(r.bankAccount ?? "", 12)];
    lines.push(assertLine(bank + "0001" + "3" + num(seq, 5) + "A" + "0" + "00" + (r.bankCode === opt.bankCode ? "000" : "018") + num(r.bankCode ?? "", 3) + ag + " " + acc + " " + " " + alpha(r.name, 30) + alpha(r.registration ?? r.id, 20) + ddmmyyyy(opt.paymentDate) + "BRL" + "0".repeat(15) + cents(r.net, 15) + " ".repeat(20) + "00000000" + "0".repeat(15) + " ".repeat(40) + "  " + " ".repeat(5) + " ".repeat(2) + " ".repeat(3) + "0" + " ".repeat(10)));
  }
  lines.push(assertLine(bank + "0001" + "5" + " ".repeat(9) + num(payable.length + 2, 6) + cents(total, 18) + "0".repeat(18) + "0".repeat(6) + " ".repeat(165) + " ".repeat(10)));
  lines.push(assertLine(bank + "9999" + "9" + " ".repeat(9) + "000001" + num(lines.length + 1, 6) + "000000" + " ".repeat(205)));
  return { content: lines.join("\r\n") + "\r\n", count: payable.length, total: round2(total), skipped };
}

// ---------- eSocial S-1200 (remuneração RGPS) e S-1202 (RPPS) — XML simplificado ----------
const xml = (s: string | number | null | undefined) => String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

export function generateEsocialRemuneration(rows: EmployeeTotals[], items: ObligationItem[], competence: string) {
  const [mm, yyyy] = competence.split("/");
  const cnpjRoot = num(municipality.cnpj, 14).slice(0, 8);
  const events = rows.map((r, idx) => {
    const evt = r.regime === "RPPS" ? "evtRmnRPPS" : "evtRemun";
    const own = items.filter((i) => i.employeeId === r.id && i.type !== "Base");
    const id = `ID1${cnpjRoot}000000${yyyy}${mm}${String(idx + 1).padStart(5, "0")}`;
    return `  <eSocial xmlns="http://www.esocial.gov.br/schema/evt/${r.regime === "RPPS" ? "evtRmnRPPS" : "evtRemun"}/v_S_01_03_00">
    <${evt} Id="${id}">
      <ideEvento><indRetif>1</indRetif><indApuracao>1</indApuracao><perApur>${yyyy}-${mm}</perApur><tpAmb>2</tpAmb><procEmi>1</procEmi><verProc>CeleriFlow</verProc></ideEvento>
      <ideEmpregador><tpInsc>1</tpInsc><nrInsc>${cnpjRoot}</nrInsc></ideEmpregador>
      <ideTrabalhador><cpfTrab>${digits(r.cpf)}</cpfTrab></ideTrabalhador>
      <dmDev><ideDmDev>${xml(r.registration ?? r.id)}</ideDmDev><codCateg>${r.regime === "RPPS" ? "301" : "101"}</codCateg>
        <infoPerApur><ideEstabLot><tpInsc>1</tpInsc><nrInsc>${num(municipality.cnpj, 14)}</nrInsc><codLotacao>${xml(r.secretariat ?? "GERAL")}</codLotacao>
          <remunPerApur><matricula>${xml(r.registration ?? "")}</matricula>
${own.map((i) => `            <itensRemun><codRubr>${xml(code(i.code))}</codRubr><ideTabRubr>CELERIFLOW</ideTabRubr><vrRubr>${i.value.toFixed(2)}</vrRubr></itensRemun>`).join("\n")}
          </remunPerApur></ideEstabLot></infoPerApur></dmDev>
    </${evt}>
  </eSocial>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Lote de pré-validação gerado pelo CeleriFlow. Assinatura digital e transmissão ao eSocial pendentes. -->\n<lote competencia="${yyyy}-${mm}">\n${events.join("\n")}\n</lote>\n`;
}

// ---------- Informe de rendimentos / DIRF (substituída pela EFD-Reinf R-4010 a partir de 2025) ----------
export type AnnualIncome = { cpf: string | null; name: string; taxable: number; prev: number; irrf: number; thirteenth: number; thirteenthIrrf: number };

export function annualIncome(payrolls: { type: string; rows: EmployeeTotals[] }[]): AnnualIncome[] {
  const map = new Map<string, AnnualIncome>();
  for (const p of payrolls) {
    const is13 = p.type === "13º Salário" || p.type === "Adiantamento 13º";
    for (const r of p.rows) {
      const key = r.cpf ?? r.id;
      const a = map.get(key) ?? { cpf: r.cpf, name: r.name, taxable: 0, prev: 0, irrf: 0, thirteenth: 0, thirteenthIrrf: 0 };
      if (is13) { a.thirteenth = round2(a.thirteenth + r.gross); a.thirteenthIrrf = round2(a.thirteenthIrrf + r.irrf); }
      else { a.taxable = round2(a.taxable + r.gross); a.irrf = round2(a.irrf + r.irrf); }
      a.prev = round2(a.prev + r.inss + r.rpps);
      map.set(key, a);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------- Importação da base anterior ----------
export type ImportRow = { line: number; name: string; cpf: string | null; registration: string | null; salaryBase: number; regime: "RGPS" | "RPPS"; admissionDate: Date | null; bankCode: string | null; bankAgency: string | null; bankAccount: string | null; pisPasep: string | null; email: string | null };
export type ImportIssue = { line: number; field: string; message: string; severity: "erro" | "aviso" };

export const IMPORT_COLUMNS = ["nome", "cpf", "matricula", "salario_base", "regime", "admissao", "banco", "agencia", "conta", "pis", "email"];

export function isValidCpf(value: string) {
  const d = digits(value);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const check = (len: number) => {
    const sum = d.slice(0, len).split("").reduce((s, n, i) => s + Number(n) * (len + 1 - i), 0);
    return ((sum * 10) % 11) % 10;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}
const formatCpf = (d: string) => `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;

function parseDate(v: string): Date | null {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) ?? null;
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return iso ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : null;
}

/** Lê CSV (separador ; ou ,) com cabeçalho e aponta inconsistências por linha. */
export function parseEmployeeImport(text: string, existingCpfs: Set<string> = new Set()) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  const issues: ImportIssue[] = [];
  const rows: ImportRow[] = [];
  if (!lines.length) return { rows, issues: [{ line: 0, field: "arquivo", message: "Arquivo vazio.", severity: "erro" as const }] };
  const sep = lines[0].includes(";") ? ";" : ",";
  const header = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  for (const col of ["nome", "cpf"]) if (!header.includes(col)) issues.push({ line: 1, field: col, message: `Coluna obrigatória "${col}" ausente.`, severity: "erro" });
  if (issues.length) return { rows, issues };
  const seen = new Set<string>();
  lines.slice(1).forEach((raw, idx) => {
    const line = idx + 2;
    const cells = raw.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const get = (c: string) => cells[header.indexOf(c)] ?? "";
    const before = issues.length;
    const name = get("nome");
    if (!name) issues.push({ line, field: "nome", message: "Nome vazio.", severity: "erro" });
    const cpfDigits = digits(get("cpf"));
    if (!isValidCpf(cpfDigits)) issues.push({ line, field: "cpf", message: `CPF inválido (${get("cpf") || "vazio"}).`, severity: "erro" });
    else if (seen.has(cpfDigits)) issues.push({ line, field: "cpf", message: "CPF repetido no arquivo.", severity: "erro" });
    const salaryRaw = get("salario_base").replace(/\./g, "").replace(",", ".");
    const salaryBase = salaryRaw ? Number(salaryRaw) : 0;
    if (Number.isNaN(salaryBase) || salaryBase < 0) issues.push({ line, field: "salario_base", message: "Salário inválido.", severity: "erro" });
    else if (salaryBase === 0) issues.push({ line, field: "salario_base", message: "Salário base zerado.", severity: "aviso" });
    const regimeRaw = get("regime").toUpperCase();
    if (regimeRaw && !["RGPS", "RPPS"].includes(regimeRaw)) issues.push({ line, field: "regime", message: `Regime "${regimeRaw}" desconhecido; será usado RGPS.`, severity: "aviso" });
    const admRaw = get("admissao");
    const admissionDate = admRaw ? parseDate(admRaw) : null;
    if (admRaw && !admissionDate) issues.push({ line, field: "admissao", message: "Data de admissão inválida (use DD/MM/AAAA).", severity: "aviso" });
    if (!get("banco") || !get("conta")) issues.push({ line, field: "banco", message: "Sem dados bancários: ficará fora da remessa CNAB.", severity: "aviso" });
    if (issues.slice(before).some((i) => i.severity === "erro")) return;
    seen.add(cpfDigits);
    const cpf = formatCpf(cpfDigits);
    if (existingCpfs.has(cpf)) issues.push({ line, field: "cpf", message: "Servidor já cadastrado: dados serão atualizados.", severity: "aviso" });
    rows.push({
      line, name, cpf, registration: get("matricula") || null, salaryBase: salaryBase || 0,
      regime: regimeRaw === "RPPS" ? "RPPS" : "RGPS", admissionDate,
      bankCode: digits(get("banco")) || null, bankAgency: get("agencia") || null, bankAccount: get("conta") || null,
      pisPasep: digits(get("pis")) || null, email: get("email") || null,
    });
  });
  return { rows, issues };
}
