import { Activity, FileText, MousePointerClick, Users } from "lucide-react";
import { getTenantContextForSystemAdministration } from "@/lib/platform/tenant-context";
import { auditEventTypes } from "@/lib/platform/audit-evidence";
import { createAuditEventSearchParams, parseAuditEventQuery } from "@/lib/platform/audit-query";
import { getAuditEventPage } from "@/lib/platform/audit-query-service";

export const dynamic = "force-dynamic";

const eventLabels: Record<string, string> = {
  SESSION_LOGIN: "Iniciou sessão",
  SESSION_LOGOUT: "Encerrou sessão",
  DOCUMENT_DOWNLOAD: "Baixou documento",
  FINANCIAL_REPORT_EXPORT: "Exportou relatório financeiro",
  REPORT_ISSUED: "Emitiu relatório",
  PAGE_VIEW: "Visualizou página",
  UI_INTERACTION: "Interagiu com controle",
  FORM_SUBMIT: "Enviou formulário",
  INSTANCE_CONFIGURATION_CHANGED: "Alterou parâmetro da instância",
};

function describeTarget(event: { eventType: string; targetType: string; targetId: string }) {
  if (event.targetType === "PAGE") return event.targetId;
  if (event.targetType === "CONTROL") {
    const [path, control] = event.targetId.split("|");
    return `${control === "link" ? "Link" : "Controle"} em ${path}`;
  }
  if (event.targetType === "FORM") return `Formulário em ${event.targetId}`;
  if (event.targetType === "SESSION") return "Sessão autenticada";
  if (event.targetType === "DOCUMENT") return "Documento protegido";
  if (event.targetType === "FINANCIAL_REPORT") return "Relatório financeiro";
  if (event.targetType === "INSTANCE_CONFIGURATION") return "Parâmetro operacional da instância";
  return event.targetType;
}

function getLast24Hours() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

export default async function AuditUsagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { prisma } = await getTenantContextForSystemAdministration();
  const auditQuery = parseAuditEventQuery(await searchParams);
  const last24Hours = getLast24Hours();

  const [eventPage, totalEvents, eventsLast24Hours, activeUsers] = await Promise.all([
    getAuditEventPage(prisma, auditQuery),
    prisma.auditEvent.count(),
    prisma.auditEvent.count({ where: { createdAt: { gte: last24Hours } } }),
    prisma.auditEvent.groupBy({
      by: ["actorUsuarioId"],
      where: { createdAt: { gte: last24Hours } },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  });

  return (
    <div className="flex-1 p-5 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-3 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Auditoria de uso</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Histórico imutável de acessos e interações realizadas no CeleriFlow.
            </p>
          </div>
        </div>
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          Exibindo até 50 registros por página
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400"><Activity className="h-5 w-5" /><span className="text-sm font-medium">Eventos registrados</span></div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{totalEvents}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400"><MousePointerClick className="h-5 w-5" /><span className="text-sm font-medium">Últimas 24 horas</span></div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{eventsLast24Hours}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400"><Users className="h-5 w-5" /><span className="text-sm font-medium">Usuários ativos</span></div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{activeUsers.length}</p>
        </div>
      </div>

      <form method="get" className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-700 dark:bg-slate-800">
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">ID do usuário</span>
          <input name="actorUsuarioId" defaultValue={auditQuery.filters.actorUsuarioId} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        </label>
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">Ação</span>
          <select name="eventType" defaultValue={auditQuery.filters.eventType ?? ""} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
            <option value="">Todas as ações</option>
            {Object.values(auditEventTypes).map((eventType) => <option key={eventType} value={eventType}>{eventLabels[eventType]}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">Tipo de destino</span>
          <input name="targetType" defaultValue={auditQuery.filters.targetType} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        </label>
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">ID do destino</span>
          <input name="targetId" defaultValue={auditQuery.filters.targetId} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        </label>
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">A partir de</span>
          <input name="from" type="date" defaultValue={auditQuery.filters.from} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        </label>
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">Até</span>
          <input name="to" type="date" defaultValue={auditQuery.filters.to} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        </label>
        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">Filtrar</button>
          <a href="/configuracoes/auditoria" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Limpar</a>
        </div>
      </form>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Histórico recente</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Não são armazenados valores de campos, parâmetros de URL, IP ou user-agent.</p>
        </div>
        {eventPage.events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center text-slate-500 dark:text-slate-400">
            <FileText className="h-8 w-8" />
            <p className="text-sm">Ainda não há eventos de auditoria registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/30 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Data e hora</th>
                  <th className="px-5 py-3 font-semibold">Usuário</th>
                  <th className="px-5 py-3 font-semibold">Ação</th>
                  <th className="px-5 py-3 font-semibold">Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {eventPage.events.map((event) => (
                  <tr key={event.id} className="text-slate-700 dark:text-slate-300">
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{dateFormatter.format(event.createdAt)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{event.actorUsuario.nome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{event.actorUsuario.email} · {event.actorUsuario.perfil.nome}</p>
                    </td>
                    <td className="px-5 py-3">{eventLabels[event.eventType] ?? event.eventType}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{describeTarget(event)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(eventPage.previousCursor || eventPage.nextCursor) && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 dark:border-slate-700">
            {eventPage.previousCursor ? (
              <a href={`/configuracoes/auditoria?${createAuditEventSearchParams(auditQuery.filters, { cursor: eventPage.previousCursor, direction: "previous" })}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Anterior</a>
            ) : <span />}
            {eventPage.nextCursor ? (
              <a href={`/configuracoes/auditoria?${createAuditEventSearchParams(auditQuery.filters, { cursor: eventPage.nextCursor })}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Próxima</a>
            ) : <span />}
          </div>
        )}
      </section>
    </div>
  );
}
