"use server";

import { getTenantContextForModuleOperation, type ModuleOperation } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";
import { nextYearlyCode } from "@/lib/sequence";
import { approvePurchaseRequest as approveOfficialPurchaseRequest, ProcurementLifecycleError } from "@/lib/compras/procurement-lifecycle";

async function getTenantPrisma(operation: ModuleOperation) {
  return (await getTenantContextForModuleOperation("COMPRAS", operation)).prisma;
}

type PurchaseRequestItemInput = {
  catalogItemId: string;
  customName: string;
  quantity: number;
  estimatedUnitValue: number;
};

type PurchaseRequestInput = {
  id?: string;
  number: string;
  object: string;
  justification: string;
  estimatedValue: number;
  items: PurchaseRequestItemInput[];
  secretariatId: string;
  departmentId: string;
};

export async function deletePurchaseRequest(id: string) {
  const prisma = await getTenantPrisma("delete");
  try {
    await prisma.purchaseRequest.delete({
      where: { id },
    });
    revalidatePath("/compras/solicitacoes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase request:", error);
    return { success: false, error: "Falha ao excluir a solicitação." };
  }
}

export async function savePurchaseRequest(payload: PurchaseRequestInput) {
  const { id, number, object, justification, estimatedValue, items, secretariatId, departmentId } = payload;
  const context = await getTenantContextForModuleOperation("COMPRAS", id ? "update" : "create");
  const { prisma } = context;

  try {
    if (!secretariatId?.trim() || !departmentId?.trim()) return { success: false, error: "Selecione a secretaria e o departamento solicitante." };
    if (!context.user.employeeId) return { success: false, error: "O usuário autenticado deve estar vinculado a um servidor solicitante." };
    const [secretariat, department, requester] = await Promise.all([
      prisma.secretariat.findUnique({ where: { id: secretariatId } }),
      prisma.department.findUnique({ where: { id: departmentId } }),
      prisma.employee.findUnique({ where: { id: context.user.employeeId }, select: { id: true, isActive: true } }),
    ]);
    if (!secretariat || !department || department.secretariatId !== secretariat.id || !requester?.isActive) {
      return { success: false, error: "Secretaria, departamento ou solicitante inválido." };
    }
    if (!items.length) return { success: false, error: "Adicione ao menos um item à solicitação." };
    const catalogItemIds = items.filter((item) => item.catalogItemId && item.catalogItemId !== "custom").map((item) => item.catalogItemId);
    const catalogItems = catalogItemIds.length
      ? await prisma.catalogItem.findMany({ where: { id: { in: catalogItemIds }, isActive: true }, select: { id: true } })
      : [];
    if (catalogItems.length !== new Set(catalogItemIds).size) return { success: false, error: "Selecione itens ativos do catálogo ou descreva o item livre." };
    if (items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0 || (item.catalogItemId === "custom" && !item.customName.trim()))) {
      return { success: false, error: "Revise os itens e suas quantidades." };
    }
    let finalNumber = number?.trim();
    if (!finalNumber && !id) {
      const requests = await prisma.purchaseRequest.findMany({ select: { number: true } });
      finalNumber = await nextYearlyCode({ prisma, key: "compras-solicitacao", prefix: "REQ", existingCodes: requests.map(({ number }) => ({ code: number })) });
    }
    if (!finalNumber) {
      return { success: false, error: "Informe o número da solicitação." };
    }

    const data = {
      number: finalNumber,
      object,
      justification,
      estimatedValue,
      secretariatId: secretariat.id,
      departmentId: department.id,
      requesterId: requester.id,
    };

    let requestId: string;

    if (id) {
      const existing = await prisma.purchaseRequest.findUnique({ where: { id }, select: { status: true, requesterId: true } });
      if (!existing || existing.status !== "Rascunho" || existing.requesterId !== requester.id) return { success: false, error: "Somente o solicitante pode editar uma solicitação em rascunho." };
      // Atualizar a solicitacao
      await prisma.purchaseRequest.update({ where: { id }, data });
      requestId = id;
      
      // Deletar os itens antigos para recriar (abordagem simples para sync de itens)
      await prisma.purchaseRequestItem.deleteMany({
        where: { purchaseRequestId: id }
      });
    } else {
      // Criar nova solicitacao
      const newRequest = await prisma.purchaseRequest.create({ data });
      requestId = newRequest.id;
    }

    // Criar os itens
    if (items && items.length > 0) {
      const itemsToCreate = items.map((item) => ({
        purchaseRequestId: requestId,
        catalogItemId: item.catalogItemId === "custom" || !item.catalogItemId ? null : item.catalogItemId,
        customName: item.catalogItemId === "custom" || !item.catalogItemId ? item.customName : null,
        quantity: item.quantity,
        estimatedUnitValue: item.estimatedUnitValue || null
      }));

      await prisma.purchaseRequestItem.createMany({
        data: itemsToCreate
      });
    }

    revalidatePath("/compras/solicitacoes");
    return { success: true };
  } catch (error) {
    console.error("Error saving purchase request:", error);
    return { success: false, error: "Falha ao salvar a solicitação." };
  }
}

export async function approvePurchaseRequest(id: string) {
  try {
    const context = await getTenantContextForModuleOperation("COMPRAS", "update");
    await approveOfficialPurchaseRequest(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId }, id);
    revalidatePath("/compras/solicitacoes");
    revalidatePath(`/compras/solicitacoes/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof ProcurementLifecycleError ? error.message : "Falha ao aprovar a solicitação." };
  }
}
