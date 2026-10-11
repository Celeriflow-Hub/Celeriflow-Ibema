"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { getPlanningContext } from "@/lib/planejamento/access";
import { jurisdictionSchema, planningBasePath } from "@/lib/planejamento/policy";
import { addPlanningAction, addPlanningLine, addPlanningMemory, addPlanningProgram, addPlanningWaiver, configurePlanningEntity, createPlanningInstrument } from "@/lib/planejamento/service";
import { AccessError } from "@/lib/platform/tenant-context";
import { createPlanningCatalog, saveRevenueAllocation } from "@/lib/planejamento/catalog";
import { addAllocatedPlanningRevenue } from "@/lib/planejamento/service";
import { decideCommunityDemand, registerCommunityDemand, registerPlanningHearing } from "@/lib/planejamento/hearings";
import { importPlanningLines } from "@/lib/planejamento/imports";

export async function savePlanningRecord(jurisdiction: string, operation: string, input: Record<string, string>): Promise<{ error?: string; id?: string }> {
  try {
    const sector = jurisdictionSchema.parse(jurisdiction);
    const context = await getPlanningContext(sector);
    const clean = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== ""));
    let id: string | undefined;
    switch (operation) {
      case "instrument": id = await createPlanningInstrument(context, clean); break;
      case "program": id = await addPlanningProgram(context, clean); break;
      case "action": id = await addPlanningAction(context, clean); break;
      case "line": id = await addPlanningLine(context, clean); break;
      case "allocatedRevenue": id = await addAllocatedPlanningRevenue(context, clean); break;
      case "catalog": id = await createPlanningCatalog(context, clean); break;
      case "allocation": id = await saveRevenueAllocation(context, clean); break;
      case "hearing": id = await registerPlanningHearing(context, clean); break;
      case "demand": id = await registerCommunityDemand(context, clean); break;
      case "demandDecision": id = await decideCommunityDemand(context, clean); break;
      case "import": id = await importPlanningLines(context, clean); break;
      case "memory": id = await addPlanningMemory(context, clean); break;
      case "waiver": id = await addPlanningWaiver(context, clean); break;
      case "scope": await configurePlanningEntity(context, clean.governmentEntityId, clean.budgetUnitId); break;
      default: return { error: "Operação inválida." };
    }
    revalidatePath(planningBasePath(sector), "layout");
    return { id };
  } catch (error) {
    if (error instanceof ZodError) return { error: error.issues.map((issue) => issue.message).join(" ") };
    if (error instanceof AccessError) return { error: error.message };
    if (error instanceof Error && !error.message.includes("Invalid `")) return { error: error.message };
    return { error: "Não foi possível salvar o registro. Confira os dados e tente novamente." };
  }
}
