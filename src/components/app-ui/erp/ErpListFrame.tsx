import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ErpListFrameProps = {
  toolbar?: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
  pagination?: ReactNode;
  className?: string;
};

export function ErpListFrame({ toolbar, summary, children, pagination, className }: ErpListFrameProps) {
  return (
    <section className={cn("flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-300 bg-white shadow-sm", className)}>
      {toolbar && <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-1">{toolbar}</div>}
      {summary && <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-3 py-1">{summary}</div>}
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      {pagination && <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-1">{pagination}</div>}
    </section>
  );
}
