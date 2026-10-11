import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

export class FleetPortalThrottled extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super("Muitas tentativas. Aguarde antes de tentar novamente.");
  }
}

/** Atomic PostgreSQL throttle shared by all workers and deployments using the
 * same database. Only hashed, namespaced identifiers are persisted.
 * Limiting both source and order code mitigates IP spoofing or NAT collisions.
 */
export async function checkFleetPortalThrottle(
  db: PrismaClient,
  kind: "station" | "workshop" | "export",
  bucket: "source" | "code",
  value: string,
  maxAttempts = bucket === "source" ? 30 : 8,
) {
  const key = createHash("sha256").update(["fleet-portal-v1", kind, bucket, value].join(":")).digest("hex");
  type Row = { count: number; windowEndsAt: Date };
  const [result] = await db.$queryRaw<Row[]>`
    INSERT INTO "FleetPortalRateLimit" ("key", "count", "windowEndsAt", "updatedAt")
    VALUES (${key}, 1, CURRENT_TIMESTAMP + INTERVAL '15 minutes', CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "FleetPortalRateLimit"."windowEndsAt" <= CURRENT_TIMESTAMP
        THEN 1 ELSE "FleetPortalRateLimit"."count" + 1 END,
      "windowEndsAt" = CASE WHEN "FleetPortalRateLimit"."windowEndsAt" <= CURRENT_TIMESTAMP
        THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE "FleetPortalRateLimit"."windowEndsAt" END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "count", "windowEndsAt"
  `;
  if (result.count > maxAttempts) {
    throw new FleetPortalThrottled(Math.max(1, Math.ceil((result.windowEndsAt.getTime() - Date.now()) / 1000)));
  }
}

/** Proxy-derived hint, never accepted as authentication. A per-code bucket
 * independently limits guesses even where source headers are unavailable.
 */
export function fleetPortalSource(headers: Headers): string {
  return headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unresolved";
}
