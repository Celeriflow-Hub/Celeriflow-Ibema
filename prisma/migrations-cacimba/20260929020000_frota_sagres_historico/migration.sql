-- Histórico mensal auditável SAGRES Frota; nenhum status atual é migrado
-- automaticamente para competências históricas.
CREATE TABLE "FleetSagresMonth" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "competence" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
  "revision" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT NOT NULL,
  "certifiedById" TEXT,
  "certifiedAt" TIMESTAMP(3),
  "certificationNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "FleetSagresMonth_competence_key" ON "FleetSagresMonth"("competence");
ALTER TABLE "FleetSagresMonth"
  ADD CONSTRAINT "FleetSagresMonth_competence_check"
  CHECK ("competence" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
ALTER TABLE "FleetSagresMonth"
  ADD CONSTRAINT "FleetSagresMonth_status_check"
  CHECK ("status" IN ('RASCUNHO', 'CERTIFICADO'));
ALTER TABLE "FleetSagresMonth"
  ADD CONSTRAINT "FleetSagresMonth_revision_check"
  CHECK ("revision" >= 0);

CREATE TABLE "FleetSagresMonthUnit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "monthId" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "plate" TEXT,
  "category" TEXT NOT NULL,
  "fuelType" TEXT,
  "departmentId" TEXT,
  "evidenceRef" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FleetSagresMonthUnit_monthId_fkey"
    FOREIGN KEY ("monthId") REFERENCES "FleetSagresMonth"("id") ON DELETE RESTRICT,
  CONSTRAINT "FleetSagresMonthUnit_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "FleetUnit"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "FleetSagresMonthUnit_monthId_unitId_key" ON "FleetSagresMonthUnit"("monthId","unitId");
CREATE INDEX "FleetSagresMonthUnit_unitId_monthId_idx" ON "FleetSagresMonthUnit"("unitId","monthId");

CREATE TABLE "FleetSagresMonthSituation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "monthUnitId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "status" TEXT NOT NULL,
  "evidenceRef" TEXT NOT NULL,
  "recordedById" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FleetSagresMonthSituation_monthUnitId_fkey"
    FOREIGN KEY ("monthUnitId") REFERENCES "FleetSagresMonthUnit"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "FleetSagresMonthSituation_monthUnitId_date_key"
  ON "FleetSagresMonthSituation"("monthUnitId","date");
CREATE INDEX "FleetSagresMonthSituation_date_idx" ON "FleetSagresMonthSituation"("date");
ALTER TABLE "FleetSagresMonthSituation"
  ADD CONSTRAINT "FleetSagresMonthSituation_status_check"
  CHECK ("status" IN ('1','2','3','4'));

CREATE TABLE "FleetSagresMonthRevision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "monthId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "payload" JSONB NOT NULL,
  "sha256" TEXT NOT NULL,
  "certifiedById" TEXT NOT NULL,
  "certificationNote" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FleetSagresMonthRevision_monthId_fkey"
    FOREIGN KEY ("monthId") REFERENCES "FleetSagresMonth"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "FleetSagresMonthRevision_monthId_version_key"
  ON "FleetSagresMonthRevision"("monthId","version");

CREATE TABLE "FleetSagresMonthEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "monthId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "detail" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FleetSagresMonthEvent_monthId_fkey"
    FOREIGN KEY ("monthId") REFERENCES "FleetSagresMonth"("id") ON DELETE RESTRICT
);
CREATE INDEX "FleetSagresMonthEvent_monthId_createdAt_idx"
  ON "FleetSagresMonthEvent"("monthId","createdAt");
