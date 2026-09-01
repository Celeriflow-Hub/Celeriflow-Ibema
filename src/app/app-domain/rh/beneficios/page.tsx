import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Gift, Plus, Search } from "lucide-react"
import Link from "next/link"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { Input } from "@/components/ui/input"
import { BeneficioRowActions } from "./BeneficioRowActions"
import type { Prisma } from "@prisma/client";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function BeneficiosPage(
  props: { searchParams?: Promise<{ q?: string }> }
) {
  const { prisma } = await getTenantContextForModule("RH");
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";

  const where: Prisma.BenefitConfigWhereInput = {};
  if (q) {
    where.name = { contains: q, mode: 'insensitive' };
  }

  const benefits = await prisma.benefitConfig.findMany({
    where,
    take: 50,
    orderBy: { name: 'asc' },
    include: {
      supplier: {
        include: {
          company: true,
          person: true
        }
      }
    }
  })

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Benefícios"
        icon={<Gift className="size-4 shrink-0 text-violet-600" />}
        action={<Link href="/rh/beneficios/novo" className={buttonVariants({ size: "sm" })}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Tipo de Benefício
          </Link>}
      />

      <Card size="sm" className="rounded-md shadow-none">
        <CardHeader className="border-b pb-2">
          <CardTitle>Cadastro Master de Benefícios</CardTitle>
          <CardDescription>
            Cadastre os tipos de benefícios fornecidos (Vale Transporte, Plano de Saúde, etc.) e seus fornecedores parceiros.
            A concessão de cada benefício aos servidores é feita na própria ficha do Servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <form className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-slate-50 p-2">
            <div className="min-w-[12rem] flex-1">
              <Input 
                name="q"
                defaultValue={q}
                placeholder="Buscar por nome do benefício..." 
                className="bg-white"
              />
            </div>
            <button type="submit" className={buttonVariants()}>
              <Search className="h-4 w-4 mr-2" />
              Filtrar
            </button>
          </form>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b sticky top-0 z-10">
                <tr>
                  <th className="font-medium p-2 px-4 whitespace-nowrap">Nome</th>
                  <th className="font-medium p-2 whitespace-nowrap">Tipo</th>
                  <th className="font-medium p-2 whitespace-nowrap">Fornecedor</th>
                  <th className="font-medium p-2 whitespace-nowrap">Valor Base</th>
                  <th className="font-medium p-2 whitespace-nowrap">Status</th>
                  <th className="font-medium p-2 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {benefits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      Nenhum benefício master cadastrado.
                    </td>
                  </tr>
                ) : (
                  benefits.map((ben) => (
                    <tr key={ben.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-2 px-4 font-medium whitespace-nowrap">{ben.name}</td>
                      <td className="p-2 whitespace-nowrap">{ben.type}</td>
                      <td className="p-2 whitespace-nowrap">{ben.supplier?.company?.corporateName || ben.supplier?.person?.fullName || "-"}</td>
                      <td className="p-2 whitespace-nowrap">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ben.baseValue)}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <Badge variant={ben.isActive ? "default" : "secondary"}>
                          {ben.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <BeneficioRowActions beneficio={ben} />
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
