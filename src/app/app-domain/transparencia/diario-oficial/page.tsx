import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { FileText } from "lucide-react";
import DiarioTable from "./DiarioTable";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function DiarioOficialPage() {
  const { prisma } = await getTenantContextForModule("TRANSPARENCIA");
  const diaries = await prisma.officialDiary.findMany({
    orderBy: { editionNumber: 'desc' },
    include: { author: true }
  });

  return (
    <PageFrame className="space-y-2">
      <PageHeader
        title="Diário Oficial"
        icon={<FileText className="size-4 shrink-0 text-emerald-600" />}
        action={<Link href="/transparencia/diario-oficial/novo" className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Nova edição</Link>}
      />
      <p className="px-1 text-sm text-slate-500">Gestão de edições do diário oficial eletrônico (DOM).</p>
      
      {diaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100">
            <FileText className="size-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Nenhuma edição publicada</h3>
          <p className="text-slate-500 mt-1">Gere e publique a primeira edição do Diário Oficial.</p>
        </div>
      ) : (
        <DiarioTable diaries={diaries} />
      )}
    </PageFrame>
  );
}
