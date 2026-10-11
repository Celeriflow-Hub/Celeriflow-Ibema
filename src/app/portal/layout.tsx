import type { Metadata } from "next";
import { PortalShell } from "@/components/portal-institucional/PortalShell";
import { MUNICIPALITY_INSTITUTION_NAME } from "@/lib/municipality-identity";
import { getInstitutionalContact } from "@/lib/portal-institucional/public-content";

// The shell reads institutional contact data from the database; render on request
// so static export never blocks on database access during build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Portal Oficial | ${MUNICIPALITY_INSTITUTION_NAME}`,
  description: `Portal oficial de ${MUNICIPALITY_INSTITUTION_NAME} — informações institucionais, serviços, notícias e transparência.`,
};

export default async function InstitutionalPortalLayout({ children }: { children: React.ReactNode }) {
  const institution = await getInstitutionalContact();
  return <PortalShell institution={institution}>{children}</PortalShell>;
}
