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
  {
    title: "Saúde e segurança ocupacional",
    items: [
      { title: "Comunicar acidente (CAT)", href: "/portal-servidor/sst/cat", icon: "fileHeart" },
      { title: "Eleições da CIPA", href: "/portal-servidor/sst/cipa", icon: "users" },
      { title: "Meus planos de saúde", href: "/portal-servidor/sst/planos", icon: "fileHeart" },
      { title: "Meu histórico SST / PPP", href: "/portal-servidor/sst/relatorios", icon: "fileText" },
    ],
  },
];
