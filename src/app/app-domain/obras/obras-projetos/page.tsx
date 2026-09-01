import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ObrasProjetosClient } from "../components/ObrasProjetosClient";
import { Building2 } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function ObrasProjetosPage() {
  const { prisma } = await getTenantContextForModule("OBRAS");
  const obras = await prisma.obrasObra.findMany({
    select: {
      id: true,
      numero: true,
      nome: true,
      descricao: true,
      local: true,
      tipo: true,
      valorEstimado: true,
      status: true,
      active: true,
    },
    orderBy: [{ numero: "asc" }, { id: "asc" }],
  });

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Obras e Projetos" icon={<Building2 className="size-4 shrink-0 text-amber-600" />} className="dark:border-slate-700 dark:bg-slate-800 dark:[&>h1]:text-white" />
      <ObrasProjetosClient obras={obras} />
    </PageFrame>
  );
}
