"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Plus, Search, Truck, X } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { categories, labels, type FleetArea, type FleetQuery } from "@/lib/frotas/contract";
import type { FleetList, FleetRow } from "@/lib/frotas/queries";
import { FleetEditor, type Editor } from "./FleetEditor";
import { fieldClass, ReferencePicker } from "./ReferencePicker";
import { mutateFleetAction } from "./actions";

const groups: { title: string; items: { area: FleetArea; title: string }[] }[] = [
  { title: "Frota", items: [{ area: "frota", title: "Cadastro da frota" }] },
  { title: "Utilização e rotas", items: [{ area: "utilizacao", title: "Histórico de utilização" }, { area: "rotas", title: "Rotas" }] },
  { title: "Manutenção", items: [{ area: "planos", title: "Planos" }, { area: "ordens", title: "Ordens de serviço" }, { area: "manutencoes", title: "Manutenções efetuadas" }] },
  { title: "Consumos e gastos", items: [{ area: "consumos", title: "Abastecimentos e lubrificantes" }, { area: "gastos", title: "Gastos realizados" }] },
  { title: "Documentos e ocorrências", items: [{ area: "seguros", title: "Seguros" }, { area: "obrigacoes", title: "Obrigações" }, { area: "documentos", title: "Documentos e vencimentos" }, { area: "ocorrencias", title: "Ocorrências" }] },
  { title: "Relatórios", items: [{ area: "relatorios", title: "Emissões" }] },
];
const creation: Partial<Record<FleetArea, { title: string; kind: Editor["kind"]; initial?: Record<string, string> }>> = {
  frota: { title: "Nova unidade da frota", kind: "unit" }, rotas: { title: "Nova rota", kind: "route" }, utilizacao: { title: "Registrar utilização", kind: "usage" }, planos: { title: "Programar plano", kind: "plan" }, consumos: { title: "Registrar consumo", kind: "consumption" }, gastos: { title: "Registrar outro gasto", kind: "expense" }, seguros: { title: "Registrar seguro", kind: "document", initial: { kind: "SEGURO", type: "SEGURO" } }, obrigacoes: { title: "Agendar obrigação", kind: "document", initial: { kind: "OBRIGACAO", type: "LICENCIAMENTO" } }, documentos: { title: "Registrar documento", kind: "document", initial: { kind: "DOCUMENTO", type: "OUTRO" } }, ocorrencias: { title: "Registrar ocorrência", kind: "occurrence" },
};
const rowActionLabels: Record<string, string> = { detail: "Abrir ficha", editUnit: "Editar cadastro", editRoute: "Editar rota", history: "Consultar históricos", asset: "Abrir bem em Patrimônio", stock: "Abrir saída em Almoxarifado", generate: "Gerar OS", emitPlan: "Emitir plano", emitOrder: "Emitir OS", start: "Iniciar execução", complete: "Concluir execução", fulfill: "Registrar cumprimento", editDocument: "Editar documento", source: "Consultar origem", recognizeExpense: "Registrar gasto decorrente" };
function href(query: FleetQuery, patch: Partial<FleetQuery> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, ...patch })) if (value !== "" && value != null) params.set(key, String(value));
  return `/frotas?${params}`;
}
function DetailDialog({ row, onClose, onAction, canCreate, canUpdate, canIssue }: { row: FleetRow; onClose: () => void; onAction: (action: string, row: FleetRow) => void; canCreate: boolean; canUpdate: boolean; canIssue: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} onCancel={e => { e.preventDefault(); onClose(); }} className="m-auto max-h-[92dvh] w-[min(760px,calc(100%_-_24px))] rounded-lg border border-slate-300 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/35" aria-labelledby="fleet-detail-title">
    <header className="flex items-center justify-between border-b border-slate-200 p-4"><h2 id="fleet-detail-title" className="text-base font-semibold">Ficha do registro</h2><button aria-label="Fechar ficha" onClick={onClose} className="rounded p-2 focus-visible:ring-2 focus-visible:ring-teal-600"><X className="size-5" /></button></header>
    <dl className="grid max-h-[65dvh] gap-4 overflow-y-auto p-5 md:grid-cols-2">{Object.entries(row.detail).map(([key, value]) => <div key={key} className={value.length > 140 ? "md:col-span-2" : ""}><dt className="text-xs font-semibold leading-4 text-slate-500">{key}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-5">{value}</dd></div>)}</dl>
    <footer className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 p-4">{row.actions.filter(action => action !== "detail" && (action.startsWith("emit") ? canIssue : ["history", "source", "asset", "stock"].includes(action) ? true : ["generate", "recognizeExpense"].includes(action) ? canCreate : canUpdate)).map(action => <button key={action} className="min-h-11 rounded border border-slate-300 bg-white px-3 text-sm font-medium outline-none hover:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-600 md:min-h-9" onClick={() => onAction(action, row)}>{rowActionLabels[action]}</button>)}<button onClick={onClose} className="min-h-11 rounded bg-teal-700 px-4 text-sm font-semibold text-white md:min-h-9">Fechar</button></footer>
  </dialog>;
}

export function FrotasClient({ query, list, selectedUnit, selectedUnits = [], permissions, departmentId }: { query: FleetQuery; list: FleetList; selectedUnit: { id: string; code: string; name: string; category: string } | null; selectedUnits?: { id: string; label: string }[]; permissions: { create: boolean; update: boolean; issueReports: boolean }; departmentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition(), [editor, setEditor] = useState<Editor | null>(null), [detail, setDetail] = useState<FleetRow | null>(null), [message, setMessage] = useState(""), [error, setError] = useState(""), [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState(query), [advanced, setAdvanced] = useState(false), [format, setFormat] = useState("pdf");
  const [units, setUnits] = useState(selectedUnits);
  const group = groups.find(g => g.items.some(i => i.area === query.area))!;
  const create = creation[query.area];
  function navigate(patch: Partial<FleetQuery>) { startTransition(() => router.push(href(query, patch))); }
  function applyFilters(event: React.FormEvent) { event.preventDefault(); setError(""); if (filters.from && filters.to && filters.from > filters.to) { setError("A data final deve ser igual ou posterior à inicial."); return; } navigate({ ...filters, page: 1 }); }
  async function emit(extra: Record<string, string> = {}) {
    if (exporting) return; setExporting(true); setError("");
    try {
      const params = new URLSearchParams(href(query).split("?")[1]); params.set("format", format);
      for (const [key, value] of Object.entries(extra)) params.set(key, value);
      const response = await fetch(`/api/frotas/relatorios?${params}`);
      if (!response.ok) { const result = await response.json(); throw new Error(result.error || "Falha na emissão."); }
      const blob = await response.blob(), url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url;
      link.download = `celeriflow-frotas-${extra.documentType || (query.area === "relatorios" ? query.report : query.area)}.${format === "print" ? "html" : format}`;
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMessage(format === "print" ? "Documento de impressão gerado. Abra o HTML e use a impressão do navegador." : "Relatório emitido com todos os registros do filtro.");
    } catch (err) { setError(err instanceof Error ? err.message : "Falha na emissão."); }
    finally { setExporting(false); }
  }
  function act(action: string, row: FleetRow) {
    if (action === "asset") { router.push(`/patrimonio/bens/${encodeURIComponent(row.data?.assetId || "")}`); return; }
    if (action === "stock") { router.push(`/patrimonio/materiais/movimentos/${encodeURIComponent(row.data?.stockMovementId || "")}`); return; }
    if (action === "detail") { setDetail(row); return; }
    setDetail(null); setError("");
    const context = row.cells.unit || row.cells.name || row.cells.title;
    if (action === "editUnit") setEditor({ kind: "unit", title: "Editar unidade da frota", initial: row.data!, context });
    if (action === "editRoute") setEditor({ kind: "route", title: "Editar rota", initial: row.data!, context });
    if (action === "editDocument") setEditor({ kind: "document", title: "Editar documento", initial: row.data!, context });
    if (action === "generate") setEditor({ kind: "generateOrder", title: "Gerar OS a partir do plano", initial: { planId: row.id, scheduledAt: row.data!.scheduledAt }, context: `${context} · ${row.cells.title}` });
    if (action === "complete") setEditor({ kind: "completeOrder", title: "Concluir execução da ordem", initial: { orderId: row.id, performed: row.data?.performed || "" }, context: `${context} · ${row.cells.title}` });
    if (action === "fulfill") setEditor({ kind: "fulfillDocument", title: "Registrar cumprimento administrativo", initial: { documentId: row.id }, context });
    if (action === "recognizeExpense") setEditor({ kind: "expense", title: "Registrar gasto decorrente da ocorrência", initial: { unitId: row.unitId!, occurrenceId: row.id }, context });
    if (action === "history") navigate({ unitId: row.unitId!, area: "utilizacao", page: 1, q: "", type: "", status: "", from: "", to: "" });
    if (action === "source") {
      if (row.data?.sourceType === "PATRIMONIO") { router.push(`/patrimonio/manutencoes/${encodeURIComponent(row.data.sourceId)}`); return; }
      const area = row.data?.sourceType === "CONSUMO" ? "consumos" : row.data?.sourceType === "OS" ? "ordens" : row.data?.sourceType === "OCORRENCIA" ? "ocorrencias" : "gastos";
      if (area === "gastos") setDetail(row); else navigate({ area, unitId: row.unitId!, q: "", page: 1, type: "", status: "" });
    }
    if (action === "emitPlan" || action === "emitOrder") void emit({ documentType: action === "emitPlan" ? "plan" : "order", documentId: row.id });
    if (action === "start") startTransition(async () => { try { const result = await mutateFleetAction({ kind: "startOrder", requestId: crypto.randomUUID(), orderId: row.id }); if (result.error) setError(result.error); else { setMessage("Execução iniciada."); router.refresh(); } } catch { setError("Não foi possível iniciar a execução."); } });
  }
  const filterTypes = query.area === "consumos" ? ["COMBUSTIVEL", "LUBRIFICANTE"] : query.area === "ocorrencias" ? ["MULTA", "ACIDENTE", "OUTRO"] : ["gastos", "manutencoes"].includes(query.area) ? ["MANUTENCAO", "COMBUSTIVEL", "LUBRIFICANTE", "OUTROS"] : query.area === "planos" ? ["REVISAO", "PREVENTIVA"] : [];
  const statuses = query.area === "ordens" ? ["EMITIDA", "EM_EXECUCAO", "CONCLUIDA"] : ["documentos", "obrigacoes", "seguros"].includes(query.area) ? ["PENDENTE", "CUMPRIDA"] : ["frota", "rotas"].includes(query.area) ? ["ATIVO", "INATIVO", ...(query.area === "frota" ? ["EM_MANUTENCAO"] : [])] : [];
  const dateCaption = ["documentos", "seguros", "obrigacoes"].includes(query.area) || (query.area === "relatorios" && query.report === "vencimentos") ? "Vencimento" : query.area === "ordens" || query.area === "planos" ? "Programação" : "Data do fato";
  const moneyText = (value: string) => `R$ ${value.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  return <PageFrame className="space-y-2 text-sm">
    <PageHeader title="Frotas" icon={<Truck className="size-5 text-teal-700" />} className="min-h-11 [&>h1]:text-xl [&>h1]:font-semibold" action={<Link href="/dashboard" className="flex min-h-9 items-center gap-1.5 rounded px-2 text-sm text-slate-600 hover:bg-slate-100"><ArrowLeft className="size-4" />Painel de módulos</Link>} />
    <nav aria-label="Áreas de Frotas" className="grid grid-cols-2 gap-1 rounded-md border border-slate-300 bg-white p-1 sm:grid-cols-3 xl:grid-cols-6">{groups.map(g => <Link key={g.title} href={href(query, { area: g.items[0].area, page: 1, type: "", status: "", origin: "" })} aria-current={group.title === g.title ? "page" : undefined} className={`flex min-h-11 items-center justify-center rounded px-2 py-2 text-center text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-teal-600 md:min-h-9 ${group.title === g.title ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{g.title}</Link>)}</nav>
    {selectedUnit && <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-teal-200 bg-teal-50 px-3 py-2"><span><strong>{selectedUnit.code} · {selectedUnit.name}</strong><span className="ml-2 text-teal-800">{labels[selectedUnit.category]}</span></span><button onClick={() => navigate({ unitId: "", page: 1 })} className="min-h-9 rounded px-2 text-sm font-medium text-teal-800">Consultar toda a frota</button></div>}
    <section className="rounded-md border border-slate-300 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
        <div className="flex flex-wrap gap-1" aria-label="Consultas da área">{group.items.map(item => <Link key={item.area} href={href(query, { area: item.area, page: 1, type: "", status: "", origin: "" })} aria-current={query.area === item.area ? "page" : undefined} className={`min-h-9 rounded px-3 py-2 text-sm ${query.area === item.area ? "bg-slate-100 font-semibold text-teal-800" : "text-slate-600 hover:bg-slate-50"}`}>{item.title}</Link>)}</div>
        {create && permissions.create && <button onClick={() => setEditor({ ...create, initial: { unitId: query.unitId, ...create.initial }, context: selectedUnit ? `${selectedUnit.code} · ${selectedUnit.name}` : undefined })} className="flex min-h-11 items-center gap-1.5 rounded bg-teal-700 px-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 md:min-h-9"><Plus className="size-4" />{create.title}</button>}
        {query.area === "ordens" && <span className="text-xs text-slate-500">Gere as ordens pela consulta de Planos.</span>}
      </header>
      <form key={href(query)} onSubmit={applyFilters} className="space-y-2 border-b border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-end gap-2">
          {query.area === "relatorios" && <label className="min-w-56 flex-1 text-xs font-medium text-slate-600">Relatório<select className={fieldClass + " mt-1"} value={filters.report} onChange={e => setFilters({ ...filters, report: e.target.value as FleetQuery["report"] })}>{Object.entries({ frota: "Listagem geral da frota", vencimentos: "Vencimentos de documentos", abastecimentos: "Abastecimentos por veículo", gastos: "Gastos realizados", manutencoes: "Manutenções efetuadas" }).map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select></label>}
          <label className="min-w-52 flex-1 text-xs font-medium text-slate-600">Busca em todos os registros<input name="q" type="search" className={fieldClass + " mt-1"} value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} placeholder="Código, descrição ou referência" /></label>
          {!["frota", "rotas"].includes(query.area) && <><label className="text-xs font-medium text-slate-600">{dateCaption} inicial<input type="date" className={fieldClass + " mt-1"} value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} /></label><label className="text-xs font-medium text-slate-600">{dateCaption} final<input type="date" className={fieldClass + " mt-1"} value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} /></label></>}
          <button type="submit" disabled={pending} className="flex min-h-11 items-center gap-1.5 rounded border border-teal-700 bg-white px-3 text-sm font-semibold text-teal-800 md:min-h-9"><Search className="size-4" />{pending ? "Consultando..." : "Consultar"}</button>
          <button type="button" onClick={() => setAdvanced(!advanced)} aria-expanded={advanced} className="min-h-11 rounded border border-slate-300 bg-white px-3 text-sm md:min-h-9">Filtros</button>
          <button type="button" onClick={() => navigate({ q: "", category: "", status: "", type: "", origin: "", from: "", to: "", unitId: "", unitIds: "", page: 1 })} className="min-h-11 rounded px-2 text-sm text-slate-600 md:min-h-9">Limpar</button>
        </div>
        {advanced && <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          {query.area !== "rotas" && (query.area === "relatorios" ? <div className="sm:col-span-2"><span className="mb-1 block text-xs font-medium text-slate-600">Uma ou mais unidades · deixe vazio para consultar todas</span><ReferencePicker kind={filters.report === "abastecimentos" ? "allVehicles" : "allUnits"} label="Adicionar unidade ao relatório" value="" onChange={(id, label) => { if (!id || units.some(v => v.id === id)) return; if (units.length >= 50) { setError("Selecione até 50 unidades."); return; } const next = [...units, { id, label: label || id }]; setUnits(next); setFilters({ ...filters, unitId: "", unitIds: next.map(v => v.id).join(",") }); }} /><div className="mt-2 flex flex-wrap gap-1">{units.map(v => <button type="button" key={v.id} aria-label={`Remover ${v.label}`} className="flex min-h-11 items-center gap-1 rounded border border-teal-200 bg-teal-50 px-2 text-sm md:min-h-9" onClick={() => { const next = units.filter(u => u.id !== v.id); setUnits(next); setFilters({ ...filters, unitIds: next.map(u => u.id).join(",") }); }}>{v.label}<X className="size-4" /></button>)}</div></div> : <div><span className="mb-1 block text-xs font-medium text-slate-600">Unidade da frota</span><ReferencePicker kind="allUnits" label="Filtro de unidade da frota" value={filters.unitId} selectedLabel={selectedUnit ? `${selectedUnit.code} · ${selectedUnit.name}` : undefined} onChange={value => setFilters({ ...filters, unitId: value, unitIds: "" })} /></div>)}
          {query.area !== "rotas" && <label className="text-xs font-medium text-slate-600">Categoria<select className={fieldClass + " mt-1"} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value as FleetQuery["category"] })}><option value="">Todas</option>{categories.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>}
          {!!statuses.length && <label className="text-xs font-medium text-slate-600">Situação<select className={fieldClass + " mt-1"} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">Todas</option>{statuses.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>}
          {!!filterTypes.length && <label className="text-xs font-medium text-slate-600">Tipo / natureza<select className={fieldClass + " mt-1"} value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}><option value="">Todos</option>{filterTypes.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>}
          {query.area === "consumos" && <label className="text-xs font-medium text-slate-600">Origem do material<select className={fieldClass + " mt-1"} value={filters.origin} onChange={e => setFilters({ ...filters, origin: e.target.value as FleetQuery["origin"] })}><option value="">Todas</option>{["PROPRIO", "TERCEIRO"].map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>}
        </div>}
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2"><p className="text-xs text-slate-500">{list.total} registro(s) no recorte{query.area === "relatorios" ? " · prévia paginada" : ""}{query.q && ` · busca: ${query.q}`}{query.from || query.to ? ` · ${dateCaption.toLowerCase()}: ${query.from || "sem início"} a ${query.to || "sem fim"}` : ""}</p>{permissions.issueReports && <div className="flex items-center gap-2"><label className="sr-only" htmlFor="fleet-format">Formato da emissão</label><select id="fleet-format" className="min-h-9 rounded border border-slate-300 bg-white px-2 text-sm" value={format} onChange={e => setFormat(e.target.value)}>{["pdf", "xlsx", "csv", "txt", "print"].map(value => <option key={value} value={value}>{value === "print" ? "Impressão HTML" : value.toUpperCase()}</option>)}</select><button disabled={exporting} onClick={() => void emit()} className="flex min-h-9 items-center gap-1.5 rounded px-2 text-sm font-medium text-teal-800 outline-none hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-600"><Download className="size-4" />{exporting ? "Emitindo..." : "Emitir relatório"}</button></div>}</div>
      <div className="overflow-x-auto" aria-busy={pending}>
        <table className="w-full border-collapse text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-600"><tr>{list.columns.map(col => <th key={col.key} className={`border-b border-slate-200 px-3 py-2 font-semibold ${col.numeric ? "text-right" : ""}`}>{col.label}</th>)}<th className="border-b border-slate-200 px-3 py-2 text-right font-semibold">Ficha</th></tr></thead><tbody>{list.rows.map(row => <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-teal-50/40">{list.columns.map(col => <td key={col.key} className={`px-3 py-2 leading-5 ${col.numeric ? "whitespace-nowrap text-right tabular-nums" : ""}`}><span className={col.numeric ? "" : "line-clamp-1 max-w-80"} title={row.cells[col.key]}>{row.cells[col.key]}</span></td>)}<td className="px-3 py-0 text-right"><button onClick={() => act("detail", row)} aria-label={`Abrir ficha de ${row.cells.unit || row.cells.name || row.cells.title || row.cells.code}`} className="min-h-11 rounded px-2 text-sm font-medium text-teal-800 outline-none hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-600 md:min-h-9">Abrir</button></td></tr>)}{!list.rows.length && <tr><td colSpan={list.columns.length + 1} className="p-8 text-center text-sm text-slate-500">Nenhum registro encontrado. Ajuste os filtros ou registre a primeira operação.</td></tr>}</tbody></table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600"><span>{list.total ? `${(list.page - 1) * list.pageSize + 1}–${Math.min(list.page * list.pageSize, list.total)} de ${list.total}` : "0 registros"}</span><div className="flex items-center gap-2"><label className="flex items-center gap-1">Linhas<select aria-label="Registros por página" className="min-h-9 rounded border border-slate-300 bg-white px-2 text-sm" value={query.pageSize} onChange={e => navigate({ pageSize: Number(e.target.value), page: 1 })}>{[5, 10].map(n => <option key={n} value={n}>{n}</option>)}</select></label><button aria-label="Página anterior" disabled={list.page <= 1 || pending} onClick={() => navigate({ page: list.page - 1 })} className="min-h-9 rounded border border-slate-300 p-2 disabled:opacity-40"><ChevronLeft className="size-4" /></button><span>Página {list.page} de {Math.max(1, Math.ceil(list.total / list.pageSize))}</span><button aria-label="Próxima página" disabled={list.page * list.pageSize >= list.total || pending} onClick={() => navigate({ page: list.page + 1 })} className="min-h-9 rounded border border-slate-300 p-2 disabled:opacity-40"><ChevronRight className="size-4" /></button></div></footer>
    </section>
    {list.amount !== null && <p className="rounded border border-slate-200 bg-white px-3 py-2 text-sm"><strong>Total realizado conhecido do recorte completo: {moneyText(list.amount)}</strong>{Object.entries(list.quantities).map(([unit, quantity]) => <span key={unit} className="ml-4 tabular-nums">{quantity} {unit}</span>)}{list.missingCosts > 0 && <span className="ml-3 text-amber-800">Total parcial · {list.missingCosts} registro(s) com custo não informado.</span>}</p>}
    {!permissions.create && !permissions.update && <p className="text-xs text-slate-500">Acesso de consulta. Seu perfil não permite gravar operações.</p>}
    {message && <p role="status" className="rounded border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">{message}</p>}{error && <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
    {detail && <DetailDialog row={detail} onClose={() => setDetail(null)} onAction={act} canCreate={permissions.create} canUpdate={permissions.update} canIssue={permissions.issueReports} />}
    {editor && <FleetEditor editor={editor} onClose={() => setEditor(null)} onSuccess={value => { setMessage(value); router.refresh(); }} defaultDepartment={departmentId} />}
  </PageFrame>;
}
