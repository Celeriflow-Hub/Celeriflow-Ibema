import assert from "node:assert/strict";
import test from "node:test";
import { buildR4010, buildS1010 } from "../src/lib/rh/reinf-esocial";
import { addBusinessDays } from "../src/lib/platform/support-sla";

test("R-4010 contém beneficiário e valores", () => {
  const xml = buildR4010("08.888.888/0001-00", "2026-09", { cpf: "123.456.789-09", name: "Ana & Cia" }, [{ cpf: "", name: "", natRend: "13002", date: "2026-09-30", gross: 3200, irrf: 120.5 }]);
  assert.match(xml, /<cpfBenef>12345678909<\/cpfBenef>/);
  assert.match(xml, /Ana &amp; Cia/);
  assert.match(xml, /<vlrIR>120,50<\/vlrIR>/);
});

test("S-1010 gera rubrica", () => {
  assert.match(buildS1010("08888888000100", { code: "001", description: "Vencimento", nature: "1000", type: 1, startCompetence: "2026-01" }), /<codRubr>001<\/codRubr>/);
});

test("dias úteis pulam feriado nacional", () => {
  // quinta 10/09/2026 + 5 úteis, sem feriados = 17/09
  assert.equal(addBusinessDays(new Date(2026, 8, 10), 5).getDate(), 17);
  // sexta 13/11/2026 + 1 útil: 16 (seg) ok
  assert.equal(addBusinessDays(new Date(2026, 10, 19), 1).getDate(), 23); // 20/11 feriado
});
