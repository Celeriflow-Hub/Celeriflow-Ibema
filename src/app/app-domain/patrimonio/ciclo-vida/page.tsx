import Link from "next/link";
import { AssetLifecycleClient } from "./AssetLifecycleClient";
import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import {
  clampPatrimonioListPage,
  patrimonioListHref,
  parsePatrimonioListPage,
  PATRIMONIO_LIST_PAGE_SIZE,
} from "../listing";

type LifecycleView = "posicao" | "baixas" | "ajustes";

type SearchParams = {
  page?: string;
  view?: string;
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function parseLifecycleView(value: string | undefined): LifecycleView {
  if (value === "baixas" || value === "ajustes") return value;
  return "posicao";
}

function lifecycleHref(view: LifecycleView, page: number) {
  return patrimonioListHref("/patrimonio/ciclo-vida", page, { view });
}

function viewLabel(view: LifecycleView) {
  if (view === "baixas") return "baixa(s) e alienação(ões)";
  if (view === "ajustes") return "ajuste(s) de valor";
  return "bem(ns) patrimonial(is)";
}

function adjustmentLabel(type: string) {
  return {
    REVALUATION: "Reavaliação",
    IMPAIRMENT: "Impairment",
    SUBSEQUENT_COST: "Custo subsequente",
  }[type] ?? type;
}

export default async function AssetLifecyclePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const params = await searchParams;
  const view = parseLifecycleView(params?.view);
  const requestedPage = parsePatrimonioListPage(params?.page);
  const activeAssetWhere = { status: { not: "Baixado" } };
  const [assetTotal, activeAssetTotal, activeAssetValue, writeOffTotal, adjustmentTotal, activeAssets] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: activeAssetWhere }),
    prisma.asset.aggregate({ where: activeAssetWhere, _sum: { currentValue: true } }),
    prisma.assetWriteOff.count(),
    prisma.assetValueAdjustment.count(),
    prisma.asset.findMany({
      where: activeAssetWhere,
      orderBy: { patrimonyNumber: "asc" },
      select: { id: true, patrimonyNumber: true, name: true, currentValue: true },
    }),
  ]);
  const total = view === "posicao" ? assetTotal : view === "baixas" ? writeOffTotal : adjustmentTotal;
  const page = clampPatrimonioListPage(requestedPage, total);
  const pageWindow = {
    skip: (page - 1) * PATRIMONIO_LIST_PAGE_SIZE,
    take: PATRIMONIO_LIST_PAGE_SIZE,
  };

  const [assets, writeOffs, adjustments] = await Promise.all([
    view === "posicao"
      ? prisma.asset.findMany({
          ...pageWindow,
          orderBy: { patrimonyNumber: "asc" },
          include: {
            category: { select: { name: true, lifeSpan: true } },
            valueHistory: { orderBy: { referenceMonth: "desc" }, take: 1 },
          },
        })
      : Promise.resolve([]),
    view === "baixas"
      ? prisma.assetWriteOff.findMany({
          ...pageWindow,
          orderBy: { date: "desc" },
          include: {
            asset: { select: { patrimonyNumber: true, name: true } },
            integrationPending: true,
            accountingTransaction: { select: { id: true } },
          },
        })
      : Promise.resolve([]),
    view === "ajustes"
      ? prisma.assetValueAdjustment.findMany({
          ...pageWindow,
          orderBy: { date: "desc" },
          include: { asset: { select: { patrimonyNumber: true, name: true } } },
        })
      : Promise.resolve([]),
  ]);
  const totalBookValue = activeAssetValue._sum.currentValue ?? 0;
  const initialCompetence = new Date().toISOString().slice(0, 7);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 sm:p-3">
      <ErpPageTitle
        title="Ciclo de vida patrimonial"
        description="Posição contábil, baixas, alienações, reavaliações e custos posteriores."
      />

      <details className="shrink-0 border border-slate-300 bg-white shadow-sm">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-slate-800 marker:text-slate-500">
          Operações de ciclo de vida
          <span className="ml-2 font-normal text-slate-500">Processar depreciação, registrar baixa, alienação ou ajuste de valor.</span>
        </summary>
        <div className="border-t border-slate-200 p-3">
          <AssetLifecycleClient assets={activeAssets} initialCompetence={initialCompetence} />
        </div>
      </details>

      <ErpListFrame
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <nav aria-label="Visão do ciclo de vida" className="flex min-w-0 items-center gap-1">
              {([
                ["posicao", "Posição patrimonial"],
                ["baixas", "Baixas e alienações"],
                ["ajustes", "Ajustes de valor"],
              ] as const).map(([candidate, label]) => (
                <Link
                  key={candidate}
                  href={lifecycleHref(candidate, 1)}
                  aria-current={view === candidate ? "page" : undefined}
                  className={
                    view === candidate
                      ? "h-7 rounded bg-slate-800 px-2 text-[11px] font-semibold leading-7 text-white"
                      : "h-7 rounded px-2 text-[11px] font-semibold leading-7 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                >
                  {label}
                </Link>
              ))}
            </nav>
            <p className="hidden text-[11px] text-slate-500 lg:block">20 registros por página</p>
          </div>
        }
        summary={
          <div className="flex min-w-0 items-center gap-3 text-[11px] text-slate-600">
            <span><strong className="text-slate-900">{total}</strong> {viewLabel(view)}</span>
            <span className="hidden border-l border-slate-200 pl-3 md:inline">{activeAssetTotal} bens ativos</span>
            <span className="hidden border-l border-slate-200 pl-3 lg:inline">Valor contábil ativo: <strong className="text-slate-900">{currency(totalBookValue)}</strong></span>
          </div>
        }
        pagination={
          <ErpPagination
            page={page}
            total={total}
            pageSize={PATRIMONIO_LIST_PAGE_SIZE}
            label={viewLabel(view)}
            previousHref={lifecycleHref(view, page - 1)}
            nextHref={lifecycleHref(view, page + 1)}
          />
        }
      >
        {view === "posicao" && (
          <table className="w-full table-fixed text-left text-[11px] leading-4 text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr className="h-7">
                <th className="w-[30%] px-3 text-left">Tombamento e bem</th>
                <th className="hidden w-[21%] px-3 text-left lg:table-cell">Categoria</th>
                <th className="w-[19%] px-3 text-right">Valor contábil</th>
                <th className="hidden w-[16%] px-3 text-left xl:table-cell">Última competência</th>
                <th className="hidden w-[15%] px-3 text-right xl:table-cell">Depreciação</th>
                <th className="w-[18%] px-3 text-left">Situação</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">Nenhum bem patrimonial encontrado.</td></tr>
              ) : (
                assets.map((asset) => {
                  const history = asset.valueHistory[0];
                  return (
                    <tr key={asset.id} className="h-[clamp(18px,2.65vh,28px)] border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-0 font-semibold text-slate-800"><span className="block truncate">{asset.patrimonyNumber} · {asset.name}</span></td>
                      <td className="hidden px-3 py-0 lg:table-cell"><span className="block truncate">{asset.category.name} · {asset.category.lifeSpan} meses</span></td>
                      <td className="px-3 py-0 text-right tabular-nums">{currency(asset.currentValue)}</td>
                      <td className="hidden px-3 py-0 tabular-nums xl:table-cell">{history ? history.referenceMonth.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric", timeZone: "UTC" }) : "Sem lançamento"}</td>
                      <td className="hidden px-3 py-0 text-right tabular-nums xl:table-cell">{history ? currency(history.depreciation) : "–"}</td>
                      <td className="px-3 py-0"><span className="inline-block max-w-full truncate rounded bg-slate-100 px-1.5 py-0 text-[10px] leading-4 text-slate-700">{asset.status}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {view === "baixas" && (
          <table className="w-full table-fixed text-left text-[11px] leading-4 text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr className="h-7">
                <th className="w-[14%] px-3 text-left">Data</th>
                <th className="w-[35%] px-3 text-left">Bem</th>
                <th className="w-[15%] px-3 text-left">Tipo</th>
                <th className="hidden w-[15%] px-3 text-right lg:table-cell">Valor contábil</th>
                <th className="hidden w-[14%] px-3 text-right xl:table-cell">Recebido</th>
                <th className="hidden w-[14%] px-3 text-right xl:table-cell">Ganho/perda</th>
                <th className="w-[21%] px-3 text-left">Integração</th>
              </tr>
            </thead>
            <tbody>
              {writeOffs.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-500">Nenhuma baixa ou alienação registrada.</td></tr>
              ) : (
                writeOffs.map((writeOff) => (
                  <tr key={writeOff.id} className="h-[clamp(18px,2.65vh,28px)] border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-0 tabular-nums">{writeOff.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
                    <td className="px-3 py-0 font-medium"><span className="block truncate">{writeOff.asset.patrimonyNumber} · {writeOff.asset.name}</span></td>
                    <td className="px-3 py-0"><span className="block truncate">{writeOff.type}</span></td>
                    <td className="hidden px-3 py-0 text-right tabular-nums lg:table-cell">{currency(writeOff.bookValue)}</td>
                    <td className="hidden px-3 py-0 text-right tabular-nums xl:table-cell">{currency(writeOff.disposalValue)}</td>
                    <td className="hidden px-3 py-0 text-right tabular-nums xl:table-cell">{currency(writeOff.gainLoss)}</td>
                    <td className="px-3 py-0"><span className="block truncate">{writeOff.accountingTransaction ? "Contabilizado" : writeOff.integrationPending ? `Pendente: ${writeOff.integrationPending.expectedEventCode}` : "Sem resultado"}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {view === "ajustes" && (
          <table className="w-full table-fixed text-left text-[11px] leading-4 text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr className="h-7">
                <th className="w-[15%] px-3 text-left">Data</th>
                <th className="w-[35%] px-3 text-left">Bem</th>
                <th className="w-[18%] px-3 text-left">Tipo</th>
                <th className="hidden w-[16%] px-3 text-right lg:table-cell">Variação</th>
                <th className="w-[18%] px-3 text-right">Valor final</th>
                <th className="hidden w-[22%] px-3 text-left xl:table-cell">Evidência</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">Nenhum ajuste de valor registrado.</td></tr>
              ) : (
                adjustments.map((adjustment) => (
                  <tr key={adjustment.id} className="h-[clamp(18px,2.65vh,28px)] border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-0 tabular-nums">{adjustment.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
                    <td className="px-3 py-0 font-medium"><span className="block truncate">{adjustment.asset.patrimonyNumber} · {adjustment.asset.name}</span></td>
                    <td className="px-3 py-0"><span className="block truncate">{adjustmentLabel(adjustment.type)}</span></td>
                    <td className="hidden px-3 py-0 text-right tabular-nums lg:table-cell">{currency(adjustment.adjustmentValue)}</td>
                    <td className="px-3 py-0 text-right tabular-nums">{currency(adjustment.closingValue)}</td>
                    <td className="hidden px-3 py-0 xl:table-cell"><span className="block truncate">{adjustment.evidence}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </ErpListFrame>
    </div>
  );
}
