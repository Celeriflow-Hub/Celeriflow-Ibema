import { FileSignature, Search, Download } from "lucide-react";
import Link from "next/link";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ContratosPage() {
  const { prisma } = await getTenantContextForModule("TRANSPARENCIA");
  const contracts = await prisma.contract.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      supplier: {
        include: { company: true, person: true }
      }
    }
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Contratos públicos" icon={<FileSignature className="size-4 shrink-0 text-emerald-600" />} />
      <p className="px-1 text-sm text-slate-500">Consulte todos os contratos firmados pela prefeitura.</p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/50 p-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por número, objeto ou fornecedor..." 
              className="h-8 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {contracts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhum contrato encontrado.</div>
        ) : (
          <div>
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Contrato</th>
                  <th className="px-3 py-2.5">Fornecedor</th>
                  <th className="hidden px-3 py-2.5 lg:table-cell">Objeto</th>
                  <th className="hidden px-3 py-2.5 xl:table-cell">Vigência</th>
                  <th className="hidden px-3 py-2.5 md:table-cell">Valor</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="hidden px-3 py-2.5 text-right sm:table-cell">Integra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => {
                  const supplierName = c.supplier.company?.tradeName || c.supplier.company?.corporateName || c.supplier.person?.fullName || "Desconhecido";
                  const supplierDoc = c.supplier.company?.cnpj || c.supplier.person?.cpf || "";

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 font-semibold text-slate-800">{c.number}<span className="mt-1 block text-xs font-normal text-slate-500 lg:hidden">{c.object}</span></td>
                      <td className="px-3 py-3">
                        <span className="block break-words font-medium text-slate-800">{supplierName}</span>
                        <span className="block break-all text-xs text-slate-500">{supplierDoc}</span>
                      </td>
                      <td className="hidden px-3 py-3 lg:table-cell">
                        <div className="break-words text-slate-600" title={c.object}>
                          {c.object}
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 text-xs text-slate-600 xl:table-cell">
                        {new Date(c.startDate).toLocaleDateString('pt-BR')} até <br />
                        {new Date(c.endDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="hidden px-3 py-3 font-semibold text-emerald-700 md:table-cell">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.updatedValue)}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          c.status === 'Vigente' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'Encerrado' ? 'bg-slate-100 text-slate-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="hidden px-3 py-3 sm:table-cell">
                        <div className="flex justify-end gap-1">
                        <Link 
                          href={`/compras/contratos`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                          title="Abrir no Módulo de Compras"
                        >
                          Ver no Compras
                        </Link>
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors">
                          <Download className="w-4 h-4" /> PDF
                        </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
