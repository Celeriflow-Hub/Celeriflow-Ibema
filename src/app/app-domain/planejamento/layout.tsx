import { Suspense } from "react";
import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";

const navigation: ModuleNavGroup[] = [
  { title: "Planejamento e Orçamento", items: [{ title: "Painel de Planejamento", href: "/planejamento", icon: "layoutDashboard", exact: true }] },
];

export default async function PlanejamentoLayout({ children }: { children: React.ReactNode }) {
  await getTenantContextForModule("PLANEJAMENTO");
  return <Suspense><ModuleShell moduleTitle="Planejamento e Orçamento" moduleCaption="Instrumentos e gestão orçamentária" moduleIcon="bookOpenCheck" navigation={navigation}>{children}</ModuleShell></Suspense>;
}
