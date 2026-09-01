import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { FileOutput } from "lucide-react";
import PaginasTable from "./PaginasTable";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function PaginasPage() {
  const { prisma } = await getTenantContextForModule("TRANSPARENCIA");
  const pages = await prisma.portalPage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Páginas institucionais"
        icon={<FileOutput className="size-4 shrink-0 text-purple-600" />}
        action={<Link href="/transparencia/paginas/novo" className="rounded-md bg-purple-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-purple-700">Nova página</Link>}
      />
      <p className="px-1 text-sm text-slate-500">Gerencie as páginas estáticas do portal da prefeitura.</p>
      
      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100">
            <FileOutput className="size-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Nenhuma página encontrada</h3>
          <p className="text-slate-500 mt-1">Crie páginas como &quot;História&quot;, &quot;Prefeito&quot; ou &quot;Estrutura&quot;.</p>
        </div>
      ) : (
        <PaginasTable pages={pages} />
      )}
    </PageFrame>
  );
}
