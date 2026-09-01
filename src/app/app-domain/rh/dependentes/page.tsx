import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { DependenteRowActions } from "./DependenteRowActions"
import { format } from "date-fns"
import { DependenteFilters } from "./DependenteFilters"
import type { Prisma } from "@prisma/client";
import { UserPlus } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function DependentesPage(
  props: {
    searchParams?: Promise<{
      q?: string;
    }>
  }
) {
  const { prisma } = await getTenantContextForModule("RH");
  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";

  const where: Prisma.DependentWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { employee: { name: { contains: q, mode: 'insensitive' } } }
    ];
  }

  const dependents = await prisma.dependent.findMany({
    where,
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      employee: true
    }
  })

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Dependentes" icon={<UserPlus className="size-4 shrink-0 text-violet-600" />} />

      <Card size="sm" className="rounded-md shadow-none">
        <CardHeader className="border-b pb-2">
          <CardTitle>Lista de Dependentes</CardTitle>
          <CardDescription>
            Visualização geral de dependentes cadastrados. Exibindo {dependents.length} registros (limite de 100).
            <br />
            <strong>Nota:</strong> Novos dependentes devem ser cadastrados diretamente na ficha do Servidor (Editar Servidor).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <DependenteFilters />

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="font-medium p-2 px-4 whitespace-nowrap">Servidor Responsável</th>
                  <th className="font-medium p-2 whitespace-nowrap">Dependente</th>
                  <th className="font-medium p-2 whitespace-nowrap">Parentesco</th>
                  <th className="font-medium p-2 whitespace-nowrap">Nascimento</th>
                  <th className="font-medium p-2 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dependents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      Nenhum dependente encontrado.
                    </td>
                  </tr>
                ) : (
                  dependents.map((dep) => (
                    <tr key={dep.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-2 px-4 font-medium whitespace-nowrap">{dep.employee?.name}</td>
                      <td className="p-2 whitespace-nowrap">{dep.name}</td>
                      <td className="p-2 whitespace-nowrap">{dep.relationship}</td>
                      <td className="p-2 whitespace-nowrap">{dep.birthDate ? format(new Date(dep.birthDate), 'dd/MM/yyyy') : '-'}</td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <DependenteRowActions dependent={dep} />
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
