import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getTransparencyCollection } from "../src/lib/transparencia/consultation-catalog";
import { parseTransparencyQuery, filterPublicDataset, publicQueryHref } from "../src/lib/transparencia/query-contract";
import { exampleTransparencyDataset } from "../src/lib/transparencia/example-provider";
import { exportTransparencyCsv } from "../src/lib/transparencia/consultation-export";
import { verifiedPublicationBytes, publicationMetadataSchema } from "../src/lib/transparencia/publication-policy";
import { loadIbemaTransparencyDataset } from "../src/lib/transparencia/ibema-provider";
import { defaultTransparencySettings } from "../src/lib/transparencia/presentation-settings";

const collection = getTransparencyCollection("despesas")!;
const query = parseTransparencyQuery(new URLSearchParams("source=EXEMPLO&year=2026&page=3&pageSize=20&sort=committed&direction=desc"));

test("paginação intermediária conserva totais e exporta mais de 125 registros", () => {
  const dataset = exampleTransparencyDataset(collection, query), result = filterPublicDataset(collection, dataset, query);
  assert.equal(result.total, 180); assert.equal(result.records.length, 20); assert.equal(result.page, 3);
  assert.equal(result.totals.committed, dataset.records.reduce((sum, row) => sum.add(String(row.values.committed)), new Prisma.Decimal(0)).toFixed(2));
  const csv = exportTransparencyCsv(collection, dataset, query);
  assert.equal(csv.trim().split("\r\n").length, 181);
  assert.ok(new Prisma.Decimal(String(result.rows[0].values.committed)).gte(String(result.rows[1].values.committed)));
});

test("filtros combinados, entidade e URL compartilhada usam o mesmo conjunto", () => {
  const filtered = parseTransparencyQuery(new URLSearchParams("source=EXEMPLO&entity=consolidado&year=2026&f.unit=Saúde&from=2026-01-01&until=2026-06-30&f.minimum=1000"));
  const result = filterPublicDataset(collection, exampleTransparencyDataset(collection, filtered), filtered);
  assert.ok(result.total > 0);
  assert.ok(result.rows.every(row => row.entity === "prefeitura" && row.values.unit === "Saúde" && String(row.values.date) <= "2026-06-30" && new Prisma.Decimal(String(row.values.committed)).gte(1000)));
  assert.deepEqual(parseTransparencyQuery(new URLSearchParams(publicQueryHref(filtered))), filtered);
});

test("campo ausente e fonte indisponível não produzem zero financeiro", () => {
  const dataset = exampleTransparencyDataset(collection, query); dataset.records[0].values.paid = null;
  assert.equal(filterPublicDataset(collection, dataset, query).totals.paid, null);
  const unavailable = { ...dataset, records: [], status: "UNAVAILABLE" as const, complete: false };
  assert.equal(filterPublicDataset(collection, unavailable, query).totals.committed, null);
  assert.throws(() => exportTransparencyCsv(collection, unavailable, query));
  assert.throws(() => filterPublicDataset(collection, dataset, { ...query, filters: { sql: "drop" } }));
});

test("CSV protege fórmulas e conserva a indicação de origem fictícia", () => {
  const dataset = exampleTransparencyDataset(collection, query); dataset.records[0].values.beneficiary = "\t=1+1";
  const csv = exportTransparencyCsv(collection, dataset, query);
  assert.ok(csv.includes("'\t=1+1")); assert.ok(csv.includes("Dados fictícios de exemplo"));
});

test("falha externa e Câmara sem código confirmado não acionam fallback", async () => {
  const failure = await loadIbemaTransparencyDataset(collection, query, defaultTransparencySettings(), async () => { throw new Error("offline"); });
  assert.equal(failure.status, "UNAVAILABLE"); assert.equal(failure.records.length, 0); assert.equal(failure.source, "API_IBEMA");
  const camera = await loadIbemaTransparencyDataset(collection, { ...query, entity: "camara" }, defaultTransparencySettings(), async () => { throw new Error("não deve chamar"); });
  assert.equal(camera.status, "UNAVAILABLE"); assert.match(camera.message!, /Código externo/);
});

test("download valida hash dos bytes e metadados não aceitam entidade/consulta arbitrária", () => {
  const bytes = new Uint8Array([1, 2, 3]), hash = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");
  assert.equal(verifiedPublicationBytes(bytes, hash(bytes), hash), bytes);
  assert.throws(() => verifiedPublicationBytes(new Uint8Array([4]), hash(bytes), hash));
  assert.equal(publicationMetadataSchema.safeParse({ title: "Documento", collectionSlug: "sql", entity: "privado", year: 2026, group: "Saúde", referencePeriod: "2026" }).success, false);
});
