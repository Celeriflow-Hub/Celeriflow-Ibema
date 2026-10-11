-- Traz para Ibema as tabelas de frota criadas na instância anterior (idempotentes)
-- origem: 20260928000000_frota_gestao
ALTER TABLE "FleetUnit" ADD COLUMN IF NOT EXISTS "meterType" TEXT NOT NULL DEFAULT 'HODOMETRO', ADD COLUMN IF NOT EXISTS "currentReading" DECIMAL(14,3), ADD COLUMN IF NOT EXISTS "fuelType" TEXT, ADD COLUMN IF NOT EXISTS "expectedConsumption" DECIMAL(10,3), ADD COLUMN IF NOT EXISTS "costCenter" TEXT;
CREATE TABLE IF NOT EXISTS "FleetDriver" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "cpf" TEXT NOT NULL UNIQUE, "employeeId" TEXT, "cnhNumber" TEXT NOT NULL, "cnhCategory" TEXT NOT NULL, "cnhExpiresAt" DATE NOT NULL, "departmentId" TEXT, "active" BOOLEAN NOT NULL DEFAULT true, "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE TABLE IF NOT EXISTS "FleetFuelStation" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "cnpj" TEXT NOT NULL UNIQUE, "contractRef" TEXT, "pricePerLiter" DECIMAL(10,3), "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "FleetFuelQuota" ("id" TEXT PRIMARY KEY, "unitId" TEXT NOT NULL, "period" TEXT NOT NULL, "litersLimit" DECIMAL(14,3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX IF NOT EXISTS "FleetFuelQuota_unitId_period_key" ON "FleetFuelQuota"("unitId","period");
CREATE TABLE IF NOT EXISTS "FleetFuelOrder" ("id" TEXT PRIMARY KEY, "code" TEXT NOT NULL UNIQUE, "unitId" TEXT NOT NULL, "driverId" TEXT, "stationId" TEXT NOT NULL REFERENCES "FleetFuelStation"("id") ON DELETE RESTRICT, "fuelType" TEXT NOT NULL, "litersAuthorized" DECIMAL(14,3) NOT NULL, "litersFilled" DECIMAL(14,3), "pricePerLiter" DECIMAL(10,3), "reading" DECIMAL(14,3), "status" TEXT NOT NULL DEFAULT 'EMITIDA', "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "filledAt" TIMESTAMP(3), "consumptionId" TEXT UNIQUE, "createdById" TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS "FleetFuelOrder_unitId_status_issuedAt_idx" ON "FleetFuelOrder"("unitId","status","issuedAt");
CREATE TABLE IF NOT EXISTS "FleetTrip" ("id" TEXT PRIMARY KEY, "unitId" TEXT NOT NULL, "driverId" TEXT NOT NULL, "destination" TEXT NOT NULL, "purpose" TEXT NOT NULL, "departedAt" TIMESTAMP(3) NOT NULL, "returnedAt" TIMESTAMP(3), "startReading" DECIMAL(14,3) NOT NULL, "endReading" DECIMAL(14,3), "notes" TEXT, "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "FleetTrip_unitId_departedAt_idx" ON "FleetTrip"("unitId","departedAt");
CREATE TABLE IF NOT EXISTS "FleetTire" ("id" TEXT PRIMARY KEY, "unitId" TEXT, "fireNumber" TEXT NOT NULL UNIQUE, "brand" TEXT NOT NULL, "size" TEXT NOT NULL, "position" TEXT, "status" TEXT NOT NULL DEFAULT 'EM_USO', "installedAt" DATE, "installReading" DECIMAL(14,3), "lifeKm" INTEGER NOT NULL DEFAULT 50000, "cost" DECIMAL(18,2), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "FleetFine" ("id" TEXT PRIMARY KEY, "unitId" TEXT NOT NULL, "driverId" TEXT, "aitNumber" TEXT NOT NULL UNIQUE, "infraction" TEXT NOT NULL, "occurredAt" DATE NOT NULL, "amount" DECIMAL(18,2) NOT NULL, "points" INTEGER NOT NULL DEFAULT 0, "dueAt" DATE, "status" TEXT NOT NULL DEFAULT 'PENDENTE', "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);

-- origem: 20260928010000_portal_frota
ALTER TABLE "FleetFuelOrder" ADD COLUMN IF NOT EXISTS "portalToken" TEXT, ADD COLUMN IF NOT EXISTS "confirmedVia" TEXT;
ALTER TABLE "FleetTrip" ADD COLUMN IF NOT EXISTS "checklist" JSONB, ADD COLUMN IF NOT EXISTS "startPhotoUrl" TEXT, ADD COLUMN IF NOT EXISTS "endPhotoUrl" TEXT, ADD COLUMN IF NOT EXISTS "origin" TEXT NOT NULL DEFAULT 'INTERNO';
ALTER TABLE "FleetWorkOrder" ADD COLUMN IF NOT EXISTS "portalToken" TEXT;
CREATE TABLE IF NOT EXISTS "FleetWorkshopReport" ("id" TEXT PRIMARY KEY, "workOrderId" TEXT NOT NULL, "workshopCnpj" TEXT NOT NULL, "workshopName" TEXT NOT NULL, "performed" TEXT NOT NULL, "parts" TEXT, "amount" DECIMAL(18,2), "reading" DECIMAL(14,3), "status" TEXT NOT NULL DEFAULT 'RECEBIDO', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "FleetWorkshopReport_workOrderId_createdAt_idx" ON "FleetWorkshopReport"("workOrderId","createdAt");

-- origem: 20260929000000_frota_oficina_autorizada
-- Sprint V2: vínculo explícito da oficina à OS. Nenhum token legado deve autorizar
-- um prestador sem novo credenciamento e geração de código pelo setor de Frota.
ALTER TABLE "FleetWorkOrder"
  ADD COLUMN IF NOT EXISTS "workshopCnpj" TEXT,
  ADD COLUMN IF NOT EXISTS "workshopName" TEXT;
UPDATE "FleetWorkOrder" SET "portalToken" = NULL
WHERE "portalToken" IS NOT NULL AND ("workshopCnpj" IS NULL OR "workshopName" IS NULL);

-- origem: 20260929010000_frota_portal_rate_limit
-- Rate limiting distribuído dos portais de postos e oficinas.
CREATE TABLE IF NOT EXISTS "FleetPortalRateLimit" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "windowEndsAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "FleetPortalRateLimit_windowEndsAt_idx" ON "FleetPortalRateLimit"("windowEndsAt");

-- origem: 20260929030000_frota_orders_financial
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

-- Termo de Referência de Ibema — itens 1.568 a 1.617
ALTER TABLE "FleetUnit" ADD COLUMN IF NOT EXISTS "species" TEXT, ADD COLUMN IF NOT EXISTS "color" TEXT, ADD COLUMN IF NOT EXISTS "tankCapacity" DECIMAL(10,2), ADD COLUMN IF NOT EXISTS "fipeCode" TEXT, ADD COLUMN IF NOT EXISTS "acquisitionDate" DATE, ADD COLUMN IF NOT EXISTS "machineFields" JSONB;
ALTER TABLE "FleetDriver" ADD COLUMN IF NOT EXISTS "outsourced" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS "cnhPoints" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FleetFine" ADD COLUMN IF NOT EXISTS "city" TEXT, ADD COLUMN IF NOT EXISTS "ctbCode" TEXT, ADD COLUMN IF NOT EXISTS "paidAt" DATE, ADD COLUMN IF NOT EXISTS "paidAmount" DECIMAL(18,2), ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;
ALTER TABLE "FleetOccurrence" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,7), ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10,7);
CREATE TABLE IF NOT EXISTS "FleetBattery" ("id" TEXT PRIMARY KEY, "unitId" TEXT NOT NULL, "identifier" TEXT NOT NULL, "brand" TEXT NOT NULL, "installedAt" DATE NOT NULL, "removedAt" DATE, "cost" DECIMAL(18,2), "notes" TEXT, "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "FleetBattery_unitId_installedAt_idx" ON "FleetBattery"("unitId","installedAt");
CREATE TABLE IF NOT EXISTS "FleetSchedule" ("id" TEXT PRIMARY KEY, "unitId" TEXT NOT NULL, "driverId" TEXT, "departmentId" TEXT, "kind" TEXT NOT NULL, "purpose" TEXT NOT NULL, "destination" TEXT, "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL, "status" TEXT NOT NULL DEFAULT 'AGENDADO', "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "FleetSchedule_unitId_startsAt_idx" ON "FleetSchedule"("unitId","startsAt");
CREATE INDEX IF NOT EXISTS "FleetSchedule_driverId_startsAt_idx" ON "FleetSchedule"("driverId","startsAt");
CREATE TABLE IF NOT EXISTS "FleetGateEvent" ("id" TEXT PRIMARY KEY, "unitId" TEXT NOT NULL, "driverId" TEXT, "kind" TEXT NOT NULL, "reading" DECIMAL(14,3), "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "notes" TEXT, "createdById" TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS "FleetGateEvent_unitId_occurredAt_idx" ON "FleetGateEvent"("unitId","occurredAt");
CREATE TABLE IF NOT EXISTS "FleetDestination" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL UNIQUE, "city" TEXT, "distanceKm" DECIMAL(10,1), "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "FleetCtbInfraction" ("code" TEXT PRIMARY KEY, "description" TEXT NOT NULL, "nature" TEXT NOT NULL, "points" INTEGER NOT NULL, "amount" DECIMAL(18,2) NOT NULL, "article" TEXT);
CREATE TABLE IF NOT EXISTS "FleetFipeModel" ("code" TEXT PRIMARY KEY, "brand" TEXT NOT NULL, "model" TEXT NOT NULL, "yearLabel" TEXT, "reference" TEXT, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "FleetFipeModel_brand_model_idx" ON "FleetFipeModel"("brand","model");
CREATE TABLE IF NOT EXISTS "FleetInsurancePolicy" ("id" TEXT PRIMARY KEY, "unitId" TEXT NOT NULL, "kind" TEXT NOT NULL, "insurer" TEXT NOT NULL, "policyNumber" TEXT NOT NULL, "startsAt" DATE NOT NULL, "endsAt" DATE NOT NULL, "premium" DECIMAL(18,2), "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "FleetInsurancePolicy_unitId_endsAt_idx" ON "FleetInsurancePolicy"("unitId","endsAt");
CREATE TABLE IF NOT EXISTS "FleetServiceAuthorization" ("id" TEXT PRIMARY KEY, "code" TEXT NOT NULL UNIQUE, "unitId" TEXT NOT NULL, "supplierName" TEXT NOT NULL, "supplierCnpj" TEXT, "description" TEXT NOT NULL, "amountLimit" DECIMAL(18,2) NOT NULL, "amountActual" DECIMAL(18,2), "procurementRef" TEXT, "procurementKind" TEXT, "status" TEXT NOT NULL DEFAULT 'EMITIDA', "validUntil" DATE, "expenseId" TEXT UNIQUE, "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "executedAt" TIMESTAMP(3));
CREATE INDEX IF NOT EXISTS "FleetServiceAuthorization_unitId_status_idx" ON "FleetServiceAuthorization"("unitId","status");
CREATE TABLE IF NOT EXISTS "FleetClaim" ("id" TEXT PRIMARY KEY, "occurrenceId" TEXT NOT NULL UNIQUE, "unitId" TEXT NOT NULL, "responsibility" TEXT NOT NULL, "insurer" TEXT, "policyNumber" TEXT, "workshopName" TEXT, "workshopCnpj" TEXT, "parties" JSONB NOT NULL, "status" TEXT NOT NULL DEFAULT 'ABERTO', "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "FleetAttachment" ("id" TEXT PRIMARY KEY, "unitId" TEXT NOT NULL, "ownerType" TEXT NOT NULL DEFAULT 'VEICULO', "ownerId" TEXT, "fileName" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "sizeBytes" INTEGER NOT NULL, "url" TEXT NOT NULL, "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "FleetAttachment_unitId_ownerType_idx" ON "FleetAttachment"("unitId","ownerType");
-- Amostra inicial do catálogo CTB (Res. CONTRAN 918/2022 – valores 2026); carga completa via importação.
INSERT INTO "FleetCtbInfraction" ("code","description","nature","points","amount","article") VALUES
('7455-0','Transitar em velocidade superior à máxima em até 20%','MEDIA',4,130.16,'218, I'),
('7463-0','Transitar em velocidade superior à máxima entre 20% e 50%','GRAVE',5,195.23,'218, II'),
('7471-0','Transitar em velocidade superior à máxima em mais de 50%','GRAVISSIMA',7,880.41,'218, III'),
('5185-1','Deixar o condutor de usar o cinto de segurança','GRAVE',5,195.23,'167'),
('7366-2','Conduzir utilizando-se de telefone celular','GRAVISSIMA',7,293.47,'252, par. único'),
('6050-1','Avançar o sinal vermelho do semáforo','GRAVISSIMA',7,293.47,'208'),
('5010-0','Dirigir sem possuir CNH','GRAVISSIMA',7,880.41,'162, I'),
('5169-0','Dirigir com CNH vencida há mais de 30 dias','GRAVISSIMA',7,293.47,'162, V'),
('6599-2','Estacionar em local proibido pela sinalização','MEDIA',4,130.16,'181, XVIII'),
('6599-1','Conduzir veículo não licenciado','GRAVISSIMA',7,293.47,'230, V')
ON CONFLICT ("code") DO NOTHING;
