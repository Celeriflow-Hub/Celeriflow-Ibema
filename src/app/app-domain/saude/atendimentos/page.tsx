import { canPerformModuleOperation, getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ClipboardList } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import AtendimentosClient from "./AtendimentosClient";

export default async function Page() {
  const context = await getTenantContextForModule("SAUDE");
  const [items, currentProfessional] = await Promise.all([
    context.prisma.medicalRecord.findMany({
      orderBy: [{ date: "desc" }, { id: "desc" }],
      select: {
        id: true,
        date: true,
        type: true,
        chiefComplaint: true,
        patient: { select: { person: { select: { fullName: true } } } },
        professional: { select: { employee: { select: { name: true } } } },
        unit: { select: { name: true } },
      },
    }),
    context.user.employeeId
      ? context.prisma.healthProfessional.findFirst({
        where: { employeeId: context.user.employeeId, isActive: true },
        select: { id: true, unitId: true, employee: { select: { name: true, isActive: true } } },
      })
      : null,
  ]);

  const professional = currentProfessional?.employee.isActive ? currentProfessional : null;
  const appointments = professional
    ? await context.prisma.healthAppointment.findMany({
      where: {
        status: { in: ["Agendado", "Aguardando", "Em Atendimento"] },
        OR: [{ professionalId: professional.id }, { professionalId: null }],
        ...(professional.unitId ? { unitId: professional.unitId } : {}),
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
      select: {
        id: true,
        date: true,
        specialty: true,
        status: true,
        professionalId: true,
        patient: { select: { person: { select: { fullName: true } } } },
        unit: { select: { name: true } },
      },
    })
    : [];

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Atendimentos e Prontuários" icon={<ClipboardList className="size-4 shrink-0 text-emerald-600" />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <AtendimentosClient
        records={items.map(item => ({ ...item, date: item.date.toISOString() }))}
        appointments={appointments.map(appointment => ({ ...appointment, date: appointment.date.toISOString() }))}
        currentProfessional={professional ? { id: professional.id, name: professional.employee.name } : null}
        canRegister={canPerformModuleOperation(context.user, "SAUDE", "update")}
      />
    </PageFrame>
  );
}
