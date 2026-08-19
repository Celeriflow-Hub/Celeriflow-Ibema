"use server";

import { C7OperationError, registerFleetOperation } from "@/lib/c7/operations-service";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";

export async function registerFleetOperationAction(input: { assetId: string; type: "ABASTECIMENTO" | "MANUTENCAO" | "ORDEM_SERVICO"; occurredAt: string; odometer?: number; quantity?: number; cost: number; description: string; supplierName?: string; evidenceDocumentId?: string }) {
  try {
    const context = await getTenantContextForModuleOperation("PATRIMONIO", "create");
    await registerFleetOperation(context.prisma, { usuarioId: context.user.id }, { ...input, occurredAt: new Date(`${input.occurredAt}T12:00:00.000Z`) });
    revalidatePath("/frotas");
    revalidatePath("/indicadores");
    return {};
  } catch (error) { return { error: error instanceof C7OperationError ? error.message : "Não foi possível registrar a operação de frota." }; }
}
