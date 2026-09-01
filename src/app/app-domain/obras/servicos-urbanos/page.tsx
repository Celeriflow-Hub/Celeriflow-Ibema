import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ServicosUrbanosClient } from "../components/ServicosUrbanosClient";
import { PageFrame } from "@/components/app-ui/PageFrame";

export default async function ServicosUrbanosPage() {
  const { prisma } = await getTenantContextForModule("OBRAS");
  const servicos = await prisma.obrasServico.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PageFrame className="px-1 py-1 md:px-2"><ServicosUrbanosClient servicos={servicos} /></PageFrame>;
}
