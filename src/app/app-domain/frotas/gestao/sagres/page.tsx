import Link from "next/link";
import { AccessError, getTenantContextForModule, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { readFleetHistoryMonth } from "@/lib/integrations/sagres/frota-history";
import { previewFleetSagresMonth, readCertifiedFleetSagresMonth } from "@/lib/integrations/sagres/frota-history-certify";
import { reconcileFleetMonth } from "@/lib/integrations/sagres/frota-reconciliation-db";
import * as actions from "./actions";

export const dynamic = "force-dynamic";
const inp = "rounded-md border border-slate-300 bg-white p-2 text-sm dark:bg-slate-900";
const btn = "rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white";
const danger = "rounded-md border border-red-300 px-2 py-1 text-xs text-red-700";

export default async function FrotaSagresHistoryPage({
  searchParams,
}: { searchParams: Promise<{ mes?: string; erro?: string; ok?: string }> }) {
  const ctx = await getTenantContextForModule("FROTAS");
  if (!isSystemAdministrator(ctx.user)) throw new AccessError("Somente o administrador pode gerenciar o histórico municipal SAGRES.", 403);
  const sp = await searchParams, today = new Date();
  const fallback = today.getUTCFullYear() + "-" + String(today.getUTCMonth() + 1).padStart(2, "0");
  const competence = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.mes ?? "") ? sp.mes! : fallback;
  const [history, months, units, departments] = await Promise.all([
    readFleetHistoryMonth(ctx.prisma, competence),
    ctx.prisma.fleetSagresMonth.findMany({ orderBy: { competence: "desc" }, take: 24, select: { competence: true, status: true, revision: true } }),
    ctx.prisma.fleetUnit.findMany({ select: { id: true, code: true, name: true, plate: true, status: true }, orderBy: { code: "asc" }, take: 1000 }),
    ctx.prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const isDraft = history?.status === "RASCUNHO";
  const preview = history && isDraft ? await previewFleetSagresMonth(ctx.prisma, competence) : null;
  const certified = history?.status === "CERTIFICADO"
    ? await readCertifiedFleetSagresMonth(ctx.prisma, competence).catch(() => null) : null;
  const reconciliation = history
    ? await reconcileFleetMonth(ctx.prisma, competence, history.status === "CERTIFICADO").catch(() => null)
    : null;
  const firstDate = competence + "-01";
  const hidden = <input type="hidden" name="competence" value={competence} />;

  return <main className="flex flex-col gap-4 overflow-auto bg-slate-50 p-4 text-sm dark:bg-slate-950">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-bold">Frota — histórico mensal SAGRES</h1>
        <p className="text-slate-600">Rascunhos documentados, mudanças de situação, certificação e revisões preservadas.</p></div>
      <Link href="/frotas/gestao" className="underline">Voltar à Gestão de Frota</Link>
    </header>
    {sp.erro && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800">{sp.erro}</p>}
    {sp.ok && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">Operação registrada.</p>}
    <section className="rounded-md border bg-white p-4 dark:bg-slate-900">
      <form method="GET" className="flex flex-wrap items-end gap-2">
        <label>Competência <input type="month" name="mes" defaultValue={competence} className={inp} required /></label>
        <button className={btn}>Consultar</button>
      </form>
      <nav className="mt-2 flex flex-wrap gap-2" aria-label="Competências recentes">
        {months.map(m => <Link key={m.competence} className="rounded-md border px-2 py-1" href={"?mes=" + m.competence}>
          {m.competence} · {m.status} (v{m.revision})
        </Link>)}
      </nav>
      {!history && <form action={actions.openMonth} className="mt-4 flex flex-wrap items-center gap-2">
        {hidden}<button className={btn}>Abrir rascunho desta competência</button>
        <span className="text-slate-500">Nenhum dado histórico será preenchido automaticamente.</span>
      </form>}
      {history && <p className="mt-3"><b>{history.status}</b> · versão certificada {history.revision}
        {history.certifiedAt && <> · certificação em {history.certifiedAt.toLocaleString("pt-BR")}</>}
      </p>}
    </section>
    {isDraft && <>
      <section className="rounded-md border bg-white p-4 dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">Incluir veículo ou máquina com comprovação</h2>
        <p className="mb-3 text-slate-500">Informe a identidade histórica da competência. Não presuma que placa, combustível ou setor atuais sejam iguais aos daquela época.</p>
        <form action={actions.addUnit} className="flex flex-wrap items-end gap-2">
          {hidden}
          <label>Cadastro vinculado<select name="unitId" className={inp} required>{units.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}{u.status !== "ATIVO" ? " (atualmente inativo)" : ""}</option>)}</select></label>
          <label>Código histórico<input name="code" className={inp} required maxLength={40} /></label>
          <label>Placa histórica<input name="plate" className={inp} maxLength={12} /></label>
          <label>Categoria<select name="category" className={inp}><option value="VEICULO">Veículo</option><option value="MAQUINA">Máquina</option></select></label>
          <label>Combustível histórico<input name="fuelType" className={inp} required maxLength={60} /></label>
          <label>Setor histórico<select name="departmentId" className={inp}><option value="">Sem setor</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <label>Referência documental<input name="evidenceRef" className={inp} required maxLength={250} placeholder="Processo, portaria, inventário..." /></label>
          <button className={btn}>Incluir no mês</button>
        </form>
      </section>
      <section className="rounded-md border bg-white p-4 dark:bg-slate-900">
        <h2 className="font-semibold">Situações documentadas</h2>
        <p className="mb-3 text-slate-500">Registre uma situação em {firstDate} para cada veículo e as mudanças posteriores. Códigos preliminares; sujeitos à confirmação oficial no TCE-PB.</p>
        {history?.units.map(u => <div key={u.id} className="my-3 space-y-2 border-t pt-3">
          <p><b>{u.code}</b> · {u.plate ?? "sem placa"} · {u.category} · comprovação: {u.evidenceRef}</p>
          <form action={actions.recordSituation} className="flex flex-wrap items-end gap-2">
            {hidden}<input type="hidden" name="unitId" value={u.unitId} />
            <label>Data <input type="date" name="date" defaultValue={u.situations.length ? "" : firstDate} min={firstDate}
              max={new Date(Date.UTC(Number(competence.slice(0, 4)), Number(competence.slice(5, 7)), 0)).toISOString().slice(0, 10)}
              className={inp} required /></label>
            <label>Situação<select name="status" className={inp}><option value="1">1 · Em uso</option><option value="2">2 · Em manutenção</option><option value="3">3 · Baixa definitiva</option><option value="4">4 · Baixa temporária</option></select></label>
            <label>Comprovação<input name="evidenceRef" required maxLength={250} className={inp} /></label>
            <button className={btn}>Registrar/corrigir</button>
          </form>
          <div className="flex flex-wrap gap-2">{u.situations.map(s => <form key={s.id} action={actions.removeSituation} className="flex items-center gap-2 rounded-md border p-2">
            {hidden}<input type="hidden" name="unitId" value={u.unitId} /><input type="hidden" name="date" value={s.date.toISOString().slice(0, 10)} />
            <span>{s.date.toISOString().slice(0, 10)} · {s.status} · {s.evidenceRef}</span>
            <input name="reason" className={inp} placeholder="Justificativa para excluir" required maxLength={250} />
            <button className={danger}>Remover situação</button>
          </form>)}</div>
          <form action={actions.removeUnit} className="flex flex-wrap items-center gap-2">
            {hidden}<input type="hidden" name="unitId" value={u.unitId} />
            <input name="reason" required maxLength={250} className={inp} placeholder="Motivo da retirada do mês" />
            <button className={danger}>Retirar veículo do rascunho</button>
          </form>
        </div>)}
      </section>
      <section className="rounded-md border bg-white p-4 dark:bg-slate-900">
        <h2 className="font-semibold">Conferência antes da certificação</h2>
        {preview?.ready
          ? <p className="mt-2 text-emerald-700">Validação interna aprovada: {preview.payload?.situation.elementos.length} situações e {preview.payload?.fuel.elementos.length} registros agregados de combustível.</p>
          : <div className="mt-2"><p className="text-amber-800">Pendências que impedem a certificação:</p>
            <ul className="list-inside list-disc">{preview?.issues.map((issue, i) => <li key={i}>{issue.unitId && issue.unitId + ": "}{issue.message}</li>)}</ul></div>}
        <div className="mt-3 rounded-md border p-3">
          <h3 className="font-semibold">Conciliação operacional da competência</h3>
          {!reconciliation && <p className="text-red-700">Conciliação indisponível. Não certifique antes de verificar os lançamentos.</p>}
          {reconciliation && <p className={reconciliation.balanced ? "text-emerald-700" : "text-amber-800"}>
            {reconciliation.balanced ? "Ordens, abastecimentos e despesas conciliados." :
              reconciliation.issues.length + " pendência(s) financeira(s) ou documental(is) encontrada(s)."}
            {" "}{reconciliation.totals.records} registro(s) de combustível, {reconciliation.totals.liters} L,
            custo conhecido de R$ {reconciliation.totals.fuelCostKnown.toFixed(2)}.
          </p>}
          {!!reconciliation?.totals.costUnknown && <p className="text-amber-700">
            {reconciliation.totals.costUnknown} registro(s) sem custo informado: avaliar os dados antes de publicar totais financeiros.
          </p>}
          {!!reconciliation?.issues.length && <ul className="mt-2 list-inside list-disc text-amber-800">
            {reconciliation.issues.slice(0, 30).map((issue, i) =>
              <li key={i}>{issue.reference}: {issue.message}</li>)}
          </ul>}
        </div>
        <form action={actions.certifyMonth} className="mt-3 flex flex-wrap items-end gap-2">
          {hidden}<label>Termo/justificativa<input name="note" className={inp} required maxLength={1000} placeholder="Declaro conferido conforme..." /></label>
          <button disabled={!preview?.ready || !reconciliation?.balanced} className={btn}>Certificar e bloquear competência</button>
        </form>
      </section>
    </>}
    {history?.status === "CERTIFICADO" && <section className="rounded-md border bg-white p-4 dark:bg-slate-900">
      <h2 className="font-semibold">Versões certificadas preservadas</h2>
      {reconciliation && <p className={reconciliation.balanced ? "mt-2 text-emerald-700" : "mt-2 text-red-700"}>
        {reconciliation.balanced ? "Dados operacionais atuais conferem com os registros certificados." :
          "O extrato operacional apresenta divergências em relação à certificação; avalie uma retificação."}
      </p>}
      {!reconciliation && <p className="mt-2 text-red-700">Conciliação da certificação indisponível.</p>}
      {!!reconciliation?.issues.length && <ul className="mt-2 list-inside list-disc text-red-700">
        {reconciliation.issues.slice(0, 30).map((issue, i) =>
          <li key={i}>{issue.reference}: {issue.message}</li>)}
      </ul>}

      {!certified && <p className="text-red-700">Não foi possível verificar o hash da revisão atual. Suspenda qualquer remessa.</p>}
      {history.revisions.map(rev => <p key={rev.id} className="mt-2 font-mono text-xs">v{rev.version} · {rev.createdAt.toLocaleString("pt-BR")} · SHA-256 {rev.sha256}</p>)}
      <form action={actions.reopenMonth} className="mt-4 flex flex-wrap items-end gap-2">
        {hidden}<label>Justificativa da retificação<input name="reason" required maxLength={1000} className={inp} /></label>
        <button className={danger}>Reabrir preservando versões anteriores</button>
      </form>
    </section>}
    {history && <section className="rounded-md border bg-white p-4 dark:bg-slate-900">
      <h2 className="font-semibold">Trilha de auditoria</h2>
      <ul className="mt-2 space-y-1">{history.events.map(e => <li key={e.id} className="border-b py-1">
        {e.createdAt.toLocaleString("pt-BR")} · {e.action} · operador {e.actorId}
      </li>)}</ul>
    </section>}
  </main>;
}
