import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import type { Prisma } from "@prisma/client";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { StockOperationsClient } from "./StockOperationsClient";
import {
  clampPatrimonioListPage,
  patrimonioListHref,
  parsePatrimonioListPage,
  PATRIMONIO_LIST_PAGE_SIZE,
} from "../listing";

type MaterialView = "catalogo" | "saldos" | "movimentar";
type SearchParams = { q?: string; page?: string; view?: string };

function getView(value?: string): MaterialView {
  return value === "saldos" || value === "movimentar" ? value : "catalogo";
}

export default async function MateriaisPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const view = getView(params?.view);
  const requestedPage = parsePatrimonioListPage(params?.page);
  const catalogWhere: Prisma.MaterialWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [catalogTotal, stockTotal] = await Promise.all([
    prisma.material.count({ where: catalogWhere }),
    prisma.materialStock.count(),
  ]);
  const selectedTotal = view === "saldos" ? stockTotal : catalogTotal;
  const page = view === "movimentar" ? 1 : clampPatrimonioListPage(requestedPage, selectedTotal);

  const [materials, stockRows, warehouses, movementMaterials, settlements] = await Promise.all([
    prisma.material.findMany({
      where: catalogWhere,
      skip: (page - 1) * PATRIMONIO_LIST_PAGE_SIZE,
      take: PATRIMONIO_LIST_PAGE_SIZE,
      orderBy: { name: "asc" },
      include: { category: true, stocks: { select: { quantity: true } } },
    }),
    prisma.materialStock.findMany({
      skip: (page - 1) * PATRIMONIO_LIST_PAGE_SIZE,
      take: PATRIMONIO_LIST_PAGE_SIZE,
      orderBy: [{ warehouse: { name: "asc" } }, { material: { name: "asc" } }, { batchNumber: "asc" }],
      include: {
        warehouse: { select: { name: true } },
        material: { select: { code: true, name: true, unitOfMeasure: true } },
      },
    }),
    prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.material.findMany({
      take: 200,
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.settlement.findMany({
      where: { status: "Liquidado" },
      take: 100,
      orderBy: { date: "desc" },
      select: { id: true, date: true, value: true, commitment: { select: { number: true } } },
    }),
  ]);

  const panelHref = (nextView: MaterialView, nextPage = 1) =>
    patrimonioListHref("/patrimonio/materiais", nextPage, { q: nextView === "catalogo" ? q : undefined, view: nextView });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 sm:p-3">
      <ErpPageTitle
        title="Materiais e estoque"
        description="Catálogo, posição física por lote e movimentações do almoxarifado."
        action={
          <Link href="/patrimonio/materiais/novo" className={buttonVariants({ size: "sm" })}>
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Novo material</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        }
      />

      <nav className="flex shrink-0 items-center gap-1 border-b border-slate-300 px-1" aria-label="Visões de materiais e estoque">
        {([
          ["catalogo", "Catálogo"],
          ["saldos", "Posição de estoque"],
          ["movimentar", "Movimentar"],
        ] as Array<[MaterialView, string]>).map(([itemView, label]) => (
          <Link
            key={itemView}
            href={panelHref(itemView)}
            aria-current={view === itemView ? "page" : undefined}
            className={`border-b-2 px-3 py-1.5 text-xs font-semibold transition-colors ${view === itemView ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {view === "catalogo" && (
        <ErpListFrame
          toolbar={
            <form className="flex items-center gap-2" role="search">
              <input type="hidden" name="view" value="catalogo" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Código ou descrição do material"
                className="h-8 min-w-0 flex-1 bg-white text-xs sm:max-w-xl"
              />
              <button type="submit" className={buttonVariants({ size: "sm" })}>
                <Search className="size-3.5" />
                Buscar
              </button>
            </form>
          }
          summary={<p className="text-[11px] text-slate-600"><strong className="text-slate-900">{catalogTotal}</strong> material(is) no catálogo</p>}
          pagination={
            <ErpPagination
              page={page}
              total={catalogTotal}
              pageSize={PATRIMONIO_LIST_PAGE_SIZE}
              label="materiais"
              previousHref={panelHref("catalogo", page - 1)}
              nextHref={panelHref("catalogo", page + 1)}
            />
          }
        >
          <table className="w-full table-fixed text-left text-[11px] leading-4 text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr className="h-7">
                <th className="w-[16%] px-3 text-left">Código</th>
                <th className="w-[43%] px-3 text-left">Descrição</th>
                <th className="hidden w-[20%] px-3 text-left lg:table-cell">Categoria</th>
                <th className="w-[10%] px-3 text-left">UN</th>
                <th className="w-[18%] px-3 text-right">Saldo atual</th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-10 text-center text-slate-500">Nenhum material encontrado para os filtros informados.</td></tr>
              ) : (
                materials.map((material) => {
                  const totalStock = material.stocks.reduce((total, stock) => total + stock.quantity, 0);
                  const isLowStock = totalStock <= material.minStock;
                  return (
                    <tr key={material.id} className="h-[clamp(18px,2.65vh,28px)] border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-0 font-semibold text-emerald-800"><span className="block truncate">{material.code}</span></td>
                      <td className="px-3 py-0 font-medium"><span className="block truncate">{material.name}</span></td>
                      <td className="hidden px-3 py-0 lg:table-cell"><span className="block truncate">{material.category?.name || "—"}</span></td>
                      <td className="px-3 py-0">{material.unitOfMeasure}</td>
                      <td className="px-3 py-0 text-right">
                        <Badge
                          variant={isLowStock && totalStock > 0 ? "secondary" : totalStock === 0 ? "destructive" : "default"}
                          className={!isLowStock && totalStock > 0 ? "max-w-full truncate bg-emerald-600 px-1.5 py-0 text-[10px] leading-4 hover:bg-emerald-600" : "max-w-full truncate px-1.5 py-0 text-[10px] leading-4"}
                        >
                          {totalStock.toLocaleString("pt-BR")} {material.unitOfMeasure}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ErpListFrame>
      )}

      {view === "saldos" && (
        <ErpListFrame
          toolbar={<p className="text-xs font-semibold text-slate-800">Posição física por almoxarifado e lote</p>}
          summary={<p className="text-[11px] text-slate-600"><strong className="text-slate-900">{stockTotal}</strong> posição(ões) de estoque registrada(s)</p>}
          pagination={
            <ErpPagination
              page={page}
              total={stockTotal}
              pageSize={PATRIMONIO_LIST_PAGE_SIZE}
              label="posições de estoque"
              previousHref={panelHref("saldos", page - 1)}
              nextHref={panelHref("saldos", page + 1)}
            />
          }
        >
          <table className="w-full table-fixed text-left text-[11px] leading-4 text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr className="h-7">
                <th className="w-[23%] px-3 text-left">Almoxarifado</th>
                <th className="w-[35%] px-3 text-left">Material</th>
                <th className="hidden w-[14%] px-3 text-left lg:table-cell">Lote</th>
                <th className="w-[16%] px-3 text-right">Saldo</th>
                <th className="hidden w-[16%] px-3 text-right xl:table-cell">Custo unit.</th>
                <th className="w-[14%] px-3 text-left">Validade</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">Nenhuma posição de estoque registrada.</td></tr>
              ) : (
                stockRows.map((stock) => (
                  <tr key={stock.id} className="h-[clamp(18px,2.65vh,28px)] border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-0"><span className="block truncate">{stock.warehouse.name}</span></td>
                    <td className="px-3 py-0 font-medium"><span className="block truncate">{stock.material.code} · {stock.material.name}</span></td>
                    <td className="hidden px-3 py-0 lg:table-cell"><span className="block truncate">{stock.batchNumber || "Sem lote"}</span></td>
                    <td className="px-3 py-0 text-right font-medium tabular-nums">{stock.quantity.toLocaleString("pt-BR")} {stock.material.unitOfMeasure}</td>
                    <td className="hidden px-3 py-0 text-right tabular-nums xl:table-cell">{stock.unitCost === null ? "—" : stock.unitCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="px-3 py-0 tabular-nums">{stock.expirationDate ? stock.expirationDate.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ErpListFrame>
      )}

      {view === "movimentar" && (
        <ErpListFrame
          toolbar={<p className="text-xs font-semibold text-slate-800">Registrar movimentação de estoque</p>}
        >
          <div className="p-3">
            <StockOperationsClient
              materials={movementMaterials.map((material) => ({ id: material.id, label: `${material.code} - ${material.name}` }))}
              warehouses={warehouses.map((warehouse) => ({ id: warehouse.id, label: warehouse.name }))}
              settlements={settlements.map((settlement) => ({
                id: settlement.id,
                label: `${settlement.commitment.number} - ${settlement.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })} - ${settlement.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
              }))}
            />
          </div>
        </ErpListFrame>
      )}
    </div>
  );
}
