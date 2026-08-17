import { NextRequest, NextResponse } from "next/server";
import { AccessError } from "@/lib/platform/tenant-context";
import { getProtocolContextForOperation } from "@/lib/protocols/access";
import { uploadProcessFile } from "@/lib/platform/blob";
import { createPublicValidationCode, hashDocumentContent } from "@/lib/documents/document-flow-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const context = await getProtocolContextForOperation("create");
    if (!context.user.employeeId) {
      throw new Error("Seu usuario precisa estar vinculado a um servidor para anexar documentos.");
    }

    const employee = await context.prisma.employee.findUnique({
      where: { id: context.user.employeeId },
      include: { department: true },
    });
    if (!employee?.isActive || !employee.departmentId || !employee.department?.isActive) {
      throw new Error("Seu vinculo operacional nao esta ativo ou nao possui departamento.");
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const processId = String(formData.get("processId") || "");
    const title = String(formData.get("title") || "").trim();
    const documentType = String(formData.get("documentType") || "Anexo").trim() || "Anexo";
    const documentClassId = String(formData.get("documentClassId") || "") || null;
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }
    if (!processId || !title) {
      return NextResponse.json({ error: "Informe o processo e o titulo do documento." }, { status: 400 });
    }

    const blob = await uploadProcessFile(file);
    const document = await context.prisma.$transaction(async (tx) => {
      const process = await tx.process.findUnique({
        where: { id: processId },
        select: { id: true, protocolNumber: true, status: true, currentDepartmentId: true, processType: { select: { genericWorkflowEnabled: true } } },
      });
      if (!process) throw new Error("Processo nao encontrado.");
      if (process.currentDepartmentId !== employee.departmentId) throw new Error("Este processo nao pertence ao seu setor.");
      if (["Aguardando Recebimento", "Arquivado", "Cancelado"].includes(process.status)) {
        throw new Error("Este processo nao aceita anexos neste momento.");
      }

      if (process.processType.genericWorkflowEnabled && !documentClassId) {
        throw new Error("Selecione a classe documental para anexos do fluxo generico.");
      }
      if (documentClassId) {
        const documentClass = await tx.documentClass.findFirst({ where: { id: documentClassId, isActive: true }, select: { id: true } });
        if (!documentClass) throw new Error("A classe documental selecionada nao esta ativa.");
      }
      const document = await tx.document.create({
        data: {
          title,
          documentType,
          fileUrl: blob.url,
          status: "Válido",
          notes: `Anexo do processo ${process.protocolNumber}.`,
          documentClassId,
        },
      });
      if (process.processType.genericWorkflowEnabled) {
        await tx.documentVersion.create({
          data: {
            documentId: document.id,
            versionNumber: 1,
            fileUrl: blob.url,
            hashSha256: hashDocumentContent(new Uint8Array(await file.arrayBuffer())),
            publicValidationCode: createPublicValidationCode(),
            status: "FINAL",
          },
        });
      }
      await tx.processDocument.create({
        data: {
          processId: process.id,
          documentId: document.id,
          purpose: documentType,
          employeeId: employee.id,
        },
      });
      await tx.processEvent.create({
        data: {
          processId: process.id,
          eventType: "DOCUMENT_ADDED",
          description: `Documento ${title} anexado ao processo e registrado no GED.`,
          departmentId: employee.departmentId,
          employeeId: employee.id,
        },
      });
      return document;
    });

    return NextResponse.json({ id: document.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno ao enviar o arquivo." },
      { status: 400 },
    );
  }
}
