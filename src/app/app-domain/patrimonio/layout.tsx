"use client";

import {
  Archive,
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  Package,
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
    title: "Patrimônio",
    items: [
      { title: "Bens patrimoniais", href: "/patrimonio/bens", icon: Archive },
      { title: "Ciclo de vida", href: "/patrimonio/ciclo-vida", icon: ChartNoAxesCombined },
    ],
  },
  {
    title: "Almoxarifado",
    items: [
      { title: "Almoxarifados", href: "/patrimonio/almoxarifados", icon: Warehouse },
      { title: "Materiais e estoque", href: "/patrimonio/materiais", icon: Boxes },
      { title: "Requisições internas", href: "/patrimonio/requisicoes", icon: ClipboardList },
      { title: "Inventários", href: "/patrimonio/inventarios", icon: ClipboardList },
    ],
  },
];

export default function PatrimonioLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleShell
      moduleTitle="Almoxarifado e Patrimônio"
      moduleCaption="Bens, estoque e inventário"
      moduleIcon={Package}
      navigation={navigation}
    >
      {children}
    </ModuleShell>
  );
}
