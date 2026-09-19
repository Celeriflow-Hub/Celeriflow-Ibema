"use client";

import Link from "next/link";
import { FileSearch, FileText, Search } from "lucide-react";
import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";

type Processo = {
  id: string;
  protocolNumber: string;
  status: string;
  createdAt: Date;
  processType: { name: string };
  subject: { name: string };
  person: { fullName: string } | null;
  company: { corporateName: string } | null;
};

function searchListHref(query: string, page = 1) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? "/protocolos/busca?" + search : "/protocolos/busca";
}

function interestedName(processo: Processo) {
  return processo.person?.fullName || processo.company?.corporateName || "Não informado";
}

function statusClass(status: string) {
  if (["Concluido", "Concluído"].includes(status)) return "bg-emerald-100 text-emerald-700";
  if (status === "Aguardando Recebimento") return "bg-blue-100 text-blue-700";
  if (status === "Arquivado") return "bg-slate-100 text-slate-600";
  if (["Cancelado", "Rejeitado"].includes(status)) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function BuscaClient({
  processos,
  query,
  total,
  page,
  pageSize,
}: {
  processos: Processo[];
  query: string;
  total: number;
  page: number;
  pageSize: number;
}) {
  const firstVisible = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastVisible = Math.min(page * pageSize, total);

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 p-2 lg:p-3">
      <ErpPageTitle
        title="Buscar processo"
        description="Consulta no escopo autorizado, com histórico e situação atual."
        icon={<FileSearch className="size-5 shrink-0 text-emerald-700" />}
      />

      <ErpListFrame
        toolbar={(
          <form action="/protocolos/busca" method="GET" className="grid items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Buscar processo</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Protocolo, interessado, tipo ou assunto"
                className="h-7 w-full rounded border border-slate-300 bg-white py-1 pl-8 pr-2 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
              />
            </label>
            <button className="h-7 rounded bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-700">
              Aplicar
            </button>
            <Link href="/protocolos/busca" className="inline-flex h-7 items-center justify-center rounded border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Limpar
            </Link>
          </form>
        )}
        summary={(
          <p className="min-h-5 text-[11px] text-slate-600">
            <strong className="text-slate-900">{total}</strong> processo(s) encontrados no recorte autorizado
            {total ? " · exibindo " + firstVisible + "–" + lastVisible : ""}.
          </p>
        )}
        pagination={(
          <ErpPagination
            page={page}
            total={total}
            pageSize={pageSize}
            previousHref={searchListHref(query, page - 1)}
            nextHref={searchListHref(query, page + 1)}
            label="resultados de busca"
          />
        )}
      >
        {processos.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center p-6 text-center">
            <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-slate-100">
              <FileText className="size-5 text-slate-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-700">Nenhum processo encontrado</h2>
            <p className="mt-1 max-w-md text-xs text-slate-500">Revise a busca ou confirme se o processo faz parte do seu escopo autorizado.</p>
          </div>
        ) : (
          <>
            <div className="hidden h-full md:block">
              <table className="h-full w-full table-fixed border-collapse text-left text-[11px] leading-3">
                <thead className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-600">
                  <tr>
                    <th className="w-[17%] px-2 py-1">Protocolo</th>
                    <th className="px-2 py-1">Tipo e assunto</th>
                    <th className="hidden w-[23%] px-2 py-1 xl:table-cell">Interessado</th>
                    <th className="w-[16%] px-2 py-1">Situação</th>
                    <th className="hidden w-[12%] px-2 py-1 lg:table-cell">Abertura</th>
                    <th className="w-[10%] px-2 py-1 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processos.map((processo) => {
                    const processLabel = processo.processType.name + " · " + processo.subject.name;
                    return (
                      <tr key={processo.id} className="h-5 hover:bg-slate-50">
                        <td className="truncate px-2 py-0.5 font-semibold text-slate-800" title={processo.protocolNumber}>{processo.protocolNumber}</td>
                        <td className="truncate px-2 py-0.5 text-slate-700" title={processLabel}>{processLabel}</td>
                        <td className="hidden truncate px-2 py-0.5 text-slate-700 xl:table-cell" title={interestedName(processo)}>{interestedName(processo)}</td>
                        <td className="px-2 py-0.5"><span className={["inline-flex max-w-full truncate rounded px-1.5 py-0 text-[10px] font-semibold leading-3", statusClass(processo.status)].join(" ")}>{processo.status}</span></td>
                        <td className="hidden whitespace-nowrap px-2 py-0.5 text-[10px] text-slate-600 lg:table-cell">{new Date(processo.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="px-2 py-0.5 text-right"><Link href={"/protocolos/processos/" + processo.id} className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900">Abrir</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto md:hidden">
              {processos.map((processo) => (
                <article key={processo.id} className="space-y-1.5 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900">{processo.protocolNumber}</span>
                    <span className={["rounded px-1.5 py-0.5 text-[10px] font-semibold", statusClass(processo.status)].join(" ")}>{processo.status}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">{processo.processType.name} · {processo.subject.name}</p>
                  <p className="text-xs text-slate-600">{interestedName(processo)}</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Aberto em {new Date(processo.createdAt).toLocaleDateString("pt-BR")}</span>
                    <Link href={"/protocolos/processos/" + processo.id} className="font-semibold text-emerald-700">Abrir</Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </ErpListFrame>
    </div>
  );
}
