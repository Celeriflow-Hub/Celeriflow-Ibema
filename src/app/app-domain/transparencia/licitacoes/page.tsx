import { Gavel, Search, Download } from "lucide-react";
import Link from "next/link";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import UploadLicitacoesForm from "./UploadLicitacoesForm";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function LicitacoesPage() {
  const { prisma } = await getTenantContextForModule("TRANSPARENCIA");
  const biddings = await prisma.bidding.findMany({
    orderBy: { publicationDate: 'desc' },
    include: {
      process: {
        select: {
          number: true,
          object: true,
          estimatedValue: true,
        }
      }
    }
  });

  const now = new Date();

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Licitações abertas"
        icon={<Gavel className="size-4 shrink-0 text-blue-600" />}
        action={<Link href="/compras" className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700">Nova licitação</Link>}
      />
      <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Acompanhe os processos de compra e concorrência pública.</p>
        <div className="flex">
          <UploadLicitacoesForm />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/50 p-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por número ou objeto..." 
              className="h-8 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
          <div className="w-full sm:w-auto">
            <select className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 sm:w-auto">
              <option value="">Todas as Modalidades</option>
              <option value="Pregão">Pregão</option>
              <option value="Concorrência">Concorrência Pública</option>
              <option value="Tomada de Preços">Tomada de Preços</option>
            </select>
          </div>
        </div>

        {biddings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhuma licitação encontrada.</div>
        ) : (
          <div>
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Número / Processo</th>
                  <th className="hidden px-3 py-2.5 md:table-cell">Modalidade</th>
                  <th className="px-3 py-2.5">Objeto</th>
                  <th className="hidden px-3 py-2.5 lg:table-cell">Data da Sessão</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="hidden px-3 py-2.5 text-right sm:table-cell">Edital</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {biddings.map((b) => {
                  // Intelligent status logic
                  let intelligentStatus = "Em Elaboração";
                  let statusColor = "bg-slate-100 text-slate-700";
                  
                  if (b.status === "Concluída" || b.status === "Suspensa") {
                    intelligentStatus = b.status;
                    statusColor = b.status === "Concluída" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
                  } else if (b.sessionDate) {
                    if (b.sessionDate > now) {
                      intelligentStatus = "Previsto (Aberto)";
                      statusColor = "bg-blue-100 text-blue-700";
                    } else {
                      intelligentStatus = "Realizado (Em Julgamento)";
                      statusColor = "bg-purple-100 text-purple-700";
                    }
                  }

                  return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 font-semibold text-slate-800">
                      {b.number}
                      <span className="block text-xs font-normal text-slate-500">{b.process.number}</span>
                    </td>
                    <td className="hidden px-3 py-3 text-slate-600 md:table-cell">{b.modality}</td>
                    <td className="px-3 py-3">
                      <div className="break-words text-slate-800" title={b.process.object}>
                        {b.process.object}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Valor Estimado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(b.process.estimatedValue || 0)}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3 text-slate-600 lg:table-cell">
                      {b.sessionDate ? new Date(b.sessionDate).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColor}`}>
                        {intelligentStatus}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3 text-right sm:table-cell">
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors">
                        <Download className="w-4 h-4" /> Baixar
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
