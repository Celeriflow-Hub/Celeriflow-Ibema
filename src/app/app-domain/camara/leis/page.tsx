import { Scale } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
}

export default async function LeisPage() {
  const { prisma } = await getTenantContextForModule("CAMARA");
  const leis = await prisma.camLei.findMany({
    include: { proposicao: { include: { autor: true } } },
    orderBy: { dataPublicacao: "desc" },
  });

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader title="Leis e Atos Normativos" icon={<Scale className="size-4 shrink-0 text-[#9333EA]" />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-gray-800"><tr><th className="px-4 py-3">Número</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Ementa</th><th className="px-4 py-3">Publicação</th><th className="px-4 py-3">Situação</th></tr></thead>
            <tbody>{leis.map((lei) => <tr key={lei.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800/50"><td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{lei.numero}</td><td className="px-4 py-3 text-slate-600 dark:text-gray-300">{lei.tipo}</td><td className="max-w-xl truncate px-4 py-3 text-slate-600 dark:text-gray-300">{lei.ementa}</td><td className="px-4 py-3 text-slate-600 dark:text-gray-300">{formatDate(lei.dataPublicacao)}</td><td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">{lei.status}</span></td></tr>)}</tbody>
          </table>
        </div>
        {leis.length === 0 && <p className="p-12 text-center text-gray-500 dark:text-gray-400">Nenhuma lei ou ato cadastrado.</p>}
      </div>
    </PageFrame>
  );
}
