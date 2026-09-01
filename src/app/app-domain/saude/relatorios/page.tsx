import { FileText } from 'lucide-react';
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default function Page() {
  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Relatórios Básicos" icon={<FileText className="size-4 shrink-0 text-emerald-600" />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <section className="rounded-md border border-slate-200 bg-white p-4 text-sm text-gray-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400">
        Módulo de relatórios em desenvolvimento. Em breve você poderá exportar estatísticas de atendimentos, dispensação e vacinação em PDF e Excel.
      </section>
    </PageFrame>
  );
}
