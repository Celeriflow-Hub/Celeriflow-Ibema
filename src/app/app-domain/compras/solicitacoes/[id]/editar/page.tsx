import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { SolicitacaoForm } from "../../SolicitacaoForm";
import { notFound } from "next/navigation";

export default async function EditarSolicitacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const resolvedParams = await params;
  const [solicitacao, catalogItems, secretarias, departments] = await Promise.all([
    prisma.purchaseRequest.findUnique({
      where: { id: resolvedParams.id },
      include: { items: true }
    }),
    prisma.catalogItem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }),
    prisma.secretariat.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.department.findMany({ where: { isActive: true }, select: { id: true, name: true, secretariatId: true }, orderBy: { name: 'asc' } }),
  ]);

  if (!solicitacao) {
    notFound();
  }

  const mappedSolicitacao = {
    ...solicitacao,
    items: solicitacao.items.map((item) => ({
      catalogItemId: item.catalogItemId ?? "",
      customName: item.customName ?? "",
      quantity: item.quantity,
      estimatedUnitValue: item.estimatedUnitValue ?? 0,
    }))
  };

  return <SolicitacaoForm data={mappedSolicitacao} catalogItems={catalogItems} secretarias={secretarias} departments={departments} />;
}
