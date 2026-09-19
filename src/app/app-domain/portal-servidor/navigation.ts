import { CalendarDays, Clock3, FileSignature, LayoutDashboard, ReceiptText, UserRound, WalletCards } from "lucide-react";
import type { ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";

export const portalServidorNavigation: ModuleNavGroup[] = [
  {
    title: "Minha área",
    items: [
      {
        title: "Painel pessoal",
        href: "/portal-servidor",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "Minha ficha",
        href: "/portal-servidor/ficha-funcional",
        icon: UserRound,
      },
    ],
  },
  {
    title: "Consultas",
    items: [
      {
        title: "Documentos e assinaturas",
        href: "/portal-servidor/documentos",
        icon: FileSignature,
      },
      {
        title: "Meu ponto",
        href: "/portal-servidor/ponto",
        icon: Clock3,
      },
      {
        title: "Férias e afastamentos",
        href: "/portal-servidor/ferias",
        icon: CalendarDays,
      },
      {
        title: "Meus benefícios",
        href: "/portal-servidor/beneficios",
        icon: WalletCards,
      },
      {
        title: "Demonstrativo de folha",
        href: "/portal-servidor/folha",
        icon: ReceiptText,
      },
    ],
  },
];
