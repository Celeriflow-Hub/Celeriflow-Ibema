import { getProtocolContext, protocolScope } from "@/lib/protocols/access";
import AssinaturasClient from "./AssinaturasClient";

export const dynamic = "force-dynamic";

export default async function AssinaturasPage() {
  const context = await getProtocolContext();
  const { prisma, user } = context;
  const signatures = await prisma.documentSignature.findMany({
    where: {
      signerUsuarioId: user.id,
      status: "PENDING",
      documentVersion: { status: "PENDING_SIGNATURE" },
      document: { processDocuments: { some: { process: { is: protocolScope(context) } } } },
    },
    select: {
      documentId: true,
      requestedAt: true,
      document: {
        select: {
          title: true,
          documentType: true,
          processDocuments: {
            where: { process: { is: protocolScope(context) } },
            select: { process: { select: { id: true, protocolNumber: true } } },
            take: 1,
          },
        },
      },
    },
    orderBy: { requestedAt: "asc" },
  });

  return <AssinaturasClient initialDocuments={signatures.flatMap((signature) => {
    const process = signature.document.processDocuments[0]?.process;
    return process ? [{ id: signature.documentId, title: signature.document.title, documentType: signature.document.documentType, requestedAt: signature.requestedAt, process }] : [];
  })} />;
}
