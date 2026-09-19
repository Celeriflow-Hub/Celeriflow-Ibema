import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { buttonVariants } from "@/components/ui/button";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import {
  Archive,
  Boxes,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  Plus,
  Warehouse,
} from "lucide-react";
import Link from "next/link";

const shortcutItems = [
  {
    href: "/patrimonio/bens",
    title: "Bens patrimoniais",
    description: "Tombamento, localização e responsabilidade.",
    icon: Archive,
  },
  {
    href: "/patrimonio/almoxarifados",
    title: "Almoxarifados",
    description: "Depósitos, responsáveis e centros de distribuição.",
    icon: Warehouse,
  },
  {
    href: "/patrimonio/materiais",
    title: "Materiais e estoque",
    description: "Catálogo, saldo físico e movimentações.",
    icon: Boxes,
  },
  {
    href: "/patrimonio/requisicoes",
    title: "Requisições internas",
    description: "Pedidos de materiais dos setores.",
    icon: ClipboardList,
  },
  {
    href: "/patrimonio/inventarios",
    title: "Inventários",
    description: "Contagem, bloqueio e divergências de estoque.",
    icon: ClipboardList,
  },
  {
    href: "/patrimonio/ciclo-vida",
    title: "Ciclo de vida",
    description: "Depreciação, baixas e ajustes contábeis.",
    icon: ChartNoAxesCombined,
  },
];

export default async function PatrimonioDashboard() {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const [totalAssets, activeAssets, totalWarehouses, totalMaterials, pendingRequests] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "Ativo" } }),
    prisma.warehouse.count(),
    prisma.material.count(),
    prisma.materialRequest.count({ where: { status: "Pendente" } }),
  ]);

  const kpis = [
    { label: "Bens ativos", value: activeAssets, detail: `de ${totalAssets} tombados`, icon: Archive },
    { label: "Materiais", value: totalMaterials, detail: "itens em catálogo", icon: Boxes },
    { label: "Requisições pendentes", value: pendingRequests, detail: "aguardando atendimento", icon: ClipboardList },
    { label: "Almoxarifados", value: totalWarehouses, detail: "locais cadastrados", icon: Warehouse },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 sm:p-3">
      <ErpPageTitle
        title="Almoxarifado e Patrimônio"
        description="Visão operacional de bens permanentes, estoque físico e requisições internas."
        action={
          <>
            <Link href="/patrimonio/bens/novo" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Archive className="size-3.5" />
              <span className="hidden sm:inline">Tombar bem</span>
              <span className="sm:hidden">Tombar</span>
            </Link>
            <Link href="/patrimonio/materiais?view=movimentar" className={buttonVariants({ size: "sm" })}>
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Movimentar estoque</span>
              <span className="sm:hidden">Movimentar</span>
            </Link>
          </>
        }
      />

      <section className="grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4" aria-label="Indicadores operacionais">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex min-h-16 items-center gap-3 border border-slate-300 bg-white px-3 py-2 shadow-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-slate-100 text-emerald-700">
              <kpi.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
              <p className="text-xl font-semibold leading-tight tabular-nums text-slate-900">{kpi.value}</p>
              <p className="truncate text-[10px] text-slate-500">{kpi.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-300 bg-white shadow-sm" aria-labelledby="operacoes-title">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
          <div>
            <h2 id="operacoes-title" className="text-xs font-semibold text-slate-800">Operações do módulo</h2>
            <p className="text-[10px] text-slate-500">Acesse cadastros, controle de estoque e procedimentos patrimoniais.</p>
          </div>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-1 content-start divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-3">
          {shortcutItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-16 items-center gap-3 px-3 py-2 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 group-hover:border-emerald-200 group-hover:text-emerald-700">
                <item.icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">{item.title}</p>
                <p className="truncate text-[10px] text-slate-500">{item.description}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-slate-300 group-hover:text-emerald-700" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
