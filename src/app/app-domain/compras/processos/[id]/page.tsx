import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList, Edit } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function ProcessoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const resolvedParams = await params;
  const processo = await prisma.purchaseProcess.findUnique({
    where: { id: resolvedParams.id },
    include: {
      secretariat: true,
      items: {
        include: { catalogItem: true }
      }
    }
  });

  if (!processo) {
    notFound();
  }

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Detalhes do Processo" icon={<ClipboardList className="size-4 shrink-0 text-blue-600" />} action={<><Link href="/compras/processos" aria-label="Voltar"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link><Link href={`/compras/processos/${processo.id}/editar`}><Button variant="outline" size="sm"><Edit className="size-3.5" /><span className="hidden sm:inline">Editar</span></Button></Link></>} />

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número</p>
              <p className="text-lg">{processo.number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="secondary">{processo.status}</Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Objeto</p>
            <p>{processo.object}</p>
          </div>
          <div className="grid gap-3 border-t pt-3 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <p>{processo.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Modalidade</p>
              <p>{processo.modality}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Secretaria</p>
              <p>{processo.secretariat?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Itens do Processo ({processo.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[560px] text-sm divide-y">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Item / Serviço</th>
                  <th className="px-4 py-2 text-left">Quant.</th>
                  <th className="px-4 py-2 text-left">Valor Unit.</th>
                  <th className="px-4 py-2 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {processo.items.map((item) => {
                  const name = item.catalogItem ? item.catalogItem.name : item.customName;
                  const unitVal = item.estimatedUnitValue || 0;
                  const subtotal = item.quantity * unitVal;
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{name}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitVal)}</td>
                      <td className="px-4 py-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <p className="text-lg font-bold">Total Estimado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(processo.estimatedValue || 0)}</p>
          </div>
        </CardContent>
      </Card>
    </PageFrame>
  );
}
