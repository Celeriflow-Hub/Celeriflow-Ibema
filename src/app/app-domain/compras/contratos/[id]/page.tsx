import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Scale } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function ContratoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const resolvedParams = await params;
  const contrato = await prisma.contract.findUnique({
    where: { id: resolvedParams.id },
    include: {
      process: true,
      supplier: { include: { company: true, person: true } },
      secretariat: true,
      sourceBudgetUnit: true,
      manager: true,
      commitments: {
        where: { status: { in: ["Emitido", "Liquidado", "Pago"] } },
        select: {
          value: true,
          valueDecimal: true,
          movements: { select: { type: true, valueDecimal: true } },
          settlements: { where: { status: "Liquidado" }, select: { value: true, valueDecimal: true } },
          payments: { where: { status: "Paga" }, select: { value: true, valueDecimal: true } },
        },
      },
      receipts: {
        where: { status: "APPROVED" },
        select: { number: true, receivedAt: true, items: { select: { quantity: true, unitCost: true } } },
        orderBy: { receivedAt: "desc" },
      },
    }
  });

  if (!contrato) {
    notFound();
  }

  const contracted = contrato.updatedValue;
  const committed = contrato.commitments.reduce((total, commitment) => (
    total + commitment.movements.reduce(
      (value, movement) => value + (movement.type === "Reforço" ? Number(movement.valueDecimal) : -Number(movement.valueDecimal)),
      Number(commitment.valueDecimal ?? commitment.value),
    )
  ), 0);
  const settled = contrato.commitments.reduce((total, commitment) => (
    total + commitment.settlements.reduce((value, settlement) => value + Number(settlement.valueDecimal ?? settlement.value), 0)
  ), 0);
  const paid = contrato.commitments.reduce((total, commitment) => (
    total + commitment.payments.reduce((value, payment) => value + Number(payment.valueDecimal ?? payment.value), 0)
  ), 0);
  const received = contrato.receipts.reduce((total, receipt) => total + receipt.items.reduce((itemTotal, item) => itemTotal + item.quantity * item.unitCost, 0), 0);
  const formatMoney = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Detalhes do Contrato" icon={<Scale className="size-4 shrink-0 text-indigo-600" />} action={<><Link href="/compras/contratos" aria-label="Voltar"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link><Link href={`/compras/contratos/${contrato.id}/editar`}><Button variant="outline" size="sm"><Edit className="size-3.5" /><span className="hidden sm:inline">Editar</span></Button></Link></>} />

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número do Contrato</p>
              <p className="text-lg">{contrato.number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="secondary">{contrato.status}</Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Objeto</p>
            <p>{contrato.object}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Inicial</p>
              <p>{formatMoney(contrato.initialValue)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Atualizado</p>
              <p>{formatMoney(contrato.updatedValue || contrato.initialValue)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
              <p>{format(new Date(contrato.startDate), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Fim</p>
              <p>{format(new Date(contrato.endDate), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
              <p>{contrato.supplier?.company?.corporateName || contrato.supplier?.person?.fullName || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processo Vinculado</p>
              <p>{contrato.process?.number || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unidade Gestora de origem</p>
              <p>{contrato.sourceBudgetUnit ? `${contrato.sourceBudgetUnit.code} - ${contrato.sourceBudgetUnit.name}` : "Pendente de definicao"}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Execução Financeira</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Contratado</p>
                <p>{formatMoney(contracted)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empenhado</p>
                <p>{formatMoney(committed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Liquidado</p>
                <p>{formatMoney(settled)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pago</p>
                <p>{formatMoney(paid)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo a Empenhar</p>
                <p>{formatMoney(contracted - committed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Contratual</p>
                <p>{formatMoney(contracted - paid)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recebido e atestado</p>
                <p>{formatMoney(received)}</p>
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Recebimentos aprovados</p>
            {contrato.receipts.length ? <div className="space-y-2">{contrato.receipts.map((receipt) => <div key={receipt.number} className="flex flex-wrap justify-between gap-2 rounded border p-3 text-sm"><span className="font-medium">{receipt.number}</span><span>{format(receipt.receivedAt, "dd/MM/yyyy", { locale: ptBR })}</span><span>{formatMoney(receipt.items.reduce((total, item) => total + item.quantity * item.unitCost, 0))}</span></div>)}</div> : <p className="text-sm text-muted-foreground">Nenhum recebimento aprovado para este contrato.</p>}
          </div>
        </CardContent>
      </Card>
    </PageFrame>
  );
}
