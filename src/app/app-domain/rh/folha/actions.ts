"use server";

import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";
import { calculatePayrollRun, closePayrollRun, PayrollServiceError, reopenPayrollRun } from "@/lib/rh/payroll-service";
import { VARIABLE_KINDS } from "@/lib/rh/payroll-engine";

async function getTenantPrisma(operation: "create" | "update" | "delete") {
  return (await getTenantContextForModuleOperation("RH", operation)).prisma;
}

export async function saveFolha(formData: FormData) {
  const id = formData.get("id") as string | null;
  const prisma = await getTenantPrisma(id ? "update" : "create");
  try {
    const competence = formData.get("competence") as string;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;

    if (!competence) {
      return { success: false, error: "Competência é obrigatória." };
    }

    const data = {
      competence,
      type: type || "Mensal",
      status: status || "Aberta",
    };

    if (id) {
      await prisma.payroll.update({
        where: { id },
        data,
      });
    } else {
      await prisma.payroll.create({
        data,
      });
    }

    revalidatePath("/rh/folha");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar folha:", error);
    return { success: false, error: "Falha ao salvar a folha de pagamento." };
  }
}

export async function deleteFolha(id: string) {
  const prisma = await getTenantPrisma("delete");
  try {
    await prisma.payroll.delete({
      where: { id },
    });
    revalidatePath("/rh/folha");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir folha:", error);
    return { success: false, error: "Falha ao excluir. Verifique se existem itens vinculados a esta folha." };
  }
}

function actionError(error: unknown, fallback: string) {
  if (error instanceof PayrollServiceError) return error.message;
  console.error(fallback, error);
  return fallback;
}

function refresh(payrollId: string) {
  revalidatePath("/rh/folha");
  revalidatePath(`/rh/folha/${payrollId}`);
  revalidatePath(`/rh/folha/${payrollId}/editar`);
}

/** Calcula a folha com o motor (INSS/RPPS, IRRF, variáveis, consignados). */
export async function processPayroll(payrollId: string) {
  const context = await getTenantContextForModuleOperation("RH", "update");
  try {
    const { prisma, user } = await getTenantContextForModuleOperation("RH", "update");
    const result = await calculatePayrollRun(prisma, payrollId, user.email);
    refresh(payrollId);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: actionError(error, "Falha ao calcular a folha de pagamento.") };
  }
}

export async function closePayroll(payrollId: string) {
  try {
    const { prisma, user } = await getTenantContextForModuleOperation("RH", "update");
    const result = await closePayrollRun(prisma, payrollId, user.email);
    refresh(payrollId);
    return { success: true, hash: result.hash };
  } catch (error) {
    return { success: false, error: actionError(error, "Falha ao fechar a competência.") };
  }
}

export async function reopenPayroll(payrollId: string, reason: string) {
  try {
    const { prisma, user } = await getTenantContextForModuleOperation("RH", "update");
    await reopenPayrollRun(prisma, payrollId, reason, user.email);
    refresh(payrollId);
    return { success: true };
  } catch (error) {
    return { success: false, error: actionError(error, "Falha ao reabrir a competência.") };
  }
}

export async function addPayrollVariable(input: { payrollId: string; employeeId: string; kind: string; quantity: number; value: number; note?: string }) {
  try {
    const { prisma } = await getTenantContextForModuleOperation("RH", "update");
    if (!VARIABLE_KINDS.some((k) => k.kind === input.kind)) return { success: false, error: "Tipo de lançamento inválido." };
    const payroll = await prisma.payroll.findUnique({ where: { id: input.payrollId } });
    if (payroll?.status !== "Aberta") return { success: false, error: "Só é possível lançar em folha aberta." };
    if (!(input.quantity > 0) && !(input.value > 0)) return { success: false, error: "Informe a quantidade ou o valor." };
    await prisma.payrollVariable.create({
      data: { payrollId: input.payrollId, employeeId: input.employeeId, kind: input.kind, quantity: input.quantity || 0, value: input.value || 0, note: input.note?.trim() || null },
    });
    refresh(input.payrollId);
    return { success: true };
  } catch (error) {
    return { success: false, error: actionError(error, "Falha ao registrar o lançamento.") };
  }
}

export async function removePayrollVariable(id: string) {
  try {
    const { prisma } = await getTenantContextForModuleOperation("RH", "update");
    const variable = await prisma.payrollVariable.findUnique({ where: { id }, include: { payroll: true } });
    if (!variable) return { success: false, error: "Lançamento não encontrado." };
    if (variable.payroll.status !== "Aberta") return { success: false, error: "Folha fechada: reabra para alterar." };
    await prisma.payrollVariable.delete({ where: { id } });
    refresh(variable.payrollId);
    return { success: true };
  } catch (error) {
    return { success: false, error: actionError(error, "Falha ao remover o lançamento.") };
  }
}
