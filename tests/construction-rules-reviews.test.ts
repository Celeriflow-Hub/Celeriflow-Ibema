import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { definitionSchema, evaluateConstructionViability, professionalSchema, validateConstructionFields } from "../src/lib/obras/construction-rules";
import { assignConstructionCase } from "../src/lib/obras/construction-distribution";
import { reviewConstructionProject, resubmitConstructionProject } from "../src/lib/obras/construction-review";

test("campos configuráveis validam tipos, opções, obrigatoriedade e chaves", () => {
  const definition = { fields: [{ key: "use", label: "Uso", type: "CHOICE", required: true, options: ["Residencial"] }, { key: "date", label: "Data", type: "DATE", required: false, options: [] }], checks: [], documents: [] };
  assert.deepEqual(validateConstructionFields(definition, { use: " Residencial " }), { use: "Residencial", date: "" });
  assert.throws(() => validateConstructionFields(definition, {}), /obrigatório/);
  assert.throws(() => validateConstructionFields(definition, { use: "Comercial" }), /opção inválida/);
  assert.throws(() => validateConstructionFields(definition, { use: "Residencial", date: "2026-02-30" }), /data inválida/);
  assert.throws(() => validateConstructionFields(definition, { use: "Residencial", unknown: "x" }), /não previstos/);
  assert.equal(definitionSchema.safeParse({ ...definition, fields: [...definition.fields, definition.fields[0]] }).success, false);
  assert.equal(professionalSchema.safeParse({ personId: "person", professionalType: "ENGINEER", council: "CRECI", registration: "PR123", startsAt: "2026-10-10", endsAt: "", isActive: true }).success, false);
});

test("viabilidade respeita precisão, limites e ausência de regra automática vigente", () => {
  const rule = { code: "ZT", name: "Zona de teste", legalBasis: "Parâmetros demonstrativos", startsAt: "2026-01-01", endsAt: "", allowedPurposeIds: ["residential"], allowedCategories: ["BUILDING"], minimumLandArea: "100", maxFloorAreaRatio: "1.5", automatic: true };
  const input = { category: "BUILDING", purposeId: "residential", landArea: "100.0001", proposedArea: "150.0001", today: "2026-10-10" };
  assert.equal(evaluateConstructionViability(input, rule).outcome, "APPROVED");
  assert.equal(evaluateConstructionViability({ ...input, proposedArea: "150.0003" }, rule).outcome, "DENIED");
  assert.equal(evaluateConstructionViability({ ...input, proposedArea: "150.0002" }, rule).outcome, "DENIED");
  assert.equal(evaluateConstructionViability({ ...input, purposeId: "industrial" }, rule).outcome, "DENIED");
  assert.equal(evaluateConstructionViability(input, { ...rule, automatic: false }).outcome, "MANUAL");
  assert.equal(evaluateConstructionViability(input, { ...rule, startsAt: "2027-01-01" }).outcome, "MANUAL");
  assert.equal(evaluateConstructionViability({ ...input, landArea: "0" }, rule).outcome, "MANUAL");
});

test("PostgreSQL: migrations, menor demanda, parecer idempotente, exigência e retorno ao analista inicial", async () => {
  const db = new PGlite();
  const server = new PGLiteSocketServer({ db, port: 0, host: "127.0.0.1" });
  let prisma: PrismaClient | undefined;
  try {
    await db.exec(`
      CREATE TABLE "Person" (id TEXT PRIMARY KEY); CREATE TABLE "Company" (id TEXT PRIMARY KEY);
      CREATE TABLE "Department" (id TEXT PRIMARY KEY, "isActive" BOOLEAN NOT NULL DEFAULT true);
      CREATE TABLE "Employee" (id TEXT PRIMARY KEY, "isActive" BOOLEAN NOT NULL DEFAULT true, "departmentId" TEXT);
      CREATE TABLE "RealEstate" (id TEXT PRIMARY KEY);
      CREATE TABLE "Process" (id TEXT PRIMARY KEY, "currentDepartmentId" TEXT, "currentResponsibleEmployeeId" TEXT, "completedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP, status TEXT NOT NULL DEFAULT 'Em andamento');
      CREATE TABLE "ProcessEvent" (id TEXT PRIMARY KEY, "processId" TEXT, "eventType" TEXT, description TEXT, "previousStatus" TEXT, "newStatus" TEXT, "departmentId" TEXT, "employeeId" TEXT, metadata TEXT, "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE "Document" (id TEXT PRIMARY KEY, title TEXT, status TEXT, "validUntil" TIMESTAMP(3));
      CREATE TABLE "DocumentVersion" (id TEXT PRIMARY KEY, "documentId" TEXT, "versionNumber" INTEGER, "hashSha256" TEXT, status TEXT);
      CREATE TABLE "ProcessDocument" (id TEXT PRIMARY KEY, "processId" TEXT, "documentId" TEXT);
    `);
    for (const migration of ["20261010160000_construction_foundation", "20261010170000_construction_rules_profiles", "20261010180000_construction_project_reviews"]) await db.exec(readFileSync(`prisma/migrations-ibema/${migration}/migration.sql`, "utf8"));
    await db.exec(`
      INSERT INTO "Department" (id) VALUES ('sector'); INSERT INTO "Employee" (id,"departmentId") VALUES ('analyst-a','sector'),('analyst-b','sector');
      INSERT INTO "ConstructionStaffRole" (id,"employeeId","departmentId",role,"startsAt","updatedAt") VALUES ('role-a','analyst-a','sector','ANALYST','2026-01-01',CURRENT_TIMESTAMP),('role-b','analyst-b','sector','ANALYST','2026-01-01',CURRENT_TIMESTAMP);
      INSERT INTO "ConstructionDistributionVersion" (id,"departmentId",version,strategy,"publishedBy") VALUES ('distribution','sector',1,'LOWEST_LOAD','actor');
      INSERT INTO "ConstructionConfigVersion" (id,version,"freeRevisions","correctionDays","checkPropertyDebts","subjectIds","areaWeights",instructions,"publishedBy") VALUES ('config',1,1,30,false,'{subject}','{}','Orientação','actor');
      INSERT INTO "Process" (id,"currentDepartmentId") VALUES ('process-a','sector'),('process-b','sector');
      INSERT INTO "ConstructionCase" (id,"requestKey","processId","configurationId",category,"locationType","catalogSnapshot","existingArea","expandedArea","irregularArea","renovationArea","demolitionArea","totalArea","calculationSnapshot","createdBy") SELECT 'case-'||x,'key-'||x,'process-'||x,'config','BUILDING','URBAN','{}',0,0,0,0,0,0,'{}','actor' FROM unnest(ARRAY['a','b']) AS x;
      INSERT INTO "ConstructionDefinitionVersion" (id,kind,version,definition,"publishedBy") VALUES ('checklist','PERMIT',1,'{"fields":[],"checks":[{"key":"rule","label":"Regra urbanística","required":true}],"documents":[{"label":"Projeto","required":true}]}','actor');
      INSERT INTO "Document" VALUES ('doc','Projeto','Válido',NULL); INSERT INTO "DocumentVersion" VALUES ('version','doc',1,'hash','FINAL'); INSERT INTO "ProcessDocument" VALUES ('link','process-a','doc');
    `);
    await assert.rejects(db.exec(`UPDATE "ConstructionDefinitionVersion" SET version=2 WHERE id='checklist'`));
    await assert.rejects(db.exec(`DELETE FROM "ConstructionDistributionVersion" WHERE id='distribution'`));
    await server.start();
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: `postgresql://postgres:postgres@${server.getServerConn()}/postgres`, max: 1 }) });
    const today = new Date("2026-10-10T00:00:00Z");
    assert.equal(await prisma.$transaction((tx) => assignConstructionCase(tx, { caseId: "case-a", processId: "process-a", departmentId: "sector", today })), "analyst-a");
    assert.equal(await prisma.$transaction((tx) => assignConstructionCase(tx, { caseId: "case-b", processId: "process-b", departmentId: "sector", today })), "analyst-b");
    const access = { administrator: false, employeeId: "analyst-a", departmentId: "sector", roles: ["ANALYST"] };
    const input = { caseId: "case-a", requestKey: randomUUID(), revision: 0, definitionVersion: 1, reviewType: "PROJECT", decision: "APPROVED", notes: "Parecer técnico", checks: {}, documentIds: {}, fieldValues: {} };
    await assert.rejects(prisma.$transaction((tx) => reviewConstructionProject(tx, access, "actor", input)), /critérios obrigatórios/);
    await assert.rejects(prisma.$transaction((tx) => reviewConstructionProject(tx, { ...access, departmentId: "other" }, "actor", input)), /indisponível/);
    const correction = { ...input, decision: "CORRECTION_REQUIRED" };
    const reviewId = await prisma.$transaction((tx) => reviewConstructionProject(tx, access, "actor", correction));
    assert.equal(await prisma.$transaction((tx) => reviewConstructionProject(tx, access, "actor", correction)), reviewId);
    assert.equal(await prisma.constructionReview.count(), 1);
    await assert.rejects(db.exec(`DELETE FROM "ConstructionReview" WHERE id='${reviewId}'`));
    await prisma.$transaction((tx) => resubmitConstructionProject(tx, access, { caseId: "case-a", revision: 0, notes: "Projeto complementado" }));
    await assert.rejects(prisma.$transaction((tx) => resubmitConstructionProject(tx, access, { caseId: "case-a", revision: 0, notes: "Reenvio repetido" })), /exigência pendente/);
    const record = await prisma.constructionCase.findUniqueOrThrow({ where: { id: "case-a" } });
    assert.equal(record.revisionCount, 1); assert.equal(record.assignedEmployeeId, "analyst-a"); assert.equal(record.reviewStatus, "RESUBMITTED");
    await db.exec(`INSERT INTO "DocumentVersion" VALUES ('version-cancelled','doc',2,'hash-cancelled','CANCELLED')`);
    await assert.rejects(prisma.$transaction((tx) => reviewConstructionProject(tx, access, "actor", { ...input, requestKey: randomUUID(), revision: 1, checks: { rule: true }, documentIds: { Projeto: "doc" } })), /versão GED atual válida/);
    await db.exec(`DELETE FROM "DocumentVersion" WHERE id='version-cancelled'; UPDATE "ConstructionCase" SET "revisionCount"=2 WHERE id='case-a'`);
    await assert.rejects(prisma.$transaction((tx) => reviewConstructionProject(tx, access, "actor", { ...input, requestKey: randomUUID(), revision: 2, checks: { rule: true }, documentIds: { Projeto: "doc" } })), /Franquia/);
    assert.equal(await prisma.constructionReview.count(), 1);
    await db.exec(`UPDATE "ConstructionCase" SET "revisionCount"=1 WHERE id='case-a'`);
    await prisma.$transaction((tx) => reviewConstructionProject(tx, access, "actor", { ...input, requestKey: randomUUID(), revision: 1, checks: { rule: true }, documentIds: { Projeto: "doc" } }));
    assert.equal((await prisma.constructionCase.findUniqueOrThrow({ where: { id: "case-a" } })).reviewStatus, "APPROVED");
  } finally { await prisma?.$disconnect(); await server.stop(); await db.close(); }
});
