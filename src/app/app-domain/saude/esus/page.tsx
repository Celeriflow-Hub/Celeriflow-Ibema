import { Activity } from 'lucide-react';
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default function Page() {
  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Integração e-SUS" icon={<Activity className="size-4 shrink-0 text-emerald-600" />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <section className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Ferramenta para exportação de arquivos no formato Thrift para o e-SUS APS.</p>
        <button type="button" className="h-9 w-fit rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700">Gerar Lote e-SUS</button>
      </section>
    </PageFrame>
  );
}
