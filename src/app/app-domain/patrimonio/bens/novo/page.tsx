import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { AssetReceiptForm } from "./AssetReceiptForm";

export default async function NovoBemPatrimonialPage() {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const [receiptItems, categories, departments, employees] = await Promise.all([
    prisma.purchaseReceiptItem.findMany({
      where: { purchaseReceipt: { status: "APPROVED" } },
      include: { material: true, purchaseReceipt: { select: { number: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.assetCategory.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.employee.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const availableReceiptItems = receiptItems
    .map((item) => ({ id: item.id, label: `${item.purchaseReceipt.number} - ${item.material.name}`, remaining: Math.max(0, item.quantity - item.quantityIncorporated) }))
    .filter((item) => item.remaining > 0);

  return <AssetReceiptForm receiptItems={availableReceiptItems} categories={categories} departments={departments} employees={employees} />;
}
