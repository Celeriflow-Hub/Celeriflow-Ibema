"use client";

import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  FileCheck2,
  FileText,
  Fuel,
  Map,
  ReceiptText,
  Route,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";
import { fleetNavigationGroups } from "./navigation";

const areaIcons: Record<string, LucideIcon> = {
  frota: Truck,
  utilizacao: Route,
  rotas: Map,
  planos: CalendarClock,
  ordens: ClipboardList,
  manutencoes: Wrench,
  consumos: Fuel,
  gastos: ReceiptText,
  seguros: ShieldCheck,
  obrigacoes: FileCheck2,
  documentos: FileText,
  ocorrencias: ClipboardList,
  relatorios: BarChart3,
};

const navigation: ModuleNavGroup[] = fleetNavigationGroups.map((group) => ({
  title: group.title,
  items: group.items.map((item) => ({
    title: item.title,
    href: `/frotas?area=${item.area}`,
    icon: areaIcons[item.area],
    query: {
      key: "area",
      values: item.area === "frota" ? ["", "frota"] : [item.area],
    },
  })),
}));

export default function FrotasLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleShell
      moduleTitle="Frotas"
      moduleCaption="Gestão operacional"
      moduleIcon={Truck}
      navigation={navigation}
    >
      {children}
    </ModuleShell>
  );
}
