import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  try {
    const migrations = await prisma.$queryRaw<{ migration_name: string; finished: boolean; rolledBack: boolean }[]>`SELECT DISTINCT ON (migration_name) migration_name, finished_at IS NOT NULL AS finished, rolled_back_at IS NOT NULL AS "rolledBack" FROM "_prisma_migrations" WHERE migration_name IN ('20261012100000_accounting_entity_unit_scope','20261012110000_entity_scoped_financial_years','20261012120000_accounting_year_entity_guard','20261012130000_scoped_year_requires_accounting_scope') ORDER BY migration_name, started_at DESC`;
    const allMigrationsApplied = migrations.length === 4 && migrations.every((migration) => migration.finished && !migration.rolledBack);
    const [columns] = await prisma.$queryRaw<{ entity: boolean; unit: boolean }[]>`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='AccountingTransaction' AND column_name='governmentEntityId') AS entity, EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='AccountingTransaction' AND column_name='budgetUnitId') AS unit`;
    const [guard] = await prisma.$queryRaw<{ present: boolean }[]>`SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='AccountingTransaction_scope_guard' AND NOT tgisinternal) AS present`;
    const [ledger] = await prisma.$queryRaw<{ total: bigint; scoped: bigint; unscoped: bigint; mismatched: bigint }[]>`
      SELECT count(*) AS total,
        count(*) FILTER (WHERE t."governmentEntityId" IS NOT NULL AND t."budgetUnitId" IS NOT NULL) AS scoped,
        count(*) FILTER (WHERE t."governmentEntityId" IS NULL AND t."budgetUnitId" IS NULL) AS unscoped,
        count(*) FILTER (WHERE t."governmentEntityId" IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM "PlanningEntityUnit" u WHERE u."governmentEntityId"=t."governmentEntityId" AND u."budgetUnitId"=t."budgetUnitId"
        )) AS mismatched
      FROM "AccountingTransaction" t`;
    const [p0] = await prisma.$queryRaw<{ entities: bigint; units: bigint; years: bigint; instruments: bigint }[]>`
      SELECT
        (SELECT count(*) FROM "GovernmentEntity" WHERE id LIKE 'p0-current-%') AS entities,
        (SELECT count(*) FROM "BudgetUnit" WHERE id LIKE 'p0-current-%') AS units,
        (SELECT count(*) FROM "FinancialYear" WHERE id LIKE 'p0-current-year-%' OR "governmentEntityId" IN ('p0-current-exe','p0-current-leg')) AS years,
        (SELECT count(*) FROM "PlanningInstrument" WHERE id LIKE 'p0-current-%') AS instruments`;
    const [yearUniqueness] = await prisma.$queryRaw<{ scopedYearKey: boolean; legacyYearKey: boolean }[]>`SELECT
      EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname=current_schema() AND indexname='FinancialYear_governmentEntityId_year_key') AS "scopedYearKey",
      EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname=current_schema() AND indexname='FinancialYear_legacy_year_key') AS "legacyYearKey"`;
    const financialYearIndexes = await prisma.$queryRaw<{ indexname: string; indexdef: string }[]>`SELECT indexname::text,indexdef::text FROM pg_indexes WHERE schemaname=current_schema() AND tablename='FinancialYear' ORDER BY indexname`;
    const result = {
      mode: "READ_ONLY",
      migrations,
      migrationsApplied: allMigrationsApplied,
      columns,
      entityUnitTrigger: guard.present,
      ledger: Object.fromEntries(Object.entries(ledger).map(([key, value]) => [key, Number(value)])),
      p0Fixtures: Object.fromEntries(Object.entries(p0).map(([key, value]) => [key, Number(value)])),
      financialYearKeys: yearUniqueness,
      financialYearIndexes,
      preservation: "SELECT-only; no rows updated or inserted",
    };
    console.log(JSON.stringify(result, null, 2));
    if (!allMigrationsApplied || !columns.entity || !columns.unit || !guard.present || result.ledger.mismatched !== 0 || result.p0Fixtures.entities !== 2 || result.p0Fixtures.units !== 42 || result.p0Fixtures.years !== 12 || result.p0Fixtures.instruments !== 18 || !yearUniqueness.scopedYearKey || !yearUniqueness.legacyYearKey) process.exitCode = 1;
  } finally { await prisma.$disconnect(); }
}

main().catch((error: unknown) => { console.error("Verificação P1 falhou:", error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, "[URL omitida]") : "ERRO"); process.exitCode = 1; });
