import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { Users } from 'lucide-react';
import PacientesClient from './PacientesClient';
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function Page() {
  const { prisma } = await getTenantContextForModule("SAUDE");
  const items = await prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
    include: { person: true }
  });

  const people = await prisma.person.findMany({
    orderBy: { fullName: 'asc' }
  });

  const units = await prisma.healthUnit.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  const teams = await prisma.healthTeam.findMany({
    where: { isActive: true },
    select: { id: true, name: true, unitId: true },
    orderBy: { name: 'asc' }
  });

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Pacientes" icon={<Users className="size-4 shrink-0 text-emerald-600" />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <PacientesClient patients={items} people={people} units={units} teams={teams} />
    </PageFrame>
  );
}
