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
import {
  clampPatrimonioListPage,
  patrimonioListHref,
  parsePatrimonioListPage,
  PATRIMONIO_LIST_PAGE_SIZE,
} from "../listing";

type SearchParams = { q?: string; page?: string };

export default async function AlmoxarifadosPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const requestedPage = parsePatrimonioListPage(params?.page);
  const where: Prisma.WarehouseWhereInput = q
    ? { name: { contains: q, mode: "insensitive" } }
    : {};

  const total = await prisma.warehouse.count({ where });
  const page = clampPatrimonioListPage(requestedPage, total);
  const warehouses = await prisma.warehouse.findMany({
    where,
    skip: (page - 1) * PATRIMONIO_LIST_PAGE_SIZE,
    take: PATRIMONIO_LIST_PAGE_SIZE,
    orderBy: { name: "asc" },
    include: { manager: true },
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 sm:p-3">
      <ErpPageTitle
        title="Almoxarifados"
        description="Depósitos, responsáveis e centros de distribuição física."
        action={
          <Link href="/patrimonio/almoxarifados/novo" className={buttonVariants({ size: "sm" })}>
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Novo almoxarifado</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        }
      />

      <ErpListFrame
        toolbar={
          <form className="flex items-center gap-2" role="search">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Nome do almoxarifado"
              className="h-8 min-w-0 flex-1 bg-white text-xs sm:max-w-xl"
            />
            <button type="submit" className={buttonVariants({ size: "sm" })}>
              <Search className="size-3.5" />
              Buscar
            </button>
          </form>
        }
        summary={<p className="text-[11px] text-slate-600"><strong className="text-slate-900">{total}</strong> almoxarifado(s) no recorte selecionado</p>}
        pagination={
          <ErpPagination
            page={page}
            total={total}
            pageSize={PATRIMONIO_LIST_PAGE_SIZE}
            label="almoxarifados"
            previousHref={patrimonioListHref("/patrimonio/almoxarifados", page - 1, { q })}
            nextHref={patrimonioListHref("/patrimonio/almoxarifados", page + 1, { q })}
          />
        }
      >
        <table className="w-full table-fixed text-left text-[11px] leading-4 text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <tr className="h-7">
              <th className="w-[36%] px-3 text-left">Nome</th>
              <th className="w-[20%] px-3 text-left">Tipo</th>
              <th className="w-[30%] px-3 text-left">Responsável</th>
              <th className="w-[14%] px-3 text-left">Situação</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-500">Nenhum almoxarifado encontrado.</td></tr>
            ) : (
              warehouses.map((warehouse) => (
                <tr key={warehouse.id} className="h-[clamp(18px,2.65vh,28px)] border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-0 font-semibold text-emerald-800"><span className="block truncate">{warehouse.name}</span></td>
                  <td className="px-3 py-0"><span className="block truncate">{warehouse.type}</span></td>
                  <td className="px-3 py-0 text-slate-600"><span className="block truncate">{warehouse.manager?.name || "Sem responsável definido"}</span></td>
                  <td className="px-3 py-0">
                    <Badge variant={warehouse.isActive ? "default" : "secondary"} className="px-1.5 py-0 text-[10px] leading-4">
                      {warehouse.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ErpListFrame>
    </div>
  );
}
