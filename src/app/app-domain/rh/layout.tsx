"use client";

import { Suspense } from "react";
import {
  Users,
  Wallet,
  Clock,
  CalendarDays,
  LayoutDashboard,
  UserPlus,
  Gift,
  HeartPulse,
  FileSignature,
} from "lucide-react";
import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";

const navigation: ModuleNavGroup[] = [
  {
    title: "Gestão",
    items: [
      { title: "Painel RH", href: "/rh", icon: LayoutDashboard, exact: true },
      { title: "Servidores", href: "/rh/servidores", icon: Users },
      { title: "Dependentes", href: "/rh/dependentes", icon: UserPlus },
    ],
  },
  {
    title: "Folha e Benefícios",
    items: [
      { title: "Folha de Pagamento", href: "/rh/folha", icon: Wallet },
      { title: "Benefícios", href: "/rh/beneficios", icon: Gift },
    ],
  },
  {
    title: "Controle",
    items: [
      { title: "Registro de Ponto", href: "/rh/ponto", icon: Clock },
      { title: "Férias", href: "/rh/ferias", icon: CalendarDays },
      { title: "Licenças", href: "/rh/licencas", icon: HeartPulse },
      { title: "Atos de Pessoal", href: "/rh/atos", icon: FileSignature },
    ],
  },
];

export default function RhLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ModuleShell
        moduleTitle="RH e Folha"
        moduleCaption="Gestão de Pessoal"
        moduleIcon={Users}
        navigation={navigation}
      >
        {children}
      </ModuleShell>
    </Suspense>
  );
}
