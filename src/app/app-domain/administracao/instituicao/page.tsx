import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { InstitutionForm } from "./InstitutionForm";

export const dynamic = "force-dynamic";

export default async function InstituicaoPage() {
  const { prisma } = await getTenantContextForModule("ADMINISTRACAO");
  const institution = await prisma.institution.findFirst();

  return (
    <div className="mx-auto w-full max-w-[1440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 border-b border-slate-300 bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">Administração geral / Cadastro institucional</p>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Prefeitura / Entidade Principal</h1>
        <p className="mt-0.5 text-sm text-slate-600">Dados institucionais usados em relatórios técnicos e documentos do sistema.</p>
      </div>

      <InstitutionForm institution={institution} />
    </div>
  );
}
