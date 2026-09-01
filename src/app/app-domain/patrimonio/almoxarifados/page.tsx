import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus,
  Search
} from "lucide-react"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import type { Prisma } from "@prisma/client";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function AlmoxarifadosPage(
  props: { searchParams?: Promise<{ q?: string }> }
) {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";

  const where: Prisma.WarehouseWhereInput = {};
  if (q) {
    where.name = { contains: q, mode: 'insensitive' };
  }

  const warehouses = await prisma.warehouse.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      manager: true
    }
  })

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Almoxarifados" action={<Link href="/patrimonio/almoxarifados/novo" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Novo Almoxarifado</span></Link>} />

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Centros de Distribuição</CardTitle>
          <CardDescription className="text-xs">
            Gestão dos depósitos físicos e locais de armazenamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <form className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-slate-50 p-2">
            <div className="min-w-0 flex-1 sm:min-w-72">
              <Input 
                name="q"
                defaultValue={q}
                placeholder="Buscar por nome do almoxarifado..." 
                className="bg-white"
              />
            </div>
            <button type="submit" className={buttonVariants()}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </button>
          </form>

          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[620px] w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="font-medium p-4 whitespace-nowrap">Nome</th>
                  <th className="font-medium p-4 whitespace-nowrap">Tipo</th>
                  <th className="font-medium p-4 whitespace-nowrap">Gerente Responsável</th>
                  <th className="font-medium p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-muted-foreground">
                      Nenhum almoxarifado encontrado.
                    </td>
                  </tr>
                ) : (
                  warehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-bold whitespace-nowrap text-indigo-700">{warehouse.name}</td>
                      <td className="p-4 whitespace-nowrap">{warehouse.type}</td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {warehouse.manager?.name || "Sem responsável definido"}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                          {warehouse.isActive ? "Ativo" : "Inativo"}
                        </Badge>
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
