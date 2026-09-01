import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"
import { Gavel, Plus, Filter, Search } from "lucide-react"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LicitacaoRowActions } from "./LicitacaoRowActions"
import { DispensaRowActions } from "../dispensas/DispensaRowActions"
import { PageFrame } from "@/components/app-ui/PageFrame"
import { PageHeader } from "@/components/app-ui/PageHeader"

export default async function LicitacoesPage() {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const biddings = await prisma.bidding.findMany({
    include: {
      process: true
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])

  const directContractings = await prisma.directContracting.findMany({
    include: {
      process: true,
      supplier: true
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Licitações e Dispensas"
        icon={<Gavel className="size-4 shrink-0 text-amber-600" />}
        action={<><Link href="/compras/dispensas/novo" className={buttonVariants({ variant: "outline", size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Nova Dispensa</span></Link><Link href="/compras/licitacoes/novo" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Nova Licitação</span></Link></>}
      />

      <Card className="rounded-md">
        <CardHeader className="flex flex-col gap-2 space-y-0 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">Certames Abertos</CardTitle>
            <CardDescription className="text-xs">
              Licitações e dispensas em andamento.
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
          {biddings.length === 0 && directContractings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Gavel className="h-10 w-10 mb-4 opacity-20" />
              <p>Nenhuma licitação encontrada.</p>
              <p className="text-sm">Clique em &quot;Nova Licitação&quot; para cadastrar um certame.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Número/Processo</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Sessão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {biddings.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-medium">
                        {bid.number}
                        <div className="text-xs text-muted-foreground">Proc: {bid.process?.number}</div>
                      </TableCell>
                      <TableCell>{bid.modality}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={bid.process?.object}>{bid.process?.object}</TableCell>
                      <TableCell>
                        {bid.sessionDate ? format(new Date(bid.sessionDate), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {bid.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <LicitacaoRowActions id={bid.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {directContractings.map((dc) => (
                    <TableRow key={dc.id}>
                      <TableCell className="font-medium">
                        (Direta)
                        <div className="text-xs text-muted-foreground">Proc: {dc.process?.number}</div>
                      </TableCell>
                      <TableCell>{dc.type}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={dc.process?.object}>{dc.process?.object}</TableCell>
                      <TableCell>
                        (Sem Sessão)
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {dc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DispensaRowActions id={dc.id} />
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
