import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Building2, 
  PackageSearch, 
  Package, 
  ShoppingCart, 
  Wrench,
  Tags,
  QrCode,
  ArrowRightLeft,
  ChartNoAxesCombined
} from "lucide-react"
import Link from "next/link"
import { PageFrame } from "@/components/app-ui/PageFrame"
import { PageHeader } from "@/components/app-ui/PageHeader"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";

export default async function PatrimonioDashboard() {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const totalAssets = await prisma.asset.count().catch(() => 0)
  const activeAssets = await prisma.asset.count({ where: { status: "Ativo" } }).catch(() => 0)
  const totalWarehouses = await prisma.warehouse.count().catch(() => 0)
  const totalMaterials = await prisma.material.count().catch(() => 0)
  const pendingRequests = await prisma.materialRequest.count({ where: { status: "Pendente" } }).catch(() => 0)

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Patrimônio e Almoxarifado"
        icon={<Package className="size-4 shrink-0 text-amber-600" />}
        action={(
          <>
            <Link href="/patrimonio/bens/novo" aria-label="Tombar Bem" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <QrCode className="size-3.5" />
              <span className="hidden sm:inline">Tombar Bem</span>
            </Link>
            <Link href="/patrimonio/materiais" aria-label="Entrada de Estoque" className={buttonVariants({ size: "sm" })}>
              <Package className="size-3.5" />
              <span className="hidden sm:inline">Entrada de Estoque</span>
            </Link>
          </>
        )}
      />

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Card size="sm" className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Bens Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssets}</div>
            <p className="text-xs text-muted-foreground">
              de {totalAssets} tombados no total
            </p>
          </CardContent>
        </Card>
        
        <Card size="sm" className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Materiais em Catálogo</CardTitle>
            <Tags className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaterials}</div>
            <p className="text-xs text-muted-foreground">
              Itens disponíveis para almoxarifado
            </p>
          </CardContent>
        </Card>
        
        <Card size="sm" className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Requisições Pendentes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando separação e entrega
            </p>
          </CardContent>
        </Card>
        
        <Card size="sm" className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Almoxarifados</CardTitle>
            <PackageSearch className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWarehouses}</div>
            <p className="text-xs text-muted-foreground">
              Centros de distribuição físicos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-7">
        <Card size="sm" className="rounded-md md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Acesso Rápido</CardTitle>
            <CardDescription className="text-xs">
              Gestão de bens permanentes e materiais de consumo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/patrimonio/bens" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <Building2 className="mr-3 size-5 text-emerald-500" />
                <div>
                  <div className="font-semibold">Bens Permanentes</div>
                  <div className="text-xs text-muted-foreground">Móveis, imóveis e equipamentos</div>
                </div>
              </Link>
              <Link href="/patrimonio/almoxarifados" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <PackageSearch className="mr-3 size-5 text-indigo-500" />
                <div>
                  <div className="font-semibold">Almoxarifados</div>
                  <div className="text-xs text-muted-foreground">Gestão dos estoques físicos</div>
                </div>
              </Link>
              <Link href="/patrimonio/materiais" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <Package className="mr-3 size-5 text-blue-500" />
                <div>
                  <div className="font-semibold">Materiais e Estoque</div>
                  <div className="text-xs text-muted-foreground">Catálogo e movimentações</div>
                </div>
              </Link>
              <Link href="/patrimonio/requisicoes" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <ShoppingCart className="mr-3 size-5 text-amber-500" />
                <div>
                  <div className="font-semibold">Requisições Internas</div>
                  <div className="text-xs text-muted-foreground">Pedidos das secretarias</div>
                </div>
              </Link>
              <Link href="/patrimonio/manutencao" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <Wrench className="mr-3 size-5 text-orange-500" />
                <div>
                  <div className="font-semibold">Manutenção e Baixa</div>
                  <div className="text-xs text-muted-foreground">Defeitos, doações e descartes</div>
                </div>
              </Link>
              <Link href="/patrimonio/transferencias" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <ArrowRightLeft className="mr-3 size-5 text-purple-500" />
                <div>
                  <div className="font-semibold">Transferências</div>
                  <div className="text-xs text-muted-foreground">Entre setores e responsáveis</div>
                </div>
              </Link>
              <Link href="/patrimonio/ciclo-vida" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <ChartNoAxesCombined className="mr-3 size-5 text-amber-600" />
                <div>
                  <div className="font-semibold">Ciclo de Vida</div>
                  <div className="text-xs text-muted-foreground">Depreciação, baixas e alienações</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="rounded-md md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Últimas Movimentações</CardTitle>
            <CardDescription className="text-xs">
              Tombamentos e entradas recentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="flex h-full flex-col items-center justify-center p-3 text-center text-muted-foreground">
                <Package className="mb-2 size-7 opacity-20" />
                <p>Nenhuma movimentação recente encontrada.</p>
                <p className="text-xs">As transferências e tombamentos aparecerão aqui.</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </PageFrame>
  )
}
