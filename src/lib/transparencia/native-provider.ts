import "server-only";
import { createHash } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import type { PublicCollection, PublicDataset, PublicRecord, TransparencyQuery } from "./query-contract";
import type { TransparencySettings } from "./presentation-settings";
const date = (value: Date | null | undefined) => value?.toISOString().slice(0, 10) || null;
const money = (value: Prisma.Decimal.Value | null | undefined) => value === null || value === undefined ? null : new Prisma.Decimal(value).toFixed(2);
const key = (entity: string, collection: string, natural: string) => createHash("sha256").update(`${entity}:${collection}:${natural}`).digest("hex").slice(0, 40);
const yearRange = (year: number) => ({ gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) });

export async function nativeTransparencyDataset(db: PrismaClient, collection: PublicCollection, query: TransparencyQuery, settings: TransparencySettings): Promise<PublicDataset> {
   const entities = settings.entities.filter(entity => entity.enabled && (query.entity === "consolidado" || entity.key === query.entity));
   if (collection.slug === "restos-a-pagar") return { records: [], status: "UNAVAILABLE", source: "NATIVO", provenance: "Registros nativos Celeriflow", updatedAt: null, complete: false, message: "A projeção pública de inscrições, baixas e saldos de restos a pagar ainda não está conectada. Pagamentos de exercícios anteriores não substituem esse demonstrativo." };
  if (!entities.length || entities.some(entity => !entity.nativeIds.length)) return { records: [], status: "UNAVAILABLE", source: "NATIVO", provenance: "Registros nativos Celeriflow", updatedAt: null, complete: false, message: "Configure a correspondência de entidades nativas na gestão da Transparência antes de consultar esta fonte." };
  const records: PublicRecord[] = []; let updatedAt: string | null = null;
  for (const entity of entities) {
    const entityIds = entity.nativeIds;
    if (["despesas", "liquidacoes", "pagamentos", "restos-a-pagar"].includes(collection.slug)) {
      const rows = await db.commitment.findMany({ where: { appropriation: { financialYear: { governmentEntityId: { in: entityIds } } }, status: { in: ["Emitido", "Liquidado", "Pago"] }, ...(collection.slug === "despesas" ? { date: yearRange(query.year) } : {}) }, include: { creditor: true, supplier: { include: { company: true, person: { select: { fullName: true } } } }, appropriation: { include: { budgetUnit: true, resourceSource: true, expenseNature: true, programPPA: true, actionPPA: true } }, settlements: { where: { status: "Liquidado" } }, payments: { where: { status: { in: ["Paga", "Pago"] } } } }, orderBy: [{ date: "desc" }, { id: "desc" }], take: 20001 });
      if (rows.length > 20000) throw new Error("Restrinja o escopo nativo para exportar integralmente mais de 20.000 empenhos.");
      for (const row of rows) {
        const beneficiary = row.creditor?.name || row.supplier?.company?.corporateName || row.supplier?.person?.fullName || "Não informado";
        const committed = new Prisma.Decimal(row.valueDecimal ?? row.value), settled = row.settlements.reduce((sum, entry) => sum.add(entry.valueDecimal ?? entry.value), new Prisma.Decimal(0)), paid = row.payments.reduce((sum, entry) => sum.add(entry.valueDecimal ?? entry.value), new Prisma.Decimal(0));
        const common = { number: row.number, date: date(row.date), beneficiary, description: row.history || "Histórico não cadastrado", unit: row.appropriation.budgetUnit.name, sourceCode: row.appropriation.resourceSource.code, nature: row.appropriation.expenseNature.code, program: row.appropriation.programPPA?.name || null, action: row.appropriation.actionPPA?.name || null, originalYear: row.date.getUTCFullYear(), committed: committed.toFixed(2), settled: settled.toFixed(2), paid: paid.toFixed(2), balance: committed.sub(paid).toFixed(2), status: row.status };
        const events = [...row.settlements.map(entry => ({ stage: "Liquidação", number: entry.id.slice(-8), date: date(entry.date)!, value: money(entry.valueDecimal ?? entry.value)!, status: entry.status })), ...row.payments.map(entry => ({ stage: "Pagamento", number: entry.orderNumber, date: date(entry.date)!, value: money(entry.valueDecimal ?? entry.value)!, status: entry.status }))];
        if (collection.slug === "despesas") records.push({ key: key(entity.key, collection.slug, row.number), entity: entity.key, year: query.year, values: common, events });
        else if (collection.slug === "liquidacoes") for (const entry of row.settlements.filter(entry => entry.date.getUTCFullYear() === query.year)) records.push({ key: key(entity.key, collection.slug, entry.id), entity: entity.key, year: query.year, values: { ...common, commitment: row.number, number: entry.id.slice(-8), date: date(entry.date), value: money(entry.valueDecimal ?? entry.value) }, events });
        else if (collection.slug === "pagamentos") for (const entry of row.payments.filter(entry => entry.date.getUTCFullYear() === query.year)) records.push({ key: key(entity.key, collection.slug, entry.orderNumber), entity: entity.key, year: query.year, values: { ...common, commitment: row.number, number: entry.orderNumber, date: date(entry.date), value: money(entry.valueDecimal ?? entry.value), netPaid: money(entry.netValueDecimal), withheld: entry.valueDecimal && entry.netValueDecimal ? entry.valueDecimal.sub(entry.netValueDecimal).toFixed(2) : null }, events });
        else if (row.date.getUTCFullYear() < query.year) for (const entry of row.payments.filter(entry => entry.date.getUTCFullYear() === query.year)) records.push({ key: key(entity.key, collection.slug, entry.id), entity: entity.key, year: query.year, values: { ...common, date: date(entry.date), type: "Movimento de exercício anterior", paid: money(entry.valueDecimal ?? entry.value) }, events });
        const time = row.updatedAt.toISOString(); if (!updatedAt || time > updatedAt) updatedAt = time;
      }
    } else if (collection.slug === "receitas") {
      const rows = await db.revenue.findMany({ where: { financialYear: { governmentEntityId: { in: entityIds } }, date: yearRange(query.year), stage: "ARRECADADA" }, include: { revenueNature: true, resourceSource: true }, orderBy: [{ date: "desc" }, { id: "desc" }], take: 20001 });
      if (rows.length > 20000) throw new Error("Consulta ampla demais para confirmação integral.");
      for (const row of rows) { records.push({ key: key(entity.key, collection.slug, row.id), entity: entity.key, year: query.year, values: { number: row.revenueNature.code, name: row.revenueNature.name, date: date(row.collectionDate || row.date), sourceCode: row.resourceSource.code, type: row.classification, status: row.status, value: money(row.valueDecimal ?? row.value), predicted: null, updated: null, description: row.history || null } }); const time = row.updatedAt.toISOString(); if (!updatedAt || time > updatedAt) updatedAt = time; }
    } else if (collection.slug === "contratos" || collection.slug === "licitacoes") {
      const units = await db.planningEntityUnit.findMany({ where: { governmentEntityId: { in: entityIds } }, select: { budgetUnitId: true } });
      const ids = units.map(unit => unit.budgetUnitId);
      if (collection.slug === "contratos") {
        const rows = await db.contract.findMany({ where: { sourceBudgetUnitId: { in: ids }, status: { notIn: ["Minuta", "Rascunho", "Em Elaboração"] }, startDate: { lt: new Date(Date.UTC(query.year + 1, 0, 1)) }, endDate: { gte: new Date(Date.UTC(query.year, 0, 1)) } }, include: { supplier: { include: { company: true, person: { select: { fullName: true } } } }, amendments: true, inspector: { select: { name: true } } }, orderBy: { number: "asc" } });
        for (const row of rows) records.push({ key: key(entity.key, collection.slug, row.number), entity: entity.key, year: query.year, values: { number: row.number, date: date(row.startDate), endDate: date(row.endDate), beneficiary: row.supplier.company?.corporateName || row.supplier.person?.fullName || "Não informado", description: row.object, status: row.status, value: money(row.updatedValue), initialValue: money(row.initialValue), inspector: row.inspector?.name || null }, events: row.amendments.filter(amendment => amendment.status !== "Minuta").map(amendment => ({ stage: "Aditivo", number: "Número não cadastrado na fonte", date: date(amendment.createdAt)!, value: amendment.newValue !== null ? new Prisma.Decimal(amendment.newValue).sub(amendment.previousValue || 0).toFixed(2) : "0.00", status: amendment.type })) });
      } else {
        const processes = await db.purchaseProcess.findMany({ where: { commitments: { some: { appropriation: { budgetUnitId: { in: ids } } } } }, select: { id: true } });
        const rows = await db.bidding.findMany({ where: { processId: { in: processes.map(process => process.id) }, publicationDate: yearRange(query.year), status: { notIn: ["Rascunho", "Em Elaboração"] } }, include: { process: { select: { number: true, object: true, estimatedValue: true } } }, orderBy: { number: "asc" } });
        for (const row of rows) records.push({ key: key(entity.key, collection.slug, row.number), entity: entity.key, year: query.year, values: { number: row.number, date: date(row.publicationDate), openingDate: date(row.sessionDate), process: row.process.number, description: row.process.object, modality: row.modality, status: row.status, value: money(row.process.estimatedValue) } });
      }
    } else if (collection.slug === "legislacao") {
      const rows = await db.legalText.findMany({ where: { governmentEntityId: { in: entityIds }, publicationDate: yearRange(query.year) }, select: { id: true, type: true, number: true, summary: true, publicationDate: true, status: true }, orderBy: { number: "asc" } });
      for (const row of rows) records.push({ key: key(entity.key, collection.slug, row.id), entity: entity.key, year: query.year, values: { number: row.number, name: row.summary, type: row.type, date: date(row.publicationDate), status: row.status, format: "Texto de origem" } });
    } else {
      const publications = await db.transparencyPublication.findMany({ where: { entity: entity.key, year: query.year, collectionSlug: collection.slug, status: "PUBLISHED", source: "NATIVO" }, orderBy: [{ publishedAt: "desc" }, { publicKey: "asc" }] });
      for (const publication of publications) records.push({ key: publication.publicKey, entity: entity.key, year: query.year, values: publication.values as PublicRecord["values"], links: [{ title: publication.title, url: `/api/transparencia/publicacoes/${publication.publicKey}` }] });
    }
  }
  return { records, source: "NATIVO", status: "AVAILABLE", updatedAt, provenance: "Dados nativos Celeriflow, nas entidades explicitamente configuradas. Campos ausentes não são completados com valores fictícios.", complete: true };
}
