"use server";

import { getTenantContextForModuleOperation, type ModuleOperation } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";
import { nextYearlyCode } from "@/lib/sequence";
import { createPurchaseProcessFromApprovedRequest } from "@/lib/compras/procurement-lifecycle";

async function getTenantPrisma(operation: ModuleOperation) {
  return (await getTenantContextForModuleOperation("COMPRAS", operation)).prisma;
}

type PurchaseProcessItemInput = {
  catalogItemId: string;
  customName: string;
  quantity: number;
  estimatedUnitValue: number;
};

type PurchaseProcessInput = {
  id?: string;
  number: string;
  object: string;
  type: string;
  modality: string;
  estimatedValue: number;
  items: PurchaseProcessItemInput[];
  purchaseRequestId?: string;
};

export async function deletePurchaseProcess(id: string) {
  const prisma = await getTenantPrisma("delete");
  try {
    await prisma.purchaseProcess.delete({
      where: { id },
    });
    revalidatePath("/compras/processos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase process:", error);
    return { success: false, error: "Falha ao excluir o processo." };
  }
}

export async function savePurchaseProcess(payload: PurchaseProcessInput) {
  const { id, number, object, type, modality, estimatedValue, purchaseRequestId } = payload;
  const context = await getTenantContextForModuleOperation("COMPRAS", id ? "update" : "create");
  const { prisma } = context;

  try {
    let finalNumber = number?.trim();
    if (!finalNumber && !id) {
      const processes = await prisma.purchaseProcess.findMany({ select: { number: true } });
      finalNumber = await nextYearlyCode({ prisma, key: "compras-processo", prefix: "PROC", existingCodes: processes.map(({ number }) => ({ code: number })) });
    }
    if (!finalNumber) {
      return { success: false, error: "Informe o número do processo." };
    }

    if (!id) {
      if (!purchaseRequestId?.trim()) return { success: false, error: "Selecione uma solicitação de compra aprovada." };
      await createPurchaseProcessFromApprovedRequest(prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId }, {
        purchaseRequestId,
        number: finalNumber,
        type,
        modality,
      });
      revalidatePath("/compras/processos");
      return { success: true };
    }

    const data = {
      number: finalNumber,
      object,
      type,
      modality,
      estimatedValue,
    };

    const existing = await prisma.purchaseProcess.findUnique({ where: { id }, select: { status: true } });
    if (!existing || existing.status !== "Em Planejamento") return { success: false, error: "Somente processos em planejamento podem ser editados." };
    await prisma.purchaseProcess.update({ where: { id }, data });
    revalidatePath("/compras/processos");
    return { success: true };
  } catch (error) {
    console.error("Error saving purchase process:", error);
    return { success: false, error: "Falha ao salvar o processo." };
  }
}
