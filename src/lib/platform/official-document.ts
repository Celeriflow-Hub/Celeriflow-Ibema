/**
 * Modelo único de documento oficial (HTML pronto para imprimir/salvar em PDF)
 * com brasão, cabeçalho e rodapé da instância vindos de municipality.ts.
 */
import { fullAddress, municipality } from "@/lib/platform/municipality";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export type OfficialSection = { title: string; head?: string[]; rows?: (string | number)[][]; paragraphs?: string[] };

export function renderOfficialDocument(input: { title: string; subtitle?: string; sections: OfficialSection[]; code?: string; issuedAt?: Date; department?: string }) {
  const issued = (input.issuedAt ?? new Date()).toLocaleString("pt-BR", { timeZone: "America/Fortaleza" });
  const body = input.sections.map((s) => `<h2>${esc(s.title)}</h2>${(s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join("")}${s.rows ? `<table>${s.head ? `<thead><tr>${s.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>` : ""}<tbody>${s.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>` : ""}`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(input.title)}</title>
<style>@page{margin:18mm 14mm 22mm}body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;font-size:12px;margin:0;padding:24px}
header{display:flex;gap:12px;align-items:center;border-bottom:2px solid #0e4c7e;padding-bottom:8px}header img{height:60px}
h1{font-size:16px;margin:14px 0 2px}h2{font-size:12px;text-transform:uppercase;color:#334155;margin:16px 0 4px}
table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e2e8f0;padding:4px 6px;text-align:left}th{background:#f1f5f9}
footer{margin-top:24px;border-top:1px solid #cbd5e1;padding-top:6px;font-size:10px;color:#475569}
.bar{text-align:right}@media print{.bar{display:none}body{padding:0}footer{position:fixed;bottom:0;left:0;right:0}}</style></head><body>
<div class="bar"><button onclick="window.print()">Imprimir / salvar PDF</button></div>
<header><img src="${esc(municipality.coatOfArms)}" alt="Brasão"><div><strong>${esc(municipality.prefectureName)}</strong><br>${esc(input.department ?? `CNPJ ${municipality.cnpj}`)}</div></header>
<h1>${esc(input.title)}</h1>${input.subtitle ? `<div>${esc(input.subtitle)}</div>` : ""}
${body}
<footer>${esc(municipality.prefectureName)} — CNPJ ${esc(municipality.cnpj)} — ${esc(fullAddress())}<br>Emitido em ${esc(issued)}${input.code ? ` — Código: ${esc(input.code)}` : ""} — CeleriFlow</footer>
</body></html>`;
}

export function officialDocumentResponse(html: string, filename: string) {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `inline; filename="${filename}.html"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
