import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button"
import { Scale, Plus, Filter, Search } from "lucide-react"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { format } from "date-fns"
import { ContratoRowActions } from "./ContratoRowActions"
import { PageFrame } from "@/components/app-ui/PageFrame"
import { PageHeader } from "@/components/app-ui/PageHeader"

export default async function ContratosPage() {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const contratos = await prisma.contract.findMany({
    include: {
      supplier: {
        include: {
          person: true,
          company: true
        }
      },
      secretariat: true,
      _count: {
        select: {
          amendments: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Gestão de Contratos"
        icon={<Scale className="size-4 shrink-0 text-indigo-600" />}
        action={<Link href="/compras/contratos/novo" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Novo Contrato</span></Link>}
      />

      <Card className="rounded-md">
        <CardHeader className="flex flex-col gap-2 space-y-0 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">Contratos Administrativos</CardTitle>
            <CardDescription className="text-xs">
              Lista de todos os contratos registrados no sistema.
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
          {contratos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Scale className="h-10 w-10 mb-4 opacity-20" />
              <p>Nenhum contrato encontrado.</p>
              <p className="text-sm">Clique em &quot;Novo Contrato&quot; para registrar um contrato.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Valor Atualizado</TableHead>
                    <TableHead>Aditivos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((cont) => {
                    const supplierName = cont.supplier?.company?.tradeName 
                                         || cont.supplier?.company?.corporateName 
                                         || cont.supplier?.person?.fullName 
                                         || "Não informado";
                    
                    return (
                      <TableRow key={cont.id}>
                        <TableCell className="font-medium">{cont.number}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={supplierName}>{supplierName}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={cont.object}>{cont.object}</TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>Início: {format(new Date(cont.startDate), "dd/MM/yyyy")}</div>
                            <div>Fim: {format(new Date(cont.endDate), "dd/MM/yyyy")}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cont.updatedValue)}
                        </TableCell>
                        <TableCell>
                          {cont._count.amendments > 0 ? (
                            <Badge variant="outline" className="border-indigo-500 text-indigo-500">
                              {cont._count.amendments}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cont.status === 'Vigente' ? 'default' : 'secondary'}>
                            {cont.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <ContratoRowActions id={cont.id} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageFrame>
  )
}
