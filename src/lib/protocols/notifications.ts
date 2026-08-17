import type { Prisma } from "@prisma/client";
import { createInternalNotifications, type InternalNotificationPriority } from "@/lib/notifications/internal-notifications";

type NotificationInput = {
  processId: string;
  type: string;
  title: string;
  message: string;
  priority?: InternalNotificationPriority;
  dedupeDiscriminator: string;
};

export async function notifyProtocolDepartment(
  tx: Prisma.TransactionClient,
  actorUsuarioId: string,
  departmentId: string,
  notification: NotificationInput,
) {
  const recipients = await tx.usuario.findMany({
    where: { ativo: true, employee: { is: { isActive: true, departmentId } } },
    select: { id: true },
  });
  if (!recipients.length) return { created: 0 };

  return createInternalNotifications(tx, {
    actorUsuarioId,
    recipientUserIds: recipients.map((recipient) => recipient.id),
    sourceModule: "PROCESSOS",
    entityType: "PROCESS",
    entityId: notification.processId,
    ...notification,
  });
}

export async function notifyProtocolUsers(
  tx: Prisma.TransactionClient,
  actorUsuarioId: string,
  userIds: string[],
  notification: NotificationInput,
) {
  const recipients = [...new Set(userIds)].filter(Boolean);
  if (!recipients.length) return { created: 0 };

  return createInternalNotifications(tx, {
    actorUsuarioId,
    recipientUserIds: recipients,
    sourceModule: "PROCESSOS",
    entityType: "PROCESS",
    entityId: notification.processId,
    ...notification,
  });
}
