import React from "react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { Search, MapPin } from "lucide-react";
import { NewInspectionSheet } from "../components/NewInspectionSheet";
import { QuickFilters } from "../components/QuickFilters";
import { InspectionRowActions } from "../components/InspectionRowActions";
import type { Prisma } from "@prisma/client";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function FiscalizacaoPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined } }) {
  const { prisma } = await getTenantContextForModule("MEIO_AMBIENTE");
  const searchParams = await Promise.resolve(props.searchParams || {});
  const where: Prisma.EnvInspectionWhereInput = {};
  if (searchParams.status) where.status = searchParams.status;

  const inspections = await prisma.envInspection.findMany({ where, include: { enterprise: true }, orderBy: { dateScheduled: "desc" } });
  const enterprises = await prisma.envEnterprise.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Fiscalização e Vistorias" icon={<Search className="size-4 shrink-0 text-purple-600" />} action={<NewInspectionSheet enterprises={enterprises} />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <section className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800" aria-label="Lista de vistorias">
        <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="search" aria-label="Buscar vistoria" placeholder="Buscar vistoria..." className="h-9 w-full rounded-md border bg-white pl-9 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white" />
          </div>
          <QuickFilters filters={[
            { name: "status", label: "Status", options: [{ value: "Agendada", label: "Agendada" }, { value: "Em Andamento", label: "Em Andamento" }, { value: "Realizada", label: "Realizada" }, { value: "Cancelada", label: "Cancelada" }] }
          ]} />
        </div>
        {inspections.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma vistoria agendada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3">Data Agendada</th>
                  <th className="px-6 py-3">Fiscal Responsavel</th>
                  <th className="px-6 py-3">Empreendimento</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Observacoes</th>
                  <th className="px-6 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((insp) => (
                  <tr key={insp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{insp.dateScheduled ? new Date(insp.dateScheduled).toLocaleString("pt-BR") : "-"}</td>
                    <td className="px-6 py-4 text-gray-500">{insp.inspector}</td>
                    <td className="px-6 py-4 text-gray-500">{insp.enterprise ? insp.enterprise.name : "Nenhum"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${insp.status === "Realizada" ? "bg-green-100 text-green-700" : insp.status === "Cancelada" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {insp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={insp.notes || ""}>{insp.notes || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <InspectionRowActions inspection={insp} enterprises={enterprises} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageFrame>
  );
}
