import { test } from "node:test";
import assert from "node:assert/strict";
import { authorizationCode, consumptionStatus, driverEligibility, fineStatusAfterPayment, gateTransition, isAllowedAttachment, policyOn, scheduleConflict } from "../src/lib/frotas/tr-rules";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

test("1.578: aceita os 14 formatos e recusa executáveis", () => {
  for (const e of ["png", "bmp", "jpg", "gif", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf", "odt", "ods", "dwg"]) assert.equal(isAllowedAttachment(`a.${e}`), true);
  assert.equal(isAllowedAttachment("a.exe"), false);
});

test("1.597: bloqueia motorista sem CNH ou com CNH vencida", () => {
  assert.match(driverEligibility({ cnhNumber: null, cnhExpiresAt: null, points: 0, active: true })!, /sem CNH/);
  assert.match(driverEligibility({ cnhNumber: "1", cnhExpiresAt: d("2026-01-01"), points: 0, active: true }, d("2026-01-02"))!, /vencida/);
  assert.equal(driverEligibility({ cnhNumber: "1", cnhExpiresAt: d("2026-01-02"), points: 0, active: true }, d("2026-01-02")), null);
});

test("1.599: bloqueia motorista com 20 pontos", () => {
  assert.match(driverEligibility({ cnhNumber: "1", cnhExpiresAt: d("2030-01-01"), points: 20, active: true }, d("2026-01-01"))!, /20 pontos/);
  assert.equal(driverEligibility({ cnhNumber: "1", cnhExpiresAt: d("2030-01-01"), points: 19, active: true }, d("2026-01-01")), null);
});

test("1.574: agenda impede conflito de veículo e de motorista", () => {
  const base = [{ id: "x", unitId: "u1", driverId: "m1", startsAt: d("2026-05-01"), endsAt: d("2026-05-03"), status: "AGENDADO" }];
  assert.match(scheduleConflict({ unitId: "u1", driverId: null, startsAt: d("2026-05-02"), endsAt: d("2026-05-04"), status: "AGENDADO" }, base)!, /Veículo/);
  assert.match(scheduleConflict({ unitId: "u2", driverId: "m1", startsAt: d("2026-05-02"), endsAt: d("2026-05-04"), status: "AGENDADO" }, base)!, /Motorista/);
  assert.equal(scheduleConflict({ unitId: "u1", driverId: "m1", startsAt: d("2026-05-03"), endsAt: d("2026-05-04"), status: "AGENDADO" }, base), null);
});

test("1.575: guarita não aceita entrada sem saída nem leitura menor", () => {
  assert.match(gateTransition(null, { kind: "ENTRADA", reading: 10 }, "HODOMETRO")!, /saída em aberto/);
  assert.match(gateTransition({ kind: "SAIDA", reading: 100 }, { kind: "SAIDA", reading: 120 }, "HODOMETRO")!, /fora do pátio/);
  assert.match(gateTransition({ kind: "SAIDA", reading: 100 }, { kind: "ENTRADA", reading: 90 }, "HODOMETRO")!, /menor/);
  assert.equal(gateTransition({ kind: "SAIDA", reading: null }, { kind: "ENTRADA", reading: null }, "SEM_MARCADOR"), null);
});

test("1.611: consumo alto, normal e baixo", () => {
  assert.equal(consumptionStatus("HODOMETRO", 8, 10), "ALTO");
  assert.equal(consumptionStatus("HODOMETRO", 10.5, 10), "NORMAL");
  assert.equal(consumptionStatus("HODOMETRO", 12, 10), "BAIXO");
  assert.equal(consumptionStatus("HORIMETRO", 12, 10), "ALTO");
});

test("1.615: apólice facultativa vigente na data do sinistro", () => {
  const p = [{ insurer: "A", policyNumber: "1", startsAt: d("2025-01-01"), endsAt: d("2025-12-31"), kind: "FACULTATIVO" }, { insurer: "B", policyNumber: "2", startsAt: d("2026-01-01"), endsAt: d("2026-12-31"), kind: "FACULTATIVO" }];
  assert.equal(policyOn(p, d("2026-03-01"))?.policyNumber, "2");
  assert.equal(policyOn(p, d("2027-03-01")), null);
});

test("1.590: pagamento integral e parcial de multa", () => {
  assert.equal(fineStatusAfterPayment(195.23, 195.23), "PAGA");
  assert.equal(fineStatusAfterPayment(195.23, 100), "PAGA_PARCIAL");
});

test("numeração de autorizações", () => {
  assert.equal(authorizationCode("SERVICO", 7, 2026), "AS-2026-000007");
});
