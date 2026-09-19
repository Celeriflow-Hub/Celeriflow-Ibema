"use client";

import { Suspense } from "react";
import {
  Building2,
  LayoutDashboard,
  MapPin,
  Banknote,
  Receipt,
  FileCheck,
  FileText,
  FileBadge,
  ShieldAlert,
  Scale,
} from "lucide-react";
import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";

const navigation: ModuleNavGroup[] = [
  {
    title: "Painel",
    items: [
      { title: "Painel Tributário", href: "/tributacao", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Cadastros Fiscais",
    items: [
      { title: "Cadastro Econômico", href: "/tributacao/economico", icon: Building2 },
      { title: "Imóveis (IPTU)", href: "/tributacao/imoveis", icon: MapPin },
    ],
  },
  {
    title: "Documentos e Arrecadação",
    items: [
      { title: "Alvarás e Licenças", href: "/tributacao/alvaras", icon: FileCheck },
      { title: "NFS-e", href: "/tributacao/nfse", icon: FileText },
      { title: "Guias e Arrecadação", href: "/tributacao/guias", icon: Receipt },
      { title: "Dívida Ativa", href: "/tributacao/divida", icon: Banknote },
      { title: "Certidões", href: "/tributacao/certidoes", icon: FileBadge },
    ],
  },
  {
    title: "Controle",
    items: [
      { title: "Fiscalização", href: "/tributacao/fiscalizacao", icon: ShieldAlert },
      { title: "Operações Internas", href: "/tributacao/operacoes", icon: Scale },
    ],
  },
];

export default function TributacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ModuleShell
        moduleTitle="Tributação"
        moduleCaption="Gestão Fiscal"
        moduleIcon={Building2}
        navigation={navigation}
      >
        {children}
      </ModuleShell>
    </Suspense>
  );
}
