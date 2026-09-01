"use client";

import { useState } from "react";
import { Users, Search, Plus, Filter, Phone, Mail, Building, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type Vereador = {
  id: string;
  nomeCompleto: string;
  nomeParlamentar: string;
  partido: string | null;
  email: string | null;
  telefone: string | null;
  status: string;
  gabinete: { sala: string; andar: string | null; telefone: string | null; ramal: string | null } | null;
  cargosMesa: { cargo: string; status: string }[];
  legislatura: { numero: number };
};

export default function VereadoresClient({ vereadores }: { vereadores: Vereador[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"vereadores" | "mesa" | "gabinetes">("vereadores");

  const filtered = vereadores.filter(ver => 
    ver.nomeParlamentar.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (ver.partido && ver.partido.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const mesaDiretora = vereadores
    .flatMap(v => v.cargosMesa.map(cargo => ({ ...v, cargoInfo: cargo })))
    .filter(v => v.cargoInfo.status === "Ativo");

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader
        title="Parlamentares"
        icon={<Users className="size-4 shrink-0 text-[#9333EA]" />}
        action={<button className="flex h-8 items-center gap-2 rounded-md bg-[#9333EA] px-3 text-sm font-medium text-white transition-colors hover:bg-[#7E22CE]"><Plus className="h-4 w-4" />Novo Vereador</button>}
        className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white"
      />

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("vereadores")}
          className={`relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "vereadores" ? "text-[#9333EA]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Vereadores
          {activeTab === "vereadores" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9333EA] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("mesa")}
          className={`relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "mesa" ? "text-[#9333EA]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Mesa Diretora
          {activeTab === "mesa" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9333EA] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("gabinetes")}
          className={`relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "gabinetes" ? "text-[#9333EA]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Gabinetes
          {activeTab === "gabinetes" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9333EA] rounded-t-full" />
          )}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar parlamentar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#9333EA]/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {activeTab === "vereadores" && (
          filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum parlamentar encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3">Nome Parlamentar</th>
                    <th className="px-6 py-3">Partido</th>
                    <th className="px-6 py-3">Contato</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ver) => (
                    <tr key={ver.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{ver.nomeParlamentar}</div>
                        <div className="text-xs text-gray-500">{ver.nomeCompleto}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-600">
                        {ver.partido || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          {ver.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {ver.telefone}</span>}
                          {ver.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {ver.email}</span>}
                          {!ver.telefone && !ver.email && "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={
                            ver.status === 'Em Exercício' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                            ver.status === 'Licenciado' || ver.status === 'Afastado' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : 
                            'bg-gray-100 text-gray-700 hover:bg-gray-100'
                          }
                        >
                          {ver.status}
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
          )
        )}

        {activeTab === "mesa" && (
          mesaDiretora.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Mesa Diretora não configurada para a legislatura atual.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3">Cargo na Mesa</th>
                    <th className="px-6 py-3">Vereador</th>
                    <th className="px-6 py-3">Partido</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mesaDiretora.map((m, i) => (
                    <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {m.cargoInfo.cargo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{m.nomeParlamentar}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-semibold">
                        {m.partido}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#9333EA] hover:text-[#7E22CE] font-medium text-sm">
                          Alterar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === "gabinetes" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3">Vereador</th>
                  <th className="px-6 py-3">Sala / Andar</th>
                  <th className="px-6 py-3">Telefone do Gabinete</th>
                  <th className="px-6 py-3">Ramal</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ver) => (
                  <tr key={ver.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {ver.nomeParlamentar}
                    </td>
                    <td className="px-6 py-4">
                      {ver.gabinete ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building className="h-4 w-4 text-gray-400" />
                          Sala {ver.gabinete.sala} {ver.gabinete.andar && `- ${ver.gabinete.andar}`}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Não alocado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {ver.gabinete?.telefone || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {ver.gabinete?.ramal || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#9333EA] hover:text-[#7E22CE] font-medium text-sm">
                        {ver.gabinete ? "Editar" : "Alocar"}
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
