import React from "react";
import { School, Users, Building, Plus, Search, Filter, Edit2, Trash2 } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
export const dynamic = "force-dynamic";

export default async function EscolasPage() {
  const { prisma } = await getTenantContextForModule("EDUCACAO");
  const schools = await prisma.school.findMany({
    include: {
      director: { include: { person: true } },
      _count: {
        select: { classes: true, enrollments: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader title="Escolas" icon={<School className="size-4 shrink-0 text-indigo-600 dark:text-indigo-300" />} action={<Link href="/educacao/escolas/novo" className="flex h-8 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"><Plus className="h-4 w-4" />Nova Escola</Link>} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Gestão da infraestrutura educacional e unidades de ensino.</p>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
        <div className="relative flex-1">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar escola por nome ou INEP..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Status (Todos)</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
          <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors">
            <Filter className="h-5 w-5" />
            Filtrar
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Escola / INEP</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Direção</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Capacidade / Turmas</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Alunos Matriculados</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      {school.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">INEP: {school.inepCode || "N/A"}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {school.director?.person?.fullName || "Não designado"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {school.capacity} vagas totais
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {school._count.classes} turmas ativas
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {school._count.enrollments}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        school.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {school.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Inativar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {schools.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma escola cadastrada no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageFrame>
  );
}
