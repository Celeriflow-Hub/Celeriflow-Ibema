import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingCart, Plus, Filter, Search } from "lucide-react"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SolicitacaoRowActions } from "./SolicitacaoRowActions"
import { PageFrame } from "@/components/app-ui/PageFrame"
import { PageHeader } from "@/components/app-ui/PageHeader"

export default async function SolicitacoesPage() {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const solicitacoes = await prisma.purchaseRequest.findMany({
    include: {
      secretariat: true,
      department: true,
      requester: true,
      _count: {
        select: { items: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Solicitações de Compra"
        icon={<ShoppingCart className="size-4 shrink-0 text-emerald-600" />}
        action={<Link href="/compras/solicitacoes/novo" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Nova Solicitação</span></Link>}
      />

      <Card className="rounded-md">
        <CardHeader className="flex flex-col gap-2 space-y-0 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">Solicitações Registradas</CardTitle>
            <CardDescription className="text-xs">
              Lista de todas as solicitações de compra abertas no sistema.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="#" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Link>
            <Link href="#" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {solicitacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-4 opacity-20" />
              <p>Nenhuma solicitação encontrada.</p>
              <p className="text-sm">Clique em &quot;Nova Solicitação&quot; para criar um pedido.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Secretaria</TableHead>
                    <TableHead>Valor Est.</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.number}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={req.object}>{req.object}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{req._count.items}</Badge>
                      </TableCell>
                      <TableCell>{req.secretariat?.acronym || req.secretariat?.name}</TableCell>
                      <TableCell>
                        {req.estimatedValue ? 
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(req.estimatedValue) 
                          : '-'}
                      </TableCell>
                      <TableCell>{format(new Date(req.createdAt), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>
                        <Badge variant={req.status === 'Rascunho' ? 'secondary' : req.status === 'Aprovada' ? 'default' : 'outline'}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <SolicitacaoRowActions id={req.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageFrame>
  )
}
