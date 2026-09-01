import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { InstitutionForm } from "./InstitutionForm";

export const dynamic = "force-dynamic";

export default async function InstituicaoPage() {
  const { prisma } = await getTenantContextForModule("ADMINISTRACAO");
  const institution = await prisma.institution.findFirst();

  return (
    <div className="mx-auto w-full max-w-[1440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2 flex h-9 items-center border-b border-slate-300 bg-white px-3 shadow-sm">
        <h1 className="text-sm font-bold tracking-tight text-slate-900">Dados da Prefeitura</h1>
      </div>

      <InstitutionForm institution={institution} />
    </div>
  );
}
