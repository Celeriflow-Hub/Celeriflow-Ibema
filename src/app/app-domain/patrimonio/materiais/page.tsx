import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import type { Prisma } from "@prisma/client"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { StockOperationsClient } from "./StockOperationsClient";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function MateriaisPage(
  props: { searchParams?: Promise<{ q?: string }> }
) {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";

  const where: Prisma.MaterialWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { code: { contains: q, mode: 'insensitive' } }
    ];
  }

  const materials = await prisma.material.findMany({
    where,
    take: 50,
    orderBy: { name: 'asc' },
    include: {
      category: true,
      stocks: {
        include: {
          warehouse: true
        }
      }
    }
  })
  const [warehouses, movementMaterials, stockRows, settlements] = await Promise.all([
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.material.findMany({ take: 200, orderBy: { name: "asc" }, select: { id: true, code: true, name: true } }),
    prisma.materialStock.findMany({
      take: 100,
      orderBy: [{ warehouse: { name: "asc" } }, { material: { name: "asc" } }, { batchNumber: "asc" }],
      include: { warehouse: { select: { name: true } }, material: { select: { code: true, name: true, unitOfMeasure: true } } },
    }),
    prisma.settlement.findMany({
      where: { status: "Liquidado" },
      take: 100,
      orderBy: { date: "desc" },
      select: { id: true, date: true, value: true, commitment: { select: { number: true } } },
    }),
  ]);

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Materiais e Estoque" action={<Link href="/patrimonio/materiais/novo" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Novo Material</span></Link>} />

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Movimentar Estoque</CardTitle>
          <CardDescription className="text-xs">Entradas, saídas e ajustes são registrados com o usuário responsável e mantêm um saldo único por almoxarifado, material e lote.</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <StockOperationsClient
            materials={movementMaterials.map((material) => ({ id: material.id, label: `${material.code} - ${material.name}` }))}
            warehouses={warehouses.map((warehouse) => ({ id: warehouse.id, label: warehouse.name }))}
            settlements={settlements.map((settlement) => ({ id: settlement.id, label: `${settlement.commitment.number} - ${settlement.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })} - ${settlement.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` }))}
          />
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Catálogo de Materiais</CardTitle>
          <CardDescription className="text-xs">
            Itens de consumo, EPIs, peças e controle de saldo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <form className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-slate-50 p-2">
            <div className="min-w-0 flex-1 sm:min-w-72">
              <Input 
                name="q"
                defaultValue={q}
                placeholder="Buscar por código ou descrição do material..." 
                className="bg-white"
              />
            </div>
            <button type="submit" className={buttonVariants()}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </button>
          </form>

          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[680px] w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="font-medium p-4 whitespace-nowrap">Código</th>
                  <th className="font-medium p-4 whitespace-nowrap">Descrição</th>
                  <th className="font-medium p-4 whitespace-nowrap">Categoria</th>
                  <th className="font-medium p-4 whitespace-nowrap">UN</th>
                  <th className="font-medium p-4 whitespace-nowrap">Saldo Atual</th>
                </tr>
              </thead>
              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      Nenhum material encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  materials.map((mat) => {
                    const totalStock = mat.stocks.reduce((acc, stock) => acc + stock.quantity, 0)
                    const isLowStock = totalStock <= mat.minStock
                    
                    return (
                      <tr key={mat.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-bold text-slate-700 whitespace-nowrap">{mat.code}</td>
                        <td className="p-4 font-medium min-w-[200px]">{mat.name}</td>
                        <td className="p-4 whitespace-nowrap">{mat.category?.name || "-"}</td>
                        <td className="p-4 whitespace-nowrap">{mat.unitOfMeasure}</td>
                        <td className="p-4 whitespace-nowrap">
                          <Badge variant={isLowStock && totalStock > 0 ? "secondary" : (totalStock === 0 ? "destructive" : "default")}
                                 className={!isLowStock && totalStock > 0 ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                            {totalStock.toLocaleString()} {mat.unitOfMeasure}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Saldos por Almoxarifado e Lote</CardTitle>
          <CardDescription className="text-xs">Até 100 posições de estoque, ordenadas por almoxarifado e material.</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[820px] w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="font-medium p-4 whitespace-nowrap">Almoxarifado</th>
                  <th className="font-medium p-4 whitespace-nowrap">Material</th>
                  <th className="font-medium p-4 whitespace-nowrap">Lote</th>
                  <th className="font-medium p-4 whitespace-nowrap">Saldo</th>
                  <th className="font-medium p-4 whitespace-nowrap">Custo Unit.</th>
                  <th className="font-medium p-4 whitespace-nowrap">Validade</th>
                </tr>
              </thead>
              <tbody>
                {stockRows.length === 0 ? <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">Nenhuma posição de estoque registrada.</td></tr> : stockRows.map((stock) => (
                  <tr key={stock.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">{stock.warehouse.name}</td>
                    <td className="p-4 whitespace-nowrap">{stock.material.code} - {stock.material.name}</td>
                    <td className="p-4 whitespace-nowrap">{stock.batchNumber || "Sem lote"}</td>
                    <td className="p-4 whitespace-nowrap font-medium">{stock.quantity.toLocaleString()} {stock.material.unitOfMeasure}</td>
                    <td className="p-4 whitespace-nowrap">{stock.unitCost === null ? "-" : stock.unitCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="p-4 whitespace-nowrap">{stock.expirationDate ? stock.expirationDate.toLocaleDateString("pt-BR") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
