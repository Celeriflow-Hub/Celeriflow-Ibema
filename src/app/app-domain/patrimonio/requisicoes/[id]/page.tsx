import Link from "next/link";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { canViewModule, getTenantContextForModule, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { MaterialRequestWorkflowClient } from "./MaterialRequestWorkflowClient";

export default async function RequisicaoMaterialDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { prisma, user } = await getTenantContextForModule("PATRIMONIO");
  const request = await prisma.materialRequest.findUnique({
    where: { id },
    include: {
      department: { select: { name: true, secretariatId: true } },
      requester: { select: { name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        include: { material: { select: { id: true, code: true, name: true, unitOfMeasure: true } } },
      },
    },
  });
  if (!request) notFound();

  const stocks = await prisma.materialStock.findMany({
    where: {
      materialId: { in: request.items.map((item) => item.materialId) },
      quantity: { gt: 0 },
      warehouse: { isActive: true },
    },
    select: {
      id: true,
      materialId: true,
      quantity: true,
      batchNumber: true,
      warehouse: { select: { name: true } },
    },
    orderBy: [{ warehouse: { name: "asc" } }, { batchNumber: "asc" }],
  });
  const financeEnabled = canViewModule(user, "FINANCEIRO") && Boolean(await prisma.configuracaoModulo.count({ where: { codigo: "FINANCEIRO", ativo: true } }));
  const settlements = financeEnabled ? await prisma.settlement.findMany({ where: { status: "Liquidado", commitment: { appropriation: { budgetUnit: { secretariatId: request.department.secretariatId }, ...(isSystemAdministrator(user) ? {} : { budgetUnitId: { in: user.allowedBudgetUnitIds } }) }, OR: [{ purchaseReceiptId: { not: null } }, { appropriation: { expenseNature: { code: { startsWith: "3.3.90.30" } } } }] } }, include: { commitment: { select: { number: true } } }, orderBy: [{ date: "desc" }, { id: "asc" }], take: 200 }) : [];

  return (
    <PageFrame className="max-w-5xl space-y-2">
      <PageHeader title={`Requisição ${request.number}`} action={<Link href="/patrimonio/requisicoes" className="text-xs font-semibold text-slate-600 underline">Voltar à listagem</Link>} />
      <p className="text-xs text-muted-foreground">Setor: {request.department.name} · Solicitante: {request.requester.name} · Situação: {request.status}</p>
      {request.justification && <p className="rounded-md border bg-white p-3 text-sm"><span className="font-medium">Justificativa:</span> {request.justification}</p>}
      <MaterialRequestWorkflowClient
        request={{
          id: request.id,
          number: request.number,
          status: request.status,
          items: request.items.map((item) => ({
            id: item.id,
            quantityRequested: item.quantityRequested,
            quantityApproved: item.quantityApproved,
            quantityDelivered: item.quantityDelivered,
            material: item.material,
          })),
        }}
        stocks={stocks}
        settlements={settlements.map(settlement => ({ id: settlement.id, label: `Empenho ${settlement.commitment.number} · ${settlement.date.toISOString().slice(0, 10)} · R$ ${settlement.valueDecimal?.toFixed(2) ?? "não conciliado"}` }))}
      />
    </PageFrame>
  );
}
