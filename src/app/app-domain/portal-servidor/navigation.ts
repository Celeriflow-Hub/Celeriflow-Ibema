import type { ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";

export const portalServidorNavigation: ModuleNavGroup[] = [
  {
    title: "Minha área",
    items: [
      {
        title: "Painel pessoal",
        href: "/portal-servidor",
        icon: "layoutDashboard",
        exact: true,
      },
      {
        title: "Minha ficha",
        href: "/portal-servidor/ficha-funcional",
        icon: "userRound",
      },
      {
        title: "Solicitações",
        href: "/portal-servidor/solicitacoes",
        icon: "clipboardList",
      },
      {
        title: "Emitir documentos",
        href: "/portal-servidor/emissao",
        icon: "fileCheck2",
      },
      {
        title: "Margem e histórico",
        href: "/portal-servidor/margem",
        icon: "handCoins",
      },
    ],
  },
  {
    title: "Consultas",
    items: [
      {
        title: "Documentos e assinaturas",
        href: "/portal-servidor/documentos",
        icon: "fileSignature",
      },
      {
        title: "Meu ponto",
        href: "/portal-servidor/ponto",
        icon: "clock3",
      },
      {
        title: "Férias e afastamentos",
        href: "/portal-servidor/ferias",
        icon: "calendarDays",
      },
      {
        title: "Meus benefícios",
        href: "/portal-servidor/beneficios",
        icon: "walletCards",
      },
      {
        title: "Demonstrativo de folha",
        href: "/portal-servidor/folha",
        icon: "receiptText",
      },
    ],
  },
];
