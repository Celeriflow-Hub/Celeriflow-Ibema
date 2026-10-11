import assert from "node:assert/strict";
import test from "node:test";
import { isValidCpf, parseCompetence, renderSagresFile, validateSagresHeader, validateSagresRecords } from "@/lib/integrations/sagres/engine";
import { getSagresLayout } from "@/lib/integrations/sagres/layouts";
import { getAccountabilityAdapter } from "@/lib/integrations/sagres/state-adapter";
import { capturaFrotaMonthEnd, openCapturaFrotaSandbox, getCapturaFrotaSandbox } from "@/lib/integrations/sagres/captura-frota-sandbox";
import { mapCapturaAbastecimentos, capturaFuelCode } from "@/lib/integrations/sagres/captura-frota-mapper";
import { mapCapturaSituacoes } from "@/lib/integrations/sagres/captura-frota-situation";
import { prepareCapturaFleetMonth } from "@/lib/integrations/sagres/captura-frota-prepare";
import { reconcileFleetFuelLedger } from "@/lib/integrations/sagres/frota-reconciliation";
import { uploadFleetEntitySandbox, consolidateFleetSandbox, readFleetSandboxValidation, readFleetSandboxAggregates } from "@/lib/integrations/sagres/captura-frota-transport";

const header = { ibgeCode: "2503506", unitCode: "035", cnpj: "08.929.648/0001-59", competence: "2026-08", managementUnit: "Prefeitura" };

test("parses competence and rejects invalid months", () => {
  assert.equal(parseCompetence("2026-08")?.payrollLabel, "08/2026");
  assert.equal(parseCompetence("2026-13"), null);
});

test("validates CPF check digits", () => {
  assert.equal(isValidCpf("529.982.247-25"), true);
  assert.equal(isValidCpf("111.111.111-11"), false);
});

test("header validation passes for Cacimba identity", () => {
  assert.deepEqual(validateSagresHeader(header), []);
  assert.equal(validateSagresHeader({ ...header, unitCode: "" }).length, 1);
});

test("points out missing required fields per line", () => {
  const layout = getSagresLayout("MENSAL_FOLHA")!;
  const issues = validateSagresRecords(layout, [{ cpf: "123", nome: "Ana" }]);
  assert.ok(issues.some((i) => i.field === "cpf" && i.line === 1));
  assert.ok(issues.some((i) => i.field === "matricula"));
});

test("renders header, details and trailer with hash", () => {
  const layout = getSagresLayout("FROTA")!;
  const file = renderSagresFile(layout, header, [{ codigoVeiculo: "V1", descricao: "Caminhão", data: new Date("2026-08-10"), tipo: "COMBUSTIVEL", material: "Diesel", quantidade: 50, unidade: "L", valor: 300 }]);
  const lines = file.content.trim().split("\r\n");
  assert.equal(lines.length, 3);
  assert.ok(lines[0].startsWith("H|FROTA|"));
  assert.ok(lines[1].includes("10082026"));
  assert.equal(lines[2], `T|1|${file.hash}`);
  assert.equal(file.fileName, "SAGRES_FROTA_035_202608.txt");
});

test("PB adapter supports the three POC files", () => {
  assert.deepEqual([...getAccountabilityAdapter("PB")!.supportsLayouts], ["MENSAL_FOLHA", "FROTA", "FARMACIA"]);
});

test("SAGRES Captura: competência final do mês e sandbox sem dados reais", async () => {
  assert.equal(capturaFrotaMonthEnd("2028-02"), "2028-02-29");
  assert.equal(capturaFrotaMonthEnd("2027-02"), "2027-02-28");
  assert.throws(() => capturaFrotaMonthEnd("2027-13"), /Competência inválida/);
  const requested: Array<{ url: string; init: RequestInit }> = [];
  const apiResponse = {
    codigoUnidadeGestora: "201001",
    tipoEnvio: "BALANCETE_FROTA",
    competencia: "2027-02-28",
    statusEnvio: "ABERTO",
    protocoloEnvio: "201001.24.00001-2027",
  };
  const mock = (async (url: string | URL | Request, init?: RequestInit) => {
    requested.push({ url: String(url), init: init! });
    return new Response(JSON.stringify(apiResponse), { status: init?.method === "POST" ? 201 : 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  const opened = await openCapturaFrotaSandbox("2027-02", "token-de-teste", mock);
  assert.equal(opened.protocoloEnvio, apiResponse.protocoloEnvio);
  assert.deepEqual(JSON.parse(requested[0].init.body as string), { tipoEnvio: "BALANCETE_FROTA", competencia: "2027-02-28" });
  assert.equal(requested[0].url, "https://api-sagrescaptura-hml.tce.pb.gov.br/envios");
  const current = await getCapturaFrotaSandbox(opened.protocoloEnvio, "token-de-teste", mock);
  assert.equal(current.statusEnvio, "ABERTO");
  assert.equal(requested[1].url, "https://api-sagrescaptura-hml.tce.pb.gov.br/envios/201001.24.00001-2027");
  await assert.rejects(getCapturaFrotaSandbox("../malicious", "token-de-teste", mock), /Protocolo de Frota inválido/);
  assert.equal(requested.length, 2);
});

test("SAGRES Captura: abastecimentos mensais agregados e declaração zero", () => {
  assert.equal(capturaFuelCode("Diesel S10"), "2");
  assert.equal(capturaFuelCode("GNV"), "4");
  const units = [
    { id: "v1", code: "V-001", plate: "ABC1234", category: "VEICULO", fuelType: "Diesel" },
    { id: "m1", code: "0000001", plate: null, category: "MAQUINA", fuelType: "Gasolina" },
  ];
  const result = mapCapturaAbastecimentos("2027-01", units, [
    { unitId: "v1", material: "Diesel", measurementUnit: "L", quantity: 12.25, occurredAt: new Date("2027-01-12T00:00:00Z") },
    { unitId: "v1", material: "Diesel", measurementUnit: "L", quantity: 5, occurredAt: new Date("2027-01-14T00:00:00Z") },
    { unitId: "v1", material: "Diesel", measurementUnit: "L", quantity: 99, occurredAt: new Date("2027-02-01T00:00:00Z") },
  ], new Date("2027-02-01T12:15:22.123Z"));
  assert.deepEqual(result.issues, []);
  assert.equal(result.payload?.timestamp, "2027-02-01T12:15:22.123");
  assert.deepEqual(result.payload?.elementos, [
    { tipoCombustivel: "1", tipoCategoriaFrota: "2", codigo: "0000001", quantidade: 0, action: "CREATE" },
    { tipoCombustivel: "2", tipoCategoriaFrota: "1", codigo: "ABC1234", quantidade: 17.25, action: "CREATE" },
  ]);
  const invalid = mapCapturaAbastecimentos("2027-01", [{ ...units[0], fuelType: null }], []);
  assert.equal(invalid.payload, null);
  assert.ok(invalid.issues.some(x => /combustível/.test(x.message)));
  const badUnit = mapCapturaAbastecimentos("2027-01", [{ ...units[0], category: "EQUIPAMENTO" }], []);
  assert.equal(badUnit.payload, null);
  const badQty = mapCapturaAbastecimentos("2027-01", units, [
    { unitId: "v1", material: "Diesel", measurementUnit: "L", quantity: 1.001, occurredAt: new Date("2027-01-12T00:00:00Z") },
  ]);
  assert.equal(badQty.payload, null);
  assert.ok(badQty.issues.some(x => /duas casas/.test(x.message)));
});

test("SAGRES Captura: situações mensais exigem linha de abertura e histórico certificado", () => {
  const units = [
    { id: "v1", code: "FRO0001", plate: "ABC1234", category: "VEICULO", fuelType: "Diesel" },
    { id: "m1", code: "0000001", plate: null, category: "MAQUINA", fuelType: "Gasolina" },
  ];
  const events = [
    { unitId: "v1", date: "2027-03-01", status: "1" as const },
    { unitId: "v1", date: "2027-03-15", status: "2" as const },
    { unitId: "v1", date: "2027-03-21", status: "1" as const },
    { unitId: "m1", date: "2027-03-01", status: "4" as const },
  ];
  const result = mapCapturaSituacoes("2027-03", units, events, new Date("2027-04-01T10:00:00.456Z"));
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.payload?.elementos, [
    { dataSituacao: "2027-03-01", tipoSituacao: "4", tipoCategoriaFrota: "2", codigo: "0000001", action: "CREATE" },
    { dataSituacao: "2027-03-01", tipoSituacao: "1", tipoCategoriaFrota: "1", codigo: "ABC1234", action: "CREATE" },
    { dataSituacao: "2027-03-15", tipoSituacao: "2", tipoCategoriaFrota: "1", codigo: "ABC1234", action: "CREATE" },
    { dataSituacao: "2027-03-21", tipoSituacao: "1", tipoCategoriaFrota: "1", codigo: "ABC1234", action: "CREATE" },
  ]);
  assert.equal(result.payload?.timestamp, "2027-04-01T10:00:00.456");
  const absentOpening = mapCapturaSituacoes("2027-03", units, events.filter(e => e.date !== "2027-03-01"));
  assert.equal(absentOpening.payload, null);
  assert.ok(absentOpening.issues.some(issue => /primeiro dia/.test(issue.message)));
  const repeat = mapCapturaSituacoes("2027-03", units, [...events, events[0]]);
  assert.equal(repeat.payload, null);
  assert.ok(repeat.issues.some(issue => /mesma data/.test(issue.message)));
  const invalid = mapCapturaSituacoes("2027-02", units, events);
  assert.equal(invalid.payload, null);
  assert.ok(invalid.issues.some(issue => /fora da competência/.test(issue.message)));
});

test("SAGRES Captura: veículo baixado não pode apresentar novas situações", () => {
  const units = [{ id: "v1", code: "FRO0001", plate: "ABC1234", category: "VEICULO", fuelType: "Diesel" }];
  const result = mapCapturaSituacoes("2027-03", units, [
    { unitId: "v1", date: "2027-03-01", status: "1" },
    { unitId: "v1", date: "2027-03-10", status: "3" },
    { unitId: "v1", date: "2027-03-11", status: "1" },
  ]);
  assert.equal(result.payload, null);
  assert.ok(result.issues.some(issue => /definitivamente baixada/.test(issue.message)));
});

test("SAGRES Captura: pacote mensal depende de situação e abastecimento conciliados", () => {
  const units = [
    { id: "v1", code: "VEIC001", plate: "ABC1234", category: "VEICULO", fuelType: "Diesel" },
    { id: "v2", code: "VEIC002", plate: "DEF5678", category: "VEICULO", fuelType: "Gasolina" },
  ];
  const situations = [
    { unitId: "v1", date: "2027-05-01", status: "1" as const },
    { unitId: "v2", date: "2027-05-01", status: "3" as const },
  ];
  const records = [{ unitId: "v1", material: "Diesel", measurementUnit: "L", quantity: 42, occurredAt: new Date("2027-05-18T00:00:00Z") }];
  const result = prepareCapturaFleetMonth("2027-05", units, situations, records);
  assert.equal(result.ready, true);
  assert.equal(result.payload?.situation.elementos.length, 2);
  assert.equal(result.payload?.fuel.elementos.length, 1);
  assert.equal(result.payload?.fuel.elementos[0].quantidade, 42);
  const missing = prepareCapturaFleetMonth("2027-05", units, situations.slice(1), records);
  assert.equal(missing.ready, false);
  assert.ok(missing.issues.some(issue => /primeiro dia/.test(issue.message)));
  const illegal = prepareCapturaFleetMonth("2027-05", units, situations, [
    ...records,
    { unitId: "v2", material: "Gasolina", measurementUnit: "L", quantity: 3, occurredAt: new Date("2027-05-04T00:00:00Z") },
  ]);
  assert.equal(illegal.ready, false);
  assert.ok(illegal.issues.some(issue => /baixa definitiva/.test(issue.message)));
  const midMonth = prepareCapturaFleetMonth("2027-05", units, [
    situations[0], { unitId: "v1", date: "2027-05-17", status: "3" as const }, situations[1],
  ], [
    { unitId: "v1", material: "Diesel", measurementUnit: "L", quantity: 2, occurredAt: new Date("2027-05-16T00:00:00Z") },
  ]);
  assert.equal(midMonth.ready, true);
  assert.equal(midMonth.payload?.fuel.elementos[0].quantidade, 2);
  const forbidden = prepareCapturaFleetMonth("2027-05", units, [
    situations[0], { unitId: "v1", date: "2027-05-17", status: "3" as const }, situations[1],
  ], [
    { unitId: "v1", material: "Diesel", measurementUnit: "L", quantity: 2, occurredAt: new Date("2027-05-17T00:00:00Z") },
  ]);
  assert.equal(forbidden.ready, false);
  assert.ok(forbidden.issues.some(issue => /após baixa definitiva/.test(issue.message)));
});

test("Frota · conciliação de ordem, despesa e snapshot certificado sem duplicar custo", () => {
  const portalFuel = {
    id: "c1", unitId: "v1", material: "Diesel", measurementUnit: "L",
    quantity: 30, occurredAt: "2027-05-12", origin: "PORTAL_POSTO",
    cost: 180, reference: "OA-101",
  };
  const localFuel = {
    id: "c2", unitId: "v1", material: "Gasolina", measurementUnit: "L",
    quantity: 10, occurredAt: "2027-05-13", origin: "PROPRIO",
    cost: 60, reference: "M-20",
  };
  const order = {
    id: "o1", code: "OA-101", unitId: "v1", status: "ABASTECIDA",
    consumptionId: "c1", litersFilled: 30, pricePerLiter: 6,
  };
  const expense = {
    id: "e2", unitId: "v1", nature: "COMBUSTIVEL", sourceType: "CONSUMO",
    sourceId: "c2", sourceKey: "consumption:c2", amount: 60,
  };
  const portalExpense = { ...expense, id: "e1", sourceId: "c1", sourceKey: "consumption:c1", amount: 180 };
  const certified = [portalFuel, localFuel];
  const baseline = { current: [portalFuel, localFuel], orders: [order], expenses: [portalExpense, expense], certified };
  const clean = reconcileFleetFuelLedger(baseline);
  assert.equal(clean.balanced, true);
  assert.deepEqual(clean.totals, { records: 2, liters: 40, fuelCostKnown: 240, costUnknown: 0 });
  assert.equal(clean.issues.length, 0);

  const missingOrder = reconcileFleetFuelLedger({ ...baseline, orders: [] });
  assert.equal(missingOrder.balanced, false);
  assert.ok(missingOrder.issues.some(i => i.kind === "MISSING_SOURCE" && i.reference === "c1"));

  const mismatchedCost = reconcileFleetFuelLedger({
    ...baseline, expenses: [portalExpense, { ...expense, amount: 70 }],
  });
  assert.ok(mismatchedCost.issues.some(i => i.kind === "COST_DIFFERENCE" && i.reference === "e2"));

  const doubleExpense = reconcileFleetFuelLedger({
    ...baseline, expenses: [portalExpense, expense, { ...expense, id: "duplicate", sourceKey: "other-key" }],
  });
  assert.ok(doubleExpense.issues.some(i => i.kind === "DUPLICATE_LINK"));

  const changedAfterCertification = reconcileFleetFuelLedger({
    ...baseline, current: [{ ...portalFuel, quantity: 31 }, localFuel],
  });
  assert.ok(changedAfterCertification.issues.some(i => /após a certificação/.test(i.message)));

  // Even if current ledger and expense are changed consistently, the
  // immutable certified amount must still reveal the post-certification edit.
  const changedCost = reconcileFleetFuelLedger({
    ...baseline,
    current: [{ ...portalFuel, cost: 190 }, localFuel],
    orders: [{ ...order, pricePerLiter: null }],
    expenses: [{ ...portalExpense, amount: 190 }, expense],
  });
  assert.ok(changedCost.issues.some(i => i.kind === "COST_DIFFERENCE" &&
    /depois da certificação/.test(i.message)));

  const lostAfterCertification = reconcileFleetFuelLedger({
    ...baseline, current: [portalFuel], expenses: [portalExpense],
  });
  assert.ok(lostAfterCertification.issues.some(i => i.reference === "c2" && /não localizado/.test(i.message)));
});

test("SAGRES Captura: transporte isolado envia entidade e consulta processamento assíncrono", async () => {
  const protocol = "201001.24.00001-2027";
  const calls: Array<{ url: string; method: string; body?: string; authorization: string }> = [];
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    const route = String(url);
    const headers = new Headers(init?.headers);
    calls.push({
      url: route, method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : undefined,
      authorization: headers.get("Authorization") ?? "",
    });
    const content = route.endsWith("/consolidacoes")
      ? { protocoloEnvio: protocol, chaveValidacao: "ABC123DEF456G" }
      : route.includes("/validacoes")
        ? { protocoloEnvio: protocol, chaveValidacao: "ABC123DEF456G",
            statusValidacao: "COM_PENDENCIAS", detalhes: {
              errosPorEntidade: [{ entidade: "ABASTECIMENTO", erros: [] }],
            } }
        : { descricao: "Dados recebidos com sucesso", entidade: "ABASTECIMENTO", protocolo: protocol };
    return new Response(JSON.stringify(content), {
      status: init?.method === "POST" ? 202 : 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  const fuel = {
    entity: "ABASTECIMENTO" as const,
    payload: {
      timestamp: "2027-06-01T14:15:16.123",
      elementos: [{
        tipoCombustivel: "2", tipoCategoriaFrota: "1" as const,
        codigo: "ABC1234", quantidade: 10.5, action: "CREATE" as const,
      }],
    },
  };
  await uploadFleetEntitySandbox(protocol, "TOKEN_MOCK", fuel, fetcher);
  const consolidated = await consolidateFleetSandbox(protocol, "TOKEN_MOCK", fetcher);
  assert.equal(consolidated.validationKey, "ABC123DEF456G");
  const validation = await readFleetSandboxValidation(protocol, "TOKEN_MOCK", consolidated.validationKey, fetcher);
  assert.equal(validation.statusValidacao, "COM_PENDENCIAS");
  assert.equal(validation.detalhes?.errosPorEntidade?.length, 1);
  await readFleetSandboxAggregates(protocol, "TOKEN_MOCK", consolidated.validationKey, fetcher);
  assert.equal(calls.length, 4);
  assert.equal(calls[0].url,
    "https://api-sagrescaptura-hml.tce.pb.gov.br/envios/" + protocol + "/entidades/ABASTECIMENTO");
  assert.equal(calls[0].authorization, "Bearer TOKEN_MOCK");
  assert.equal(JSON.parse(calls[0].body ?? "{}").elementos[0].quantidade, 10.5);
  await assert.rejects(uploadFleetEntitySandbox("../unsafe", "TOKEN_MOCK", fuel, fetcher), /Protocolo/);
  await assert.rejects(uploadFleetEntitySandbox(protocol, "TOKEN_MOCK", {
    ...fuel, payload: { ...fuel.payload, elementos: [{ ...fuel.payload.elementos[0], quantidade: -1 }] },
  }, fetcher), /combustível|Quantidade/);
  assert.equal(calls.length, 4);
});
