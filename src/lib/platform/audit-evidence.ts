import type { Prisma, PrismaClient } from "@prisma/client";

export const auditEventTypes = {
  sessionLogin: "SESSION_LOGIN",
  sessionLogout: "SESSION_LOGOUT",
  documentDownload: "DOCUMENT_DOWNLOAD",
  financialReportExport: "FINANCIAL_REPORT_EXPORT",
  reportIssued: "REPORT_ISSUED",
  pageView: "PAGE_VIEW",
  uiInteraction: "UI_INTERACTION",
  formSubmit: "FORM_SUBMIT",
  instanceConfigurationChanged: "INSTANCE_CONFIGURATION_CHANGED",
  internalNotificationCreated: "INTERNAL_NOTIFICATION_CREATED",
  internalNotificationRead: "INTERNAL_NOTIFICATION_READ",
  personMergeProposed: "PERSON_MERGE_PROPOSED",
  personMergeExecuted: "PERSON_MERGE_EXECUTED",
  personMergeReversed: "PERSON_MERGE_REVERSED",
} as const;

export type AuditEventType = (typeof auditEventTypes)[keyof typeof auditEventTypes];

export type AuditEventInput = {
  actorUsuarioId: string;
  eventType: AuditEventType;
  targetType: string;
  targetId: string;
};

// Deliberately persist only stable identifiers; request bodies, URLs, IPs, and report data are excluded.
export async function writeAuditEvent(prisma: PrismaClient | Prisma.TransactionClient, input: AuditEventInput) {
  await prisma.auditEvent.create({
    data: {
      actorUsuarioId: input.actorUsuarioId,
      eventType: input.eventType,
      targetType: input.targetType,
      targetId: input.targetId,
    },
  });
}
