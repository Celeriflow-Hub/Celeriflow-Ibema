"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckSquare, FileBox, FileText, Plus, Search } from "lucide-react";
import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
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
  const firstVisible = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastVisible = Math.min(page * pageSize, total);
  const receivableIds = processos
    .filter((processo) => canReceive && processo.currentDepartmentId === currentDepartmentId && processo.status === "Aguardando Recebimento")
    .map((processo) => processo.id);
  const selectedReceivableIds = selectedIds.filter((id) => receivableIds.includes(id));

  function setSelected(processId: string, selected: boolean) {
    setSelectedIds((current) => selected ? [...new Set([...current, processId])] : current.filter((id) => id !== processId));
  }

  function processHref(processId: string) {
    return "/protocolos/processos/" + processId + "?returnTo=" + encodeURIComponent(returnTo);
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
          ? received + " processo(s) recebido(s). " + failed.length + " item(ns) precisa(m) de revisão: " + failed.map((item) => item.error).join(" ")
          : received + " processo(s) recebido(s) com sucesso.",
      );
      router.refresh();
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 p-2 lg:p-3">
      <ErpPageTitle
        title="Caixa do Setor"
        description="Processos distribuídos no escopo autorizado."
        icon={<FileBox className="size-5 shrink-0 text-emerald-700" />}
        action={canCreate ? (
          <Link href="/protocolos/processos/novo" className="inline-flex h-8 items-center gap-1.5 rounded bg-emerald-700 px-3 text-xs font-semibold text-white outline-none hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
            <Plus className="size-3.5" />
            Novo protocolo
          </Link>
        ) : undefined}
      />

      <ErpListFrame
        toolbar={(
          <form action="/protocolos/processos" method="GET" className="grid items-center gap-2 md:grid-cols-[minmax(0,1fr)_180px_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Buscar processo</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input name="q" defaultValue={filters.q} placeholder="Protocolo, interessado, tipo ou assunto" className="h-7 w-full rounded border border-slate-300 bg-white py-1 pl-8 pr-2 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" />
            </label>
            <label className="sr-only" htmlFor="status">Situação</label>
            <select id="status" name="status" defaultValue={filters.status || "ATIVOS"} className="h-7 rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15">
              <option value="ATIVOS">Não arquivados</option>
              <option value="Aguardando Recebimento">Aguardando recebimento</option>
              <option value="Recebido">Recebido</option>
              <option value="Em Analise">Em análise</option>
              <option value="Concluido">Concluído</option>
              <option value="Arquivado">Arquivado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <button className="h-7 rounded bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700">Aplicar</button>
            <Link href="/protocolos/processos" className="inline-flex h-7 items-center justify-center rounded border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">Limpar</Link>
          </form>
        )}
        summary={(
          <div className="flex min-h-5 flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex min-w-0 items-center gap-2 text-slate-600">
              <span><strong className="text-slate-900">{total}</strong> processo(s) no recorte autorizado{total ? " · exibindo " + firstVisible + "–" + lastVisible : ""}.</span>
              {notice && <span className="truncate font-medium text-slate-700" aria-live="polite">{notice}</span>}
            </div>
            {selectedReceivableIds.length > 0 && (
              <button disabled={isPending} onClick={handleBatchReceive} className="inline-flex h-7 items-center justify-center gap-1 rounded bg-blue-700 px-2 text-[11px] font-semibold text-white disabled:opacity-50">
                <CheckSquare className="size-3.5" />
                Receber ({selectedReceivableIds.length})
              </button>
            )}
          </div>
        )}
        pagination={<ErpPagination page={page} total={total} pageSize={pageSize} previousHref={processListHref(filters, page - 1)} nextHref={processListHref(filters, page + 1)} label="processos" />}
      >
        {processos.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center p-6 text-center">
            <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-slate-100"><FileText className="size-5 text-slate-400" /></div>
            <h2 className="text-sm font-bold text-slate-700">Nenhum processo encontrado</h2>
            <p className="mt-1 max-w-md text-xs text-slate-500">Revise os filtros ou aguarde uma nova distribuição para o seu setor.</p>
          </div>
        ) : (
          <>
            <div className="hidden h-full md:block">
              <table className="w-full table-fixed border-collapse text-left text-[11px] leading-3">
                <thead className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-600">
                  <tr>
                    <th className="w-8 px-2 py-1"><span className="sr-only">Selecionar</span></th>
                    <th className="w-[16%] px-2 py-1">Protocolo</th>
                    <th className="px-2 py-1">Tipo e assunto</th>
                    <th className="hidden w-[20%] px-2 py-1 2xl:table-cell">Interessado</th>
                    <th className="w-[15%] px-2 py-1">Situação</th>
                    <th className="hidden w-[11%] px-2 py-1 xl:table-cell">Abertura</th>
                    <th className="w-[11%] px-2 py-1 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processos.map((processo) => {
                    const canReceiveThis = canReceive && processo.currentDepartmentId === currentDepartmentId && processo.status === "Aguardando Recebimento";
                    const processLabel = processo.processType.name + " · " + processo.subject.name;
                    return (
                      <tr key={processo.id} className="h-5 hover:bg-slate-50">
                        <td className="px-2 py-0.5">{canReceiveThis && <input aria-label={"Selecionar " + processo.protocolNumber} type="checkbox" checked={selectedIds.includes(processo.id)} onChange={(event) => setSelected(processo.id, event.target.checked)} />}</td>
                        <td className="truncate px-2 py-0.5 font-semibold text-slate-800" title={processo.protocolNumber}>{processo.protocolNumber}</td>
                        <td className="truncate px-2 py-0.5 text-slate-700" title={processLabel}>{processLabel}</td>
                        <td className="hidden truncate px-2 py-0.5 text-slate-700 2xl:table-cell" title={interestedName(processo)}>{interestedName(processo)}</td>
                        <td className="px-2 py-0.5"><span className={["inline-flex max-w-full truncate rounded px-1.5 py-0 text-[10px] font-semibold leading-3", statusClass(processo.status)].join(" ")}>{processo.status}</span></td>
                        <td className="hidden whitespace-nowrap px-2 py-0.5 text-[10px] text-slate-600 xl:table-cell">{new Date(processo.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="px-2 py-0.5 text-right"><div className="flex justify-end gap-2 whitespace-nowrap"><Link href={processHref(processo.id)} className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900">Abrir</Link>{canReceiveThis && <button disabled={isPending} onClick={() => handleReceive(processo.id)} className="text-[10px] font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-50">Receber</button>}</div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto md:hidden">
              {processos.map((processo) => {
                const canReceiveThis = canReceive && processo.currentDepartmentId === currentDepartmentId && processo.status === "Aguardando Recebimento";
                return <article key={processo.id} className="space-y-1.5 p-3"><div className="flex items-start justify-between gap-2"><div>{canReceiveThis && <input aria-label={"Selecionar " + processo.protocolNumber} type="checkbox" checked={selectedIds.includes(processo.id)} onChange={(event) => setSelected(processo.id, event.target.checked)} className="mr-2" />}<span className="font-semibold text-slate-900">{processo.protocolNumber}</span></div><span className={["rounded px-1.5 py-0.5 text-[10px] font-semibold", statusClass(processo.status)].join(" ")}>{processo.status}</span></div><p className="text-xs font-medium text-slate-800">{processo.processType.name} · {processo.subject.name}</p><p className="text-xs text-slate-600">{interestedName(processo)}</p><div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">Aberto em {new Date(processo.createdAt).toLocaleDateString("pt-BR")}</span><span className="flex gap-3"><Link href={processHref(processo.id)} className="font-semibold text-emerald-700">Abrir</Link>{canReceiveThis && <button disabled={isPending} onClick={() => handleReceive(processo.id)} className="font-semibold text-blue-700 disabled:opacity-50">Receber</button>}</span></div></article>;
              })}
            </div>
          </>
        )}
      </ErpListFrame>
    </div>
  );
}
