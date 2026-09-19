"use server";

import { assertBudgetUnitAccess, getTenantContextForModuleOperation, type ModuleOperation } from "@/lib/platform/tenant-context";
import { dispatchSiaficEvents } from "@/lib/siafic/dispatcher";
import { saveContractWithSiaficEvent } from "@/lib/siafic/source";
import { revalidatePath } from "next/cache";

async function getTenantContext(operation: ModuleOperation) {
  return getTenantContextForModuleOperation("COMPRAS", operation);
}

export async function deleteContract(id: string) {
  const context = await getTenantContext("delete");
  try {
    const exported = await context.prisma.siaficOutboxEvent.findFirst({
      where: { entityType: "INSTRUMENT", entityId: id },
      select: { id: true },
    });
    if (exported) {
      return { success: false, error: "Contrato com historico de integracao SIAFIC nao pode ser excluido. Use o encerramento do instrumento." };
    }
    await context.prisma.contract.delete({
      where: { id },
    });
    revalidatePath("/compras/contratos");
    revalidatePath(`/compras/contratos/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting contract:", error);
    return { success: false, error: "Falha ao excluir o contrato." };
  }
}

export async function saveContract(formData: FormData) {
  const id = formData.get("id") as string | null;
  const context = await getTenantContext(id ? "update" : "create");
  const number = String(formData.get("number") || "").trim();
  const object = String(formData.get("object") || "").trim();
  const initialValue = Number(formData.get("initialValue"));
  const status = formData.get("status") as string;
  const startDate = new Date(`${formData.get("startDate")}T12:00:00.000Z`);
  const endDate = new Date(`${formData.get("endDate")}T12:00:00.000Z`);
  
  const processId = formData.get("processId") as string;
  const supplierId = formData.get("supplierId") as string;
  const secretariatId = formData.get("secretariatId") as string;
  const sourceBudgetUnitId = formData.get("sourceBudgetUnitId") as string;

  if (!number || !object || !processId || !supplierId || !secretariatId || !sourceBudgetUnitId) {
    throw new Error("Dados basicos (numero, objeto, processo, fornecedor, secretaria e unidade gestora) sao obrigatorios.");
  }
  if (!Number.isFinite(initialValue) || initialValue < 0) return { success: false, error: "Informe um valor contratual valido." };
  if (!["Minuta", "Vigente", "Encerrado"].includes(status)) {
    return { success: false, error: "Status do contrato inválido." };
  }
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf()) || endDate < startDate) {
    return { success: false, error: "Informe uma vigência válida para o contrato." };
  }

  assertBudgetUnitAccess(context.user, sourceBudgetUnitId);
  const [process, supplier, sourceBudgetUnit] = await Promise.all([
    context.prisma.purchaseProcess.findUnique({ where: { id: processId }, select: { id: true, secretariatId: true, purchaseRequest: { select: { status: true } } } }),
    context.prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true, status: true } }),
    context.prisma.budgetUnit.findUnique({ where: { id: sourceBudgetUnitId }, select: { id: true, secretariatId: true } }),
  ]);
  if (!process || process.secretariatId !== secretariatId || process.purchaseRequest?.status !== "Aprovada") {
    return { success: false, error: "O contrato exige um processo originado de solicitação de compra aprovada e da mesma secretaria." };
  }
  if (!supplier || supplier.status !== "Ativo") {
    return { success: false, error: "Selecione um fornecedor ativo." };
  }
  if (!sourceBudgetUnit || sourceBudgetUnit.secretariatId !== secretariatId) {
    return { success: false, error: "A Unidade Gestora deve pertencer a secretaria do contrato." };
  }

  const data = {
    number,
    object,
    initialValue,
    updatedValue: initialValue,
    startDate,
    endDate,
    status,
    processId,
    supplierId,
    secretariatId,
    sourceBudgetUnitId,
  };

  try {
    const result = await saveContractWithSiaficEvent(context.prisma, { usuarioId: context.user.id }, { id: id || undefined, ...data });
    await dispatchSiaficEvents(context.prisma, result.eventIds);
    revalidatePath("/compras/contratos");
    if (id) revalidatePath(`/compras/contratos/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving contract:", error);
    return { success: false, error: "Falha ao salvar o contrato." };
  }
}
