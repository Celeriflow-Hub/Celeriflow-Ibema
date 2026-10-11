-- Idempotent backfill for fuel orders confirmed before the shared service
-- started creating FleetExpense alongside FleetConsumption. Never invent
-- a cost: preserve NULL when the original consumption lacked pricing.
-- Safely skips any consumption already appropriated in the internal ledger.
INSERT INTO "FleetExpense"
  ("id", "unitId", "nature", "occurredAt", "amount", "description",
   "sourceType", "sourceId", "sourceKey", "reference", "createdById", "createdAt")
SELECT
  'legacy-fuel:' || c."id",
  c."unitId",
  'COMBUSTIVEL',
  c."occurredAt",
  c."cost",
  c."material",
  'CONSUMO',
  c."id",
  'consumption:' || c."id",
  o."code",
  c."createdById",
  CURRENT_TIMESTAMP
FROM "FleetFuelOrder" o
JOIN "FleetConsumption" c ON c."id" = o."consumptionId"
WHERE o."status" = 'ABASTECIDA'
  AND c."type" = 'COMBUSTIVEL'
  AND NOT EXISTS (
    SELECT 1 FROM "FleetExpense" existing
    WHERE existing."sourceType" = 'CONSUMO'
      AND existing."sourceId" = c."id"
  )
ON CONFLICT ("sourceKey") DO NOTHING;
