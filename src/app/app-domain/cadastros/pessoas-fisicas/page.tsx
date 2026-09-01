import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { Users, Search, Plus } from "lucide-react";
import { ImportExportDropdown } from "@/components/ui/ImportExportDropdown";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import PessoasFisicasClient from "./PessoasFisicasClient";

export const dynamic = "force-dynamic";

export default async function PessoasFisicasPage() {
  const { prisma } = await getTenantContextForModule("CADASTROS");
  const persons = await prisma.person.findMany({
    orderBy: { createdAt: 'desc' },
    include: { taxpayerInfo: true },
    take: 10
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Pessoas Físicas" icon={<Users className="size-4 shrink-0 text-indigo-600" />} action={<div className="flex items-center gap-2">
          <ImportExportDropdown />
          <Link href="/cadastros/pessoas-fisicas/novo" className="inline-flex h-7 items-center gap-1.5 rounded bg-indigo-700 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800">
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Adicionar pessoa</span>
            <span className="sm:hidden">Adicionar</span>
          </Link>
        </div>} />

      <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
        <div className="flex min-h-9 items-center border-b border-slate-200 bg-slate-50 px-3 py-1.5">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              className="h-7 w-full rounded border border-slate-300 bg-white py-1 pl-8 pr-2 text-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
            />
          </div>
        </div>

        <PessoasFisicasClient persons={persons} />
      </div>
    </PageFrame>
  );
}
