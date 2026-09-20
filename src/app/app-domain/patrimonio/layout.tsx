"use client";

import {
  Archive,
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  Landmark,
  Package,
  Truck,
  Warehouse,
} from "lucide-react";
import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";

const navigation: ModuleNavGroup[] = [
  {
    title: "Visão geral",
    items: [
      { title: "Painel operacional", href: "/patrimonio", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Almoxarifado",
    items: [
      { title: "Almoxarifados", href: "/patrimonio/almoxarifados", icon: Warehouse },
      { title: "Estoque", href: "/patrimonio/materiais", icon: Boxes },
      { title: "Requisições internas", href: "/patrimonio/requisicoes", icon: ClipboardList },
      { title: "Inventários", href: "/patrimonio/inventarios", icon: ClipboardList },
      { title: "Fornecedores", href: "/cadastros/fornecedores", icon: Truck },
      { title: "Centros de custo", href: "/patrimonio/centros-custo", icon: Landmark },
    ],
  },
  {
    title: "Patrimônio",
    items: [
      { title: "Bens patrimoniais", href: "/patrimonio/bens", icon: Archive },
      { title: "Ciclo de vida", href: "/patrimonio/ciclo-vida", icon: ChartNoAxesCombined },
    ],
  },
];

export default function PatrimonioLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleShell
      moduleTitle="Almoxarifado e Patrimônio"
      moduleIcon={Package}
      navigation={navigation}
      sidebarVariant="light"
      desktopCollapsible
    >
      {children}
    </ModuleShell>
  );
}
