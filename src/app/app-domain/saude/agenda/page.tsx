import { canPerformModuleOperation, getTenantContextForModule } from "@/lib/platform/tenant-context";
import { Calendar } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import AgendaClient from "./AgendaClient";

export default async function Page() {
  const context = await getTenantContextForModule("SAUDE");
  const [items, patients, units, professionals] = await Promise.all([
    context.prisma.healthAppointment.findMany({
      orderBy: [{ date: "desc" }, { id: "desc" }],
      select: {
        id: true,
        date: true,
        specialty: true,
        priority: true,
        status: true,
        patient: { select: { person: { select: { fullName: true } } } },
        unit: { select: { name: true } },
        professional: { select: { employee: { select: { name: true } } } },
      },
    }),
    context.prisma.patient.findMany({
      where: { status: "Ativo" },
      orderBy: { person: { fullName: "asc" } },
      select: { id: true, cns: true, person: { select: { fullName: true } } },
    }),
    context.prisma.healthUnit.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    context.prisma.healthProfessional.findMany({
      where: { isActive: true },
      orderBy: { employee: { name: "asc" } },
      select: { id: true, unitId: true, specialty: true, employee: { select: { name: true, isActive: true } } },
    }),
  ]);

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Agenda e Agendamentos" icon={<Calendar className="size-4 shrink-0 text-emerald-600" />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <AgendaClient
        appointments={items.map(item => ({ ...item, date: item.date.toISOString() }))}
        patients={patients}
        units={units}
        professionals={professionals.filter(professional => professional.employee.isActive).map(({ employee, ...professional }) => ({ ...professional, employee: { name: employee.name } }))}
        canCreate={canPerformModuleOperation(context.user, "SAUDE", "create")}
        canUpdate={canPerformModuleOperation(context.user, "SAUDE", "update")}
      />
    </PageFrame>
  );
}
