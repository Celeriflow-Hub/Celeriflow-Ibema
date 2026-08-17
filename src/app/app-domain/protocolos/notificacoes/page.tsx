import { Bell } from "lucide-react";
import { getProtocolContext } from "@/lib/protocols/access";
import { listInternalNotifications } from "@/lib/notifications/internal-notifications";
import { resolveNotificationEntities } from "@/lib/notifications/process-entity-resolver";
import NotificationsClient from "@/app/app-domain/notificacoes/NotificationsClient";

export const dynamic = "force-dynamic";

export default async function ProtocolNotificationsPage() {
  const { prisma, user } = await getProtocolContext();
  const notifications = await listInternalNotifications(prisma, user.id, { sourceModule: "PROCESSOS" });
  const entities = await resolveNotificationEntities(notifications);
  const items = notifications.map((notification) => ({ ...notification, entity: entities.get(notification.id) ?? null }));

  return <div className="max-w-5xl space-y-6">
    <div><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Bell className="h-6 w-6 text-emerald-600" />Notificações internas</h1><p className="mt-1 text-sm text-slate-500">Recebimentos, encaminhamentos e prazos dos seus processos.</p></div>
    <NotificationsClient initialNotifications={items} />
  </div>;
}
