import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { TaxActor } from "./index";
import { assertPropertyCadastralAccess } from "./property-access";
import { calculateTerritorialFraction } from "./property-cadastral-engine";
import { attributePropertyHistory } from "./property-history";
import { savePropertyProfileInTransaction } from "./property-profile";
import { parsePropertyInscription, propertyProfileSchema, propertyRegistrationPolicySchema } from "./property-profile-schema";
import { taxScopeSnapshot } from "./scope";

const subunitSchema = z.object({ parentId: z.string().min(1), municipalInsc: z.string().trim().min(1).max(120), registration: z.string().trim().max(120).optional(), unitLabel: z.string().trim().min(1).max(240), builtArea: z.number().finite().nonnegative(), unitLandArea: z.number().finite().nonnegative(), processId: z.string().trim().min(1).nullable(), reason: z.string().trim().min(1).max(4000), unitMode: z.enum(["AUTONOMA", "ENGLOBADA"]) });

/** The legacy shortcut creates the same versioned unit as the complete cadastral editor. */
export async function createPropertySubunit(db: PrismaClient, actor: TaxActor, raw: z.input<typeof subunitSchema>) {
  const input = subunitSchema.parse(raw);
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "RealEstate" WHERE id=${input.parentId} FOR UPDATE`;
    const { property: parent, profile } = await assertPropertyCadastralAccess(tx, actor, input.parentId);
    if (!profile) throw new Error("Concilie o perfil do terreno antes de incluir unidades vinculadas.");
    const inherited = propertyProfileSchema.parse(profile.data);
    if (inherited.kind !== "Terreno" || ["Baixado", "Inativo", "Desmembrado", "Remembrado"].includes(parent.status) || parent.landArea === null) throw new Error("Selecione um terreno ativo com área territorial documentada.");
    const policyEntry = await tx.taxRegistryEntry.findFirstOrThrow({ where: { entityType: "BUDGET_UNIT", entityId: inherited.budgetUnitId, category: "PROPERTY_REGISTRATION_POLICY" }, orderBy: { version: "desc" } });
    const policy = propertyRegistrationPolicySchema.parse(policyEntry.data);
    if (policy.governmentEntityId !== inherited.governmentEntityId) throw new Error("Composição da inscrição diverge da origem do terreno.");
    const inscriptionParts = parsePropertyInscription(policy, input.municipalInsc);
    const fraction = calculateTerritorialFraction({ unitLandArea: input.unitLandArea, totalLandArea: parent.landArea });
    const ownership = await tx.taxRegistryEntry.findFirst({ where: { entityType: "REAL_ESTATE", entityId: parent.id, category: "FISCAL_OWNERSHIP", status: "ATIVO" }, orderBy: { version: "desc" } });
    const position = taxScopeSnapshot(ownership?.data);
    if (ownership && (position.governmentEntityId !== inherited.governmentEntityId || position.budgetUnitId !== inherited.budgetUnitId)) throw new Error("Titularidade atual do terreno sem origem conciliada.");
    const owners = ownership && Array.isArray(position.owners) ? position.owners.map(owner => { const row = taxScopeSnapshot(owner); return { taxpayerId: String(row.taxpayerId), sharePercent: String(row.sharePercent), primary: row.taxpayerId === parent.taxpayerId }; }) : inherited.owners;
    await attributePropertyHistory(tx, actor.usuarioId);
    await tx.$queryRaw`SELECT set_config('celeriflow.cadastral_process', ${input.processId ?? ""}, true), set_config('celeriflow.cadastral_profile_change', 'true', true)`;
    // Touch the parent so its native protocol/supervisor restrictions also govern this shortcut.
    await tx.realEstate.update({ where: { id: parent.id }, data: { updatedAt: new Date() } });
    const child = await tx.realEstate.create({ data: { taxpayerId: parent.taxpayerId, municipalInsc: input.municipalInsc, registration: input.registration || null, propertyType: "Unidade", status: "Ativo", streetName: parent.streetName, streetId: parent.streetId, number: parent.number, complement: input.unitLabel, lot: parent.lot, block: parent.block, landArea: input.unitLandArea, builtArea: input.builtArea, propertyUse: parent.propertyUse, fiscalZone: parent.fiscalZone, neighborhoodId: parent.neighborhoodId } });
    const saved = await savePropertyProfileInTransaction(tx, actor, { ...inherited, propertyId: child.id, expectedVersion: 0, expectedUpdatedAt: child.updatedAt.toISOString(), kind: "Unidade", parentId: parent.id, unitMode: input.unitMode, owners, inscriptionParts, documentIds: [], processId: input.processId, reason: input.reason });
    const scope = { governmentEntityId: inherited.governmentEntityId, budgetUnitId: inherited.budgetUnitId };
    await tx.taxRegistryEntry.createMany({ data: [
      { entityType: "REAL_ESTATE", entityId: parent.id, category: "CONDOMINIO", title: `Subunidade ${input.unitLabel}`, data: { ...scope, childId: child.id, municipalInsc: child.municipalInsc, fraction: fraction.toFixed(6), profileId: saved.id }, processId: input.processId, source: "INTERNO", actorUsuarioId: actor.usuarioId },
      { entityType: "REAL_ESTATE", entityId: child.id, category: "UNIDADE", title: input.unitLabel, data: { ...scope, parentId: parent.id, fraction: fraction.toFixed(6), profileId: saved.id }, processId: input.processId, source: "INTERNO", actorUsuarioId: actor.usuarioId },
    ] });
    await tx.taxAuditLog.create({ data: { action: "CREATE_SUBUNIT", entityType: "RealEstate", entityId: child.id, payload: { ...scope, parentId: parent.id, fraction: fraction.toFixed(6), profileId: saved.id, processId: input.processId, reason: input.reason }, authorUsuarioId: actor.usuarioId, authorEmployeeId: actor.employeeId } });
    return { id: child.id, fraction: fraction.toFixed(6) };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 60000 });
}
