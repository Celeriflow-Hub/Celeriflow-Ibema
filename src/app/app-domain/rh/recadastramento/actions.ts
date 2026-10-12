"use server";
import { revalidatePath } from "next/cache";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { requestRecertificationCorrection } from "@/lib/rh/recertification";

export async function requestRecertificationCorrectionAction(raw: unknown) {
  try {
    const context = await getTenantContextForModuleOperation("RH", "update");
    await requestRecertificationCorrection(context, raw);
    revalidatePath("/rh/solicitacoes"); revalidatePath("/rh/recadastramento"); revalidatePath("/portal-servidor/recadastramento");
    return { error: "" };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível solicitar correção." }; }
}
