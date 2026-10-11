CREATE TABLE "SagresRemessa" (
    "id" TEXT NOT NULL,
    "layoutCode" TEXT NOT NULL,
    "layoutVersion" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "managementUnit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GERADA',
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "fileName" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "protocol" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SagresRemessa_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SagresRemessa_layoutCode_competence_managementUnit_idx" ON "SagresRemessa"("layoutCode", "competence", "managementUnit");
