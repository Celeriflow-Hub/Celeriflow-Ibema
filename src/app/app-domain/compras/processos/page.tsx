import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"
import { ClipboardList, Plus, Filter, Search } from "lucide-react"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ProcessoRowActions } from "./ProcessoRowActions"
import { PageFrame } from "@/components/app-ui/PageFrame"
import { PageHeader } from "@/components/app-ui/PageHeader"

export default async function ProcessosComprasPage() {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const processos = await prisma.purchaseProcess.findMany({
    include: {
      secretariat: true,
      _count: {
        select: {
          preliminaryStudies: true,
          termsOfReference: true,
          contracts: true,
          items: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Processos de Compra"
        icon={<ClipboardList className="size-4 shrink-0 text-blue-600" />}
        action={<Link href="/compras/processos/novo" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Novo Processo</span></Link>}
      />

      <Card className="rounded-md">
        <CardHeader className="flex flex-col gap-2 space-y-0 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">Processos Administrativos</CardTitle>
            <CardDescription className="text-xs">
              Lista de todos os processos de compras e contratações.
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
          {processos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <ClipboardList className="h-10 w-10 mb-4 opacity-20" />
              <p>Nenhum processo encontrado.</p>
              <p className="text-sm">Clique em &quot;Novo Processo&quot; para iniciar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Valor Est.</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processos.map((proc) => (
                    <TableRow key={proc.id}>
                      <TableCell className="font-medium">{proc.number}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={proc.object}>{proc.object}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{proc._count.items}</Badge>
                      </TableCell>
                      <TableCell>{proc.modality || proc.type}</TableCell>
                      <TableCell>
                        {proc.estimatedValue ? 
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.estimatedValue) 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 text-xs">
                          <Badge variant="outline" className={proc._count.preliminaryStudies > 0 ? "border-emerald-500 text-emerald-500" : ""}>
                            ETP
                          </Badge>
                          <Badge variant="outline" className={proc._count.termsOfReference > 0 ? "border-emerald-500 text-emerald-500" : ""}>
                            TR
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {proc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ProcessoRowActions id={proc.id} />
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
