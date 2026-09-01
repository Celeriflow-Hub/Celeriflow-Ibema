import React from "react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { FileText, Search } from "lucide-react";
import { NewProposicaoSheet } from "../components/NewProposicaoSheet";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function ProposicoesPage() {
  const { prisma } = await getTenantContextForModule("CAMARA");
  const [proposicoes, vereadores] = await Promise.all([
    prisma.camProposicao.findMany({
      include: { autor: true, sessao: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.camVereador.findMany({
      where: { status: "Em Exercício" },
      orderBy: { nomeParlamentar: 'asc' }
    })
  ]);

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader
        title="Proposições Legislativas"
        icon={<FileText className="size-4 shrink-0 text-[#9333EA]" />}
        action={<NewProposicaoSheet vereadores={vereadores} />}
        className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white"
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center border-b border-slate-100 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar proposição..." 
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#9333EA]/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {proposicoes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma proposição cadastrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3">Número/Ano</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Ementa</th>
                  <th className="px-6 py-3">Autor</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {proposicoes.map((prop) => (
                  <tr key={prop.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {prop.numero}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{prop.tipo}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={prop.ementa}>
                      {prop.ementa}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{prop.autor.nomeParlamentar}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${prop.status === 'Aprovada' ? 'bg-green-100 text-green-700' : 
                          prop.status === 'Rejeitada' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {prop.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
