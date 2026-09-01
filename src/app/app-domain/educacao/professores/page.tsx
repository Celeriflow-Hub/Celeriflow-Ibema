import React from "react";
import { BookOpen, Search, Filter, Plus, Edit2, Trash2, Building } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ProfessoresPage() {
  const { prisma } = await getTenantContextForModule("EDUCACAO");
  const teachers = await prisma.teacher.findMany({
    include: {
      employee: true,
      taughtClasses: {
        include: { school: true }
      },
    },
    orderBy: { employee: { name: "asc" } },
  });

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader title="Professores" icon={<BookOpen className="size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />} action={<button className="flex h-8 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"><Plus className="h-4 w-4" />Novo Professor</button>} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Gestão do corpo docente, alocação em turmas e escolas.</p>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
        <div className="relative flex-1">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula do professor..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors">
            <Filter className="h-5 w-5" />
            Filtrar
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Professor(a) / Matrícula</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Escolas Atendidas</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Turmas</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Status (RH)</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => {
                // Get unique schools from taught classes
                const uniqueSchools = Array.from(
                  new Set(teacher.taughtClasses.map((c) => c.school.name))
                );

                return (
                  <tr key={teacher.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {teacher.employee.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Mat: {teacher.employee.registration || "-"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {uniqueSchools.length > 0 ? (
                          uniqueSchools.map((school, i) => (
                            <span key={i} className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                              <Building className="h-3 w-3 text-gray-400" /> {school}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">Nenhuma escola</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.taughtClasses.length > 0 ? (
                          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
                            {teacher.taughtClasses.length} turma(s)
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          teacher.employee.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {teacher.employee.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Remover Vínculo">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {teachers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum professor cadastrado.
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
