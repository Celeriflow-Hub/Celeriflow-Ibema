"use server";

import { approveMaterialRequest, issueMaterialRequestItem, ProcurementLifecycleError } from "@/lib/compras/procurement-lifecycle";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

export async function approveMaterialRequestAction(requestId: string, quantities: Array<{ itemId: string; quantityApproved: number }>): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("PATRIMONIO", "update");
    await approveMaterialRequest(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId }, { requestId, quantities });
    revalidatePath("/patrimonio/requisicoes");
    return {};
  } catch (error) {
    return { error: error instanceof ProcurementLifecycleError ? error.message : "Não foi possível aprovar a requisição." };
  }
}

export async function issueMaterialRequestItemAction(data: { requestItemId: string; stockId: string; quantity: number }): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("PATRIMONIO", "create");
    await issueMaterialRequestItem(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId }, data);
    revalidatePath("/patrimonio/requisicoes");
    revalidatePath("/patrimonio/materiais");
    return {};
  } catch (error) {
    return { error: error instanceof ProcurementLifecycleError ? error.message : "Não foi possível atender a requisição." };
  }
}
