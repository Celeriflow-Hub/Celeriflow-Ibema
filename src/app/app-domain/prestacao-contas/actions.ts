"use server";

import { revalidatePath } from "next/cache";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { generateSagresRemessa, registerSagresSubmission, SagresError, validateSagresRemessa, type SagresRequest } from "@/lib/integrations/sagres/service";
import type { SagresIssue } from "@/lib/integrations/sagres/engine";

const message = (error: unknown, fallback: string) => (error instanceof SagresError ? error.message : fallback);

export async function validateSagresAction(input: SagresRequest): Promise<{ error?: string; recordCount?: number; issues?: SagresIssue[] }> {
  try {
    const context = await getTenantContextForModuleOperation("TRANSPARENCIA", "issueReports");
    const result = await validateSagresRemessa(context.prisma, input);
    return { recordCount: result.recordCount, issues: result.issues.slice(0, 200) };
  } catch (error) {
    return { error: message(error, "Não foi possível validar a remessa.") };
  }
}

export async function generateSagresAction(input: SagresRequest): Promise<{ error?: string }> {
  try {
    const context = await getTenantContextForModuleOperation("TRANSPARENCIA", "create");
    await generateSagresRemessa(context.prisma, input, context.user.id);
    revalidatePath("/prestacao-contas");
    return {};
  } catch (error) {
    return { error: message(error, "Não foi possível gerar a remessa.") };
  }
}

export async function registerSagresSubmissionAction(id: string, protocol: string): Promise<{ error?: string }> {
  try {
    const context = await getTenantContextForModuleOperation("TRANSPARENCIA", "update");
    await registerSagresSubmission(context.prisma, id, protocol);
    revalidatePath("/prestacao-contas");
    return {};
  } catch (error) {
    return { error: message(error, "Não foi possível registrar o envio.") };
  }
}

export async function downloadSagresAction(id: string): Promise<{ error?: string; fileName?: string; content?: string }> {
  try {
    const context = await getTenantContextForModuleOperation("TRANSPARENCIA", "issueReports");
    const remessa = await context.prisma.sagresRemessa.findUnique({ where: { id }, select: { fileName: true, content: true } });
    if (!remessa) return { error: "Remessa não encontrada." };
    return remessa;
  } catch {
    return { error: "Não foi possível baixar o arquivo." };
  }
}
