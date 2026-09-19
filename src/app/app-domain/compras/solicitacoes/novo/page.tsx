import { SolicitacaoForm } from "../SolicitacaoForm";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { canSelectAnyPurchaseRequestOrigin, purchaseRequestOriginScope } from "@/lib/compras/purchase-request-policy";

export default async function NovaSolicitacaoPage() {
  const context = await getTenantContextForModule("COMPRAS");
  const { prisma } = context;
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

  return <SolicitacaoForm catalogItems={catalogItems} secretarias={secretarias} departments={departments} initialOrigin={origin} originLocked={!canSelectAnyOrigin} />;
}
