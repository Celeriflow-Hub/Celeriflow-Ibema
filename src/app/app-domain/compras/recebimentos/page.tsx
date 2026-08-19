import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ReceiptForm } from "./ReceiptForm";

export default async function RecebimentosPage() {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const [contracts, documents, employees, warehouses, receipts] = await Promise.all([
    prisma.contract.findMany({
      where: { status: "Vigente" },
      select: { id: true, number: true, process: { select: { items: { select: { id: true, quantity: true, estimatedUnitValue: true, material: { select: { id: true, name: true } } } } } } },
      orderBy: { number: "asc" },
    }),
    prisma.document.findMany({ where: { status: "Válido", documentType: { not: "Modelo" } }, select: { id: true, title: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.employee.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.warehouse.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.purchaseReceipt.findMany({ include: { contract: { select: { number: true } }, items: { include: { material: { select: { name: true } } } } }, orderBy: { receivedAt: "desc" }, take: 30 }),
  ]);

  return <div className="space-y-6 p-8 pt-6"><div><h1 className="text-3xl font-bold tracking-tight">Recebimentos de Compra</h1><p className="mt-1 text-sm text-muted-foreground">O recebimento aprovado gera a entrada rastreável no almoxarifado.</p></div><div className="rounded-lg border bg-white p-6"><ReceiptForm contracts={contracts} documents={documents} employees={employees} warehouses={warehouses} /></div><section className="rounded-lg border bg-white p-6"><h2 className="mb-4 text-lg font-semibold">Recebimentos recentes</h2><div className="space-y-2">{receipts.length ? receipts.map((receipt) => <div key={receipt.id} className="flex flex-wrap justify-between gap-2 rounded border p-3 text-sm"><span className="font-medium">{receipt.number} · {receipt.contract.number}</span><span>{receipt.items.map((item) => `${item.material.name} (${item.quantity})`).join(", ")}</span><span>{receipt.status}</span></div>) : <p className="text-sm text-muted-foreground">Nenhum recebimento registrado.</p>}</div></section></div>;
}
