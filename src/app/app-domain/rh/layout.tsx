import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";
import styles from "./RhWorkspace.module.css";

const navigation: ModuleNavGroup[] = [{
  title: "RH e Folha",
  items: [
    { title: "Painel RH", href: "/rh", icon: "layoutDashboard", exact: true },
    { title: "Servidores", href: "/rh/servidores", icon: "users" },
    { title: "Dependentes", href: "/rh/dependentes", icon: "userRound" },
    { title: "Folha de Pagamento", href: "/rh/folha", icon: "walletCards" },
    { title: "Parametrizações", href: "/rh/parametrizacoes", icon: "settings2" },
    { title: "Benefícios", href: "/rh/beneficios", icon: "gift" },
    { title: "Registro de Ponto", href: "/rh/ponto", icon: "clock3" },
    { title: "Férias", href: "/rh/ferias", icon: "calendarDays" },
    { title: "Licenças", href: "/rh/licencas", icon: "heartPulse" },
    { title: "Atos de Pessoal", href: "/rh/atos", icon: "fileSignature" },
    { title: "Solicitações do Portal", href: "/rh/solicitacoes", icon: "mailOpen" },
  ],
}];

export default function RhLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleShell moduleTitle="RH e Folha" moduleCaption="Gestão de pessoal" moduleIcon="users" navigation={navigation}>
      <div className={`${styles.workspace} flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}>{children}</div>
    </ModuleShell>
  );
}
