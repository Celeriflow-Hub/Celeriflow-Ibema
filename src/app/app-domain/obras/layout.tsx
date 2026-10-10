import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";

const navigation: ModuleNavGroup[] = [{
  title: "Gestão urbana",
  items: [
    { title: "Painel", href: "/obras", icon: "layoutDashboard", exact: true },
    { title: "Obras e Projetos", href: "/obras/obras-projetos", icon: "building2" },
    { title: "Fiscalização e Medições", href: "/obras/fiscalizacao-medicoes", icon: "ruler" },
    { title: "Serviços Urbanos", href: "/obras/servicos-urbanos", icon: "pickaxe" },
    { title: "Iluminação e Energia", href: "/obras/iluminacao-energia", icon: "lightbulb" },
    { title: "Ordens de Serviço", href: "/obras/ordens-servico", icon: "clipboardCheck" },
    { title: "Máquinas e Equipes", href: "/obras/maquinas-equipes", icon: "tractor" },
    { title: "Documentos", href: "/obras/documentos", icon: "fileText" },
    { title: "Relatórios", href: "/obras/relatorios", icon: "barChart3" },
  ],
}, {
  title: "Construção civil",
  items: [
    { title: "Solicitações Urbanísticas", href: "/obras/construcao-civil", icon: "building2", exact: true },
    { title: "Configurações Urbanísticas", href: "/obras/construcao-civil/configuracoes", icon: "settings" },
    { title: "Profissionais e Construtoras", href: "/obras/construcao-civil/profissionais", icon: "users" },
    { title: "Formulários e Zoneamento", href: "/obras/construcao-civil/regras", icon: "settings" },
  ],
}];

export default function ObrasLayout({ children }: { children: React.ReactNode }) {
  return <ModuleShell moduleTitle="Obras e Serviços Públicos" moduleCaption="Infraestrutura e gestão urbana" moduleIcon="hardHat" navigation={navigation}>{children}</ModuleShell>;
}
