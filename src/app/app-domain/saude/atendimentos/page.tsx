import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ClipboardList } from 'lucide-react';
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function Page() {
  const { prisma } = await getTenantContextForModule("SAUDE");
  const items = await prisma.medicalRecord.findMany({
    orderBy: { createdAt: 'desc' },
    include: { patient: { include: { person: true } }, professional: { include: { employee: true } } }
  });

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Atendimentos e Prontuários" icon={<ClipboardList className="size-4 shrink-0 text-emerald-600" />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800" aria-label="Lista de atendimentos">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Data</th><th className="p-4 font-semibold text-gray-600">Tipo</th><th className="p-4 font-semibold text-gray-600">Paciente</th><th className="p-4 font-semibold text-gray-600">Profissional</th><th className="p-4 font-semibold text-gray-600">Queixa Principal</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">Nenhum registro encontrado.</td>
              </tr>
            ) : (
              items.map(item => (
      <tr key={item.id} className="border-b">
        <td className="p-4">{new Date(item.date).toLocaleString()}</td>
        <td className="p-4">{item.type}</td>
        <td className="p-4">{item.patient?.person?.fullName}</td>
        <td className="p-4">{item.professional?.employee?.name}</td>
        <td className="p-4">{item.chiefComplaint || '-'}</td>
      </tr>
    ))
            )}
          </tbody>
        </table>
        </div>
      </section>
    </PageFrame>
  );
}
