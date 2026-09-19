import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ErpPaginationProps = {
  page: number;
  total: number;
  pageSize?: number;
  previousHref: string;
  nextHref: string;
  label?: string;
};

export function ErpPagination({
  page,
  total,
  pageSize = 20,
  previousHref,
  nextHref,
  label = "registros",
}: ErpPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const previousDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav aria-label={"Paginação de " + label} className="flex min-h-7 items-center justify-between gap-3 text-[11px] text-slate-600">
      <span className="tabular-nums">{total ? first + "–" + last + " de " + total : "0 " + label}</span>
      <div className="flex items-center gap-2">
        <Link
          aria-disabled={previousDisabled}
          href={previousHref}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded border px-2 font-semibold",
            previousDisabled ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-slate-700 hover:bg-slate-50",
          )}
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </Link>
        <span className="whitespace-nowrap tabular-nums">Página {page} de {totalPages}</span>
        <Link
          aria-disabled={nextDisabled}
          href={nextHref}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded border px-2 font-semibold",
            nextDisabled ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-slate-700 hover:bg-slate-50",
          )}
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </nav>
  );
}
