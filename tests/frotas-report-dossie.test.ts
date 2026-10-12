import test from "node:test";
import assert from "node:assert/strict";
import { buildDossieSections, type DossieFine, type DossieOccurrence, type DossieUnit } from "../src/lib/frotas/report-dossie";

const fmt = {
  label: (v: string) => v,
  money: (v: number) => `R$${v.toFixed(2)}`,
  date: (d: Date | null) => d ? d.toISOString().slice(0, 10) : "—",
};

test("buildDossieSections consolidates per-vehicle sections and a grand total", () => {
  const units: DossieUnit[] = [
    {
      id: "u1", code: "FR-001", plate: "ABC1D23", name: "Caminhão 1", category: "VEICULO", status: "ATIVO",
      brand: "Volvo", model: "FH", year: 2020, renavam: "123456789",
      consumptions: [{ occurredAt: new Date("2024-01-10"), material: "Diesel", quantity: "100", measurementUnit: "L", cost: 500 }],
      expenses: [{ occurredAt: new Date("2024-01-15"), description: "Troca de óleo", amount: 300 }],
      usages: [{ startedAt: new Date("2024-01-01T08:00:00Z"), endedAt: new Date("2024-01-01T10:00:00Z"), purpose: "Entrega", initialReading: 1000, finalReading: 1100 }],
    },
    {
      id: "u2", code: "FR-002", plate: null, name: "Van 2", category: "VEICULO", status: "ATIVO",
      brand: "Fiat", model: "Ducato", year: 2019, renavam: "987654321",
      consumptions: [],
      expenses: [{ occurredAt: new Date("2024-02-01"), description: "Revisão", amount: 200 }],
      usages: [],
    },
  ];
  const fines: DossieFine[] = [
    { unitId: "u1", occurredAt: new Date("2024-01-05"), aitNumber: "AIT1", infraction: "Excesso de velocidade", amount: 150, status: "PENDENTE" },
  ];
  const occurrences: DossieOccurrence[] = [
    { unitId: "u2", occurredAt: new Date("2024-02-10"), type: "ACIDENTE", description: "Colisão leve", involvedValue: 400 },
  ];

  const sections = buildDossieSections(units, fines, occurrences, fmt);

  const u1Totals = sections.find(s => s.title === "Totais — FR-001 / ABC1D23");
  assert.ok(u1Totals);
  assert.deepEqual(u1Totals!.rows[0], {
    "Multas": "R$150.00",
    "Ocorrências": "R$0.00",
    "Combustível": "R$500.00",
    "Manutenção": "R$300.00",
    "Viagens (quantidade)": 1,
    "Distância percorrida": "100.00 km",
    "Total geral do veículo": "R$950.00",
  });

  const u2Totals = sections.find(s => s.title === "Totais — FR-002");
  assert.ok(u2Totals);
  assert.deepEqual(u2Totals!.rows[0], {
    "Multas": "R$0.00",
    "Ocorrências": "R$400.00",
    "Combustível": "R$0.00",
    "Manutenção": "R$200.00",
    "Viagens (quantidade)": 0,
    "Distância percorrida": "0.00 km",
    "Total geral do veículo": "R$600.00",
  });

  const grand = sections.find(s => s.title === "Total consolidado — todos os veículos selecionados");
  assert.ok(grand);
  assert.deepEqual(grand!.rows[0], {
    "Veículos no dossiê": 2,
    "Multas": "R$150.00",
    "Ocorrências": "R$400.00",
    "Combustível": "R$500.00",
    "Manutenção": "R$500.00",
    "Viagens (quantidade)": 1,
    "Distância percorrida": "100.00 km",
    "Total geral do dossiê": "R$1550.00",
  });

  assert.ok(sections.some(s => s.title === "Multas — FR-001 / ABC1D23"));
  assert.ok(sections.some(s => s.title === "Abastecimentos — FR-001 / ABC1D23"));
  assert.ok(sections.some(s => s.title === "Manutenções — FR-001 / ABC1D23"));
  assert.ok(sections.some(s => s.title === "Viagens — FR-001 / ABC1D23"));
  assert.ok(sections.some(s => s.title === "Ocorrências/Sinistros — FR-002"));
});
