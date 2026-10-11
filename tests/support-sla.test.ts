import test from "node:test";
import assert from "node:assert/strict";
import { addBusinessDays, computeDueAt, slaState, suggestSeverity } from "../src/lib/platform/support-sla";

test("prazos do TR", () => {
  const t = new Date("2026-09-25T10:00:00"); // sexta
  assert.equal(computeDueAt("ALTA", t).getTime() - t.getTime(), 12 * 3_600_000);
  assert.equal(computeDueAt("MEDIA", t).getTime() - t.getTime(), 24 * 3_600_000);
  assert.equal(addBusinessDays(t, 5).getDate(), 2); // sexta seguinte, 02/10
});

test("classificação e situação", () => {
  assert.equal(suggestSeverity("INDISPONIBILIDADE", false), "CRITICA");
  assert.equal(suggestSeverity("ERRO", true), "ALTA");
  assert.equal(suggestSeverity("DUVIDA", false), "BAIXA");
  const now = new Date();
  assert.equal(slaState(new Date(now.getTime() - 1), "ABERTO", now), "VENCIDO");
  assert.equal(slaState(new Date(now.getTime() - 1), "RESOLVIDO", now), "ENCERRADO");
});
