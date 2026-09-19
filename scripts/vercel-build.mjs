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

// Database migrations are an explicit production operation. This avoids
// applying an unbaselined history during an ordinary application deployment.
// Enable only after the Neon migration history has been reviewed.
if (process.env.VERCEL_ENV === "production" && process.env.APPLY_PRISMA_MIGRATIONS === "true") {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required when APPLY_PRISMA_MIGRATIONS=true.");
  }
  run("prisma", ["migrate", "deploy"]);
}

run("next", ["build"]);
