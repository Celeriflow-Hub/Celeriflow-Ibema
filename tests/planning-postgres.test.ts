import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import type { PlanningContext } from "../src/lib/planejamento/access";
import { addAllocatedPlanningRevenue, addPlanningAction, addPlanningLine, addPlanningProgram, configurePlanningEntity, createPlanningInstrument, getPlanningInstrument } from "../src/lib/planejamento/service";
import { saveRevenueAllocation } from "../src/lib/planejamento/catalog";
import { decideCommunityDemand, registerCommunityDemand, registerPlanningHearing } from "../src/lib/planejamento/hearings";
import { importPlanningLines } from "../src/lib/planejamento/imports";

test("PostgreSQL: cadeia canônica, isolamento, rateio, importação atômica/replay e audiência", async () => {
  const pg = new PGlite();
  const server = new PGLiteSocketServer({ db: pg, port: 0, host: "127.0.0.1" });
  let db: PrismaClient | undefined;
  try {
    const newColumns: Record<string, string[]> = {
      ProgramPPA: ["origin", "guidelines", "targetAudience", "financing", "managerName"],
      ResourceSource: ["tceCode", "stnGroup", "stnSpecification", "stnDetail", "referenceYear"],
      RevenueNature: ["degree", "shortCode", "referenceYear"],
    };
    for (const name of ["GovernmentEntity", "BudgetUnit", "Secretariat", "MultiYearPlan", "BudgetGuideline", "AnnualBudgetLaw", "AnnualBudgetRevenueForecast", "AnnualBudgetExpenseFixation", "ProgramPPA", "ObjectivePPA", "IndicatorPPA", "ActionPPA", "FinancialYear", "ResourceSource", "RevenueNature", "ExpenseNature", "FinancialAuditLog", "CamVereador", "Person", "Employee", "CamGabinete"]) {
      const model = Prisma.dmmf.datamodel.models.find((item) => item.name === name)!;
      const columns = model.fields.filter((item) => item.kind !== "object" && !newColumns[name]?.includes(item.name)).map((item) => {
        const types: Record<string, string> = { Int: "INTEGER", Float: "DOUBLE PRECISION", Decimal: "NUMERIC(18,6)", DateTime: "TIMESTAMP(3)", Boolean: "BOOLEAN", Json: "JSONB" };
        const sqlType = (types[item.type] ?? "TEXT") + (item.isList ? "[]" : "");
        let fallback = "";
        if (typeof item.default === "string") fallback = ` DEFAULT '${item.default.replaceAll("'", "''")}'`;
        else if (typeof item.default === "boolean" || typeof item.default === "number") fallback = ` DEFAULT ${item.default}`;
        if (item.type === "DateTime" && item.isRequired) fallback = " DEFAULT CURRENT_TIMESTAMP";
        return `"${item.name}" ${sqlType}${item.name === "id" ? " PRIMARY KEY" : ""}${fallback}`;
      });
      await pg.exec(`CREATE TABLE "${name}" (${columns.join(",")})`);
    }
    await pg.exec(readFileSync("prisma/migrations-ibema/20261011150000_add_planning_scoped_instruments/migration.sql", "utf8"));
    await pg.exec(readFileSync("prisma/migrations-ibema/20261011160000_add_planning_import_batches/migration.sql", "utf8"));
    await pg.exec(`INSERT INTO "GovernmentEntity" (id,code,name,type,status) VALUES ('prefeitura','PMVA','Prefeitura Municipal de Vila das Araucárias','PREFEITURA','ATIVA'),('camara','CMVA','Câmara Municipal de Vila das Araucárias','CAMARA','ATIVA');
      INSERT INTO "Secretariat" (id,name) VALUES ('saude','Secretaria Municipal de Saúde'),('legislativo','Câmara Municipal');
      INSERT INTO "BudgetUnit" (id,code,name,"secretariatId") VALUES ('ug-exe','03.01','Fundo Municipal de Saúde','saude'),('ug-leg','01.01','Câmara Municipal','legislativo');
      INSERT INTO "FinancialYear" (id,year,status,"startDate","endDate") VALUES ('2027',2027,'Preparação','2027-01-01','2027-12-31');
      INSERT INTO "ResourceSource" (id,code,name) VALUES ('livre','000','Recursos ordinários'),('saude','303','Saúde - receitas vinculadas');
      INSERT INTO "RevenueNature" (id,code,name) VALUES ('receita','1.7.1.1.51','Transferências da União');
      INSERT INTO "ExpenseNature" (id,code,name) VALUES ('despesa','3.3.90.39','Serviços de terceiros');`);
    await server.start();
    db = new PrismaClient({ adapter: new PrismaPg({ connectionString: `postgresql://postgres:postgres@${server.getServerConn()}/postgres`, max: 1 }), transactionOptions: { timeout: 30000 } });
    const user = { id: "ana", employeeId: null, profileCode: "SYSTEM_ADMINISTRATOR", modulePermissions: [], allowedBudgetUnitIds: ["ug-exe"], permissions: JSON.stringify({ modules: { PLANEJAMENTO: { blocked: false, create: true, update: true } } }) };
    const ctx = { prisma: db, jurisdiction: "EXECUTIVE", user } as unknown as PlanningContext;
    await configurePlanningEntity(ctx, "prefeitura", "ug-exe");
    await configurePlanningEntity({ ...ctx, jurisdiction: "LEGISLATIVE" }, "camara", "ug-leg");
    ctx.user.profileCode = "BUDGET_ANALYST";
    const piece = { governmentEntityId: "prefeitura", kind: "PPA", code: "2026-2029", title: "Plano Plurianual 2026–2029", startYear: 2026, endYear: 2029, revenueDegree: 6, expenseLevel: "ELEMENT_SOURCE" };
    const ppa = await createPlanningInstrument(ctx, piece);
    await assert.rejects(createPlanningInstrument(ctx, { ...piece, governmentEntityId: "camara" }), /Entidade não autorizada/);
    const program = await addPlanningProgram(ctx, { instrumentId: ppa, code: "0003", name: "Saúde Perto de Você", type: "Finalístico", origin: "Plano de governo", objectiveCode: "0003.01", objective: "Ampliar a atenção primária", guidelines: "Universalização do atendimento", targetAudience: "Famílias do município", financing: "Receitas ordinárias e vinculadas", managerName: "Mariana Lopes de Almeida", indicatorName: "Consultas realizadas", indicatorUnit: "consultas", baselineValue: 20000, targetValue: 26000 });
    const action = await addPlanningAction(ctx, { instrumentId: ppa, programId: program, code: "2003", name: "Atenção primária à saúde", type: "Atividade" });
    const expense = { instrumentId: ppa, kind: "EXPENSE", code: "03.01.2003", description: "Manutenção das unidades de saúde", year: 2027, budgetUnitId: "ug-exe", resourceSourceId: "livre", expenseNatureId: "despesa", programId: program, actionId: action, functionCode: "10", subfunctionCode: "301", product: "Consultas realizadas", productUnit: "consultas", physicalTarget: "26000", originalValue: "100000.05" };
    await addPlanningLine(ctx, expense);
    await assert.rejects(addPlanningLine(ctx, { ...expense, code: "03.01.2004", budgetUnitId: "ug-leg" }), /Unidade não autorizada/);
    await saveRevenueAllocation(ctx, { revenueNatureId: "receita", resourceSourceId: "livre", percentage: "60" });
    await assert.rejects(saveRevenueAllocation(ctx, { revenueNatureId: "receita", resourceSourceId: "saude", percentage: "41" }), /ultrapassar/);
    await saveRevenueAllocation(ctx, { revenueNatureId: "receita", resourceSourceId: "saude", percentage: "40" });
    await addAllocatedPlanningRevenue(ctx, { instrumentId: ppa, revenueNatureId: "receita", budgetUnitId: "ug-exe", code: "R.001", description: "Receitas previstas para atenção primária", year: 2027, originalValue: "100000.05" });
    const ldo = await createPlanningInstrument(ctx, { ...piece, kind: "LDO", code: "2027", title: "Diretrizes Orçamentárias 2027", startYear: 2027, endYear: 2027, parentId: ppa });
    const loa = await createPlanningInstrument(ctx, { ...piece, kind: "LOA", code: "2027", title: "Orçamento Anual 2027", startYear: 2027, endYear: 2027, parentId: ldo });
    const request = { sourceInstrumentId: ppa, targetInstrumentId: loa, targetYear: 2027, mode: "VALUES", lineCodes: "", submissionKey: "32005277-345f-4ab5-9a4e-dd6e1c50ae73" };
    const batch = await importPlanningLines(ctx, request);
    assert.equal(await importPlanningLines(ctx, request), batch);
    assert.equal(await db.planningBudgetLine.count({ where: { instrumentId: loa } }), 3);
    const law = await db.annualBudgetLaw.findFirstOrThrow({ where: { planningInstrument: { is: { id: loa } } } });
    assert.equal(law.totalRevenue.toFixed(2), "100000.05");
    assert.equal(law.totalExpense.toFixed(2), "100000.05");
    const before = await db.financialAuditLog.count();
    await assert.rejects(importPlanningLines(ctx, { ...request, submissionKey: "da005277-345f-4ab5-9a4e-dd6e1c50ae73" }));
    assert.equal(await db.planningImportBatch.count(), 1, "lote duplicado com conflito não deve persistir parcialmente");
    assert.equal(await db.financialAuditLog.count(), before);
    const hearing = await registerPlanningHearing(ctx, { instrumentId: ppa, title: "Prioridades da saúde municipal", heldAt: "2026-08-20", location: "Centro Comunitário Jardim Primavera", minutes: "Moradores apresentaram propostas para ampliação do atendimento." });
    const demand = await registerCommunityDemand(ctx, { hearingId: hearing, requesterName: "João Henrique da Silva", email: "joao.silva@example.org", neighborhood: "Jardim Primavera", request: "Ampliar o atendimento da unidade de saúde no período noturno.", responsibleUnitId: "ug-exe" });
    await decideCommunityDemand(ctx, { demandId: demand, status: "ACCEPTED", opinion: "Proposta acolhida para estudo de cobertura e custos." });
    await assert.rejects(decideCommunityDemand(ctx, { demandId: demand, status: "REJECTED", opinion: "Outra decisão" }), /já foi analisada/);
    const detail = await getPlanningInstrument(ctx, loa);
    assert.equal(detail.total, 3);
    assert.equal(detail.sums.find((row) => row.kind === "REVENUE")?._sum.originalValue?.toFixed(2), "100000.05");
  } finally {
    await db?.$disconnect();
    await server.stop();
    await pg.close();
  }
});
