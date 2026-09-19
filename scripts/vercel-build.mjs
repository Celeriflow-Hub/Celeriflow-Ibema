import { spawnSync } from "node:child_process";
import { join } from "node:path";

const commands = {
  prisma: join(process.cwd(), "node_modules", "prisma", "build", "index.js"),
  next: join(process.cwd(), "node_modules", "next", "dist", "bin", "next"),
};

function run(command, args) {
  const result = spawnSync(process.execPath, [commands[command], ...args], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("prisma", ["generate"]);

// The GitHub main branch produces the production Vercel deployment. Apply
// additive Prisma migrations there before the application build, while preview
// deployments remain schema-safe and do not alter the production database.
if (process.env.VERCEL_ENV === "production") {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required to apply Prisma migrations in the production Vercel build.");
  }
  run("prisma", ["migrate", "deploy"]);
}

run("next", ["build"]);
