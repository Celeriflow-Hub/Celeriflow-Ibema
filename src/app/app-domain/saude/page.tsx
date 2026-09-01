import React from "react";
import { Stethoscope, HeartPulse, Users, Activity, Pill, CalendarCheck, ClipboardType } from "lucide-react";
import Link from "next/link";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function SaudeDashboardPage() {
  const { prisma } = await getTenantContextForModule("SAUDE");
  const [
    totalUnits,
    totalPatients,
    todayAppointments,
    todayVaccines
  ] = await Promise.all([
    prisma.healthUnit.count({ where: { isActive: true } }),
    prisma.patient.count({ where: { status: "Ativo" } }),
    prisma.healthAppointment.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.vaccinationRecord.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    })
  ]);

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader
        title="Saúde"
        icon={<HeartPulse className="size-4 shrink-0 text-rose-600" />}
        className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white"
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-md bg-indigo-100 p-2.5 dark:bg-indigo-900/50">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unidades Ativas</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalUnits}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-md bg-blue-100 p-2.5 dark:bg-blue-900/50">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pacientes Cadastrados</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalPatients}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-md bg-emerald-100 p-2.5 dark:bg-emerald-900/50">
            <CalendarCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Agendamentos (Hoje)</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{todayAppointments}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-md bg-teal-100 p-2.5 dark:bg-teal-900/50">
            <Pill className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vacinas Aplicadas (Hoje)</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{todayVaccines}</p>
          </div>
        </div>
      </div>

      <h2 className="pt-1 text-sm font-semibold text-gray-900 dark:text-white">Acesso Rápido</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/saude/unidades" className="group">
          <div className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <Activity className="mb-3 h-6 w-6 text-indigo-500 transition-transform group-hover:scale-110" />
            <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white">Unidades e Equipes</h3>
            <p className="text-sm text-gray-500">Gestão de UBS, ESF e profissionais da saúde.</p>
          </div>
        </Link>

        <Link href="/saude/pacientes" className="group">
          <div className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <Users className="mb-3 h-6 w-6 text-blue-500 transition-transform group-hover:scale-110" />
            <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white">Pacientes</h3>
            <p className="text-sm text-gray-500">Cartão SUS, prontuário unificado e histórico clínico.</p>
          </div>
        </Link>

        <Link href="/saude/atendimentos" className="group">
          <div className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <Stethoscope className="mb-3 h-6 w-6 text-emerald-500 transition-transform group-hover:scale-110" />
            <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white">Atendimentos</h3>
            <p className="text-sm text-gray-500">Agenda, triagem (sinais vitais) e evolução clínica.</p>
          </div>
        </Link>

        <Link href="/saude/farmacia" className="group">
          <div className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="flex gap-2">
              <Pill className="mb-3 h-6 w-6 text-teal-500 transition-transform group-hover:scale-110" />
              <ClipboardType className="mb-3 h-6 w-6 text-cyan-500 transition-transform group-hover:scale-110" />
            </div>
            <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white">Farmácia e Vacinas</h3>
            <p className="text-sm text-gray-500">Dispensação de receitas, vacinação e controle básico.</p>
          </div>
        </Link>
      </div>
    </PageFrame>
  );
}
