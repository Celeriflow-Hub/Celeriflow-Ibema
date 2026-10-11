import { Inbox } from "lucide-react";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { PORTAL_REQUEST_KINDS, PORTAL_REQUEST_STATUS, type PortalRequestKind } from "@/lib/portal-servidor/documents";
import { CancelButton, RequestForm } from "./RequestForm";

export const dynamic = "force-dynamic";

const statusClass: Record<string, string> = { PENDENTE: "bg-amber-50 text-amber-800", APROVADA: "bg-emerald-50 text-emerald-800", INDEFERIDA: "bg-red-50 text-red-700", CANCELADA: "bg-slate-100 text-slate-600" };

function describe(payload: unknown) {
  const p = (payload ?? {}) as Record<string, string | number>;
  const fmt = (d: unknown) => (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.split("-").reverse().join("/") : String(d));
  if (p.days) return `${p.days} dias a partir de ${fmt(p.start)}`;
  if (p.leaveType) return `${p.leaveType}: ${fmt(p.start)} a ${fmt(p.end)}`;
  return Object.keys(p).map((k) => ({ email: "e-mail", phone: "telefone", bankCode: "banco", bankAgency: "agência", bankAccount: "conta" })[k] ?? k).join(", ");
}

export default async function SolicitacoesPage() {
  const access = await getEmployeePortalAccess();
  const title = <ErpPageTitle title="Minhas solicitações" description="Férias, licenças e atualização cadastral com análise do RH" icon={<Inbox className="size-5 text-emerald-700" />} />;
  if (access.status !== "AVAILABLE") return <div className="flex flex-1 flex-col">{title}<p className="m-3 border bg-white p-4 text-sm text-slate-600">Seu usuário ainda não possui vínculo funcional ativo.</p></div>;
  const requests = await access.context.prisma.employeePortalRequest.findMany({ where: { employeeId: access.employee.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      {title}
      <div className="grid gap-3 p-3 lg:grid-cols-[320px_1fr]">
        <RequestForm />
        <section className="border border-slate-300 bg-white shadow-sm">
          <h2 className="border-b px-3 py-2 text-sm font-semibold text-slate-900">Histórico</h2>
          {!requests.length ? <p className="p-3 text-xs text-slate-500">Nenhuma solicitação registrada.</p> : (
            <ul className="divide-y">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{PORTAL_REQUEST_KINDS[r.kind as PortalRequestKind] ?? r.kind}</p>
                    <p className="text-[11px] text-slate-600">{describe(r.payload)}</p>
                    <p className="text-[10px] text-slate-500">Enviada em {r.createdAt.toLocaleDateString("pt-BR")}{r.decisionNote ? ` · Parecer do RH: ${r.decisionNote}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${statusClass[r.status] ?? ""}`}>{PORTAL_REQUEST_STATUS[r.status] ?? r.status}</span>
                    {r.status === "PENDENTE" && <CancelButton id={r.id} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
