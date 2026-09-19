import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { SolicitacaoForm } from "../../SolicitacaoForm";
import { notFound } from "next/navigation";
import { canManagePurchaseRequest, canSelectAnyPurchaseRequestOrigin, purchaseRequestOriginScope } from "@/lib/compras/purchase-request-policy";

export default async function EditarSolicitacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await getTenantContextForModule("COMPRAS");
  const { prisma } = context;
  const resolvedParams = await params;
  const solicitacao = await prisma.purchaseRequest.findUnique({
    where: { id: resolvedParams.id },
    include: { items: true },
  });

  if (!solicitacao || !canManagePurchaseRequest(context.user, solicitacao)) {
    notFound();
  }
  const origin = purchaseRequestOriginScope(context.user);
  const canSelectAnyOrigin = canSelectAnyPurchaseRequestOrigin(context.user);
  const [catalogItems, secretarias, departments] = await Promise.all([
    prisma.catalogItem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }),
    prisma.secretariat.findMany({
      where: origin ? { id: origin.secretariatId } : canSelectAnyOrigin ? undefined : { id: "__sem-origem-autorizada__" },
      orderBy: { name: 'asc' }
    }),
    prisma.department.findMany({ where: { isActive: true, ...(origin ? { id: origin.departmentId } : canSelectAnyOrigin ? {} : { id: "__sem-origem-autorizada__" }) }, select: { id: true, name: true, secretariatId: true }, orderBy: { name: 'asc' } }),
  ]);

  const mappedSolicitacao = {
    ...solicitacao,
    items: solicitacao.items.map((item) => ({
      catalogItemId: item.catalogItemId ?? "",
      customName: item.customName ?? "",
      quantity: item.quantity,
      estimatedUnitValue: item.estimatedUnitValue ?? 0,
    }))
  };

  return <SolicitacaoForm data={mappedSolicitacao} catalogItems={catalogItems} secretarias={secretarias} departments={departments} initialOrigin={origin} originLocked={!canSelectAnyOrigin} />;
}
