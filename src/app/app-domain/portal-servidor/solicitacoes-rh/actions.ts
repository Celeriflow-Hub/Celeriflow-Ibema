"use server";

import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { submitEmployeeHrRequest } from "@/lib/rh/portal-requests";
import { revalidatePath } from "next/cache";

export async function submitMyHrRequest(values: Record<string, string>) {
  const access = await getEmployeePortalAccess();
  if (access.status !== "AVAILABLE") return { error: "Cadastro funcional indisponível." };
  try {
    const request = await submitEmployeeHrRequest(access.context.prisma, access.context.user.id, access.employee.id, values);
    revalidatePath("/portal-servidor/solicitacoes-rh");
    revalidatePath("/rh/solicitacoes");
    return { id: request.id };
  } catch (error) { return { error: error instanceof Error ? error.message : "Falha ao registrar solicitação." }; }
}
