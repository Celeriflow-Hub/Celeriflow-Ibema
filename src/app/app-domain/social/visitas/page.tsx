import React from "react";
import { Home, Calendar, MapPin, CheckCircle2, Clock, XCircle } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function SocialVisitasPage() {
  const { prisma } = await getTenantContextForModule("SOCIAL");
  const visits = await prisma.socialVisit.findMany({
    include: {
      family: { include: { representative: true, address: true } },
      professional: { include: { person: true } },
    },
    orderBy: { scheduledDate: "asc" },
    take: 50
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Visitas domiciliares"
        icon={<Home className="size-4 shrink-0 text-teal-600" />}
        action={<button className="inline-flex h-7 items-center gap-1 rounded-md bg-teal-600 px-2.5 text-xs font-semibold text-white hover:bg-teal-700"><Calendar className="size-3.5" />Agendar visita</button>}
      />
      <p className="px-1 text-sm text-slate-500">Gestão, agendamento e registro das visitas técnicas da equipe.</p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="p-3 font-semibold">Data</th>
                <th className="p-3 font-semibold">Família e endereço</th>
                <th className="hidden p-3 font-semibold md:table-cell">Técnico</th>
                <th className="hidden p-3 font-semibold lg:table-cell">Objetivo</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Calendar className="size-3.5 text-slate-400" />
                      {visit.scheduledDate.toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="break-words font-medium text-slate-900">
                      {visit.family.representative.fullName}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {visit.family.address?.streetName || "Endereço não cadastrado"}
                    </div>
                  </td>
                  <td className="hidden p-3 md:table-cell">
                    <div className="text-sm text-slate-900">
                      {visit.professional.person?.fullName || visit.professional.name || "Técnico"}
                    </div>
                  </td>
                  <td className="hidden p-3 lg:table-cell">
                    <div className="text-sm text-slate-900">
                      {visit.objective}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                      visit.status === "Agendada" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      visit.status === "Realizada" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {visit.status === "Realizada" && <CheckCircle2 className="h-3 w-3" />}
                      {visit.status === "Agendada" && <Clock className="h-3 w-3" />}
                      {(visit.status !== "Realizada" && visit.status !== "Agendada") && <XCircle className="h-3 w-3" />}
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}

              {visits.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                    Nenhuma visita domiciliar agendada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </PageFrame>
  );
}
