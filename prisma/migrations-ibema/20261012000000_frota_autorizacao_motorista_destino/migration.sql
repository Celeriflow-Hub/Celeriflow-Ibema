-- Autorização de serviço: vínculo de motorista e destino para impressão formatada.
ALTER TABLE "FleetServiceAuthorization" ADD COLUMN IF NOT EXISTS "driverId" TEXT;
ALTER TABLE "FleetServiceAuthorization" ADD COLUMN IF NOT EXISTS "destination" TEXT;
CREATE INDEX IF NOT EXISTS "FleetServiceAuthorization_driverId_idx" ON "FleetServiceAuthorization"("driverId");
