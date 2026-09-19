import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import NfseClient from "./NfseClient";

export const dynamic = "force-dynamic";

export default async function NfsePage() {
  const { prisma } = await getTenantContextForModule("TRIBUTACAO");
  const invoices = await prisma.invoice.findMany({
    include: {
      provider: { include: { person: true, company: true } },
      taker: { include: { person: true, company: true } }
    },
    take: 50,
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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <NfseClient invoices={invoices} taxpayers={taxpayers} />
    </div>
  );
}
