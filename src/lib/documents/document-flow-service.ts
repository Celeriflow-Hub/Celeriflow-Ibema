import "server-only";

import { getFile } from "@/lib/platform/blob";
import { getInstanceConfigurationDefaults } from "@/lib/platform/instance-configuration";
import type { AppContext } from "@/lib/platform/tenant-context";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
  assertInternalSigningAllowed,
  createPublicValidationCode,
  getVersionSignatureStatus,
  hashDocumentContent,
  snapshotRetentionMonths,
  toPublicValidationResponse,
} from "./document-flow-policy";

type Db = PrismaClient | Prisma.TransactionClient;

type SignatureAudit = {
  ipAddress: string | null;
  userAgent: string | null;
};

async function hashStoredFile(fileUrl: string) {
  const file = await getFile(fileUrl);
  if (!file?.stream) throw new Error("O arquivo original nao esta disponivel para gerar o hash.");
  return hashDocumentContent(new Uint8Array(await new Response(file.stream).arrayBuffer()));
}

async function getConfiguredRetentionMonths(db: Db) {
  const parameter = await db.configuracaoParametroInstancia.findFirst({
    where: { chave: "DOCUMENT_DEFAULT_RETENTION_MONTHS" },
    orderBy: { createdAt: "asc" },
    select: { valor: true },
  });
  const configured = typeof parameter?.valor === "number"
    ? parameter.valor
    : getInstanceConfigurationDefaults().DOCUMENT_DEFAULT_RETENTION_MONTHS;
  return snapshotRetentionMonths(configured);
}

export async function ingestGedDocument(
  db: PrismaClient,
  input: {
    title: string;
    documentType: string;
    documentClassCode: string;
    fileUrl: string;
    folderId?: string | null;
    publicLabel?: string;
    content?: string | Uint8Array;
  },
) {
  const hashSha256 = input.content !== undefined ? hashDocumentContent(input.content) : await hashStoredFile(input.fileUrl);

  return db.$transaction(async (tx) => {
    const [documentClass, retentionMonths] = await Promise.all([
      tx.documentClass.findFirst({
        where: { code: input.documentClassCode, isActive: true },
        select: { id: true },
      }),
      getConfiguredRetentionMonths(tx),
    ]);
    if (!documentClass) throw new Error("A classe documental selecionada nao esta ativa.");

    const document = await tx.document.create({
      data: {
        title: input.title.trim(),
        documentType: input.documentType,
        documentClassId: documentClass.id,
        fileUrl: input.fileUrl,
        folderId: input.folderId ?? null,
        publicLabel: input.publicLabel?.trim() || "Documento autenticado",
        retentionMonths,
        status: "Válido",
      },
      select: { id: true },
    });
    const version = await tx.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: 1,
        fileUrl: input.fileUrl,
        hashSha256,
        publicValidationCode: createPublicValidationCode(),
        status: "FINAL",
      },
      select: { id: true, versionNumber: true, hashSha256: true, publicValidationCode: true },
    });
    return { documentId: document.id, version };
  });
}

export async function requestInternalDocumentSignatures(
  context: AppContext,
  documentId: string,
  signerUsuarioIds: string[],
) {
  const uniqueSignerIds = [...new Set(signerUsuarioIds.filter(Boolean))];
  if (uniqueSignerIds.length === 0) throw new Error("Selecione pelo menos um signatario interno.");

  return context.prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`DOCUMENT_SIGNATURE:${documentId}`}))`;
    const document = await tx.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        documentClass: { select: { signaturePolicy: true } },
        versions: {
          where: { status: "FINAL", lockedAt: null },
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: { id: true, hashSha256: true, publicValidationCode: true },
        },
      },
    });
    if (!document) throw new Error("Documento nao encontrado.");
    assertInternalSigningAllowed(document.documentClass?.signaturePolicy);
    const version = document.versions[0];
    if (!version) throw new Error("O documento nao possui uma versao final disponivel para assinatura.");

    const signers = await tx.usuario.findMany({
      where: { id: { in: uniqueSignerIds }, ativo: true },
      select: { id: true, nome: true, email: true, employeeId: true },
    });
    if (signers.length !== uniqueSignerIds.length) throw new Error("Um ou mais signatarios internos nao estao ativos.");

    const requestedAt = new Date();
    await tx.documentVersion.update({
      where: { id: version.id },
      data: { status: "PENDING_SIGNATURE", lockedAt: requestedAt },
    });
    await tx.documentSignature.createMany({
      data: signers.map((signer) => ({
        documentId: document.id,
        documentVersionId: version.id,
        signerUsuarioId: signer.id,
        signerEmployeeId: signer.employeeId,
        signerName: signer.nome,
        signerEmail: signer.email,
        requestedByUsuarioId: context.user.id,
        isRequired: true,
        authenticationMethod: "PENDING_REAUTHENTICATION",
        documentHash: version.hashSha256,
        verificationCode: createPublicValidationCode(),
        status: "PENDING",
        requestedAt,
      })),
    });
    await tx.document.update({ where: { id: document.id }, data: { status: "Pendente Assinatura" } });
    return {
      documentId: document.id,
      documentVersionId: version.id,
      publicValidationCode: version.publicValidationCode,
      qrValidationUrl: `${process.env.CELERIFLOW_PUBLIC_BASE_URL?.replace(/\/$/, "") || ""}/validar-documento/${version.publicValidationCode}`,
    };
  });
}

export async function registerRequestedInternalDocumentSignature(
  context: AppContext,
  documentId: string,
  audit: SignatureAudit,
  reauthenticatedAt: Date,
) {
  return context.prisma.$transaction(async (tx) => {
    const pendingSignature = await tx.documentSignature.findFirst({
      where: { documentId, signerUsuarioId: context.user.id, status: "PENDING" },
      select: {
        id: true,
        documentVersionId: true,
        documentVersion: {
          select: {
            documentId: true,
            hashSha256: true,
            status: true,
            document: {
              select: {
                documentClass: { select: { signaturePolicy: true } },
              },
            },
          },
        },
      },
    });
    if (!pendingSignature) throw new Error("Nenhuma solicitacao de assinatura pendente foi encontrada para este documento.");
    assertInternalSigningAllowed(pendingSignature.documentVersion.document.documentClass?.signaturePolicy);
    if (pendingSignature.documentVersion.status !== "PENDING_SIGNATURE") throw new Error("A versao solicitada nao esta disponivel para assinatura.");

    const signature = await tx.documentSignature.update({
      where: { id: pendingSignature.id },
      data: {
        authenticationMethod: "FIREBASE_PASSWORD_REAUTH",
        reauthenticatedAt,
        status: "SIGNED",
        signedAt: reauthenticatedAt,
        ipAddress: audit.ipAddress,
        userAgent: audit.userAgent,
        metadata: JSON.stringify({ documentId, documentVersionId: pendingSignature.documentVersionId, signatureId: pendingSignature.id }),
      },
      select: { id: true, verificationCode: true },
    });
    const signatures = await tx.documentSignature.findMany({
      where: { documentVersionId: pendingSignature.documentVersionId },
      select: { status: true, isRequired: true },
    });
    const versionStatus = getVersionSignatureStatus(signatures);
    if (versionStatus === "SIGNED") {
      await tx.documentVersion.update({ where: { id: pendingSignature.documentVersionId }, data: { status: "SIGNED" } });
      await tx.document.update({ where: { id: documentId }, data: { status: "Assinado" } });
    }
    return { ...signature, versionStatus };
  });
}

export async function findPublicDocumentValidation(db: PrismaClient, code: string) {
  const version = await db.documentVersion.findUnique({
    where: { publicValidationCode: code },
    select: {
      versionNumber: true,
      hashSha256: true,
      status: true,
      document: { select: { publicLabel: true } },
    },
  });
  return version ? toPublicValidationResponse({
    publicLabel: version.document.publicLabel,
    versionNumber: version.versionNumber,
    hashSha256: version.hashSha256,
    status: version.status,
  }) : null;
}
