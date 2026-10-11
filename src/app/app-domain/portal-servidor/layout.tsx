"use client";

import { ModuleShell } from "@/components/app-ui/erp/ModuleShell";
import { usePathname } from "next/navigation";
import { portalServidorNavigation } from "./navigation";

export default function PortalServidorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/portal-servidor/entrar") return <>{children}</>;

  return (
    <ModuleShell
      moduleTitle="Portal do Servidor"
      moduleCaption="Autosserviço funcional"
      moduleIcon="badgeCheck"
      navigation={portalServidorNavigation}
    >
      {children}
    </ModuleShell>
  );
}
