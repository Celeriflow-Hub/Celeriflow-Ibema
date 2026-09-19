import type { Metadata } from "next";
import { PortalShell } from "@/components/portal-institucional/PortalShell";

export const metadata: Metadata = {
  title: "Portal Institucional | Prefeitura Municipal de Divino São Lourenço",
  description: "Ambiente demonstrativo do portal institucional da Prefeitura Municipal de Divino São Lourenço.",
};

export default function InstitutionalPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
