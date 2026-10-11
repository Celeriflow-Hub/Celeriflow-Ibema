import type { Metadata } from "next";
import { PortalShell } from "@/components/portal-institucional/PortalShell";
import { municipality } from "@/lib/platform/municipality";

export const metadata: Metadata = {
  title: `Portal Oficial | ${municipality.prefectureName}`,
  description: `Portal oficial da ${municipality.prefectureName} — informações institucionais, serviços, notícias e transparência.`,
};

export default function InstitutionalPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
