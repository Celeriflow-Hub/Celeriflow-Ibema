import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { TaxActor } from "./index";
import { resolveTaxAssessmentScope, taxScopeSnapshot } from "./scope";

const ownersSchema = z.array(z.object({ taxpayerId: z.string().min(1), sharePercent: z.string() })).min(1);

/** Fiscal ownership snapshots; a tax payment does not replace civil registration. */
export async function transferPaidItbiInTransaction(tx: Prisma.TransactionClient, actor: TaxActor, assessmentId: string, paymentId: string, date: Date) {
  const declarations = await tx.itbiDeclaration.findMany({ where: { assessmentId, cadastralUpdateMode: "AUTO_ON_PAYMENT" }, select: { id: true } });
  for (const { id } of declarations) {
    await tx.$queryRaw`SELECT id FROM "ItbiDeclaration" WHERE id=${id} FOR UPDATE`;
    const declaration = await tx.itbiDeclaration.findUniqueOrThrow({ where: { id }, include: { parties: true } });
    if (declaration.cadastralUpdatedAt) continue;
    if (!["APROVADA", "DAM_EMITIDO", "DOCUMENTO_EMITIDO"].includes(declaration.status)) throw new Error("Declaração ITBI não está aprovada para transmissão cadastral.");
    const assessment = await tx.taxAssessment.findUniqueOrThrow({ where: { id: assessmentId } });
    const scope = await resolveTaxAssessmentScope(tx, actor, assessment.taxId, assessment.calculationSnapshot);
    const payments = await tx.taxPayment.findMany({ where: { guide: { assessmentId }, status: "Confirmado" }, select: { amountPaidDecimal: true } });
    const total = assessment.finalValueDecimal;
    if (!total || payments.some(payment => !payment.amountPaidDecimal)) throw new Error("ITBI sem saldo Decimal conciliado para transmissão.");
    const paid = payments.reduce((sum, payment) => sum.plus(payment.amountPaidDecimal!), new Prisma.Decimal(0));
    if (paid.lt(total)) continue;
    await tx.$queryRaw`SELECT id FROM "RealEstate" WHERE id=${declaration.realEstateId} FOR UPDATE`;
    const property = await tx.realEstate.findUniqueOrThrow({ where: { id: declaration.realEstateId } });
    const positions = await tx.taxRegistryEntry.findMany({ where: { entityType: "REAL_ESTATE", entityId: property.id, category: "FISCAL_OWNERSHIP", status: "ATIVO" }, orderBy: { version: "desc" } });
    if (positions.length > 1) throw new Error("Titularidade fiscal tem mais de uma posição vigente; concilie o cadastro.");
    const seller = declaration.parties.find(party => party.role === "TRANSMITENTE");
    const buyers = declaration.parties.filter(party => party.role === "ADQUIRENTE");
    if (!seller || !buyers.length || new Set(buyers.map(buyer => buyer.taxpayerId)).size !== buyers.length) throw new Error("Partes da transmissão ITBI inválidas.");
    const previous = positions[0];
    if (previous && previous.effectiveFrom > date) throw new Error("Pagamento anterior à posição fiscal vigente do imóvel.");
    const owners = previous ? ownersSchema.parse(taxScopeSnapshot(previous.data).owners) : property.taxpayerId ? [{ taxpayerId: property.taxpayerId, sharePercent: "100" }] : [];
    if (!owners.length || !owners.reduce((sum, owner) => sum.plus(owner.sharePercent), new Prisma.Decimal(0)).eq(100)) throw new Error("Posição fiscal anterior não conciliada.");
    const sellerOwner = owners.find(owner => owner.taxpayerId === seller.taxpayerId);
    if (!sellerOwner || new Prisma.Decimal(sellerOwner.sharePercent).lt(declaration.transmittedFraction)) throw new Error("Fração transmitida excede a titularidade fiscal do transmitente.");
    const shares = new Map(owners.map(owner => [owner.taxpayerId, new Prisma.Decimal(owner.sharePercent)]));
    shares.set(seller.taxpayerId, shares.get(seller.taxpayerId)!.minus(declaration.transmittedFraction));
    const buyerShares = buyers.reduce((sum, buyer) => sum.plus(buyer.participationPercent ?? 0), new Prisma.Decimal(0));
    if (!buyerShares.eq(100)) throw new Error("Participações dos adquirentes devem totalizar 100% da fração transmitida.");
    for (const buyer of buyers) shares.set(buyer.taxpayerId, (shares.get(buyer.taxpayerId) ?? new Prisma.Decimal(0)).plus(declaration.transmittedFraction.mul(buyer.participationPercent!).div(100)));
    const next = [...shares].filter(([, share]) => share.gt(0)).map(([taxpayerId, share]) => ({ taxpayerId, sharePercent: share.toString() })).sort((a, b) => a.taxpayerId.localeCompare(b.taxpayerId));
    if (!next.reduce((sum, owner) => sum.plus(owner.sharePercent), new Prisma.Decimal(0)).eq(100)) throw new Error("Transmissão não conserva a composição fiscal do imóvel.");
    if (previous) await tx.taxRegistryEntry.update({ where: { id: previous.id }, data: { status: "HISTORICO", effectiveUntil: date } });
    const primary = next.some(owner => owner.taxpayerId === property.taxpayerId) ? property.taxpayerId : next[0].taxpayerId;
    const position = await tx.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: property.id, category: "FISCAL_OWNERSHIP", title: `Titularidade fiscal por ITBI ${declaration.declarationNumber}`, source: "ITBI_PAYMENT", effectiveFrom: date, version: (previous?.version ?? 0) + 1, actorUsuarioId: actor.usuarioId, processId: declaration.processId, data: { ...scope, declarationId: id, paymentId, assessmentId, previousPositionId: previous?.id ?? null, previousTaxpayerId: property.taxpayerId, previousOwners: owners, owners: next, primaryTaxpayerId: primary } } });
    await tx.realEstate.update({ where: { id: property.id }, data: { taxpayerId: primary } });
    await tx.itbiDeclaration.update({ where: { id }, data: { cadastralUpdatedAt: date, events: { create: { eventType: "CADASTRO_TRANSFERIDO_PAGAMENTO", description: "Titularidade fiscal transferida após pagamento integral, preservando frações e coproprietários.", actorUsuarioId: actor.usuarioId, payload: { positionId: position.id, paymentId, owners: next } } } } });
  }
}

export async function reversePaidItbiInTransaction(tx: Prisma.TransactionClient, actor: TaxActor, paymentId: string, date: Date) {
  const payment = await tx.taxPayment.findUniqueOrThrow({ where: { id: paymentId }, include: { guide: { include: { assessment: true } } } });
  const declaration = await tx.itbiDeclaration.findFirst({ where: { assessmentId: payment.guide.assessmentId, cadastralUpdateMode: "AUTO_ON_PAYMENT" }, select: { id: true } });
  if (!declaration) return;
  const remaining = await tx.taxPayment.findMany({ where: { guide: { assessmentId: payment.guide.assessmentId }, status: "Confirmado" }, select: { amountPaidDecimal: true } });
  if (remaining.some(row => !row.amountPaidDecimal) || !payment.guide.assessment.finalValueDecimal) throw new Error("ITBI sem saldo Decimal conciliado no estorno.");
  if (remaining.reduce((sum, row) => sum.plus(row.amountPaidDecimal!), new Prisma.Decimal(0)).gte(payment.guide.assessment.finalValueDecimal)) return;
  const origins = await tx.taxRegistryEntry.findMany({ where: { category: "FISCAL_OWNERSHIP", source: "ITBI_PAYMENT", status: "ATIVO", data: { path: ["assessmentId"], equals: payment.guide.assessmentId } } });
  const later = await tx.taxRegistryEntry.count({ where: { category: "FISCAL_OWNERSHIP", source: "ITBI_PAYMENT", status: "HISTORICO", data: { path: ["assessmentId"], equals: payment.guide.assessmentId } } });
  if (later) throw new Error("Há transmissão posterior do imóvel; regularize a titularidade antes de estornar o ITBI.");
  for (const origin of origins) {
    const memory = taxScopeSnapshot(origin.data);
    if (typeof memory.declarationId !== "string") throw new Error("Posição ITBI sem origem conciliada.");
    await tx.$queryRaw`SELECT id FROM "ItbiDeclaration" WHERE id=${memory.declarationId} FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM "RealEstate" WHERE id=${origin.entityId} FOR UPDATE`;
    const current = await tx.taxRegistryEntry.findUniqueOrThrow({ where: { id: origin.id } });
    if (current.status !== "ATIVO") throw new Error("Titularidade alterada após o pagamento ITBI.");
    if (date < current.effectiveFrom) throw new Error("Estorno anterior à transmissão fiscal do imóvel.");
    const property = await tx.realEstate.findUniqueOrThrow({ where: { id: origin.entityId } });
    if (property.taxpayerId !== memory.primaryTaxpayerId) throw new Error("Titular principal alterado após o pagamento; concilie o cadastro antes do estorno ITBI.");
    const owners = ownersSchema.parse(memory.previousOwners);
    await tx.taxRegistryEntry.update({ where: { id: origin.id }, data: { status: "ESTORNADO", effectiveUntil: date } });
    await tx.taxRegistryEntry.create({ data: { entityType: "REAL_ESTATE", entityId: origin.entityId, category: "FISCAL_OWNERSHIP", title: "Recomposição fiscal após estorno do ITBI", source: "ITBI_PAYMENT_REVERSAL", effectiveFrom: date, version: origin.version + 1, actorUsuarioId: actor.usuarioId, data: { budgetUnitId: memory.budgetUnitId ?? null, governmentEntityId: memory.governmentEntityId ?? null, owners, primaryTaxpayerId: memory.previousTaxpayerId ?? null, reversedPositionId: origin.id, paymentId } } });
    await tx.realEstate.update({ where: { id: origin.entityId }, data: { taxpayerId: typeof memory.previousTaxpayerId === "string" ? memory.previousTaxpayerId : null } });
    await tx.itbiDeclaration.update({ where: { id: memory.declarationId }, data: { cadastralUpdatedAt: null, events: { create: { eventType: "CADASTRO_TRANSFERENCIA_ESTORNADA", description: "Titularidade fiscal anterior recomposta pelo estorno da arrecadação ITBI.", actorUsuarioId: actor.usuarioId, payload: { paymentId, reversedPositionId: origin.id } } } } });
  }
}
