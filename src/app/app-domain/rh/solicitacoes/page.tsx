import { Inbox } from "lucide-react";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PORTAL_REQUEST_KINDS, PORTAL_REQUEST_STATUS, type PortalRequestKind } from "@/lib/portal-servidor/documents";
import { decidePortalRequest } from "./actions";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = { start: "Início", end: "Fim", days: "Dias", leaveType: "Tipo", email: "E-mail", phone: "Telefone", bankCode: "Banco", bankAgency: "Agência", bankAccount: "Conta" };

export default async function RhSolicitacoesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { prisma } = await getTenantContextForModule("RH");
  const { status = "PENDENTE" } = await searchParams;
  const requests = await prisma.employeePortalRequest.findMany({ where: status === "TODAS" ? {} : { status }, orderBy: { createdAt: "asc" }, take: 100 });
  const employees = await prisma.employee.findMany({ where: { id: { in: requests.map((r) => r.employeeId) } }, select: { id: true, name: true, registration: true } });
  const byId = new Map(employees.map((e) => [e.id, e]));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-slate-50 p-3 dark:bg-slate-950">
      <ErpPageTitle title="Solicitações do Portal do Servidor" icon={<Inbox className="size-4 text-violet-600" />} />
      <nav className="flex gap-2 text-xs">
        {["PENDENTE", "APROVADA", "INDEFERIDA", "TODAS"].map((s) => (
          <a key={s} href={`?status=${s}`} className={`rounded-md border px-3 py-1 ${s === status ? "border-violet-600 bg-violet-50 font-semibold text-violet-800" : "bg-white"}`}>{s === "TODAS" ? "Todas" : PORTAL_REQUEST_STATUS[s]}</a>
        ))}
      </nav>
      {!requests.length ? <p className="rounded-md border bg-white p-3 text-sm text-slate-500">Nenhuma solicitação nesta situação.</p> : requests.map((r) => {
        const e = byId.get(r.employeeId);
        const p = r.payload as Record<string, string>;
        return (
          <section key={r.id} className="rounded-md border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="text-sm font-semibold">{PORTAL_REQUEST_KINDS[r.kind as PortalRequestKind] ?? r.kind} — {e?.name ?? "Servidor"} <span className="font-normal text-slate-500">(mat. {e?.registration ?? "—"})</span></p>
              <span className="text-slate-500">{r.createdAt.toLocaleString("pt-BR")} · {PORTAL_REQUEST_STATUS[r.status] ?? r.status}</span>
            </div>
            <p className="mt-1 text-slate-700">{Object.entries(p).map(([k, v]) => `${labels[k] ?? k}: ${v}`).join(" · ")}</p>
            {r.justification && <p className="mt-1 text-slate-500">Observação: {r.justification}</p>}
            {r.decisionNote && <p className="mt-1 text-slate-500">Parecer: {r.decisionNote}</p>}
            {r.status === "PENDENTE" && (
              <form action={decidePortalRequest} className="mt-2 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={r.id} />
                <input name="note" placeholder="Parecer (obrigatório para indeferir)" className="h-8 min-w-60 flex-1 rounded-md border px-2" />
                <button name="decision" value="APROVADA" className="h-8 rounded-md bg-emerald-700 px-3 font-semibold text-white">Aprovar</button>
                <button name="decision" value="INDEFERIDA" className="h-8 rounded-md border border-red-300 px-3 font-semibold text-red-700">Indeferir</button>
              </form>
            )}
          </section>
        );
      })}
    </div>
  );
}
