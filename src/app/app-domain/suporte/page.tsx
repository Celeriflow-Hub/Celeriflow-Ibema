import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { getCurrentTenantContext, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { severityInfo, slaState, type SupportSeverity } from "@/lib/platform/support-sla";
import { openSupportRequest, replySupportRequest } from "./actions";

export const dynamic = "force-dynamic";

const slaBadge = { VENCIDO: "bg-red-100 text-red-800", VENCENDO: "bg-amber-100 text-amber-800", NO_PRAZO: "bg-emerald-100 text-emerald-800", ENCERRADO: "bg-slate-100 text-slate-600" };
const slaText = { VENCIDO: "Prazo vencido", VENCENDO: "Vence em breve", NO_PRAZO: "No prazo", ENCERRADO: "Encerrado" };
const dt = (d: Date) => d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
type Msg = { at: string; by: string; support: boolean; text: string };

export default async function SuportePage() {
  const { prisma, user } = await getCurrentTenantContext();
  const admin = isSystemAdministrator(user);
  const list = await prisma.supportRequest.findMany({ where: admin ? {} : { requesterId: user.id }, orderBy: [{ status: "asc" }, { dueAt: "asc" }], take: 100 });
  const closed = list.filter((r) => r.resolvedAt);
  const onTime = closed.filter((r) => r.resolvedAt! <= r.dueAt).length;
  const input = "mt-1 w-full rounded border px-2 py-1.5 text-sm";
  return (
    <PageFrame className="space-y-3">
      <PageHeader title="Central de Suporte" />
      <section className="grid gap-2 sm:grid-cols-4">
        {(Object.keys(severityInfo) as SupportSeverity[]).map((s) => <div key={s} className="rounded border bg-white p-3 text-sm"><b>{severityInfo[s].label}</b><p className="text-slate-600">Prazo: {severityInfo[s].prazo}</p></div>)}
      </section>
      <p className="text-sm text-slate-600">Abertos: <b>{list.filter((r) => !r.resolvedAt && r.status !== "CANCELADO").length}</b> · Resolvidos no prazo: <b>{closed.length ? Math.round((onTime / closed.length) * 100) : 100}%</b></p>
      <form action={openSupportRequest} className="grid gap-2 rounded border bg-white p-3 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">Abrir chamado</h2>
        <label className="text-sm">Sistema<select name="module" className={input}>{["Gestão Tributária", "Portal do Contribuinte", "Folha de Pagamento", "Portal do Servidor", "Gestão de Frota", "Portal da Frota", "Farmácia", "SAGRES", "Geral"].map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="text-sm">Tipo<select name="category" className={input}><option value="DUVIDA">Dúvida</option><option value="ERRO">Erro</option><option value="MELHORIA">Pedido de melhoria</option><option value="INDISPONIBILIDADE">Sistema fora do ar</option></select></label>
        <label className="text-sm">Prioridade<select name="severity" className={input}><option value="">Classificar automaticamente</option>{(Object.keys(severityInfo) as SupportSeverity[]).map((s) => <option key={s} value={s}>{severityInfo[s].label}</option>)}</select></label>
        <label className="flex items-end gap-2 text-sm"><input type="checkbox" name="blocks" />O problema impede o trabalho</label>
        <label className="text-sm sm:col-span-2">Assunto<input name="subject" required maxLength={150} className={input} /></label>
        <label className="text-sm sm:col-span-2">Descrição<textarea name="description" required maxLength={4000} rows={3} className={input} /></label>
        <button className="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white sm:col-span-2 sm:justify-self-start">Enviar chamado</button>
      </form>
      <section className="space-y-2">
        {list.length === 0 && <p className="text-sm text-slate-500">Nenhum chamado.</p>}
        {list.map((r) => { const st = slaState(r.dueAt, r.status); return (
          <details key={r.id} className="rounded border bg-white p-3 text-sm">
            <summary className="flex cursor-pointer flex-wrap items-center gap-2"><span className="font-mono">{r.number}</span><b>{r.subject}</b><span className="text-slate-500">{r.module} · {severityInfo[r.severity as SupportSeverity]?.label} · {r.status}</span><span className={`rounded px-2 py-0.5 text-xs ${slaBadge[st]}`}>{slaText[st]} · até {dt(r.dueAt)}</span></summary>
            <p className="mt-2 whitespace-pre-wrap">{r.description}</p>
            <p className="text-xs text-slate-500">Aberto por {r.requesterName} em {dt(r.createdAt)}</p>
            <ul className="mt-2 space-y-1">{((r.messages as Msg[]) ?? []).map((m, i) => <li key={i} className={`rounded p-2 ${m.support ? "bg-emerald-50" : "bg-slate-50"}`}><b>{m.by}</b> <span className="text-xs text-slate-500">{dt(new Date(m.at))}</span><p className="whitespace-pre-wrap">{m.text}</p></li>)}</ul>
            {r.status !== "RESOLVIDO" && r.status !== "CANCELADO" && (
              <form action={replySupportRequest} className="mt-2 flex flex-wrap gap-2"><input type="hidden" name="id" value={r.id} /><input name="message" placeholder="Escreva uma mensagem" className="min-w-60 flex-1 rounded border px-2 py-1.5" />
                {admin && <select name="status" className="rounded border px-2"><option value="">Manter situação</option><option value="EM_ATENDIMENTO">Em atendimento</option><option value="RESOLVIDO">Resolvido</option><option value="CANCELADO">Cancelado</option></select>}
                <button className="rounded border px-3 py-1.5">Enviar</button></form>)}
          </details>); })}
      </section>
    </PageFrame>
  );
}
