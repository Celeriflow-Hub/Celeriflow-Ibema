import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Building2,
  Plus,
  Search
} from "lucide-react"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import type { Prisma } from "@prisma/client";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function BensPatrimoniaisPage(
  props: { searchParams?: Promise<{ q?: string, status?: string }> }
) {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";
  const status = searchParams?.status || "";

  const where: Prisma.AssetWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { patrimonyNumber: { contains: q, mode: 'insensitive' } }
    ];
  }
  if (status) {
    where.status = status;
  }

  const assets = await prisma.asset.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      department: true,
      responsible: true,
      realEstate: true
    }
  })

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Bens Patrimoniais" action={<><Link href="/patrimonio/ciclo-vida" className={buttonVariants({ variant: "outline", size: "sm" })}><span className="hidden sm:inline">Ciclo de Vida</span></Link><Link href="/patrimonio/bens/novo" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Tombar Novo Bem</span></Link></>} />

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Lista de Bens Permanentes</CardTitle>
          <CardDescription className="text-xs">
            Controle de móveis, equipamentos, veículos e vinculação com imóveis e secretarias.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <form className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-slate-50 p-2">
            <div className="min-w-0 flex-1 sm:min-w-72">
              <Input 
                name="q"
                defaultValue={q}
                placeholder="Buscar por nome do bem ou nº do tombamento..." 
                className="bg-white"
              />
            </div>
            <div className="w-full sm:w-48">
              <select 
                name="status"
                defaultValue={status}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Em uso">Em uso</option>
                <option value="Ocioso">Ocioso</option>
                <option value="Em manutenção">Em manutenção</option>
                <option value="Baixado">Baixado</option>
              </select>
            </div>
            <button type="submit" className={buttonVariants()}>
              <Search className="h-4 w-4 mr-2" />
              Filtrar
            </button>
          </form>

          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[980px] w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="font-medium p-4 whitespace-nowrap">Tombamento</th>
                  <th className="font-medium p-4 whitespace-nowrap">Descrição</th>
                  <th className="font-medium p-4 whitespace-nowrap">Categoria</th>
                  <th className="font-medium p-4 whitespace-nowrap">Imóvel (Localização Física)</th>
                  <th className="font-medium p-4 whitespace-nowrap">Setor / Responsável</th>
                  <th className="font-medium p-4 whitespace-nowrap">Status</th>
                  <th className="font-medium p-4 whitespace-nowrap">Valor Contábil</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      Nenhum bem patrimonial encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-bold whitespace-nowrap text-amber-700"><Link href={`/patrimonio/bens/${encodeURIComponent(asset.id)}`} className="underline underline-offset-2">{asset.patrimonyNumber}</Link></td>
                      <td className="p-4 font-medium min-w-[200px]">{asset.name}</td>
                      <td className="p-4 whitespace-nowrap">{asset.category?.name || "-"}</td>
                      <td className="p-4 text-xs text-muted-foreground min-w-[200px]">
                        {asset.realEstate ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-blue-500" />
                            {asset.realEstate.propertyType || "Imóvel"} - Inscrição: {asset.realEstate.municipalInsc || "-"}
                            <br/>
                            {asset.realEstate.streetName}, {asset.realEstate.number}
                          </div>
                        ) : (
                          <span className="text-slate-400">Não vinculado a imóvel</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground min-w-[200px]">
                        <strong>Setor:</strong> {asset.department?.name || "Não alocado"} <br/>
                        <strong>Resp:</strong> {asset.responsible?.name || "Sem responsável"}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={asset.status === "Ativo" || asset.status === "Em uso" ? "default" : asset.status === "Baixado" ? "destructive" : "secondary"}>
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="p-4 whitespace-nowrap">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(asset.currentValue)}</td>
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
