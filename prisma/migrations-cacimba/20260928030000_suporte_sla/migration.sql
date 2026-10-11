CREATE TABLE IF NOT EXISTS "SupportRequest" (
  "id" TEXT PRIMARY KEY, "number" TEXT NOT NULL UNIQUE, "module" TEXT NOT NULL, "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL, "subject" TEXT NOT NULL, "description" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'ABERTO',
  "requesterId" TEXT NOT NULL, "requesterName" TEXT NOT NULL, "dueAt" TIMESTAMP(3) NOT NULL, "firstResponseAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3), "solution" TEXT, "messages" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "SupportRequest_status_dueAt_idx" ON "SupportRequest"("status","dueAt");
