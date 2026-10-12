#!/usr/bin/env node
// Reads MATRIZ_CONFORMIDADE_IBEMA.md and prints % ATENDE per module
// No external dependencies.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mdPath = join(__dirname, "..", "MATRIZ_CONFORMIDADE_IBEMA.md");
const md = readFileSync(mdPath, "utf-8");

const lines = md.split("\n");

// Find the "Resumo por módulo" table rows
const startIdx = lines.findIndex((l) => l.includes("## Resumo por módulo"));
if (startIdx === -1) {
  console.error("Seção 'Resumo por módulo' não encontrada no markdown.");
  process.exit(1);
}

const rows = [];
for (let i = startIdx; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith("|") && !line.startsWith("|---") && !line.includes("Módulo")) {
    const cols = line.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
    // cols: #, Módulo, Itens, Atende, Não atende, Pendente externo, % Atende, Status meta
    if (cols.length >= 7 && !isNaN(Number(cols[0]))) {
      rows.push({
        idx: Number(cols[0]),
        modulo: cols[1],
        itens: Number(cols[2]),
        atende: Number(cols[3]),
        naoAtende: Number(cols[4]),
        pendenteExterno: Number(cols[5]),
        pct: parseFloat(cols[6]),
        meta: cols[7],
      });
    }
  }
  if (line.startsWith("## ") && i > startIdx + 1) break;
}

if (rows.length === 0) {
  console.error("Nenhuma linha de módulo encontrada.");
  process.exit(1);
}

console.log("MATRIZ DE CONFORMIDADE IBEMA — % ATENDE POR MÓDULO (meta: 90%)\n");
const sorted = [...rows].sort((a, b) => b.pct - a.pct);
for (const r of sorted) {
  const bar = r.pct >= 90 ? "✅" : "❌";
  console.log(
    `${bar} ${r.pct.toFixed(1).padStart(5)}%  ${r.modulo}  (${r.atende}/${r.itens - r.pendenteExterno} avaliáveis, ${r.pendenteExterno} pendente externo)`
  );
}

const totalItens = rows.reduce((s, r) => s + r.itens, 0);
const totalAtende = rows.reduce((s, r) => s + r.atende, 0);
const totalPendente = rows.reduce((s, r) => s + r.pendenteExterno, 0);
const totalAvaliavel = totalItens - totalPendente;
const totalPct = totalAvaliavel ? (totalAtende / totalAvaliavel) * 100 : 0;

console.log("\n----------------------------------------");
console.log(`TOTAL GERAL: ${totalPct.toFixed(1)}% ATENDE (${totalAtende}/${totalAvaliavel} itens avaliáveis, ${totalPendente} pendente externo)`);

console.log("\n10 módulos com menor % de atendimento:");
const lowest = [...rows].sort((a, b) => a.pct - b.pct).slice(0, 10);
for (const r of lowest) {
  console.log(`- ${r.modulo}: ${r.pct.toFixed(1)}%`);
}
