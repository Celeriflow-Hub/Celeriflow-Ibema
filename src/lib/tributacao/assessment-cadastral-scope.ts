import type { Prisma } from "@prisma/client";
import type { TaxActor } from "./index";
import { taxScopeSnapshot } from "./scope";

/** Ownership alone cannot authorize a property/company from another municipal origin. */
export async function assertAssessmentCadastralScope(tx: Prisma.TransactionClient, actor: TaxActor, scope: { governmentEntityId: string | null; budgetUnitId: string | null }, input: { realEstateId?: string; economicRegistrationId?: string }) {
  for (const [entityType, id, category] of [["REAL_ESTATE", input.realEstateId, "PROPERTY_PROFILE"], ["ECONOMIC_REGISTRATION", input.economicRegistrationId, "ECONOMIC_PROFILE"]] as const) {
    if (!id) continue;
    if (entityType === "REAL_ESTATE") await tx.$queryRaw`SELECT id FROM "RealEstate" WHERE id=${id} FOR SHARE`;
    else await tx.$queryRaw`SELECT id FROM "EconomicRegistration" WHERE id=${id} FOR SHARE`;
    const profile = await tx.taxRegistryEntry.findFirst({ where: { entityType, entityId: id, category }, orderBy: { version: "desc" } });
    if (!profile) {
      if (actor.allowedBudgetUnitIds) throw new Error("Cadastro vinculado sem origem conciliada para lançar com acesso por UG.");
      continue;
    }
    const origin = taxScopeSnapshot(profile.data);
    if (!scope.governmentEntityId || !scope.budgetUnitId || origin.governmentEntityId !== scope.governmentEntityId || origin.budgetUnitId !== scope.budgetUnitId) throw new Error("Cadastro vinculado pertence a outra origem municipal em relação ao lançamento.");
    if (!await tx.planningEntityUnit.findFirst({ where: { governmentEntityId: scope.governmentEntityId, budgetUnitId: scope.budgetUnitId } })) throw new Error("Origem do cadastro vinculado não conciliada.");
  }
}
