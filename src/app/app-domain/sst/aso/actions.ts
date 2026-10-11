"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AccessError, getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { registerAso } from "@/lib/sst/aso-service";
import { SstValidationError } from "@/lib/sst/errors";

export async function saveSstAso(form: FormData) {
  try {
    const context = await getTenantContextForModuleOperation("SST", "create");
    const exams = z.array(z.unknown()).max(100).parse(JSON.parse(String(form.get("exams") || "[]")));
    const id = await registerAso(context, { ...Object.fromEntries(form), exams });
    revalidatePath("/sst/aso");
    revalidatePath("/app-domain/sst/aso");
    return { error: null, id };
  } catch (error) {
    return { error: error instanceof z.ZodError ? error.issues[0]?.message || "Confira os campos do ASO." : error instanceof AccessError || error instanceof SstValidationError ? error.message : "Não foi possível registrar o ASO. Confira os dados dos exames." };
  }
}
