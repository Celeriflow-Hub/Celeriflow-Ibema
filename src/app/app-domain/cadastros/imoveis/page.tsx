import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { Home, Search, Plus, Upload, Download } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import ImoveisClient from "./ImoveisClient";

export const dynamic = "force-dynamic";

export default async function ImoveisPage() {
  const { prisma } = await getTenantContextForModule("CADASTROS");
  const realEstates = await prisma.realEstate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      neighborhood: true,
      taxpayer: {
        include: {
          person: true,
          company: true,
        }
      }
    },
    take: 20
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Imóveis" icon={<Home className="size-4 shrink-0 text-sky-600" />} action={<div className="flex items-center gap-1">
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50" aria-label="Importar imóveis">
            <Upload className="size-3.5" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <button type="button" className="inline-flex h-7 items-center gap-1 rounded border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50" aria-label="Exportar imóveis">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <Link href="/cadastros/imoveis/novo" className="inline-flex h-7 items-center gap-1 rounded bg-sky-700 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-sky-800">
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Adicionar imóvel</span>
            <span className="sm:hidden">Adicionar</span>
          </Link>
        </div>} />

      <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="flex min-h-9 items-center border-b border-slate-200 bg-slate-50 px-3 py-1.5">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por Inscrição ou Endereço..." 
              className="h-7 w-full rounded border border-slate-300 bg-white py-1 pl-8 pr-2 text-xs outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
            />
          </div>
        </div>

        <ImoveisClient realEstates={realEstates} />
      </div>
    </PageFrame>
  );
}
