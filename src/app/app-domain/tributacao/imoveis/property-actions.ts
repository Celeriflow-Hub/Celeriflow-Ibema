"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getTenantContextForModuleOperation, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { assertPropertyCadastralAccess } from "@/lib/tributacao/property-access";
import { calculateTerritorialFraction, previewPropertyValuation } from "@/lib/tributacao/property-cadastral-engine";
import { createPropertySubunit } from "@/lib/tributacao/property-subunits";

type Result<T = undefined> = { data?: T; error?: string };

export async function calculatePropertyPreviewAction(input: { estateId: string; landArea: number; builtArea: number; landUnitValue: number; constructionUnitValue: number; factor: number; taxRate: number }): Promise<Result<{ landValue: string; constructionValue: string; venalValue: string; estimatedTax: string | null; memory: Record<string, string | null> }>> {
  try {
    const context = await getTenantContextForModuleOperation("TRIBUTACAO", "update");
    await assertPropertyCadastralAccess(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId, allowedBudgetUnitIds: isSystemAdministrator(context.user) ? undefined : context.user.allowedBudgetUnitIds }, input.estateId);
    const preview = previewPropertyValuation(input);
    return { data: { landValue: preview.landValue.toFixed(2), constructionValue: preview.constructionValue.toFixed(2), venalValue: preview.venalValue.toFixed(2), estimatedTax: preview.estimatedTax?.toFixed(2) ?? null, memory: preview.memory } };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível calcular a prévia." }; }
}

export async function calculateTerritorialFractionAction(input: { estateId: string; unitLandArea: number; totalLandArea: number }): Promise<Result<{ percentage: string }>> {
  try {
    const context = await getTenantContextForModuleOperation("TRIBUTACAO", "update");
    await assertPropertyCadastralAccess(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId, allowedBudgetUnitIds: isSystemAdministrator(context.user) ? undefined : context.user.allowedBudgetUnitIds }, input.estateId);
    return { data: { percentage: calculateTerritorialFraction(input).toFixed(6) } };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível calcular a fração territorial." }; }
}

export async function createCondominiumSubunit(input: { parentId: string; municipalInsc: string; registration?: string; unitLabel: string; builtArea: number; unitLandArea: number; processId?: string; reason?: string; unitMode?: "AUTONOMA" | "ENGLOBADA" }): Promise<Result<{ id: string; fraction: string }>> {
  try {
    const context = await getTenantContextForModuleOperation("TRIBUTACAO", "create");
    const result = await createPropertySubunit(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId, allowedBudgetUnitIds: isSystemAdministrator(context.user) ? undefined : context.user.allowedBudgetUnitIds }, { ...input, processId: input.processId?.trim() || null, reason: input.reason?.trim() || "Inclusão de unidade vinculada pela ficha imobiliária.", unitMode: input.unitMode ?? "AUTONOMA" });
    revalidatePath(`/tributacao/imoveis/${input.parentId}`); revalidatePath("/tributacao/imoveis");
    return { data: result };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível criar a subunidade." }; }
}

export async function copyPropertyCharacteristics(input: { sourceId: string; targetId: string }): Promise<Result<{ copied: number }>> {
  try {
    if (input.sourceId === input.targetId) throw new Error("Selecione imóveis diferentes para copiar características.");
    const context = await getTenantContextForModuleOperation("TRIBUTACAO", "update");
    const copied = await context.prisma.$transaction(async (tx) => {
      const actor = { usuarioId: context.user.id, employeeId: context.user.employeeId, allowedBudgetUnitIds: isSystemAdministrator(context.user) ? undefined : context.user.allowedBudgetUnitIds };
      const origin = await assertPropertyCadastralAccess(tx, actor, input.sourceId);
      const destination = await assertPropertyCadastralAccess(tx, actor, input.targetId);
      if (origin.scope.budgetUnitId !== destination.scope.budgetUnitId || origin.scope.governmentEntityId !== destination.scope.governmentEntityId) throw new Error("Copie características somente entre imóveis da mesma origem conciliada.");
      const [source, target, entries] = await Promise.all([
        tx.realEstate.findUnique({ where: { id: input.sourceId }, select: { id: true } }),
        tx.realEstate.findUnique({ where: { id: input.targetId }, select: { id: true } }),
        tx.taxRegistryEntry.findMany({ where: { entityType: "REAL_ESTATE", entityId: input.sourceId, category: { in: ["BCI", "AREA", "CARACTERISTICA", "ATRIBUTO"] }, status: "ATIVO" } }),
      ]);
      if (!source || !target) throw new Error("Imóvel de origem ou destino não encontrado.");
      if (!entries.length) throw new Error("O imóvel de origem não possui características ativas para copiar.");
      await tx.taxRegistryEntry.createMany({ data: entries.map((entry) => ({ entityType: "REAL_ESTATE", entityId: input.targetId, category: entry.category, title: entry.title, data: { copiedFrom: input.sourceId, snapshot: entry.data } as Prisma.InputJsonValue, status: "PENDENTE_VALIDACAO", source: "COPIA_CADASTRAL", effectiveFrom: new Date(), actorUsuarioId: context.user.id, version: entry.version + 1 })) });
      await tx.taxAuditLog.create({ data: { action: "COPY_CHARACTERISTICS", entityType: "RealEstate", entityId: input.targetId, payload: { sourceId: input.sourceId, count: entries.length, status: "PENDENTE_VALIDACAO" }, authorUsuarioId: context.user.id, authorEmployeeId: context.user.employeeId } });
      return entries.length;
    });
    revalidatePath(`/tributacao/imoveis/${input.targetId}`);
    return { data: { copied } };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível copiar as características." }; }
}
