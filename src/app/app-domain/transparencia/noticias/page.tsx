import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import NoticiasTable from "./NoticiasTable";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const { prisma } = await getTenantContextForModule("TRANSPARENCIA");
  const news = await prisma.portalNews.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Notícias"
        icon={<Newspaper className="size-4 shrink-0 text-blue-600" />}
        action={<Link href="/transparencia/noticias/novo" className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700">Nova notícia</Link>}
      />
      <p className="px-1 text-sm text-slate-500">Gerencie as notícias do portal da prefeitura.</p>
      
      {news.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100">
            <Newspaper className="size-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Nenhuma notícia encontrada</h3>
          <p className="text-slate-500 mt-1">Comece publicando a primeira notícia do portal.</p>
        </div>
      ) : (
        <NoticiasTable news={news} />
      )}
    </PageFrame>
  );
}
