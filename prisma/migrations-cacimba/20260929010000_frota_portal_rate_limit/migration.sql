-- Rate limiting distribuído dos portais de postos e oficinas.
CREATE TABLE IF NOT EXISTS "FleetPortalRateLimit" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "windowEndsAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "FleetPortalRateLimit_windowEndsAt_idx" ON "FleetPortalRateLimit"("windowEndsAt");
