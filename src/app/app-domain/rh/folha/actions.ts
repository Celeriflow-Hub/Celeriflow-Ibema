"use server";

import { assertBudgetUnitAccess, getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";
import { postBenefitPayrollBatch } from "@/lib/sst/benefit-posting";

export async function saveFolha(formData: FormData) {
  const id = formData.get("id") as string | null;
  const context = await getTenantContextForModuleOperation("RH", id ? "update" : "create");
  const prisma = context.prisma;
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
      await prisma.$transaction(async (tx) => {
        const [scope] = await tx.$queryRaw<{ budgetUnitId: string }[]>`SELECT "budgetUnitId" FROM "SstBenefitPayrollScope" WHERE "payrollId"=${id}`;
        if (scope) assertBudgetUnitAccess(context.user, scope.budgetUnitId);
        const [current] = await tx.$queryRaw<{ status: string }[]>`SELECT status FROM "Payroll" WHERE id=${id} FOR UPDATE`;
        if (!current) throw new Error("Folha não encontrada.");
        if (current.status === "Aberta") await tx.$queryRaw`SELECT sst_recalculate_payroll(${id})`;
        await tx.payroll.update({ where: { id }, data });
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
    return { success: false, error: error instanceof Error ? error.message : "Falha ao salvar a folha de pagamento." };
  }
}

export async function deleteFolha(id: string) {
  const context = await getTenantContextForModuleOperation("RH", "delete");
  const prisma = context.prisma;
  try {
    const [scope] = await prisma.$queryRaw<{ budgetUnitId: string }[]>`SELECT "budgetUnitId" FROM "SstBenefitPayrollScope" WHERE "payrollId"=${id}`;
    if (scope) assertBudgetUnitAccess(context.user, scope.budgetUnitId);
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

export async function processPayroll(payrollId: string) {
  const context = await getTenantContextForModuleOperation("RH", "update");
  try {
    const result = await postBenefitPayrollBatch(context, payrollId);
    if (result.status === "BLOCKED") return { success: false, error: `Integração bloqueada: ${result.blockers.join(" · ")}` };
    // Closing remains an explicit RH operation after all payroll domains reconcile.
    revalidatePath(`/rh/folha/${payrollId}/editar`);
    revalidatePath("/sst/planos");
    revalidatePath("/portal-servidor/folha");
    return { success: true };
  } catch (error) {
    console.error("Erro ao processar folha:", error);
    return { success: false, error: error instanceof Error ? error.message : "Falha ao processar a folha de pagamento." };
  }
}
