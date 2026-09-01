import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import NfseClient from "./NfseClient";
import { PageFrame } from "@/components/app-ui/PageFrame";

export const dynamic = "force-dynamic";

export default async function NfsePage() {
  const { prisma } = await getTenantContextForModule("TRIBUTACAO");
  const invoices = await prisma.invoice.findMany({
    include: {
      provider: { include: { person: true, company: true } },
      taker: { include: { person: true, company: true } }
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
      <NfseClient invoices={invoices} taxpayers={taxpayers} />
    </PageFrame>
  );
}
