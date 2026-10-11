-- Sprint V2: vínculo explícito da oficina à OS. Nenhum token legado deve autorizar
-- um prestador sem novo credenciamento e geração de código pelo setor de Frota.
ALTER TABLE "FleetWorkOrder"
  ADD COLUMN IF NOT EXISTS "workshopCnpj" TEXT,
  ADD COLUMN IF NOT EXISTS "workshopName" TEXT;
UPDATE "FleetWorkOrder" SET "portalToken" = NULL
WHERE "portalToken" IS NOT NULL AND ("workshopCnpj" IS NULL OR "workshopName" IS NULL);
