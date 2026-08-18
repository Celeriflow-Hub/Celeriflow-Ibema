import { ProcessoForm } from "../ProcessoForm";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";

export default async function NovoProcessoPage() {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const [catalogItems, purchaseRequests] = await Promise.all([
    prisma.catalogItem.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.purchaseRequest.findMany({ where: { status: "Aprovada" }, select: { id: true, number: true, object: true }, orderBy: { approvedAt: 'desc' } }),
  ]);

  return <ProcessoForm catalogItems={catalogItems} purchaseRequests={purchaseRequests} />;
}
