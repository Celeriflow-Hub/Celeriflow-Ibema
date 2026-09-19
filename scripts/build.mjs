import { spawnSync } from "node:child_process";
import { join } from "node:path";

const memoryOption = "--max-old-space-size=4096";
const inheritedNodeOptions = process.env.NODE_OPTIONS?.trim() ?? "";
const nodeOptions = inheritedNodeOptions.includes("--max-old-space-size")
  ? inheritedNodeOptions
  : [inheritedNodeOptions, memoryOption].filter(Boolean).join(" ");

const environment = { ...process.env, NODE_OPTIONS: nodeOptions };
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

run("prisma", ["generate"]);
run("next", ["build"]);
