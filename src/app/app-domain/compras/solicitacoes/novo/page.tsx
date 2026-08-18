import { SolicitacaoForm } from "../SolicitacaoForm";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";

export default async function NovaSolicitacaoPage() {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const [catalogItems, secretarias, departments] = await Promise.all([
    prisma.catalogItem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }),
    prisma.secretariat.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.department.findMany({ where: { isActive: true }, select: { id: true, name: true, secretariatId: true }, orderBy: { name: 'asc' } }),
  ]);

  return <SolicitacaoForm catalogItems={catalogItems} secretarias={secretarias} departments={departments} />;
}
