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
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Prisma } from "@prisma/client";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function RequisicoesPage(
  props: { searchParams?: Promise<{ q?: string, status?: string }> }
) {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";
  const status = searchParams?.status || "";

  const where: Prisma.MaterialRequestWhereInput = {};
  if (q) {
    where.number = { contains: q, mode: 'insensitive' };
  }
  if (status) {
    where.status = status;
  }

  const requests = await prisma.materialRequest.findMany({
    where,
    take: 50,
    orderBy: { date: 'desc' },
    include: {
      department: true,
      requester: true,
      items: true
    }
  })

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Requisições Internas" action={<Link href="/patrimonio/requisicoes/nova" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" /><span className="hidden sm:inline">Nova Requisição</span></Link>} />

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Pedidos de Materiais</CardTitle>
          <CardDescription className="text-xs">
            Solicitações feitas pelas secretarias e departamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <form className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-slate-50 p-2">
            <div className="min-w-0 flex-1 sm:min-w-72">
              <Input 
                name="q"
                defaultValue={q}
                placeholder="Buscar por número da requisição..." 
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
                <option value="Pendente">Pendente</option>
                <option value="Atendida Parcialmente">Atendida Parcialmente</option>
                <option value="Atendida">Atendida</option>
                <option value="Rejeitada">Rejeitada</option>
              </select>
            </div>
            <button type="submit" className={buttonVariants()}>
              <Search className="h-4 w-4 mr-2" />
              Filtrar
            </button>
          </form>

          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[680px] w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="font-medium p-4 whitespace-nowrap">Número</th>
                  <th className="font-medium p-4 whitespace-nowrap">Data</th>
                  <th className="font-medium p-4 whitespace-nowrap">Setor Solicitante</th>
                  <th className="font-medium p-4 whitespace-nowrap">Itens</th>
                  <th className="font-medium p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      Nenhuma requisição de material encontrada com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-bold text-slate-700 whitespace-nowrap">{req.number}</td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {format(new Date(req.date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="p-4 text-xs whitespace-nowrap">
                        {req.department?.name || "Desconhecido"} <br/>
                        <span className="text-muted-foreground">Por: {req.requester?.name || "-"}</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">{req.items.length} item(s)</td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={req.status === "Pendente" ? "secondary" : req.status === "Rejeitada" ? "destructive" : "default"}
                               className={req.status === "Atendida" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                          {req.status}
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
