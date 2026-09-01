import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import ImoveisClient from "./ImoveisClient";
import { PageFrame } from "@/components/app-ui/PageFrame";

export const dynamic = "force-dynamic";

export default async function ImoveisFiscaisPage() {
  const { prisma } = await getTenantContextForModule("TRIBUTACAO");
  const imoveis = await prisma.realEstate.findMany({
    include: {
      taxpayer: {
        include: { person: true, company: true }
      }
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <PageFrame className="space-y-3">
      <ImoveisClient imoveis={imoveis} />
    </PageFrame>
  );
}
