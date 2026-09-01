import React from "react";
import { ClipboardList, Clock, ShieldAlert } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

import { NewAttendanceSheet } from "../components/NewAttendanceSheet";

export default async function SocialAtendimentosPage() {
  const { prisma } = await getTenantContextForModule("SOCIAL");
  const attendances = await prisma.socialAttendance.findMany({
    include: {
      family: { include: { representative: true } },
      person: true,
      unit: true,
      professional: { include: { person: true } },
    },
    orderBy: { date: "desc" },
    take: 50
  });

  const families = await prisma.socialFamily.findMany({
    include: { representative: { select: { fullName: true } } },
    orderBy: { representative: { fullName: "asc" } }
  });

  const units = await prisma.socialUnit.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  const professionals = await prisma.employee.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Atendimentos e acompanhamentos"
        icon={<ClipboardList className="size-4 shrink-0 text-emerald-600" />}
        action={<NewAttendanceSheet families={families} units={units} professionals={professionals} />}
      />
      <p className="px-1 text-sm text-slate-500">Registro de acolhimento, PAIF, PAEFI e atendimentos técnicos.</p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="p-3 font-semibold">Data e hora</th>
                <th className="p-3 font-semibold">Família / indivíduo</th>
                <th className="p-3 font-semibold">Tipo</th>
                <th className="hidden p-3 font-semibold lg:table-cell">Unidade e técnico</th>
                <th className="p-3 font-semibold">Sigilo</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((att) => (
                <tr key={att.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Clock className="size-3.5 text-slate-400" />
                      {att.date.toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="break-words font-medium text-slate-900">
                      Família de {att.family.representative.fullName}
                    </div>
                    {att.person && (
                      <div className="mt-1 text-xs text-slate-500">
                        Foco: {att.person.fullName}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-sm font-medium text-slate-900">
                      {att.type}
                    </div>
                    <div className="mt-1 hidden text-xs text-slate-500 lg:block">
                      {att.description}
                    </div>
                  </td>
                  <td className="hidden p-3 lg:table-cell">
                    <div className="text-sm text-slate-900">
                      {att.unit.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {att.professional.person?.fullName || "Sem técnico designado"}
                    </div>
                  </td>
                  <td className="p-3">
                    {att.secrecyLevel === "Normal" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                        Normal
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center w-fit gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        {att.secrecyLevel}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {attendances.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                    Nenhum atendimento registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </PageFrame>
  );
}
