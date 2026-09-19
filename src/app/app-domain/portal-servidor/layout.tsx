"use client";

import { BadgeCheck } from "lucide-react";
import { ModuleShell } from "@/components/app-ui/erp/ModuleShell";
import { portalServidorNavigation } from "./navigation";

export default function PortalServidorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleShell
      moduleTitle="Portal do Servidor"
      moduleCaption="Autosserviço funcional"
      moduleIcon={BadgeCheck}
      navigation={portalServidorNavigation}
    >
      {children}
    </ModuleShell>
  );
}
