import type { ReactNode } from "react";

/** A single scroll owner keeps the table header sticky and the footer visible. */
export function RhListFrame({ toolbar, pagination, children }: {
  toolbar?: ReactNode;
  pagination: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {toolbar && <div className="shrink-0 border-b border-slate-200 p-2.5 dark:border-slate-800">{toolbar}</div>}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      <div className="shrink-0 border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">{pagination}</div>
    </section>
  );
}
