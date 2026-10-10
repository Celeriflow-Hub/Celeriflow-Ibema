import { Suspense } from "react";
import { ModuleShell, type ModuleNavGroup } from "@/components/app-ui/erp/ModuleShell";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";

const navigation: ModuleNavGroup[] = [
  { title: "Segurança e Medicina do Trabalho", items: [{ title: "Painel de SST", href: "/sst", icon: "layoutDashboard", exact: true }] },
];

export default async function SstLayout({ children }: { children: React.ReactNode }) {
  await getTenantContextForModule("SST");
  return <Suspense><ModuleShell moduleTitle="Segurança e Medicina do Trabalho" moduleCaption="Saúde ocupacional dos servidores" moduleIcon="hardHat" navigation={navigation}>{children}</ModuleShell></Suspense>;
}
