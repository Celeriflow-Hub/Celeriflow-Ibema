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
      <div className="mb-2 flex h-9 items-center justify-between border-b border-slate-300 bg-white px-3 shadow-sm">
        <h1 className="text-sm font-bold tracking-tight text-slate-900">Secretarias</h1>
        <Link href="/administracao/secretarias/novo" className="inline-flex h-7 items-center justify-center rounded bg-blue-700 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-800">
          Adicionar secretaria
        </Link>
      </div>
      <SecretariasClient secretariats={secretariats} />
    </div>
  );
}
