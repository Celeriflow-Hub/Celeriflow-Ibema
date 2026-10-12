import { NextRequest, NextResponse } from "next/server";
import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { listFunctionalServices } from "@/lib/portal-servidor/service-catalog";
import { uploadFile } from "@/lib/platform/blob";
import { ingestGedDocument } from "@/lib/documents/document-flow-service";
import { enqueueHrIntegration } from "@/lib/rh/workforce-service";
import { checkRateLimit } from "@/lib/platform/rate-limit";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const access = await getEmployeePortalAccess();
    if (access.status !== "AVAILABLE") return NextResponse.json({ error: "Acesso funcional indisponível." }, { status: 403 });
    const rate = checkRateLimit(`functional-upload:${access.context.user.id}`);
    if (!rate.allowed) return NextResponse.json({ error: "Aguarde antes de enviar outro documento." }, { status: 429 });
    const data = await request.formData();
    const serviceId = String(data.get("serviceId") || ""), code = String(data.get("code") || "");
    const service = (await listFunctionalServices(access.context.prisma, access.employee.id)).find(item => item.id === serviceId);
    const requirement = service?.configuration.requiredDocuments.find(item => item.code === code);
    if (!service || !requirement) return NextResponse.json({ error: "Documento não exigido pelo serviço disponível." }, { status: 400 });
    const file = data.get("file");
    const allowed = ["application/pdf", "image/png", "image/jpeg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.oasis.opendocument.text"];
    if (!(file instanceof File) || !allowed.includes(file.type)) return NextResponse.json({ error: "Envie PDF, DOC, DOCX, XLS, XLSX, ODT, JPG ou PNG." }, { status: 400 });
    const blob = await uploadFile(file);
    let uploadEventId = "";
    await ingestGedDocument(access.context.prisma, {
      title: requirement.label, documentType: "Anexo funcional", documentClassCode: requirement.documentClassCode,
      fileUrl: blob.url, content: new Uint8Array(await file.arrayBuffer()), publicLabel: "Documento funcional",
      actorUsuarioId: access.context.user.id,
      afterCreate: async (tx, documentId) => {
        const event = await enqueueHrIntegration(tx, { sourceKey: `PORTAL:ANEXO:${documentId}`, domain: "PORTAL", environment: "INTERNO", eventType: "ANEXO_FUNCIONAL_RECEBIDO", payload: { employeeId: access.employee.id, actorId: access.context.user.id, serviceId, serviceVersion: service.configuration.version, code, documentId, requestId: null } });
        await tx.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "RECEBIDO" } });
        uploadEventId = event.id;
      },
    });
    return NextResponse.json({ uploadEventId, filename: file.name }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível receber o documento. Confira o formato, tamanho e classe documental do serviço." }, { status: 400 });
  }
}
