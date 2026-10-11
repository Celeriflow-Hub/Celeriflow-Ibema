"use client";

import { ModuleShell } from "@/components/app-ui/erp/ModuleShell";

export default function PortalFrotaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleShell moduleTitle="Portal da Frota" moduleCaption="Motorista" moduleIcon="truck" navigation={[{ title: "Motorista", items: [{ title: "Saída e chegada", href: "/portal-frota", icon: "route" }] }]}>
      {children}
    </ModuleShell>
  );
}
