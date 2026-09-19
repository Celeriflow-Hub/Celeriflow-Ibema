import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import ImoveisClient from "./ImoveisClient";

export const dynamic = "force-dynamic";

export default async function ImoveisFiscaisPage() {
  const { prisma } = await getTenantContextForModule("TRIBUTACAO");
  const imoveis = await prisma.realEstate.findMany({
    include: {
      taxpayer: {
        include: { person: true, company: true }
      }
    },
    take: 50,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ImoveisClient imoveis={imoveis} />
    </div>
  );
}
