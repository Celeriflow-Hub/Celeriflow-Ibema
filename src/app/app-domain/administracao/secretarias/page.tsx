import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import SecretariasClient from "./SecretariasClient";

export const dynamic = "force-dynamic";

export default async function SecretariasPage() {
  const { prisma } = await getTenantContextForModule("ADMINISTRACAO");
  const secretariats = await prisma.secretariat.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { departments: true } } }
  });

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-300 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">Administração geral / Estrutura organizacional</p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Secretarias</h1>
          <p className="mt-0.5 text-sm text-slate-600">Gerencie os registros de secretarias e autarquias.</p>
        </div>
        <Link href="/administracao/secretarias/novo" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800">
          Adicionar secretaria
        </Link>
      </div>
      <SecretariasClient secretariats={secretariats} />
    </div>
  );
}
