ALTER TABLE "FleetFuelOrder" ADD COLUMN IF NOT EXISTS "portalToken" TEXT, ADD COLUMN IF NOT EXISTS "confirmedVia" TEXT;
ALTER TABLE "FleetTrip" ADD COLUMN IF NOT EXISTS "checklist" JSONB, ADD COLUMN IF NOT EXISTS "startPhotoUrl" TEXT, ADD COLUMN IF NOT EXISTS "endPhotoUrl" TEXT, ADD COLUMN IF NOT EXISTS "origin" TEXT NOT NULL DEFAULT 'INTERNO';
ALTER TABLE "FleetWorkOrder" ADD COLUMN IF NOT EXISTS "portalToken" TEXT;
CREATE TABLE IF NOT EXISTS "FleetWorkshopReport" ("id" TEXT PRIMARY KEY, "workOrderId" TEXT NOT NULL, "workshopCnpj" TEXT NOT NULL, "workshopName" TEXT NOT NULL, "performed" TEXT NOT NULL, "parts" TEXT, "amount" DECIMAL(18,2), "reading" DECIMAL(14,3), "status" TEXT NOT NULL DEFAULT 'RECEBIDO', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "FleetWorkshopReport_workOrderId_createdAt_idx" ON "FleetWorkshopReport"("workOrderId","createdAt");
