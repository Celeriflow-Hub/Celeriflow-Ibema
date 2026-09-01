import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import CertidoesClient from "./CertidoesClient";
import { PageFrame } from "@/components/app-ui/PageFrame";

export const dynamic = "force-dynamic";

export default async function CertidoesPage() {
  const { prisma } = await getTenantContextForModule("TRIBUTACAO");
  const certificates = await prisma.taxCertificate.findMany({
    include: {
      taxpayer: { include: { person: true, company: true } }
    },
    take: 20,
    orderBy: { createdAt: "desc" }
  });

  const rawTaxpayers = await prisma.taxpayer.findMany({
    include: { person: true, company: true }
  });

  const taxpayers = rawTaxpayers.map(tp => ({
    id: tp.id,
    name: tp.company?.corporateName || tp.person?.fullName || "Contribuinte sem nome"
  }));

  return (
    <PageFrame className="space-y-3">
      <CertidoesClient certificates={certificates} taxpayers={taxpayers} />
    </PageFrame>
  );
}
