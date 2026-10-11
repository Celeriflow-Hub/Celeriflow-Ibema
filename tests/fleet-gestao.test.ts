import { test } from "node:test";
import assert from "node:assert/strict";
import { averageConsumption, newFuelOrderCode, cnhAllows, cnhStatus, consumptionDeviation, groupCosts, quotaCheck, tireWear, validateReading } from "../src/lib/frotas/gestao-engine";

test("consumo médio por hodômetro e horímetro", () => {
  assert.equal(averageConsumption("HODOMETRO", [{ reading: 1000, liters: 40 }, { reading: 1400, liters: 40 }]), 10);
  assert.equal(averageConsumption("HORIMETRO", [{ reading: 100, liters: 50 }, { reading: 110, liters: 150 }]), 15);
  assert.equal(averageConsumption("HODOMETRO", [{ reading: 1, liters: 1 }]), null);
});

test("alerta de desvio respeita o sentido de cada medidor", () => {
  assert.equal(consumptionDeviation("HODOMETRO", 7, 10).alert, true);
  assert.equal(consumptionDeviation("HODOMETRO", 12, 10).alert, false);
  assert.equal(consumptionDeviation("HORIMETRO", 20, 15).alert, true);
});

test("leitura, cota, CNH e pneus", () => {
  assert.match(validateReading(500, 400, "HODOMETRO")!, /menor/);
  assert.equal(validateReading(500, 520, "HORIMETRO"), null);
  assert.deepEqual(quotaCheck(100, 80, 30), { allowed: false, remaining: 20 });
  assert.equal(cnhStatus(new Date("2026-01-10"), new Date("2026-01-20")).status, "VENCIDA");
  assert.equal(cnhStatus(new Date("2026-02-01"), new Date("2026-01-20")).status, "A_VENCER");
  assert.equal(cnhAllows("AB", "CAMINHAO"), false);
  assert.equal(cnhAllows("D", "ONIBUS"), true);
  assert.equal(tireWear(50000, 10000, 35000), 50);
  assert.deepEqual(groupCosts([{ unitLabel: "A", department: "Obras", costCenter: "", nature: "C", amount: 10 }, { unitLabel: "B", department: "Obras", costCenter: "", nature: "C", amount: 5 }], "department"), [{ label: "Obras", total: 15 }]);
});

// Isolated pure-function test: no database or production credentials.
test("novas ordens recebem codigos independentes da contagem do banco", () => {
  const date = new Date("2026-09-28T23:30:00Z");
  const codes = Array.from({ length: 1000 }, () => newFuelOrderCode(date));
  assert.equal(new Set(codes).size, codes.length);
  for (const code of codes) assert.match(code, /^OA-2026-[A-F0-9]{16}$/);
});
