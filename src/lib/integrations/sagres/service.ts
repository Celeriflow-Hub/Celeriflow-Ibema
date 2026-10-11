import type { PrismaClient } from "@prisma/client";
import { municipality } from "@/lib/platform/municipality";
import { loadSagresRecords } from "./data-sources";
import { parseCompetence, renderSagresFile, validateSagresHeader, validateSagresRecords, type SagresHeader, type SagresIssue } from "./engine";
import { getSagresLayout, isSagresLayoutCode } from "./layouts";
import { getAccountabilityAdapter } from "./state-adapter";

export class SagresError extends Error {}

export type SagresRequest = { layoutCode: string; competence: string; managementUnit: string };

export function buildSagresHeader(input: SagresRequest): SagresHeader {
  return {
    ibgeCode: municipality.ibgeCode,
    unitCode: municipality.sagresUnitCode,
    cnpj: municipality.cnpj,
    competence: input.competence,
    managementUnit: input.managementUnit,
  };
}

function resolveLayout(code: string) {
  const adapter = getAccountabilityAdapter();
  if (!adapter || !adapter.supportsLayouts.includes(code) || !isSagresLayoutCode(code)) {
    throw new SagresError("Leiaute não suportado para o tribunal deste município.");
  }
  return getSagresLayout(code)!;
}

export async function validateSagresRemessa(prisma: PrismaClient, input: SagresRequest) {
  const layout = resolveLayout(input.layoutCode);
  const headerIssues = validateSagresHeader(buildSagresHeader(input));
  if (!parseCompetence(input.competence)) return { layout, recordCount: 0, issues: headerIssues };
  const records = await loadSagresRecords(prisma, layout.code, input.competence);
  const issues: SagresIssue[] = [...headerIssues, ...validateSagresRecords(layout, records)];
  if (!records.length) issues.push({ line: 0, field: "registros", label: "Registros", message: "Nenhum registro encontrado na competência." });
  return { layout, recordCount: records.length, issues };
}

export async function generateSagresRemessa(prisma: PrismaClient, input: SagresRequest, userId?: string) {
  const layout = resolveLayout(input.layoutCode);
  const validation = await validateSagresRemessa(prisma, input);
  if (validation.issues.length) throw new SagresError(`Existem ${validation.issues.length} pendência(s). Corrija antes de gerar.`);
  const records = await loadSagresRecords(prisma, layout.code, input.competence);
  const file = renderSagresFile(layout, buildSagresHeader(input), records);
  await prisma.sagresRemessa.updateMany({
    where: { layoutCode: layout.code, competence: input.competence, managementUnit: input.managementUnit, status: "GERADA" },
    data: { status: "SUBSTITUIDA" },
  });
  return prisma.sagresRemessa.create({
    data: {
      layoutCode: layout.code,
      layoutVersion: layout.version,
      competence: input.competence,
      managementUnit: input.managementUnit,
      recordCount: file.recordCount,
      fileName: file.fileName,
      fileHash: file.hash,
      content: file.content,
      createdById: userId,
    },
  });
}

export async function registerSagresSubmission(prisma: PrismaClient, id: string, protocol: string) {
  if (!protocol.trim()) throw new SagresError("Informe o número do protocolo do TCE-PB.");
  const remessa = await prisma.sagresRemessa.findUnique({ where: { id } });
  if (!remessa) throw new SagresError("Remessa não encontrada.");
  if (remessa.status !== "GERADA") throw new SagresError("Só é possível registrar envio de remessa gerada e vigente.");
  return prisma.sagresRemessa.update({ where: { id }, data: { status: "ENVIADA", protocol: protocol.trim(), sentAt: new Date() } });
}
