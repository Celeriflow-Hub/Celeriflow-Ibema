import React from "react";
import { Users, Plus, Search, Edit2, Trash2, Building, BookOpen } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function MatriculasPage() {
  const { prisma } = await getTenantContextForModule("EDUCACAO");
  const classes = await prisma.schoolClass.findMany({
    include: {
      school: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: [{ school: { name: "asc" } }, { name: "asc" }],
  });

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader title="Matrículas e Turmas" icon={<Users className="size-4 shrink-0 text-blue-600 dark:text-blue-300" />} action={<button className="flex h-8 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"><Plus className="h-4 w-4" />Novas Turmas</button>} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Gestão de turmas, vagas e alunos matriculados nas escolas.</p>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar turma ou escola..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Escola</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Ensino</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Turma</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-center">Nº de Alunos</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((schoolClass) => (
                <tr key={schoolClass.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      {schoolClass.school.name}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      {schoolClass.stage}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 dark:text-white font-semibold">
                      {schoolClass.name} - {schoolClass.grade}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Turno: {schoolClass.shift}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {schoolClass._count.enrollments} / {schoolClass.capacity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        schoolClass.status === "Aberta"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {schoolClass.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {classes.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma turma cadastrada no momento.
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
