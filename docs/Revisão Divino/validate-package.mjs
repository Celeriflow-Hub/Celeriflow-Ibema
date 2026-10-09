import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const database = new PGlite();
await database.waitReady;
const packageDirectory = dirname(fileURLToPath(import.meta.url));

for (const [label, file] of [
  ["baseline", "prisma/migrations-ibema/20261009232000_baseline/migration.sql"],
  ["database guards", "prisma/migrations-ibema/20261009232100_database_guards/migration.sql"],
  ["reference data", "prisma/migrations-ibema/20261009232200_reference_data/migration.sql"],
]) {
  process.stdout.write(`Aplicando ${label}... `);
  await database.exec(await readFile(resolve(packageDirectory, "../..", file), "utf8"));
  console.log("ok");
}

const [{ count: tableCount }] = (
  await database.query(
    "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public'",
  )
).rows;
const [{ count: triggerCount }] = (
  await database.query(
    "SELECT count(*)::int AS count FROM pg_trigger WHERE NOT tgisinternal",
  )
).rows;
const [{ count: checkCount }] = (
  await database.query(
    "SELECT count(*)::int AS count FROM pg_constraint WHERE contype = 'c'",
  )
).rows;
const [{ count: functionCount }] = (
  await database.query(
    "SELECT count(*)::int AS count FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public'",
  )
).rows;
const [{ count: moduleCount }] = (
  await database.query('SELECT count(*)::int AS count FROM "ConfiguracaoModulo"')
).rows;

const expected = {
  tableCount: 620,
  triggerCount: 16,
  checkCount: 59,
  functionCount: 17,
  moduleCount: 24,
};
const actual = {
  tableCount,
  triggerCount,
  checkCount,
  functionCount,
  moduleCount,
};

for (const [key, expectedValue] of Object.entries(expected)) {
  if (actual[key] !== expectedValue) {
    throw new Error(`${key}: esperado ${expectedValue}, encontrado ${actual[key]}`);
  }
}

console.log(
  `Pacote valido: ${tableCount} tabelas, ${checkCount} checks, ${functionCount} funcoes, ${triggerCount} triggers e ${moduleCount} modulos.`,
);

await database.close();
