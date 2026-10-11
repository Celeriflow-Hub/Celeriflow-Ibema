"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AccessError, getTenantContextForModuleOperation, isSystemAdministrator } from "@/lib/platform/tenant-context";
import {
  type FleetHistoryActor, type FleetHistoryUnit,
  addFleetHistoryUnit, openFleetHistoryMonth, recordFleetHistorySituation,
  removeFleetHistorySituation, removeFleetHistoryUnit, validHistoryCompetence,
} from "@/lib/integrations/sagres/frota-history";
import { certifyFleetSagresMonth, reopenFleetSagresMonth } from "@/lib/integrations/sagres/frota-history-certify";

const get = (f: FormData, key: string) => String(f.get(key) ?? "").trim();
function month(f: FormData) { const competence = get(f, "competence"); validHistoryCompetence(competence); return competence; }
function actor(id: string): FleetHistoryActor { return { actorId: id, administrator: true, departmentId: null }; }
type Tenant = Awaited<ReturnType<typeof getTenantContextForModuleOperation>>;
async function run(
  operation: "create" | "update",
  f: FormData,
  apply: (ctx: Tenant, competence: string) => Promise<unknown>,
) {
  const ctx = await getTenantContextForModuleOperation("FROTAS", operation);
  if (!isSystemAdministrator(ctx.user)) throw new AccessError("Histórico SAGRES municipal exige perfil de administrador.", 403);
  let competence = get(f, "competence"), result = "ok=1";
  try {
    competence = month(f);
    await apply(ctx, competence);
  } catch (error) {
    result = "erro=" + encodeURIComponent(error instanceof Error ? error.message : "Não foi possível salvar o histórico.");
  }
  revalidatePath("/frotas/gestao/sagres");
  redirect("/frotas/gestao/sagres?mes=" + encodeURIComponent(competence) + "&" + result);
}

export async function openMonth(f: FormData) {
  await run("create", f, async (ctx, competence) =>
    openFleetHistoryMonth(ctx.prisma, competence, actor(ctx.user.id)));
}
export async function addUnit(f: FormData) {
  await run("create", f, async (ctx, competence) => {
    const category = get(f, "category");
    if (!["VEICULO", "MAQUINA"].includes(category)) throw new Error("Categoria inválida.");
    const data: FleetHistoryUnit = {
      unitId: get(f, "unitId"), code: get(f, "code"), plate: get(f, "plate") || null,
      category: category as FleetHistoryUnit["category"], fuelType: get(f, "fuelType"),
      departmentId: get(f, "departmentId") || null, evidenceRef: get(f, "evidenceRef"),
    };
    return addFleetHistoryUnit(ctx.prisma, competence, data, actor(ctx.user.id));
  });
}
export async function recordSituation(f: FormData) {
  await run("create", f, async (ctx, competence) =>
    recordFleetHistorySituation(ctx.prisma, competence, get(f, "unitId"), {
      date: get(f, "date"), status: get(f, "status") as "1" | "2" | "3" | "4",
      evidenceRef: get(f, "evidenceRef"),
    }, actor(ctx.user.id)));
}
export async function removeUnit(f: FormData) {
  await run("update", f, async (ctx, competence) =>
    removeFleetHistoryUnit(ctx.prisma, competence, get(f, "unitId"), actor(ctx.user.id), get(f, "reason")));
}
export async function removeSituation(f: FormData) {
  await run("update", f, async (ctx, competence) =>
    removeFleetHistorySituation(ctx.prisma, competence, get(f, "unitId"), get(f, "date"), actor(ctx.user.id), get(f, "reason")));
}
export async function certifyMonth(f: FormData) {
  await run("update", f, async (ctx, competence) =>
    certifyFleetSagresMonth(ctx.prisma, competence, actor(ctx.user.id), get(f, "note")));
}
export async function reopenMonth(f: FormData) {
  await run("update", f, async (ctx, competence) =>
    reopenFleetSagresMonth(ctx.prisma, competence, actor(ctx.user.id), get(f, "reason")));
}
