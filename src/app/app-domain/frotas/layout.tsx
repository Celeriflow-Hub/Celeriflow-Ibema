"use client";

import { ModuleShell, type ModuleIconName, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";
import { fleetNavigationGroups } from "./navigation";

const areaIcons: Record<string, ModuleIconName> = {
  frota: "truck",
  utilizacao: "route",
  rotas: "map",
  planos: "calendarClock",
  ordens: "clipboardList",
  manutencoes: "wrench",
  consumos: "fuel",
  gastos: "receiptText",
  seguros: "shieldCheck",
  obrigacoes: "fileCheck2",
  documentos: "fileText",
  ocorrencias: "clipboardList",
  relatorios: "barChart3",
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

navigation.unshift({
  title: "Gestão completa",
  items: [
    { title: "Painel e alertas", href: "/frotas/gestao?aba=painel", icon: "barChart3", query: { key: "aba", values: ["", "painel"] } },
    { title: "Medidores e consumo", href: "/frotas/gestao?aba=veiculos", icon: "truck", query: { key: "aba", values: ["veiculos"] } },
    { title: "Motoristas", href: "/frotas/gestao?aba=motoristas", icon: "clipboardList", query: { key: "aba", values: ["motoristas"] } },
    { title: "Postos, cotas e ordens", href: "/frotas/gestao?aba=ordens", icon: "fuel", query: { key: "aba", values: ["ordens", "postos", "cotas"] } },
    { title: "Diário de bordo", href: "/frotas/gestao?aba=viagens", icon: "route", query: { key: "aba", values: ["viagens"] } },
    { title: "Pneus e multas", href: "/frotas/gestao?aba=pneus", icon: "wrench", query: { key: "aba", values: ["pneus", "multas"] } },
    { title: "Oficinas (portal)", href: "/frotas/gestao?aba=oficinas", icon: "wrench", query: { key: "aba", values: ["oficinas"] } },
    { title: "Custos", href: "/frotas/gestao?aba=custos", icon: "receiptText", query: { key: "aba", values: ["custos"] } },
  ],
});

export default function FrotasLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleShell
      moduleTitle="Frotas"
      moduleCaption="Gestão operacional"
      moduleIcon="truck"
      navigation={navigation}
    >
      {children}
    </ModuleShell>
  );
}
