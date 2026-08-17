import { getTenantContextForModule, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { createReportTemplatePresentation, reportTemplateScope } from "@/lib/reports/report-template";
import { ReportTemplateForm } from "./ReportTemplateForm";

export const dynamic = "force-dynamic";

export default async function ReportTemplatePage() {
  const { prisma, user } = await getTenantContextForModule("CONFIGURACOES");
  const storedTemplate = await prisma.reportTemplate.findUnique({
    where: { scope: reportTemplateScope },
    select: { version: true, fingerprint: true, header: true, footer: true, orientation: true, includeEmissionMetadata: true },
  });
  const template = createReportTemplatePresentation(storedTemplate);

  return <div className="flex-1 p-5 sm:p-8"><div className="mb-8"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios da instância</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Um único modelo visual é aplicado aos relatórios internos. Arquivamento, publicação e assinatura são fluxos separados.</p></div>{isSystemAdministrator(user) ? <ReportTemplateForm template={template} /> : <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">O modelo global de relatórios é gerenciado pelo administrador do sistema.</div>}</div>;
}
