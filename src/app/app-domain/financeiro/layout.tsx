"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Landmark, 
  WalletCards, 
  FileText,
  Receipt,
  Scale,
  LayoutDashboard,
  ArrowLeft,
  Menu,
  X,
  BookOpenCheck,
  ClipboardList,
  Download,
  ArrowRightLeft,
  TrendingUp,
  GitCompare,
  Activity,
  ChevronDown
} from "lucide-react";

const sidebarNavGroups = [
  {
    title: "Visão Geral",
    items: [{ title: "Painel Financeiro", href: "/financeiro", icon: LayoutDashboard }],
  },
  {
    title: "Planejamento e Orçamento",
    items: [
      { title: "Planejamento Orçamentário", href: "/financeiro/orcamento/planejamento", icon: BookOpenCheck },
      { title: "Cadastros Orçamentários", href: "/financeiro/orcamento/cadastros", icon: FileText },
      { title: "Dotações e Reservas", href: "/financeiro/orcamento", icon: Scale },
    ],
  },
  {
    title: "Execução da Despesa",
    items: [
      { title: "Empenhos", href: "/financeiro/empenhos", icon: FileText },
      { title: "Liquidações", href: "/financeiro/liquidacoes", icon: Receipt },
      { title: "Pagamentos", href: "/financeiro/pagamentos", icon: WalletCards },
      { title: "Restos a Pagar", href: "/financeiro/restos-a-pagar", icon: ClipboardList },
    ],
  },
  {
    title: "Receitas",
    items: [
      { title: "Lançamentos de Receita", href: "/financeiro/receitas", icon: WalletCards },
      { title: "Regras Constitucionais", href: "/financeiro/receitas-constitucionais", icon: Landmark },
    ],
  },
  {
    title: "Tesouraria e Bancos",
    items: [
      { title: "Contas e Transferências", href: "/financeiro/contas-bancarias", icon: Landmark },
      { title: "Extratos Bancários", href: "/financeiro/download-extratos", icon: Download },
      { title: "Monitoramento de Automações", href: "/financeiro/automacoes", icon: Activity },
      { title: "Resgates e Aplicações", href: "/financeiro/resgates-aplicacoes", icon: ArrowRightLeft },
      { title: "Rendimentos de Aplicações", href: "/financeiro/rendimentos", icon: TrendingUp },
      { title: "Conciliação Bancária", href: "/financeiro/conciliacao-bancaria", icon: GitCompare },
    ],
  },
  {
    title: "Contabilidade e Saídas",
    items: [
      { title: "Contabilidade e Fechamento", href: "/financeiro/contabilidade", icon: Scale },
      { title: "Relatórios Financeiros", href: "/financeiro/relatorios", icon: FileText },
    ],
  },
];

const sidebarNavItems = sidebarNavGroups.flatMap((group) => group.items);

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeGroup = sidebarNavGroups.find((group) => group.items.some((item) => {
    if (item.href === "/financeiro") return pathname === "/financeiro";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }))?.title ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);

  return (
    <div data-module-shell className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col overflow-visible bg-slate-100 xl:flex-row">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-300 bg-white px-3 xl:hidden">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Módulo setorial</p>
          <h2 className="text-sm font-bold leading-tight text-slate-800">Financeiro e Contábil</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menu financeiro"
          aria-expanded={isSidebarOpen}
          className="flex size-8 items-center justify-center rounded border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <Menu className="size-4" />
        </button>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu financeiro"
          className="fixed inset-0 z-40 bg-slate-950/45 xl:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-[min(19.5rem,calc(100vw-2rem))] -translate-x-full flex-col border-r border-slate-700 bg-slate-950 px-3 py-4 text-slate-100 shadow-2xl transition-transform duration-200
        ${isSidebarOpen ? 'translate-x-0' : ''}
        xl:sticky xl:top-[5.5rem] xl:z-20 xl:flex xl:h-[calc(100dvh-6rem)] xl:w-64 xl:translate-x-0 xl:shadow-none
      `}>
        <div className="mb-4 flex items-start justify-between border-b border-slate-700 px-2 pb-4">
          <div>
            <div className="mb-2 flex size-8 items-center justify-center rounded bg-emerald-500 text-white">
              <Landmark className="size-4" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">Financeiro</h2>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Gestão e contabilidade</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Fechar menu financeiro"
            className="flex size-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white xl:hidden"
          >
            <X className="size-4" />
          </button>
        </div>
        
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1" aria-label="Navegação financeira">
          {sidebarNavGroups.map((group) => (
            <section key={group.title} className="border-b border-slate-800/90 pb-1 last:border-0">
              <button
                type="button"
                onClick={() => setOpenGroup((current) => current === group.title ? null : group.title)}
                aria-expanded={openGroup === group.title || activeGroup === group.title}
                className={`flex w-full items-center justify-between rounded px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  activeGroup === group.title
                    ? "text-emerald-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span>{group.title}</span>
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${openGroup === group.title || activeGroup === group.title ? "rotate-180" : ""}`} />
              </button>
              {(openGroup === group.title || activeGroup === group.title) && group.items.map((item) => {
                const isActive = item.href === "/financeiro"
                  ? pathname === "/financeiro"
                  : pathname === item.href || (
                    pathname.startsWith(`${item.href}/`) &&
                    !sidebarNavItems.some((child) => child.href !== item.href && child.href.startsWith(`${item.href}/`) && pathname.startsWith(child.href))
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setOpenGroup(group.title);
                      setIsSidebarOpen(false);
                    }}
                    className={`mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors outline-none ${
                      isActive
                        ? "bg-emerald-700 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400"
                    }`}
                  >
                    <item.icon className={`size-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="min-w-0 truncate">{item.title}</span>
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>

        <div className="mt-3 border-t border-slate-700 pt-3">
          <Link
            href="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="size-4 shrink-0 text-slate-400" strokeWidth={2} />
            <span>Voltar ao painel geral</span>
          </Link>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-slate-100">
        {children}
      </main>
    </div>
  );
}
