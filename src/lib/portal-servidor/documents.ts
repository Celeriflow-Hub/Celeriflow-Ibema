/**
 * Sprint 5 — Portal do Servidor: regras puras (sem banco) para margem
 * consignável, códigos de validação e montagem dos documentos emitidos.
 */
import { createHash, randomBytes } from "node:crypto";
import { round2 } from "@/lib/rh/payroll-engine";

export const EMPLOYEE_DOCUMENT_KINDS = {
  CONTRACHEQUE: "Contracheque",
  INFORME_RENDIMENTOS: "Informe de rendimentos",
  FICHA_FINANCEIRA: "Ficha financeira",
  DECLARACAO_VINCULO: "Declaração de vínculo funcional",
} as const;
export type EmployeeDocumentKind = keyof typeof EMPLOYEE_DOCUMENT_KINDS;

export const PORTAL_REQUEST_KINDS = {
  FERIAS: "Férias",
  LICENCA: "Licença / afastamento",
  ATUALIZACAO_CADASTRAL: "Atualização cadastral",
} as const;
export type PortalRequestKind = keyof typeof PORTAL_REQUEST_KINDS;

export const PORTAL_REQUEST_STATUS: Record<string, string> = {
  PENDENTE: "Em análise no RH",
  APROVADA: "Aprovada",
  INDEFERIDA: "Indeferida",
  CANCELADA: "Cancelada",
};

/** Margem consignável presumida (35%) — mesma regra do motor da folha. */
export const CONSIGNABLE_RATE = 0.35;

export type PayslipLine = { code: string; name: string; type: string; value: number; reference?: string | null };

const stripCode = (c: string) => c.replace(/^CF/, "");

export function payslipTotals(lines: PayslipLine[]) {
  const sum = (pred: (l: PayslipLine) => boolean) => round2(lines.filter(pred).reduce((s, l) => s + l.value, 0));
  const gross = sum((l) => l.type === "Vencimento");
  const discounts = sum((l) => l.type === "Desconto");
  return {
    gross,
    discounts,
    net: round2(gross - discounts),
    previdencia: sum((l) => ["100", "101"].includes(stripCode(l.code))),
    irrf: sum((l) => stripCode(l.code) === "110"),
    consigned: sum((l) => stripCode(l.code) === "120"),
  };
}

/** Margem = 35% de (bruto − previdência − IRRF); disponível = margem − consignados em folha. */
export function consignableMargin(lines: PayslipLine[], rate = CONSIGNABLE_RATE) {
  const t = payslipTotals(lines);
  const base = round2(Math.max(0, t.gross - t.previdencia - t.irrf));
  const limit = round2(base * rate);
  return { base, rate, limit, used: t.consigned, available: round2(Math.max(0, limit - t.consigned)) };
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newValidationCode() {
  const bytes = randomBytes(16);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `CFS-${out}`;
}
export const VALIDATION_CODE_PATTERN = /^CFS-[A-HJ-NP-Z2-9]{16}$/;

export function documentHash(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function maskCpf(cpf: string | null | undefined) {
  const d = (cpf ?? "").replace(/\D/g, "");
  return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : "não informado";
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export const brl = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export type DocumentSection = { title: string; head?: string[]; rows: (string | number)[][] };

export function renderEmployeeDocumentHtml(input: {
  title: string;
  issuer: string;
  issuerDetail: string;
  coatOfArms: string;
  employeeLines: [string, string][];
  sections: DocumentSection[];
  paragraphs?: string[];
  code: string;
  hash: string;
  validationUrl: string;
  qrSvg: string;
  issuedAt: Date;
}) {
  const sections = input.sections.map((s) => `
    <h2>${esc(s.title)}</h2>
    <table>${s.head ? `<thead><tr>${s.head.map((h, i) => `<th class="${i ? "r" : ""}">${esc(h)}</th>`).join("")}</tr></thead>` : ""}
    <tbody>${s.rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i ? "r" : ""}">${esc(typeof c === "number" ? brl(c) : c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(input.title)}</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;margin:0;padding:24px;font-size:12px;background:#f1f5f9}
.doc{max-width:760px;margin:0 auto;background:#fff;border:1px solid #cbd5e1;padding:24px}
header{display:flex;gap:12px;align-items:center;border-bottom:2px solid #0e4c7e;padding-bottom:10px}
header img{height:56px}h1{font-size:16px;margin:14px 0 8px}h2{font-size:12px;margin:14px 0 4px;text-transform:uppercase;color:#334155}
table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e2e8f0;padding:4px 6px;text-align:left}.r{text-align:right}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px}.val{display:flex;gap:12px;align-items:center;margin-top:18px;border-top:1px solid #cbd5e1;padding-top:10px}
.val svg{width:96px;height:96px}.mono{font-family:monospace;word-break:break-all;font-size:10px}
.bar{max-width:760px;margin:0 auto 10px;text-align:right}button{padding:6px 12px}
@media print{body{background:#fff;padding:0}.doc{border:0}.bar{display:none}}
</style></head><body>
<div class="bar"><button onclick="window.print()">Imprimir / salvar PDF</button></div>
<div class="doc">
<header><img src="${esc(input.coatOfArms)}" alt=""><div><strong>${esc(input.issuer)}</strong><br>${esc(input.issuerDetail)}</div></header>
<h1>${esc(input.title)}</h1>
<div class="meta">${input.employeeLines.map(([k, v]) => `<div><strong>${esc(k)}:</strong> ${esc(v)}</div>`).join("")}</div>
${sections}
${(input.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join("")}
<div class="val">${input.qrSvg}<div>
<strong>Documento emitido pelo Portal do Servidor em ${esc(input.issuedAt.toLocaleString("pt-BR", { timeZone: "America/Fortaleza" }))}.</strong><br>
Código de validação: <strong>${esc(input.code)}</strong><br>
Valide em: ${esc(input.validationUrl)}<br>
<span class="mono">SHA-256: ${esc(input.hash)}</span></div></div>
</div></body></html>`;
}
