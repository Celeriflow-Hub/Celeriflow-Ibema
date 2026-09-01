import { FileSignature, Search } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import AssinaturasClient from "./AssinaturasClient";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function AssinaturasPage() {
  const { prisma, user } = await getTenantContextForModule("DOCUMENTOS");
  const pendingSignatures = await prisma.documentSignature.findMany({
    where: {
      signerUsuarioId: user.id,
      status: "PENDING",
      documentVersion: { status: "PENDING_SIGNATURE" },
    },
    orderBy: { requestedAt: "asc" },
    select: {
      documentId: true,
      requestedAt: true,
      document: { select: { title: true, documentType: true, status: true } },
    },
  });
  const documents = pendingSignatures.map((signature) => ({
    id: signature.documentId,
    title: signature.document.title,
    documentType: signature.document.documentType,
    createdAt: signature.requestedAt,
    status: signature.document.status,
  }));

  return (
    <PageFrame className="max-w-6xl space-y-2">
      <PageHeader title="Assinaturas Eletrônicas" icon={<FileSignature className="size-4 shrink-0 text-indigo-600" />} />
      <p className="text-xs text-slate-500">Registre uma manifestação interna vinculada a uma versão imutável do documento.</p>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-2 border-b border-slate-200 bg-slate-50/50 p-3 sm:flex-row">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar documentos pendentes..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Você não possui documentos pendentes de assinatura no momento.
            </div>
          ) : (
            <AssinaturasClient initialDocuments={documents} />
          )}
        </div>
      </div>
    </PageFrame>
  );
}
