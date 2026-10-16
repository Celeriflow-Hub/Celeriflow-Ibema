import { Prisma, type PrismaClient, type RealEstate } from "@prisma/client";
import { z } from "zod";
import type { TaxActor } from "./index";
import { attributePropertyHistory } from "./property-history";
import { taxScopeSnapshot } from "./scope";
import { parsePropertyInscription,propertyProfileSchema,propertyRegistrationPolicySchema } from "./property-profile-schema";
import { savePropertyProfileInTransaction } from "./property-profile";
import { assertPropertyCadastralAccess } from "./property-access";

const scopeSchema = z.object({ governmentEntityId: z.string().min(1), budgetUnitId: z.string().min(1), processId: z.string().nullable(), reason: z.string().trim().min(1).max(4000) });
const targetSchema = z.object({ id: z.string().min(1), updatedAt: z.string().datetime() });
const filterSchema = z.object({ query: z.string().trim().default(""), streetId: z.string().optional(), neighborhoodId: z.string().optional(), status: z.string().optional(), propertyUse: z.string().optional() });
const propertyPatchSchema = z.object({ municipalInsc: z.string().trim().min(1).optional(), registration: z.string().nullable().optional(), propertyType: z.string().optional(), streetName: z.string().nullable().optional(), streetId: z.string().nullable().optional(), neighborhoodId: z.string().nullable().optional(), number: z.string().nullable().optional(), complement: z.string().nullable().optional(), lot: z.string().nullable().optional(), block: z.string().nullable().optional(), landArea: z.number().finite().nonnegative().nullable().optional(), builtArea: z.number().finite().nonnegative().nullable().optional(), propertyUse: z.string().nullable().optional(), fiscalZone: z.string().nullable().optional(), status: z.string().trim().min(1).optional() }).strict();
export const bulkPropertyChangeSchema = scopeSchema.extend({ filter: filterSchema, targets: z.array(targetSchema).min(1).max(1000), changes: propertyPatchSchema }).refine(input => Object.keys(input.changes).length > 0, "Informe os campos a alterar.");
export const copyPropertySchema = scopeSchema.extend({ source: targetSchema, inscriptions: z.array(z.string().trim().min(1).max(120)).min(1).max(100) }).refine(input => new Set(input.inscriptions).size === input.inscriptions.length, "Informe inscrições distintas para as cópias.");
export const reorganizePropertySchema = scopeSchema.extend({ operation: z.enum(["SPLIT", "MERGE"]), sources: z.array(targetSchema).min(1).max(100), destinations: z.array(z.object({ inscription: z.string().trim().min(1).max(120), landArea: z.string(), builtArea: z.string(), propertyType: z.enum(["Terreno", "Unidade", "Rural"]), taxpayerId: z.string().nullable(), profileSourceId: z.string().min(1).optional(), parentId: z.string().nullable().optional(), unitMode: z.enum(["AUTONOMA", "ENGLOBADA"]).nullable().optional() })).min(1).max(100), unitAssignments: z.array(z.object({ unitId: z.string().min(1), expectedUpdatedAt: z.iso.datetime(), expectedProfileVersion: z.number().int().positive(), destinationInscription: z.string().min(1) })).max(1000).default([]) });

export function propertyFilterWhere(input: z.input<typeof filterSchema>): Prisma.RealEstateWhereInput {
  const filter = filterSchema.parse(input);
  return { ...(filter.query ? { OR: [{ municipalInsc: { contains: filter.query, mode: "insensitive" } }, { registration: { contains: filter.query, mode: "insensitive" } }, { streetName: { contains: filter.query, mode: "insensitive" } }] } : {}), ...(filter.streetId ? { streetId: filter.streetId } : {}), ...(filter.neighborhoodId ? { neighborhoodId: filter.neighborhoodId } : {}), ...(filter.status ? { status: filter.status } : {}), ...(filter.propertyUse ? { propertyUse: filter.propertyUse } : {}) };
}

async function authorizeOperation(tx: Prisma.TransactionClient, actor: TaxActor, input: z.infer<typeof scopeSchema>) {
  if (actor.allowedBudgetUnitIds && !actor.allowedBudgetUnitIds.includes(input.budgetUnitId)) throw new Error("UG fora do acesso autorizado.");
  if (!await tx.planningEntityUnit.findFirst({ where: { governmentEntityId: input.governmentEntityId, budgetUnitId: input.budgetUnitId } })) throw new Error("Ente/UG não conciliados.");
  if (input.processId && !await tx.process.findUnique({ where: { id: input.processId } })) throw new Error("Protocolo não encontrado.");
  await attributePropertyHistory(tx, actor.usuarioId);
  await tx.$queryRaw`SELECT set_config('celeriflow.cadastral_process', ${input.processId ?? ""}, true)`;
}

async function lockProperties(tx: Prisma.TransactionClient, targets: z.infer<typeof targetSchema>[]) {
  if (new Set(targets.map(target => target.id)).size !== targets.length) throw new Error("Imóveis repetidos na operação.");
  const sorted = [...targets].sort((a, b) => a.id.localeCompare(b.id));
  const rows: RealEstate[] = [];
  for (const target of sorted) {
    await tx.$queryRaw`SELECT id FROM "RealEstate" WHERE id=${target.id} FOR UPDATE`;
    const row = await tx.realEstate.findUniqueOrThrow({ where: { id: target.id } });
    if (row.updatedAt.toISOString() !== target.updatedAt) throw new Error("Cadastro alterado após a seleção. Recarregue a prévia.");
    rows.push(row);
  }
  return rows;
}

function cadastralCopy(property: RealEstate): Prisma.RealEstateUncheckedCreateInput {
  return { registration: property.registration, propertyType: property.propertyType, streetName: property.streetName, number: property.number, complement: property.complement, lot: property.lot, block: property.block, landArea: property.landArea, builtArea: property.builtArea, propertyUse: property.propertyUse, fiscalZone: property.fiscalZone, neighborhoodId: property.neighborhoodId, streetId: property.streetId, taxpayerId: property.taxpayerId, status: "Regular" };
}

async function recordOperation(tx: Prisma.TransactionClient, actor: TaxActor, propertyId: string, input: z.infer<typeof scopeSchema>, operation: string, data: Prisma.InputJsonObject) {
  const entry = await tx.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: propertyId, category: "CADASTRAL_OPERATION", title: operation, processId: input.processId, actorUsuarioId: actor.usuarioId, data: { ...data, governmentEntityId: input.governmentEntityId, budgetUnitId: input.budgetUnitId, reason: input.reason } } });
  await tx.taxAuditLog.create({ data: { action: operation, entityType: "RealEstate", entityId: propertyId, authorUsuarioId: actor.usuarioId, authorEmployeeId: actor.employeeId, payload: { operationId: entry.id, ...data, reason: input.reason, processId: input.processId } } });
  return entry;
}

export async function bulkChangeProperties(db: PrismaClient, actor: TaxActor, raw: z.input<typeof bulkPropertyChangeSchema>) {
  const input = bulkPropertyChangeSchema.parse(raw);
  return db.$transaction(async tx => {
    await authorizeOperation(tx, actor, input);
    const where = propertyFilterWhere(input.filter);
    // Serialize filter previews: every row must still be in the exact selection.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended('PROPERTY_BULK_CHANGE',0))::text`;
    const rows = await lockProperties(tx, input.targets);
    const profiles = await tx.taxRegistryEntry.findMany({ where: { entityType: "REAL_ESTATE", category: "PROPERTY_PROFILE" }, orderBy: { version: "desc" } });
    const latest = new Map<string, typeof profiles[number]>();
    for (const profile of profiles) if (!latest.has(profile.entityId)) latest.set(profile.entityId, profile);
    const sameScope = [...latest.values()].filter(entry => { const data = taxScopeSnapshot(entry.data); return data.governmentEntityId === input.governmentEntityId && data.budgetUnitId === input.budgetUnitId; }).map(entry => entry.entityId);
    const filtered = await tx.realEstate.findMany({ where: { AND: [where, { OR: [{ id: { in: sameScope } }, ...(!actor.allowedBudgetUnitIds ? [{ id: { notIn: [...latest.keys()] } }] : [])] }] }, select: { id: true } });
    if (filtered.length !== rows.length || filtered.some(row => !rows.some(target => row.id === target.id))) throw new Error("A seleção do filtro mudou. Recarregue antes da alteração geral.");
    if (rows.length > 1 && input.changes.municipalInsc) throw new Error("Inscrição única não pode ser repetida numa alteração geral.");
    for (const row of rows) {
      const { profile, scope } = await assertPropertyCadastralAccess(tx, actor, row.id);
      if (profile && (scope.governmentEntityId !== input.governmentEntityId || scope.budgetUnitId !== input.budgetUnitId)) throw new Error("Imóvel fora da origem da alteração geral.");
      await tx.realEstate.update({ where: { id: row.id }, data: input.changes });
      await recordOperation(tx, actor, row.id, input, "BULK_PROPERTY_CHANGE", { before: JSON.parse(JSON.stringify(row)), changes: input.changes });
    }
    return { count: rows.length };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 60000 });
}

export async function copyProperties(db: PrismaClient, actor: TaxActor, raw: z.input<typeof copyPropertySchema>) {
  const input = copyPropertySchema.parse(raw);
  return db.$transaction(async tx => {
    await authorizeOperation(tx, actor, input);
    const [source] = await lockProperties(tx, [input.source]);
    await assertPropertyCadastralAccess(tx, actor, source.id);
    const profileEntry=await tx.taxRegistryEntry.findFirst({where:{entityType:"REAL_ESTATE",entityId:source.id,category:"PROPERTY_PROFILE"},orderBy:{version:"desc"}});
    const profile=profileEntry ? propertyProfileSchema.parse(profileEntry.data) : null;
    if(profile && (profile.governmentEntityId!==input.governmentEntityId || profile.budgetUnitId!==input.budgetUnitId)) throw new Error("A origem da cópia diverge do perfil imobiliário conciliado.");
    const policyEntry=profile ? await tx.taxRegistryEntry.findFirst({where:{entityType:"BUDGET_UNIT",entityId:input.budgetUnitId,category:"PROPERTY_REGISTRATION_POLICY"},orderBy:{version:"desc"}}) : null;
    const policy=policyEntry ? propertyRegistrationPolicySchema.parse(policyEntry.data) : null;
    if(policy?.requireProcess && !input.processId) throw new Error("A configuração municipal exige protocolo para copiar este cadastro.");
    const characteristics = await tx.taxRegistryEntry.findMany({ where: { entityType: "REAL_ESTATE", entityId: source.id, category: { in: ["BCI", "AREA", "CARACTERISTICA", "ATRIBUTO", "TYPED_FISCAL_RECORD", "ENDERECO", "PROPRIETARIO", "PARTICIPACAO", "FISCAL_OWNERSHIP", "UNIDADE"] } }, orderBy: [{ version: "desc" }, { createdAt: "desc" }] });
    const latest = new Map<string, typeof characteristics[number]>();
    for (const characteristic of characteristics) { const key = characteristic.category==="FISCAL_OWNERSHIP" ? characteristic.category : `${characteristic.category}:${characteristic.title}`; if (!latest.has(key)) latest.set(key, characteristic); }
    const results: { id: string; inscription: string }[] = [];
    for (const inscription of input.inscriptions) {
      const row = await tx.realEstate.create({ data: { ...cadastralCopy(source), municipalInsc: inscription } });
      if(profile) {
        const position=taxScopeSnapshot(latest.get("FISCAL_OWNERSHIP")?.data);
        const owners=Array.isArray(position.owners) ? position.owners.map(owner=>{const value=taxScopeSnapshot(owner);return {taxpayerId:value.taxpayerId,sharePercent:value.sharePercent,primary:value.taxpayerId===source.taxpayerId};}) : profile.owners;
        const copiedProfile=propertyProfileSchema.parse({...profile,propertyId:row.id,expectedUpdatedAt:row.updatedAt.toISOString(),expectedVersion:0,owners,inscriptionParts:policy ? parsePropertyInscription(policy,inscription) : {},processId:input.processId,reason:input.reason});
        await tx.taxRegistryEntry.create({data:{entityType:"REAL_ESTATE",entityId:row.id,category:"PROPERTY_PROFILE",title:"Perfil imobiliário",version:1,actorUsuarioId:actor.usuarioId,processId:input.processId,source:"COPIA_CADASTRAL",data:{...copiedProfile,inscription,previousId:null,ownerNames:taxScopeSnapshot(position.ownerNames ?? taxScopeSnapshot(profileEntry?.data).ownerNames),copiedFrom:source.id,policyId:policyEntry?.id ?? null} as Prisma.InputJsonObject}});
      }
      for (const characteristic of latest.values()) if (characteristic.status === "ATIVO") {
        const data=taxScopeSnapshot(characteristic.data);
        const copiedData=characteristic.category==="FISCAL_OWNERSHIP" ? {governmentEntityId:input.governmentEntityId,budgetUnitId:input.budgetUnitId,owners:data.owners,ownerNames:data.ownerNames ?? {},primaryTaxpayerId:source.taxpayerId,copiedFrom:source.id} : {...data,copiedFrom:source.id};
        await tx.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: row.id, category: characteristic.category, title: characteristic.title, data: copiedData as Prisma.InputJsonValue, status: "ATIVO", source: "COPIA_CADASTRAL", actorUsuarioId: actor.usuarioId, processId: input.processId, version: 1 } });
      }
      await recordOperation(tx, actor, row.id, input, "COPY_PROPERTY", { sourceId: source.id, sourceSnapshot: JSON.parse(JSON.stringify(source)) });
      results.push({ id: row.id, inscription });
    }
    return results;
  }, { timeout: 60000 });
}

export async function reorganizeProperties(db: PrismaClient, actor: TaxActor, raw: z.input<typeof reorganizePropertySchema>) {
  const input = reorganizePropertySchema.parse(raw);
  if (input.operation === "SPLIT" && (input.sources.length !== 1 || input.destinations.length < 2) || input.operation === "MERGE" && (input.sources.length < 2 || input.destinations.length !== 1)) throw new Error("Desmembramento exige um imóvel e ao menos dois destinos; remembramento exige ao menos dois imóveis e um destino.");
  if (new Set(input.destinations.map(destination => destination.inscription)).size !== input.destinations.length) throw new Error("Inscrições de destino devem ser distintas.");
  const areas = input.destinations.map(destination => {
    const land = new Prisma.Decimal(destination.landArea); const built = new Prisma.Decimal(destination.builtArea);
    if (!land.isFinite() || !built.isFinite() || land.lte(0) || built.lt(0)) throw new Error("Áreas de destino inválidas.");
    return { land, built };
  });
  return db.$transaction(async tx => {
    await authorizeOperation(tx, actor, input);
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended('PROPERTY_REORGANIZATION',0))::text`;
    const sources = await lockProperties(tx, input.sources);
    if (sources.some(source => source.landArea === null || source.builtArea === null || ["Desmembrado", "Remembrado", "Inativo", "Baixado"].includes(source.status))) throw new Error("Origens devem estar ativas e ter áreas documentadas.");
    const sourceLand = sources.reduce((sum, source) => sum.plus(String(source.landArea)), new Prisma.Decimal(0));
    const sourceBuilt = sources.reduce((sum, source) => sum.plus(String(source.builtArea)), new Prisma.Decimal(0));
    if (!areas.reduce((sum, area) => sum.plus(area.land), new Prisma.Decimal(0)).eq(sourceLand) || !areas.reduce((sum, area) => sum.plus(area.built), new Prisma.Decimal(0)).eq(sourceBuilt)) throw new Error("As áreas de destino devem conservar as áreas totais das origens.");
    const sourceProfiles = new Map<string, { entryId: string; profile: z.infer<typeof propertyProfileSchema> }>();
    for (const source of sources) {
      const entry = await tx.taxRegistryEntry.findFirst({ where: { entityType: "REAL_ESTATE", entityId: source.id, category: "PROPERTY_PROFILE" }, orderBy: { version: "desc" } });
      if (!entry) continue;
      const profile = propertyProfileSchema.parse(entry.data);
      if (profile.governmentEntityId !== input.governmentEntityId || profile.budgetUnitId !== input.budgetUnitId) throw new Error("Todas as origens devem pertencer ao ente/UG da reorganização.");
      const ownership = await tx.taxRegistryEntry.findFirst({ where: { entityType: "REAL_ESTATE", entityId: source.id, category: "FISCAL_OWNERSHIP", status: "ATIVO" }, orderBy: { version: "desc" } });
      if (ownership) {
        const position = taxScopeSnapshot(ownership.data);
        if (position.governmentEntityId !== input.governmentEntityId || position.budgetUnitId !== input.budgetUnitId || !Array.isArray(position.owners)) throw new Error("Titularidade vigente da origem não conciliada.");
        profile.owners = position.owners.map(owner => { const data = taxScopeSnapshot(owner); return { taxpayerId: String(data.taxpayerId), sharePercent: String(data.sharePercent), primary: data.taxpayerId === source.taxpayerId }; });
      }
      sourceProfiles.set(source.id, { entryId: entry.id, profile });
    }
    if (sourceProfiles.size && sourceProfiles.size !== sources.length) throw new Error("Concilie os perfis de todas as origens antes de reorganizar cadastros conciliados e legados juntos.");
    if (!sourceProfiles.size && actor.allowedBudgetUnitIds) throw new Error("Concilie a origem dos imóveis legados antes de reorganizar com acesso por UG.");
    const legacyLinks = await tx.taxRegistryEntry.findMany({ where: { entityType: "REAL_ESTATE", category: "UNIDADE" }, orderBy: [{ version: "desc" }, { createdAt: "desc" }] });
    const latestLegacyLinks = new Map<string, typeof legacyLinks[number]>();
    for (const link of legacyLinks) if (!latestLegacyLinks.has(link.entityId)) latestLegacyLinks.set(link.entityId, link);
    const related = await tx.taxRegistryEntry.findMany({ where: { entityType: "REAL_ESTATE", category: "PROPERTY_PROFILE" }, orderBy: { version: "desc" } });
    const latestRelated = new Map<string, typeof related[number]>();
    // Consider only each unit's current profile; an old link must never be moved again.
    for (const entry of related) if (!latestRelated.has(entry.entityId)) latestRelated.set(entry.entityId, entry);
    for (const link of latestLegacyLinks.values()) {
      if (latestRelated.has(link.entityId) || !sources.some(source => source.id === taxScopeSnapshot(link.data).parentId)) continue;
      const unit = await tx.realEstate.findUnique({ where: { id: link.entityId } });
      if (unit && !["Baixado", "Inativo", "Desmembrado", "Remembrado"].includes(unit.status)) throw new Error("Há unidade legada sem perfil conciliado. Concilie sua origem e vínculo antes de reorganizar o terreno.");
    }
    const linkedUnits: { property: RealEstate; entry: typeof related[number]; profile: z.infer<typeof propertyProfileSchema> }[] = [];
    for (const entry of latestRelated.values()) {
      const data = taxScopeSnapshot(entry.data);
      if (data.kind !== "Unidade" || !sources.some(source => source.id === data.parentId)) continue;
      const property = await tx.realEstate.findUniqueOrThrow({ where: { id: entry.entityId } });
      if (["Baixado", "Inativo", "Desmembrado", "Remembrado"].includes(property.status)) continue;
      if (data.governmentEntityId !== input.governmentEntityId || data.budgetUnitId !== input.budgetUnitId) throw new Error("Há unidade vinculada com origem divergente; concilie o vínculo antes de reorganizar.");
      if (sources.some(source => source.id === property.id)) throw new Error("Reorganize o terreno com o remanejamento das unidades, sem selecionar a mesma unidade também como origem.");
      const profile = propertyProfileSchema.parse(entry.data);
      const ownership = await tx.taxRegistryEntry.findFirst({ where: { entityType: "REAL_ESTATE", entityId: property.id, category: "FISCAL_OWNERSHIP", status: "ATIVO" }, orderBy: { version: "desc" } });
      if (ownership) {
        const position = taxScopeSnapshot(ownership.data);
        if (position.governmentEntityId !== input.governmentEntityId || position.budgetUnitId !== input.budgetUnitId || !Array.isArray(position.owners)) throw new Error("Titularidade vigente da unidade não conciliada.");
        profile.owners = position.owners.map(owner => { const value = taxScopeSnapshot(owner); return { taxpayerId: String(value.taxpayerId), sharePercent: String(value.sharePercent), primary: value.taxpayerId === property.taxpayerId }; });
      }
      linkedUnits.push({ property, entry, profile });
    }
    if (new Set(input.unitAssignments.map(row => row.unitId)).size !== input.unitAssignments.length || input.unitAssignments.length !== linkedUnits.length || linkedUnits.some(unit => !input.unitAssignments.some(row => row.unitId === unit.property.id))) throw new Error("Indique exatamente um terreno de destino para cada unidade vigente vinculada às origens.");
    const lockedUnits = await lockProperties(tx, input.unitAssignments.map(row => ({ id: row.unitId, updatedAt: row.expectedUpdatedAt })));
    for (const assignment of input.unitAssignments) {
      const unit = linkedUnits.find(row => row.property.id === assignment.unitId)!;
      if (unit.entry.version !== assignment.expectedProfileVersion || !input.destinations.some(row => row.inscription === assignment.destinationInscription && row.propertyType === "Terreno")) throw new Error("Perfil da unidade alterado ou destino sem tipo Terreno. Recarregue a seleção.");
    }
    const policyEntry = sourceProfiles.size ? await tx.taxRegistryEntry.findFirstOrThrow({ where: { entityType: "BUDGET_UNIT", entityId: input.budgetUnitId, category: "PROPERTY_REGISTRATION_POLICY" }, orderBy: { version: "desc" } }) : null;
    const policy = policyEntry ? propertyRegistrationPolicySchema.parse(policyEntry.data) : null;
    if (policy && (policy.governmentEntityId !== input.governmentEntityId || policy.requireProcess && !input.processId)) throw new Error("A política imobiliária exige origem conciliada e protocolo para reorganizar.");
    const created: { id: string; inscription: string }[] = [];
    for (const [index, destination] of input.destinations.entries()) {
      const templateId = destination.profileSourceId ?? (sources.length === 1 ? sources[0].id : null);
      if (sourceProfiles.size && (!templateId || !sourceProfiles.has(templateId))) throw new Error("Escolha a origem do perfil de cada destino do remembramento.");
      const template = templateId ? sources.find(source => source.id === templateId) : sources[0];
      if (!template) throw new Error("Origem do perfil de destino inválida.");
      if (destination.taxpayerId && !await tx.taxpayer.findFirst({ where: { id: destination.taxpayerId, status: "Ativo" } })) throw new Error("Titular de destino ativo não encontrado.");
      const inherited = sourceProfiles.get(template.id);
      const taxpayerId = destination.taxpayerId ?? (inherited ? template.taxpayerId : null);
      const row = await tx.realEstate.create({ data: { ...cadastralCopy(template), municipalInsc: destination.inscription, registration: null, propertyType: destination.propertyType, taxpayerId, landArea: Number(areas[index].land), builtArea: Number(areas[index].built) } });
      if (inherited && policy) {
        const parentId = destination.propertyType === "Unidade" ? destination.parentId ?? inherited.profile.parentId : null;
        if (parentId && sources.some(source => source.id === parentId)) throw new Error("A unidade de destino não pode permanecer vinculada a uma origem que será baixada.");
        const owners = destination.taxpayerId ? [{ taxpayerId: destination.taxpayerId, sharePercent: "100", primary: true }] : inherited.profile.owners;
        await savePropertyProfileInTransaction(tx, actor, { ...inherited.profile, propertyId: row.id, expectedVersion: 0, expectedUpdatedAt: row.updatedAt.toISOString(), kind: destination.propertyType, parentId, unitMode: destination.propertyType === "Unidade" ? destination.unitMode ?? inherited.profile.unitMode : null, owners, inscriptionParts: parsePropertyInscription(policy, destination.inscription), documentIds: [], processId: input.processId, reason: input.reason });
        await recordOperation(tx, actor, row.id, input, "REORGANIZATION_PROFILE_ORIGIN", { sourceId: template.id, sourceProfileId: inherited.entryId, exclusiveTaxpayerId: destination.taxpayerId });
      } else if (destination.propertyType === "Unidade") throw new Error("Concilie os perfis das origens para gerar uma unidade com terreno e modalidade explícitos.");
      created.push({ id: row.id, inscription: destination.inscription });
    }
    for (const assignment of input.unitAssignments) {
      const unit = linkedUnits.find(row => row.property.id === assignment.unitId)!;
      const property = lockedUnits.find(row => row.id === assignment.unitId)!;
      const destination = created.find(row => row.inscription === assignment.destinationInscription)!;
      await savePropertyProfileInTransaction(tx, actor, { ...unit.profile, expectedVersion: unit.entry.version, expectedUpdatedAt: property.updatedAt.toISOString(), parentId: destination.id, processId: input.processId, reason: input.reason });
      const previousLink = latestLegacyLinks.get(unit.property.id);
      await tx.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: unit.property.id, category: "UNIDADE", title: previousLink?.title ?? unit.property.municipalInsc ?? unit.property.id, version: (previousLink?.version ?? 0) + 1, actorUsuarioId: actor.usuarioId, processId: input.processId, source: "REORGANIZACAO_CADASTRAL", data: { governmentEntityId: input.governmentEntityId, budgetUnitId: input.budgetUnitId, parentId: destination.id, previousParentId: unit.profile.parentId, previousId: previousLink?.id ?? null } } });
      const oldCondominiumLinks = await tx.taxRegistryEntry.findMany({ where: { entityType: "REAL_ESTATE", entityId: unit.profile.parentId!, category: "CONDOMINIO", data: { path: ["childId"], equals: unit.property.id } }, orderBy: { version: "desc" } });
      const oldCondominiumLink = oldCondominiumLinks[0];
      if (oldCondominiumLink) await tx.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: unit.profile.parentId!, category: "CONDOMINIO", title: oldCondominiumLink.title, version: oldCondominiumLink.version + 1, status: "INATIVO", source: "REORGANIZACAO_CADASTRAL", actorUsuarioId: actor.usuarioId, processId: input.processId, data: { ...taxScopeSnapshot(oldCondominiumLink.data), childId: unit.property.id, movedToParentId: destination.id, previousId: oldCondominiumLink.id } } });
      await tx.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: destination.id, category: "CONDOMINIO", title: oldCondominiumLink?.title ?? `Unidade ${unit.property.municipalInsc ?? unit.property.id}`, version: 1, source: "REORGANIZACAO_CADASTRAL", actorUsuarioId: actor.usuarioId, processId: input.processId, data: { governmentEntityId: input.governmentEntityId, budgetUnitId: input.budgetUnitId, childId: unit.property.id, previousParentId: unit.profile.parentId } } });
      await recordOperation(tx, actor, unit.property.id, input, "REORGANIZATION_UNIT_RELINK", { previousParentId: unit.profile.parentId, parentId: destination.id, previousProfileId: unit.entry.id });
    }
    const data = { operation: input.operation, sources: JSON.parse(JSON.stringify(sources)), destinations: created, unitAssignments: input.unitAssignments, areas: areas.map(area => ({ landArea: area.land.toString(), builtArea: area.built.toString() })) };
    for (const source of sources) {
      await tx.realEstate.update({ where: { id: source.id }, data: { status: input.operation === "SPLIT" ? "Desmembrado" : "Remembrado" } });
      await recordOperation(tx, actor, source.id, input, "REORGANIZE_PROPERTY", data);
    }
    let certificateId = "";
    for (const destination of created) certificateId = (await recordOperation(tx, actor, destination.id, input, "REORGANIZE_PROPERTY", data)).id;
    return { created, certificateId };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120000 });
}
