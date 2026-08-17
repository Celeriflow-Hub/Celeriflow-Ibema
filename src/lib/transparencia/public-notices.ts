import type { PrismaClient } from "@prisma/client";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import { createPublicNoticeValidationCode, createRedactedProcessNotice, projectPublicNotice } from "./public-notice-policy";

export async function publishProcessPublicNotice(
  db: PrismaClient,
  actorUsuarioId: string,
  processId: string,
) {
  return db.$transaction(async (tx) => {
    const process = await tx.process.findUnique({
      where: { id: processId },
      select: { id: true, protocolNumber: true, processType: { select: { name: true } } },
    });
    if (!process) throw new Error("Processo nao encontrado.");
    const notice = createRedactedProcessNotice({
      protocolNumber: process.protocolNumber,
      processTypeName: process.processType.name,
    });
    const created = await tx.publicNotice.create({
      data: {
        sourceModule: "PROCESSOS",
        sourceEntityId: process.id,
        ...notice,
        validationCode: createPublicNoticeValidationCode(),
        publishedByUsuarioId: actorUsuarioId,
      },
      select: { id: true },
    });
    await writeAuditEvent(tx, {
      actorUsuarioId,
      eventType: auditEventTypes.publicNoticePublished,
      targetType: "PUBLIC_NOTICE",
      targetId: created.id,
    });
    return created;
  });
}

export async function getPublicNotices(db: PrismaClient) {
  const notices = await db.publicNotice.findMany({
    select: { title: true, category: true, publishedAt: true, validationCode: true },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });
  return notices.map(projectPublicNotice);
}

export async function findPublicNoticeValidation(db: PrismaClient, validationCode: string) {
  const notice = await db.publicNotice.findUnique({
    where: { validationCode },
    select: { title: true, category: true, publishedAt: true, validationCode: true },
  });
  return notice ? projectPublicNotice(notice) : null;
}
