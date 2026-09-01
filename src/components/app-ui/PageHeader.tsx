import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function PageHeader({ title, action, icon, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-2 flex h-9 items-center justify-between gap-3 border-b border-slate-300 bg-white px-3 shadow-sm", className)}>
      <h1 className="flex min-w-0 items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
        {icon}
        <span className="truncate">{title}</span>
      </h1>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}
