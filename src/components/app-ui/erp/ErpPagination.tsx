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
    <nav aria-label={"Paginação de " + label} className="flex min-h-7 items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
      <span className="tabular-nums font-medium text-slate-500 dark:text-slate-400">
        {total ? `${total} ${label}` : `0 ${label}`}
      </span>
      <div className="flex items-center gap-1.5">
        <Link
          aria-disabled={previousDisabled}
          href={previousHref}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded border px-2.5 text-[11px] font-medium transition-colors",
            previousDisabled
              ? "pointer-events-none border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
          )}
        >
          <ChevronLeft className="size-3.5" />
          <span>Anterior</span>
        </Link>
        <span className="whitespace-nowrap px-1 text-[11px] font-medium text-slate-600 tabular-nums dark:text-slate-300">
          {page} de {totalPages}
        </span>
        <Link
          aria-disabled={nextDisabled}
          href={nextHref}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded border px-2.5 text-[11px] font-medium transition-colors",
            nextDisabled
              ? "pointer-events-none border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
          )}
        >
          <span>Próxima</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </nav>
  );
}
