"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModuleNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  query?: { key: string; values: string[] };
};

export type ModuleNavGroup = {
  title: string;
  items: ModuleNavItem[];
};

type ModuleShellProps = {
  moduleTitle: string;
  moduleCaption?: string;
  moduleIcon: LucideIcon;
  navigation: ModuleNavGroup[];
  children: ReactNode;
  sidebarVariant?: "dark" | "light";
  desktopCollapsible?: boolean;
};

function isCurrentRoute(
  item: ModuleNavItem,
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
) {
  const itemPath = item.href.split("?")[0];
  const matchesPath = item.exact
    ? pathname === itemPath
    : pathname === itemPath || pathname.startsWith(itemPath + "/");

  if (!matchesPath) return false;
  if (!item.query) return true;

  return item.query.values.includes(searchParams.get(item.query.key) || "");
}

export function ModuleShell({
  moduleTitle,
  moduleCaption,
  moduleIcon: ModuleIcon,
  navigation,
  children,
  sidebarVariant = "dark",
  desktopCollapsible = false,
}: ModuleShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuCollapsed, setIsDesktopMenuCollapsed] = useState(false);
  const isLightSidebar = sidebarVariant === "light";
  const isCollapsed = desktopCollapsible && isDesktopMenuCollapsed;

  return (
    <div
      data-module-shell
      className="relative -my-2 flex h-full min-h-0 w-[calc(100%+1rem)] max-w-[calc(1600px+1rem)] flex-1 flex-col overflow-hidden bg-slate-100 sm:-my-3 sm:w-[calc(100%+1.5rem)] sm:max-w-[calc(1600px+1.5rem)] lg:flex-row"
    >
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-slate-300 bg-white px-3 lg:hidden">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">Módulo operacional</p>
          <h2 className="truncate text-sm font-bold leading-tight text-slate-800">{moduleTitle}</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label={"Abrir menu de " + moduleTitle}
          aria-expanded={isMobileMenuOpen}
          className="flex size-8 items-center justify-center rounded border border-slate-300 text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <Menu className="size-4" />
        </button>
      </header>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label={"Fechar menu de " + moduleTitle}
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(19.5rem,calc(100vw-2rem))] -translate-x-full flex-col border-r px-3 py-4 shadow-2xl transition-[transform,width,padding] duration-200 lg:sticky lg:top-0 lg:z-20 lg:flex lg:h-full lg:translate-x-0 lg:shadow-none",
          desktopCollapsible ? "lg:w-56" : "lg:w-64",
          isLightSidebar
            ? "border-slate-300 bg-slate-100 text-slate-800"
            : "border-slate-700 bg-slate-950 text-slate-100",
          isCollapsed && "lg:w-16 lg:px-2",
          isMobileMenuOpen && "translate-x-0",
        )}
      >
        <div className={cn("mb-2 flex shrink-0 items-start justify-between border-b px-2 pb-2", isLightSidebar ? "border-slate-300" : "border-slate-700", isCollapsed && "lg:justify-center lg:px-0")}>
          <div className={cn("min-w-0", isCollapsed && "lg:hidden")}>
            <div className="mb-2 flex size-8 items-center justify-center rounded bg-emerald-600 text-white">
              <ModuleIcon className="size-4" />
            </div>
            <h2 className={cn("text-[13px] font-bold leading-tight", isLightSidebar ? "text-slate-800" : "truncate uppercase tracking-wide text-white")}>
              {moduleTitle}
            </h2>
            {moduleCaption && (
              <p className={cn("mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em]", isLightSidebar ? "text-slate-500" : "text-slate-400")}>
                {moduleCaption}
              </p>
            )}
          </div>
          {desktopCollapsible && (
            <button
              type="button"
              onClick={() => setIsDesktopMenuCollapsed((value) => !value)}
              aria-label={isCollapsed ? `Expandir menu de ${moduleTitle}` : `Recolher menu de ${moduleTitle}`}
              aria-expanded={!isCollapsed}
              className={cn(
                "hidden size-7 items-center justify-center rounded outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 lg:flex",
                isLightSidebar ? "text-slate-600 hover:bg-white hover:text-slate-900" : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Menu className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={"Fechar menu de " + moduleTitle}
            className={cn(
              "flex size-7 items-center justify-center rounded lg:hidden",
              isLightSidebar ? "text-slate-500 hover:bg-white hover:text-slate-900" : "text-slate-400 hover:bg-slate-800 hover:text-white",
            )}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden pr-1" aria-label={"Navegação de " + moduleTitle}>
          {navigation.map((group) => (
            <section key={group.title} className={cn("border-b pb-1.5 last:border-0", isLightSidebar ? "border-slate-200" : "border-slate-800")}>
              <p className={cn("px-2 pb-0.5 text-[9px] font-bold uppercase tracking-[0.14em]", isLightSidebar ? "text-slate-500" : "text-slate-500", isCollapsed && "lg:sr-only")}>{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const current = isCurrentRoute(item, pathname, searchParams);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.title : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-7 items-center gap-2.5 rounded-md px-2.5 py-1 text-[11px] font-medium outline-none transition-colors",
                        isCollapsed && "lg:justify-center lg:px-1",
                        current
                          ? "bg-emerald-700 text-white"
                          : isLightSidebar
                            ? "text-slate-600 hover:bg-white hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400",
                      )}
                    >
                      <item.icon className={cn("size-4 shrink-0", current ? "text-white" : isLightSidebar ? "text-slate-500" : "text-slate-400")} strokeWidth={current ? 2.5 : 2} />
                      <span className={cn("min-w-0 truncate", isCollapsed && "lg:hidden")}>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className={cn("mt-2 shrink-0 border-t pt-2", isLightSidebar ? "border-slate-300" : "border-slate-700")}>
          <Link
            href="/dashboard"
            title={isCollapsed ? "Voltar ao painel geral" : undefined}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex min-h-7 items-center gap-2.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              isCollapsed && "lg:justify-center lg:px-1",
              isLightSidebar ? "text-slate-600 hover:bg-white hover:text-slate-900" : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <ArrowLeft className={cn("size-4 shrink-0", isLightSidebar ? "text-slate-500" : "text-slate-400")} />
            <span className={cn(isCollapsed && "lg:hidden")}>Voltar ao painel geral</span>
          </Link>
        </div>
      </aside>

      <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden bg-slate-100">
        {children}
      </main>
    </div>
  );
}
