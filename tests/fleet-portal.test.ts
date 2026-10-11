import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePortalToken, onlyDigits, parseChecklist, tokenMatches } from "../src/lib/frotas/portal";
import { publicFleetCsv, publicFleetMonth } from "../src/lib/frotas/public-report";

test("token do portal da frota", () => {
  const t = generatePortalToken();
  assert.equal(t.length, 8);
  assert.match(t, /^[A-Z2-9]+$/);
  assert.equal(tokenMatches(t, t.toLowerCase()), true);
  assert.equal(tokenMatches(t, "XXXXXXXX"), false);
  assert.equal(tokenMatches(null, t), false);
  assert.equal(onlyDigits("12.345.678/0001-90"), "12345678000190");
});

test("checklist aponta itens não conferidos", () => {
  const f = new FormData();
  f.set("check_pneus", "on");
  const r = parseChecklist(f);
  assert.equal(r.items[0].ok, true);
  assert.ok(r.failures.includes("Freios funcionando"));
});

test("transparência: competência validada e CSV sem fórmulas executáveis", () => {
  assert.equal(publicFleetMonth("2028-02").end.toISOString().slice(0, 10), "2028-03-01");
  assert.throws(() => publicFleetMonth("2028-13"), /Competência inválida/);
  const example = {
    competence: "2028-02",
    departments: [],
    rows: [{
      code: "=2+3", name: "Caminhão DEMO", category: "VEICULO",
      plate: null, year: null, department: "Obras", liters: 12.5,
      fuelCost: null, maintenanceCost: 100,
    }],
    totals: { activeVehicles: 1, liters: 12.5, fuelCostKnown: 0, maintenanceCostKnown: 100, fuelUnknown: 1, maintenanceUnknown: 0 },
  };
  const csv = publicFleetCsv(example);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'=2+3"'));
  assert.ok(csv.includes('"12.500"'));
  assert.ok(csv.includes('"100.00"'));
});
