CREATE TABLE IF NOT EXISTS "EmployeePortalRequest" ("id" TEXT NOT NULL, "employeeId" TEXT NOT NULL, "kind" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDENTE', "payload" JSONB NOT NULL, "justification" TEXT, "decisionNote" TEXT, "decidedBy" TEXT, "decidedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "EmployeePortalRequest_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "EmployeePortalRequest_employeeId_createdAt_idx" ON "EmployeePortalRequest"("employeeId", "createdAt");
CREATE INDEX IF NOT EXISTS "EmployeePortalRequest_status_idx" ON "EmployeePortalRequest"("status");
CREATE TABLE IF NOT EXISTS "EmployeeDocumentIssue" ("id" TEXT NOT NULL, "code" TEXT NOT NULL, "kind" TEXT NOT NULL, "employeeId" TEXT NOT NULL, "reference" TEXT NOT NULL, "hashSha256" TEXT NOT NULL, "summary" JSONB NOT NULL, "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "EmployeeDocumentIssue_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeDocumentIssue_code_key" ON "EmployeeDocumentIssue"("code");
CREATE INDEX IF NOT EXISTS "EmployeeDocumentIssue_employeeId_kind_reference_idx" ON "EmployeeDocumentIssue"("employeeId", "kind", "reference");
INSERT INTO "ConfiguracaoPerfil" ("id","codigo","nome","descricao","permissoes","ativo","createdAt","updatedAt")
SELECT 'celeriflow-perfil-servidor-portal','SERVIDOR_PORTAL','Servidor — Portal','Acesso exclusivo ao Portal do Servidor (autosserviço).','{"modules":{}}',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "ConfiguracaoPerfil" WHERE "codigo"='SERVIDOR_PORTAL');
