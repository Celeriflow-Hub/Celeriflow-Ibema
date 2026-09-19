import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ErpPageTitleProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function ErpPageTitle({ title, description, action, icon, className }: ErpPageTitleProps) {
  return (
    <header className={cn("flex min-h-10 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 sm:flex-nowrap sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="flex min-w-0 items-center gap-2 text-[22px] font-semibold leading-tight tracking-tight text-slate-900">
          {icon}
          <span className="truncate">{title}</span>
        </h1>
        {description && <p className="mt-0.5 truncate text-[11px] text-slate-500">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}
