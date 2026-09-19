import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
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

type SearchParams = { q?: string; status?: string; page?: string };

export default async function BensPatrimoniaisPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const status = params?.status || "";
  const requestedPage = parsePatrimonioListPage(params?.page);

  const where: Prisma.AssetWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { patrimonyNumber: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const total = await prisma.asset.count({ where });
  const page = clampPatrimonioListPage(requestedPage, total);
  const assets = await prisma.asset.findMany({
    where,
    skip: (page - 1) * PATRIMONIO_LIST_PAGE_SIZE,
    take: PATRIMONIO_LIST_PAGE_SIZE,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      department: true,
      responsible: true,
      realEstate: true,
    },
  });
  const hrefValues = { q, status };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 sm:p-3">
      <ErpPageTitle
        title="Bens patrimoniais"
        description="Cadastro, localização e responsabilidade dos bens permanentes."
        action={
          <>
            <Link href="/patrimonio/ciclo-vida" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <span className="hidden sm:inline">Ciclo de vida</span>
              <span className="sm:hidden">Ciclo</span>
            </Link>
            <Link href="/patrimonio/bens/novo" className={buttonVariants({ size: "sm" })}>
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Tombar bem</span>
              <span className="sm:hidden">Novo</span>
            </Link>
          </>
        }
      />

      <ErpListFrame
        toolbar={
          <form className="flex flex-wrap items-center gap-2" role="search">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Tombamento ou descrição"
              className="h-8 min-w-0 flex-1 bg-white text-xs sm:min-w-72"
            />
            <select
              name="status"
              defaultValue={status}
              aria-label="Filtrar por situação"
              className="h-8 w-36 rounded-md border border-input bg-white px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Todas as situações</option>
              <option value="Ativo">Ativo</option>
              <option value="Em uso">Em uso</option>
              <option value="Ocioso">Ocioso</option>
              <option value="Em manutenção">Em manutenção</option>
              <option value="Baixado">Baixado</option>
            </select>
            <button type="submit" className={buttonVariants({ size: "sm" })}>
              <Search className="size-3.5" />
              Filtrar
            </button>
          </form>
        }
        summary={<p className="text-[11px] text-slate-600"><strong className="text-slate-900">{total}</strong> bem(ns) no recorte selecionado</p>}
        pagination={
          <ErpPagination
            page={page}
            total={total}
            pageSize={PATRIMONIO_LIST_PAGE_SIZE}
            label="bens"
            previousHref={patrimonioListHref("/patrimonio/bens", page - 1, hrefValues)}
            nextHref={patrimonioListHref("/patrimonio/bens", page + 1, hrefValues)}
          />
        }
      >
        <table className="w-full table-fixed text-left text-[11px] leading-4 text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <tr className="h-7">
              <th className="w-[14%] px-3 text-left">Tombamento</th>
              <th className="w-[40%] px-3 text-left">Descrição</th>
              <th className="hidden w-[15%] px-3 text-left xl:table-cell">Categoria</th>
              <th className="hidden w-[20%] px-3 text-left 2xl:table-cell">Localização</th>
              <th className="w-[15%] px-3 text-left">Situação</th>
              <th className="w-[16%] px-3 text-right">Valor contábil</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-slate-500">
                  Nenhum bem patrimonial encontrado para os filtros informados.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="h-[clamp(18px,2.65vh,28px)] border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-0 font-semibold text-emerald-800">
                    <Link className="block truncate underline-offset-2 hover:underline" href={`/patrimonio/bens/${encodeURIComponent(asset.id)}`}>
                      {asset.patrimonyNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-0 font-medium"><span className="block truncate">{asset.name}</span></td>
                  <td className="hidden px-3 py-0 xl:table-cell"><span className="block truncate">{asset.category?.name || "—"}</span></td>
                  <td className="hidden px-3 py-0 text-slate-600 2xl:table-cell">
                    <span className="block truncate">
                      {asset.realEstate
                        ? `${asset.realEstate.propertyType || "Imóvel"} · ${asset.realEstate.streetName || "Sem endereço"}`
                        : "Não vinculado"}
                    </span>
                  </td>
                  <td className="px-3 py-0">
                    <Badge
                      variant={asset.status === "Ativo" || asset.status === "Em uso" ? "default" : asset.status === "Baixado" ? "destructive" : "secondary"}
                      className="max-w-full truncate px-1.5 py-0 text-[10px] leading-4"
                    >
                      {asset.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-0 text-right font-medium tabular-nums">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(asset.currentValue)}
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
