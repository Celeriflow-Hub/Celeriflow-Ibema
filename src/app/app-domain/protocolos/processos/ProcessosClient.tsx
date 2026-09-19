"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckSquare, ChevronLeft, ChevronRight, FileBox, FileText, Plus, Search } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import type { ProcessListFilters } from "@/lib/protocols/process-listing-policy";
import { processListHref } from "@/lib/protocols/process-listing-policy";
import { receiveProcess, receiveProcessesBatch } from "../actions";

type Processo = {
  id: string;
  protocolNumber: string;
  status: string;
  createdAt: Date;
  currentDepartmentId: string | null;
  processType: { name: string };
  subject: { name: string };
  person: { fullName: string } | null;
  company: { corporateName: string } | null;
};

function statusClass(status: string) {
  if (["Concluido", "Concluído"].includes(status)) return "bg-emerald-100 text-emerald-700";
  if (status === "Aguardando Recebimento") return "bg-blue-100 text-blue-700";
  if (status === "Arquivado") return "bg-slate-100 text-slate-600";
  if (["Cancelado", "Rejeitado"].includes(status)) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

function interestedName(processo: Processo) {
  return processo.person?.fullName || processo.company?.corporateName || "Não informado";
}

export default function ProcessosClient({
  processos,
  filters,
  total,
  page,
  pageSize,
  canReceive,
  currentDepartmentId,
  canCreate,
  returnTo,
}: {
  processos: Processo[];
  filters: ProcessListFilters;
  total: number;
  page: number;
  pageSize: number;
  canReceive: boolean;
  currentDepartmentId: string | null;
  canCreate: boolean;
  returnTo: string;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstVisible = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastVisible = Math.min(page * pageSize, total);
  const receivableIds = processos
    .filter((processo) => canReceive && processo.currentDepartmentId === currentDepartmentId && processo.status === "Aguardando Recebimento")
    .map((processo) => processo.id);
  const selectedReceivableIds = selectedIds.filter((id) => receivableIds.includes(id));

  function setSelected(processId: string, selected: boolean) {
    setSelectedIds((current) => selected ? [...new Set([...current, processId])] : current.filter((id) => id !== processId));
  }

  function handleReceive(processId: string) {
    setNotice(null);
    startTransition(async () => {
      const result = await receiveProcess(processId);
      if (result.error) {
        setNotice(result.error);
        return;
      }
      setSelectedIds((current) => current.filter((id) => id !== processId));
      setNotice("Recebimento registrado.");
      router.refresh();
    });
  }

  function handleBatchReceive() {
    if (!selectedReceivableIds.length) return;
    setNotice(null);
    startTransition(async () => {
      const { results } = await receiveProcessesBatch(selectedReceivableIds);
      const failed = results.filter((result) => result.error);
      const received = results.length - failed.length;
      setSelectedIds([]);
      setNotice(
        failed.length
          ? `${received} processo(s) recebido(s). ${failed.length} item(ns) precisa(m) de revisão: ${failed.map((item) => item.error).join(" ")}`
          : `${received} processo(s) recebido(s) com sucesso.`,
      );
      router.refresh();
    });
  }

  return (
    <PageFrame className="space-y-3">
      <PageHeader
        title="Caixa do Setor"
        icon={<FileBox className="size-4 shrink-0 text-emerald-600" />}
        action={canCreate ? (
          <Link href="/protocolos/processos/novo" className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2 text-xs font-semibold text-white hover:bg-emerald-700">
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Novo Protocolo</span>
          </Link>
        ) : undefined}
      />
      <p className="text-xs text-slate-500">Caixa operacional com pesquisa em todo o escopo autorizado, ordenação estável e histórico preservado por setor participante.</p>

      <form action="/protocolos/processos" method="GET" className="grid gap-2 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-[minmax(0,1fr)_200px_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Buscar processo</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={filters.q} placeholder="Protocolo, interessado, tipo, assunto ou descrição" className="h-9 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" />
        </label>
        <label className="sr-only" htmlFor="status">Situação</label>
        <select id="status" name="status" defaultValue={filters.status || "ATIVOS"} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15">
          <option value="ATIVOS">Não arquivados</option>
          <option value="Aguardando Recebimento">Aguardando recebimento</option>
          <option value="Recebido">Recebido</option>
          <option value="Em Analise">Em análise</option>
          <option value="Concluido">Concluído</option>
          <option value="Arquivado">Arquivado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
        <button className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700">Aplicar</button>
        <Link href="/protocolos/processos" className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Limpar</Link>
      </form>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm" aria-label="Listagem de processos">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/70 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600"><strong className="text-slate-900">{total}</strong> processo(s) no recorte autorizado{total ? ` · exibindo ${firstVisible}–${lastVisible}` : ""}.</p>
          {selectedReceivableIds.length > 0 && (
            <button disabled={isPending} onClick={handleBatchReceive} className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-blue-700 px-3 text-xs font-semibold text-white disabled:opacity-50">
              <CheckSquare className="size-3.5" />
              Receber selecionados ({selectedReceivableIds.length})
            </button>
          )}
        </div>
        {notice && <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700" aria-live="polite">{notice}</p>}

        {processos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100"><FileText className="size-6 text-slate-400" /></div>
            <h2 className="text-base font-bold text-slate-700">Nenhum processo encontrado</h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">Revise os filtros ou aguarde uma nova distribuição para o seu setor.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup><col className="w-10" /><col className="w-[18%]" /><col className="w-[27%]" /><col className="w-[22%]" /><col className="w-[15%]" /><col className="w-[10%]" /><col className="w-[8%]" /></colgroup>
                <thead className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-600">
                  <tr><th className="px-2 py-2"><span className="sr-only">Selecionar</span></th><th className="px-3 py-2">Protocolo</th><th className="px-3 py-2">Tipo e assunto</th><th className="px-3 py-2">Interessado</th><th className="px-3 py-2">Situação</th><th className="px-3 py-2">Abertura</th><th className="px-3 py-2 text-right">Ações</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processos.map((processo) => {
                    const canReceiveThis = canReceive && processo.currentDepartmentId === currentDepartmentId && processo.status === "Aguardando Recebimento";
                    return (
                      <tr key={processo.id} className="align-top hover:bg-slate-50">
                        <td className="px-2 py-2">{canReceiveThis && <input aria-label={`Selecionar ${processo.protocolNumber}`} type="checkbox" checked={selectedIds.includes(processo.id)} onChange={(event) => setSelected(processo.id, event.target.checked)} />}</td>
                        <td className="break-words px-3 py-2 font-semibold text-slate-800">{processo.protocolNumber}</td>
                        <td className="break-words px-3 py-2"><p className="font-medium text-slate-800">{processo.processType.name}</p><p className="mt-0.5 text-xs text-slate-500">{processo.subject.name}</p></td>
                        <td className="break-words px-3 py-2 text-slate-700">{interestedName(processo)}</td>
                        <td className="px-3 py-2"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(processo.status)}`}>{processo.status}</span></td>
                        <td className="px-3 py-2 text-xs text-slate-600">{new Date(processo.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="px-3 py-2 text-right"><div className="flex flex-col items-end gap-1"><Link href={`/protocolos/processos/${processo.id}?returnTo=${encodeURIComponent(returnTo)}`} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Abrir</Link>{canReceiveThis && <button disabled={isPending} onClick={() => handleReceive(processo.id)} className="text-xs font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-50">Receber</button>}</div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-100 md:hidden">
              {processos.map((processo) => {
                const canReceiveThis = canReceive && processo.currentDepartmentId === currentDepartmentId && processo.status === "Aguardando Recebimento";
                return <article key={processo.id} className="space-y-2 p-3"><div className="flex items-start justify-between gap-2"><div>{canReceiveThis && <input aria-label={`Selecionar ${processo.protocolNumber}`} type="checkbox" checked={selectedIds.includes(processo.id)} onChange={(event) => setSelected(processo.id, event.target.checked)} className="mr-2" />}<span className="font-semibold text-slate-900">{processo.protocolNumber}</span></div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(processo.status)}`}>{processo.status}</span></div><div><p className="text-sm font-medium text-slate-800">{processo.processType.name}</p><p className="text-xs text-slate-500">{processo.subject.name}</p></div><p className="text-sm text-slate-700">{interestedName(processo)}</p><div className="flex items-center justify-between text-xs"><span className="text-slate-500">Aberto em {new Date(processo.createdAt).toLocaleDateString("pt-BR")}</span><span className="flex gap-3"><Link href={`/protocolos/processos/${processo.id}?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-emerald-700">Abrir</Link>{canReceiveThis && <button disabled={isPending} onClick={() => handleReceive(processo.id)} className="font-semibold text-blue-700 disabled:opacity-50">Receber</button>}</span></div></article>;
              })}
            </div>
          </>
        )}

        {total > 0 && <nav aria-label="Paginação de processos" className="flex items-center justify-between border-t border-slate-200 px-3 py-2"><p className="text-xs text-slate-500">Página {page} de {totalPages}</p><div className="flex gap-2"><Link aria-disabled={page <= 1} href={processListHref(filters, page - 1)} className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-semibold ${page <= 1 ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}><ChevronLeft className="size-3.5" />Anterior</Link><Link aria-disabled={page >= totalPages} href={processListHref(filters, page + 1)} className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-semibold ${page >= totalPages ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>Próxima<ChevronRight className="size-3.5" /></Link></div></nav>}
      </section>
    </PageFrame>
  );
}

