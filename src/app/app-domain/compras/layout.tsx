"use client";

import { usePathname } from "next/navigation";
import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";

const navigation: ModuleNavGroup[] = [{
  title: "Compras",
  items: [
    { title: "Painel de Compras", href: "/compras", icon: "layoutDashboard", exact: true },
    { title: "Solicitações", href: "/compras/solicitacoes", icon: "clipboardList" },
    { title: "Planejamento", href: "/compras/planejamento", icon: "calendarDays" },
    { title: "Pesquisas de Preços", href: "/compras/pesquisas-precos", icon: "search" },
    { title: "Processos de Compra", href: "/compras/processos", icon: "clipboardCheck" },
    { title: "Licitações", href: "/compras/licitacoes", icon: "gavel" },
    { title: "Contratos", href: "/compras/contratos", icon: "scale" },
    { title: "Recebimentos", href: "/compras/recebimentos", icon: "package" },
    { title: "Catálogo de Itens", href: "/compras/catalogo", icon: "fileText" },
  ],
}];

export default function ComprasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.includes("/compras/pesquisas-precos/portal/")) {
    return <main className="min-h-0 flex-1 bg-slate-50">{children}</main>;
  }
  return (
    <ModuleShell moduleTitle="Compras e Licitações" moduleCaption="Gestão de aquisições" moduleIcon="gavel" navigation={navigation}>
      {children}
    </ModuleShell>
  );
}
