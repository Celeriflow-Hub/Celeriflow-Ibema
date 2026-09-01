"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Landmark, Search, Plus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type Legislatura = {
  id: string;
  numero: number;
  inicio: Date;
  fim: Date;
  status: string;
  descricao: string | null;
  _count: { vereadores: number };
};

export default function LegislaturasClient({ legislaturas }: { legislaturas: Legislatura[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = legislaturas.filter(leg => 
    leg.numero.toString().includes(searchTerm) || 
    (leg.descricao && leg.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader
        title="Legislaturas"
        icon={<Landmark className="size-4 shrink-0 text-[#9333EA]" />}
        action={<button className="flex h-8 items-center gap-2 rounded-md bg-[#9333EA] px-3 text-sm font-medium text-white transition-colors hover:bg-[#7E22CE]"><Plus className="h-4 w-4" />Nova Legislatura</button>}
        className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white"
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-slate-100 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar legislatura..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#9333EA]/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Landmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma legislatura encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3">Número</th>
                  <th className="px-6 py-3">Período</th>
                  <th className="px-6 py-3">Descrição</th>
                  <th className="px-6 py-3 text-center">Vereadores</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((leg) => (
                  <tr key={leg.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {leg.numero}ª Legislatura
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(leg.inicio), 'yyyy')} - {format(new Date(leg.fim), 'yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {leg.descricao || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="bg-gray-50">
                        {leg._count.vereadores}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        className={
                          leg.status === 'Ativa' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                          leg.status === 'Encerrada' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100' : 
                          'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                        }
                      >
                        {leg.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#9333EA] hover:text-[#7E22CE] font-medium text-sm">
                        Editar
                      </button>
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
