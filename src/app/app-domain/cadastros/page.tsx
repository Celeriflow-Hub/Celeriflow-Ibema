import { Users, Building2, Home, FileBox, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";

export const dynamic = "force-dynamic";

export default async function CadastrosDashboardPage() {
  const { prisma } = await getTenantContextForModule("CADASTROS");
  const personsCount = await prisma.person.count();
  const companiesCount = await prisma.company.count();
  const suppliersCount = await prisma.supplier.count();
  const realEstatesCount = await prisma.realEstate.count();

  const stats = [
    { title: "Pessoas Físicas", value: personsCount.toString(), icon: Users, href: "/cadastros/pessoas-fisicas", color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Pessoas Jurídicas", value: companiesCount.toString(), icon: Building2, href: "/cadastros/pessoas-juridicas", color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Fornecedores", value: suppliersCount.toString(), icon: Users, href: "/cadastros/fornecedores", color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Imóveis", value: realEstatesCount.toString(), icon: Home, href: "/cadastros/imoveis", color: "text-sky-600", bg: "bg-sky-100" },
  ];

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Painel de Cadastros" icon={<Users className="size-4 shrink-0 text-indigo-600" />} />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block group">
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-0.5 text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`flex size-9 items-center justify-center rounded-md ${stat.bg} transition-transform duration-200 group-hover:scale-105`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-slate-100">
              <FileBox className="size-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Acesso Rápido</h3>
          </div>
          <div className="space-y-2">
            <Link href="/cadastros/pessoas-fisicas/novo" className="flex items-center justify-between rounded-md border border-slate-100 p-2 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors">
              <span className="text-sm font-medium text-slate-700">Nova Pessoa Física</span>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-100 px-2 py-1 rounded-md">Adicionar</span>
            </Link>
            <Link href="/cadastros/pessoas-juridicas/novo" className="flex items-center justify-between rounded-md border border-slate-100 p-2 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
              <span className="text-sm font-medium text-slate-700">Nova Empresa / Entidade</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-1 rounded-md">Adicionar</span>
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-rose-100">
              <ShieldAlert className="size-4 text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Qualidade dos Dados</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-end justify-between border-b border-slate-100 pb-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Cadastros Duplicados Suspeitos</p>
                <p className="text-xs text-slate-500 mt-0.5">Pessoas com mesmo CPF ou nome similar</p>
              </div>
              <span className="text-lg font-bold text-slate-800">0</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-slate-700">Documentos Vencidos</p>
                <p className="text-xs text-slate-500 mt-0.5">Certidões e alvarás expirados</p>
              </div>
              <span className="text-lg font-bold text-slate-800">0</span>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
