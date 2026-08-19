"use server";

import { acquireAssetFromPurchaseReceipt, AssetAcquisitionError, type AssetAcquisitionInput } from "@/lib/patrimonio/asset-acquisition-service";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; assetId?: string };

export async function acquireAssetFromReceiptAction(input: AssetAcquisitionInput): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("PATRIMONIO", "create");
    const asset = await acquireAssetFromPurchaseReceipt(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId }, input);
    revalidatePath("/patrimonio/bens");
    revalidatePath("/patrimonio");
    return { assetId: asset.id };
  } catch (error) {
    return { error: error instanceof AssetAcquisitionError ? error.message : "Não foi possível tombar o bem." };
  }
}
