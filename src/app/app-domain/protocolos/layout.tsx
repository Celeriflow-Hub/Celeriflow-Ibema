"use client";

import {
  Archive,
  BarChart3,
  Bell,
  ChartNoAxesCombined,
  FileBox,
  FileSearch,
  FileSignature,
  LayoutDashboard,
  MessageSquareWarning,
} from "lucide-react";
import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";

const navigation: ModuleNavGroup[] = [
  {
    title: "Visão geral",
    items: [{ title: "Painel de protocolos", href: "/protocolos", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Operação",
    items: [
      { title: "Caixa do setor", href: "/protocolos/processos", icon: FileBox },
      { title: "Acompanhamento", href: "/protocolos/acompanhamento", icon: ChartNoAxesCombined },
      { title: "Buscar processo", href: "/protocolos/busca", icon: FileSearch },
    ],
  },
  {
    title: "Atendimento",
    items: [
      { title: "Ouvidoria", href: "/protocolos/ouvidoria", icon: MessageSquareWarning },
      { title: "Notificações", href: "/protocolos/notificacoes", icon: Bell },
    ],
  },
  {
    title: "Gestão",
    items: [
      { title: "Assinaturas", href: "/protocolos/assinaturas", icon: FileSignature },
      { title: "Relatórios", href: "/protocolos/relatorios", icon: BarChart3 },
      { title: "Arquivados", href: "/protocolos/arquivados", icon: Archive },
    ],
  },
];

export default function ProtocolosLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleShell
      moduleTitle="Protocolos e Processos"
      moduleCaption="Processo digital"
      moduleIcon={FileBox}
      navigation={navigation}
    >
      {children}
    </ModuleShell>
  );
}
