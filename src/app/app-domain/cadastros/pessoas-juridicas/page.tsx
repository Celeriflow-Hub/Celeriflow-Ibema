import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { Building2, Search, Plus } from "lucide-react";
import { ImportExportDropdown } from "@/components/ui/ImportExportDropdown";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import PessoasJuridicasClient from "./PessoasJuridicasClient";

export const dynamic = "force-dynamic";

export default async function PessoasJuridicasPage() {
  const { prisma } = await getTenantContextForModule("CADASTROS");
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: { taxpayerInfo: true },
    take: 10
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Pessoas Jurídicas" icon={<Building2 className="size-4 shrink-0 text-emerald-600" />} action={<div className="flex items-center gap-2">
          <ImportExportDropdown />
          <Link href="/cadastros/pessoas-juridicas/novo" className="inline-flex h-7 items-center gap-1.5 rounded bg-emerald-700 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800">
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Adicionar empresa</span>
            <span className="sm:hidden">Adicionar</span>
          </Link>
        </div>} />

      <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="flex min-h-9 items-center border-b border-slate-200 bg-slate-50 px-3 py-1.5">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por Razão Social ou CNPJ..." 
              className="h-7 w-full rounded border border-slate-300 bg-white py-1 pl-8 pr-2 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
            />
          </div>
        </div>

        <PessoasJuridicasClient companies={companies} />
      </div>
    </PageFrame>
  );
}
