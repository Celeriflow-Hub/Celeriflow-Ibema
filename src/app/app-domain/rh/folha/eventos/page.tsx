import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Plus, ArrowLeft, ReceiptText } from "lucide-react"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function EventosPage() {
  const { prisma } = await getTenantContextForModule("RH");
  const events = await prisma.payrollEvent.findMany({
    orderBy: { code: 'asc' }
  })

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Eventos da Folha"
        icon={<ReceiptText className="size-4 shrink-0 text-violet-600" />}
        action={<div className="flex items-center gap-1.5">
          <Link href="/rh/folha" className={buttonVariants({ variant: "outline", size: "icon-sm" })} aria-label="Voltar para folha de pagamento">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/rh/folha/eventos/novo" className={buttonVariants({ size: "sm" })}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Link>
        </div>}
      />

      <Card size="sm" className="rounded-md shadow-none">
        <CardHeader className="border-b pb-2">
          <CardTitle>Configuração de Rubricas/Eventos</CardTitle>
          <CardDescription>
            Gerencie proventos, descontos e bases de cálculo para a folha de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="font-medium p-2 px-4 whitespace-nowrap">Código</th>
                  <th className="font-medium p-2 whitespace-nowrap">Descrição</th>
                  <th className="font-medium p-2 whitespace-nowrap">Tipo</th>
                  <th className="font-medium p-2 whitespace-nowrap">Fórmula Base</th>
                  <th className="font-medium p-2 whitespace-nowrap">Status</th>
                  <th className="font-medium p-2 px-4 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      Nenhum evento configurado.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-2 px-4 font-medium font-mono whitespace-nowrap">{ev.code}</td>
                      <td className="p-2 font-medium whitespace-nowrap">{ev.name}</td>
                      <td className="p-2 whitespace-nowrap">
                        <Badge variant="outline" className={
                          ev.type === 'Vencimento' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                          ev.type === 'Desconto' ? "bg-red-100 text-red-700 border-red-200" :
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }>
                          {ev.type}
                        </Badge>
                      </td>
                      <td className="p-2 font-mono text-xs whitespace-nowrap">{ev.formula || "-"}</td>
                      <td className="p-2 whitespace-nowrap">
                        <Badge variant={ev.isActive ? "default" : "secondary"}>
                          {ev.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-2 px-4 text-right whitespace-nowrap">
                        <Link href={`/rh/folha/eventos/${ev.id}/editar`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
