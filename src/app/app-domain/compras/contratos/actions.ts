"use server";

import { getTenantContextForModuleOperation, type ModuleOperation } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";

async function getTenantPrisma(operation: ModuleOperation) {
  return (await getTenantContextForModuleOperation("COMPRAS", operation)).prisma;
}

export async function deleteContract(id: string) {
  const prisma = await getTenantPrisma("delete");
  try {
    await prisma.contract.delete({
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
  const prisma = await getTenantPrisma(id ? "update" : "create");
  const number = formData.get("number") as string;
  const object = formData.get("object") as string;
  const initialValue = parseFloat(formData.get("initialValue") as string) || 0;
  const status = formData.get("status") as string;
  const startDate = new Date(`${formData.get("startDate")}T12:00:00.000Z`);
  const endDate = new Date(`${formData.get("endDate")}T12:00:00.000Z`);
  
  const processId = formData.get("processId") as string;
  const supplierId = formData.get("supplierId") as string;
  const secretariatId = formData.get("secretariatId") as string;

  if (!processId || !supplierId || !secretariatId) {
    throw new Error("Dados básicos (Processo, Fornecedor, Secretaria) não foram selecionados.");
  }
  if (!["Minuta", "Vigente", "Encerrado"].includes(status)) {
    return { success: false, error: "Status do contrato inválido." };
  }
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf()) || endDate < startDate) {
    return { success: false, error: "Informe uma vigência válida para o contrato." };
  }

  const [process, supplier] = await Promise.all([
    prisma.purchaseProcess.findUnique({ where: { id: processId }, select: { id: true, secretariatId: true, purchaseRequest: { select: { status: true } } } }),
    prisma.supplier.findUnique({ where: { id: supplierId }, select: { id: true, status: true } }),
  ]);
  if (!process || process.secretariatId !== secretariatId || process.purchaseRequest?.status !== "Aprovada") {
    return { success: false, error: "O contrato exige um processo originado de solicitação de compra aprovada e da mesma secretaria." };
  }
  if (!supplier || supplier.status !== "Ativo") {
    return { success: false, error: "Selecione um fornecedor ativo." };
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
  };

  try {
    if (id) {
      await prisma.contract.update({ where: { id }, data });
    } else {
      await prisma.contract.create({ data });
    }
    revalidatePath("/compras/contratos");
    if (id) revalidatePath(`/compras/contratos/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving contract:", error);
    return { success: false, error: "Falha ao salvar o contrato." };
  }
}
