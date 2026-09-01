import React from "react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { Trash2, Search } from "lucide-react";
import { NewWasteSheet } from "../components/NewWasteSheet";
import { QuickFilters } from "../components/QuickFilters";
import { WasteRowActions } from "../components/WasteRowActions";
import type { Prisma } from "@prisma/client";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ResiduosPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined } }) {
  const { prisma } = await getTenantContextForModule("MEIO_AMBIENTE");
  const searchParams = await Promise.resolve(props.searchParams || {});
  const where: Prisma.EnvWasteWhereInput = {};
  if (searchParams.tipo) where.wasteType = { contains: searchParams.tipo, mode: "insensitive" };

  const wastes = await prisma.envWaste.findMany({ where, include: { enterprise: true }, orderBy: { date: "desc" } });
  const enterprises = await prisma.envEnterprise.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Controle de Resíduos" icon={<Trash2 className="size-4 shrink-0 text-green-600" />} action={<NewWasteSheet enterprises={enterprises} />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <section className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800" aria-label="Lista de resíduos">
        <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="search" aria-label="Buscar registro de resíduo" placeholder="Buscar registros..." className="h-9 w-full rounded-md border bg-white pl-9 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:text-white" />
          </div>
          <QuickFilters filters={[
            { name: "tipo", label: "Tipo", options: [{ value: "Organico", label: "Organico" }, { value: "Reciclavel", label: "Reciclavel" }, { value: "Perigoso", label: "Perigoso" }, { value: "Eletronico", label: "Eletronico" }] }
          ]} />
        </div>
        {wastes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Trash2 className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-bounce" />
            <p>Nenhum registro de residuo encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3">Gerador / Empresa</th>
                  <th className="px-6 py-3">Tipo de Residuo</th>
                  <th className="px-6 py-3">Quantidade (Kg)</th>
                  <th className="px-6 py-3">Destinacao Final</th>
                  <th className="px-6 py-3">Data Registro</th>
                  <th className="px-6 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {wastes.map((w) => (
                  <tr key={w.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{w.generatorName}</td>
                    <td className="px-6 py-4 text-gray-500">{w.wasteType}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{w.quantityKg.toLocaleString("pt-BR")} Kg</td>
                    <td className="px-6 py-4 text-gray-500">{w.destination}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(w.date).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4 text-right">
                      <WasteRowActions waste={w} enterprises={enterprises} />
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
