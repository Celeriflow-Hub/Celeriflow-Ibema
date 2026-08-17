import { Bell } from "lucide-react";
import { countUnreadInternalNotifications, listInternalNotifications } from "@/lib/notifications/internal-notifications";
import { resolveNotificationEntities } from "@/lib/notifications/process-entity-resolver";
import { getCurrentTenantContext } from "@/lib/platform/tenant-context";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function InternalNotificationsPage() {
  const { prisma, user } = await getCurrentTenantContext();
  const [notifications, unread] = await Promise.all([
    listInternalNotifications(prisma, user.id),
    countUnreadInternalNotifications(prisma, user.id),
  ]);
  const entities = await resolveNotificationEntities(notifications);
  const items = notifications.map((notification) => ({ ...notification, entity: entities.get(notification.id) ?? null }));

  return <div className="mx-auto w-full max-w-5xl space-y-6">
    <div><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Bell className="h-6 w-6 text-emerald-600" />Notificações internas</h1><p className="mt-1 text-sm text-slate-500">Seu histórico pessoal de avisos internos. {unread ? `${unread} não lida(s).` : "Nenhuma pendência de leitura."}</p></div>
    <NotificationsClient initialNotifications={items} />
  </div>;
}
