import "server-only";
import { z } from "zod";
import { assertPlanningOperation, planningInstrumentWhere, type PlanningContext } from "./access";
import { requestDocumentSignaturesForActor } from "@/lib/documents/document-flow-service";
import { AccessError, canPerformModuleOperation } from "@/lib/platform/tenant-context";

export async function linkPlanningDocument(context: PlanningContext, raw: unknown) {
  assertPlanningOperation(context, "update");
  const input = z.object({ instrumentId: z.string().min(1), hearingId: z.string().min(1).optional(), documentId: z.string().min(1), purpose: z.enum(["ANNEX", "LEGAL_ACT", "HEARING_MINUTES"]) }).parse(raw);
  return context.prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "PlanningInstrument" WHERE id = ${input.instrumentId} FOR UPDATE`;
    const piece = await tx.planningInstrument.findFirstOrThrow({ where: { id: input.instrumentId, ...planningInstrumentWhere(context) }, include: { multiYearPlan: true, budgetGuideline: true, annualBudgetLaw: true } });
    const canonical = piece.multiYearPlan ?? piece.budgetGuideline ?? piece.annualBudgetLaw;
    if (input.purpose === "HEARING_MINUTES" && !input.hearingId) throw new Error("Selecione a audiência da ata.");
    if (input.purpose === "LEGAL_ACT" && ["SANCTIONED", "PUBLISHED"].includes(canonical?.status ?? "") && canonical?.legalDocumentId !== input.documentId) throw new Error("O ato final de peça sancionada não pode ser substituído. Utilize revisão formal.");
    if (input.hearingId && !await tx.planningHearing.count({ where: { id: input.hearingId, instrumentId: piece.id } })) throw new AccessError("Audiência fora da peça autorizada.", 403);
    await tx.$queryRaw`SELECT id FROM "Document" WHERE id = ${input.documentId} FOR UPDATE`;
    const targetKey = `${input.purpose}:${input.hearingId ?? "instrument"}`;
    const preserved = await tx.planningDocumentLink.findUnique({ where: { instrumentId_documentId_targetKey: { instrumentId: piece.id, documentId: input.documentId, targetKey } } });
    if (preserved) return preserved.id;
    const document = await tx.document.findFirst({ where: { id: input.documentId, status: "Válido", documentType: { startsWith: "PLANEJAMENTO:" }, personId: null, companyId: null, healthClinicalDocument: { is: null }, sstCertificateDocument: { is: null }, healthLabReport: { is: null } }, include: { versions: { where: { status: { in: ["FINAL", "SIGNED"] } }, orderBy: { versionNumber: "desc" }, take: 1 } } });
    if (!document?.versions.length) throw new Error("Selecione um documento GED de Planejamento com versão final e hash. Documentos pessoais/clínicos não podem ser reutilizados.");
    if (await tx.planningDocumentLink.count({ where: { documentId: document.id, instrument: { governmentEntityId: { not: piece.governmentEntityId } } } })) throw new AccessError("O documento pertence a outra entidade.", 403);
    const link = await tx.planningDocumentLink.create({ data: { ...input, documentVersionId: document.versions[0].id, targetKey, createdById: context.user.id } });
    if (input.purpose === "LEGAL_ACT") {
      if (piece.multiYearPlanId) await tx.multiYearPlan.update({ where: { id: piece.multiYearPlanId }, data: { legalDocumentId: document.id } });
      if (piece.budgetGuidelineId) await tx.budgetGuideline.update({ where: { id: piece.budgetGuidelineId }, data: { legalDocumentId: document.id } });
      if (piece.annualBudgetLawId) await tx.annualBudgetLaw.update({ where: { id: piece.annualBudgetLawId }, data: { legalDocumentId: document.id } });
    }
    await tx.financialAuditLog.create({ data: { authorUsuarioId: context.user.id, action: "PLANNING_DOCUMENT_LINK", entityType: "PLANNING_INSTRUMENT", entityId: piece.id, payload: { documentId: document.id, versionId: document.versions[0].id, hash: document.versions[0].hashSha256, purpose: input.purpose, hearingId: input.hearingId ?? null } } });
    return link.id;
  });
}

export async function requestPlanningDocumentSignatures(context: PlanningContext, raw: unknown) {
  assertPlanningOperation(context, "update");
  const input = z.object({ linkId: z.string().min(1), signerIds: z.string().min(1) }).parse(raw);
  if (!canPerformModuleOperation(context.user, "DOCUMENTOS", "update")) throw new AccessError("Solicitação de assinatura exige autorização documental.", 403);
  const link = await context.prisma.planningDocumentLink.findFirstOrThrow({ where: { id: input.linkId, instrument: planningInstrumentWhere(context) } });
  const ids = [...new Set(input.signerIds.split(",").filter(Boolean))];
  if (!ids.length || ids.length > 20) throw new Error("Selecione de um a vinte assinantes.");
  await requestDocumentSignaturesForActor(context.prisma, context.user.id, link.documentId, ids, { planningInstrumentId: link.instrumentId, planningDocumentLinkId: link.id, planningDocumentVersionId: link.documentVersionId });
  return link.id;
}

export async function readPlanningDocument(context: PlanningContext, linkId: string) {
  const link = await context.prisma.planningDocumentLink.findFirst({ where: { id: linkId, instrument: planningInstrumentWhere(context) }, include: { document: true, documentVersion: true } });
  if (!link) throw new AccessError("Anexo não encontrado na entidade autorizada.", 404);
  return { ...link, version: link.documentVersion };
}
