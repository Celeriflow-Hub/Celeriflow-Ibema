import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { Eye } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const { prisma } = await getTenantContextForModule("TRANSPARENCIA");
  const banners = await prisma.portalBanner.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Banners"
        icon={<Eye className="size-4 shrink-0 text-blue-600" />}
        action={<Link href="/transparencia/banners/novo" className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700">Novo banner</Link>}
      />
      <p className="px-1 text-sm text-slate-500">Gerencie os destaques da página inicial do portal.</p>
      
      {banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100">
            <Eye className="size-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Nenhum banner cadastrado</h3>
          <p className="text-slate-500 mt-1">Adicione banners para destacar informações importantes.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-3 py-2.5">Título</th>
                <th className="px-3 py-2.5">Posição</th>
                <th className="hidden px-3 py-2.5 sm:table-cell">Ordem</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {banners.map(banner => (
                <tr key={banner.id} className="hover:bg-slate-50">
                  <td className="break-words px-3 py-3 font-medium text-slate-800">{banner.title}</td>
                  <td className="px-3 py-3 text-slate-600">{banner.position}<span className="mt-1 block text-xs sm:hidden">Ordem: {banner.order}</span></td>
                  <td className="hidden px-3 py-3 text-slate-600 sm:table-cell">{banner.order}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${banner.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {banner.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageFrame>
  );
}
