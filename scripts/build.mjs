import { spawnSync } from "node:child_process";
import { join } from "node:path";

const minimumHeapMegabytes = 4096;
const heapOptionPattern = /--max[-_]old[-_]space[-_]size(?:=(\d+)|\s+(\d+))?/g;
const inheritedNodeOptions = process.env.NODE_OPTIONS?.trim() ?? "";
let containsHeapOption = false;
const nodeOptions = inheritedNodeOptions.replace(
  heapOptionPattern,
  (option, equalsValue, spacedValue) => {
    containsHeapOption = true;
    const configuredHeap = Number(equalsValue ?? spacedValue ?? 0);
    return configuredHeap >= minimumHeapMegabytes
      ? option
      : `--max-old-space-size=${minimumHeapMegabytes}`;
  },
);

const normalizedNodeOptions = containsHeapOption
  ? nodeOptions
  : [nodeOptions, `--max-old-space-size=${minimumHeapMegabytes}`].filter(Boolean).join(" ");

// Lovable invokes this file directly in production. Skip Next's duplicate,
// memory-heavy typecheck by default; `build:check` explicitly opts back in.
const environment = {
  ...process.env,
  NODE_OPTIONS: normalizedNodeOptions,
  SKIP_NEXT_TYPECHECK: process.env.SKIP_NEXT_TYPECHECK ?? "1",
};
const commands = {
  prisma: join(process.cwd(), "node_modules", "prisma", "build", "index.js"),
  next: join(process.cwd(), "node_modules", "next", "dist", "bin", "next"),
};

function run(command, args) {
  const result = spawnSync(process.execPath, [commands[command], ...args], {
    stdio: "inherit",
    env: environment,
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
  if (process.exitCode !== 0) process.exit(process.exitCode);
}

// Production builds use the production database, so deploy committed schema
// migrations before compiling code that depends on their columns.
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);
if (process.env.VERCEL_ENV === "production" && hasDatabaseUrl) run("prisma", ["migrate", "deploy"]);
else if (process.env.VERCEL_ENV === "production") console.warn("DATABASE_URL ausente: migrações não aplicadas neste build.");
run("prisma", ["generate"]);
run("next", ["build"]);
