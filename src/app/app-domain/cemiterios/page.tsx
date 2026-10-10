import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ensureS9Defaults } from "@/lib/tributacao/s9-service";
import CemiteriosClient from "./CemiteriosClient";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; status?: string; type?: string; cemetery?: string; funeralHome?: string; start?: string; end?: string };

function text(value: string | undefined) {
  return value?.trim() ?? "";
}

export default async function CemiteriosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = await searchParams;
  const { prisma, user } = await getTenantContextForModule("CEMITERIOS");
  await ensureS9Defaults(prisma, { usuarioId: user.id });
  const [cemeteries, graves, lots, ossuaries, funeralHomes, causes, deceased, movements, concessions, taxpayers, feeAssessments, processes, identificationFields, feeRules, documents, attachments, histories] = await Promise.all([
    prisma.taxCemetery.findMany({ include: { sectors: true, employees: true, chapels: true }, orderBy: { name: "asc" } }),
    prisma.taxGrave.findMany({ include: { sector: true, lot: true }, orderBy: [{ cemeteryId: "asc" }, { code: "asc" }], take: 500 }),
    prisma.cemeteryLot.findMany({ include: { _count: { select: { graves: true } } }, orderBy: { identifier: "asc" }, take: 500 }),
    prisma.cemeteryOssuary.findMany({ orderBy: { code: "asc" }, take: 200 }),
    prisma.taxFuneralHome.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.taxDeathCause.findMany({ orderBy: { code: "asc" } }),
    prisma.taxDeceased.findMany({ include: { grave: true, cause: true, funeralHome: true }, orderBy: { deathDate: "desc" }, take: 500 }),
    prisma.taxBurialMovement.findMany({ include: { deceased: true, grave: true }, orderBy: { movementDate: "desc" }, take: 500 }),
    prisma.taxGraveConcession.findMany({ include: { grave: true }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.taxpayer.findMany({ where: { status: "Ativo" }, include: { person: true, company: true }, orderBy: { createdAt: "asc" }, take: 500 }),
    prisma.taxAssessment.findMany({ where: { tax: { name: "Taxa de Sepultamento" } }, include: { guides: true, taxpayer: { include: { person: true, company: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.cemeteryProcess.findMany({ include: { deceased: { include: { cause: true } }, chapel: true, grave: true }, orderBy: { scheduledAt: "desc" }, take: 500 }),
    prisma.cemeteryIdentificationField.findMany({ where: { active: true }, orderBy: [{ targetType: "asc" }, { label: "asc" }] }),
    prisma.cemeteryFeeRule.findMany({ where: { active: true }, orderBy: { validFrom: "desc" } }),
    prisma.document.findMany({ where: { status: { in: ["Válido", "Pendente"] } }, select: { id: true, title: true, fileUrl: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.cemeteryAttachment.findMany({ include: { document: { select: { title: true, fileUrl: true } } }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.cemeteryChangeHistory.findMany({ orderBy: { createdAt: "desc" }, take: 300 }),
  ]);
  const names = new Map(taxpayers.map((row) => [row.id, row.company?.corporateName ?? row.person?.fullName ?? row.id]));
  const funeralNames = new Map(funeralHomes.map((row) => [row.id, row.name]));
  const graveOf = (id: string | null) => graves.find((grave) => grave.id === id);
  const query = text(filters.q).toLocaleLowerCase("pt-BR");
  const filteredProcesses = processes.filter((process) => {
    if (filters.status && process.status !== filters.status) return false;
    if (filters.type && process.processType !== filters.type) return false;
    if (filters.cemetery && process.cemeteryId !== filters.cemetery) return false;
    if (filters.funeralHome && process.funeralHomeId !== filters.funeralHome) return false;
    if (filters.start && process.scheduledAt < new Date(`${filters.start}T00:00:00`)) return false;
    if (filters.end && process.scheduledAt > new Date(`${filters.end}T23:59:59.999`)) return false;
    return !query || [process.deceased.fullName, process.receiptCode, funeralNames.get(process.funeralHomeId ?? "") ?? "", process.deceased.cause?.description ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(query));
  });
  return <CemiteriosClient data={{
    filters: { q: text(filters.q), status: text(filters.status), type: text(filters.type), cemetery: text(filters.cemetery), funeralHome: text(filters.funeralHome), start: text(filters.start), end: text(filters.end) },
    cemeteries: cemeteries.map((cemetery) => ({ id: cemetery.id, code: cemetery.code, name: cemetery.name, address: cemetery.address ?? null, wakePlace: cemetery.wakePlace ?? null, observations: cemetery.observations ?? null, sectors: cemetery.sectors.map((sector) => ({ id: sector.id, code: sector.code, name: sector.name, parentId: sector.parentId ?? null })), employees: cemetery.employees.map((employee) => ({ id: employee.id, name: employee.name, role: employee.role })), chapels: cemetery.chapels.map((chapel) => ({ id: chapel.id, name: chapel.name, address: chapel.address ?? null, responsible: names.get(chapel.responsibleTaxpayerId) ?? chapel.responsibleTaxpayerId })) })),
    lots: lots.map((lot) => ({ id: lot.id, cemeteryId: lot.cemeteryId, identifier: lot.identifier, owner: names.get(lot.ownerTaxpayerId) ?? lot.ownerTaxpayerId, graveLimit: lot.graveLimit, graveCount: lot._count.graves, status: lot.status, active: lot.active })),
    ossuaries: ossuaries.map((item) => ({ id: item.id, cemeteryId: item.cemeteryId, code: item.code, address: item.address, occupied: item.occupantCount, capacity: item.capacity, active: item.active })),
    graves: graves.map((grave) => ({ id: grave.id, cemeteryId: grave.cemeteryId, lotId: grave.lotId ?? null, lot: grave.lot?.identifier ?? null, code: grave.code, type: grave.graveType, sector: grave.sector?.name ?? null, capacity: grave.capacity, occupied: grave.occupantCount, status: grave.status, active: grave.active })),
    funeralHomes: funeralHomes.map((home) => ({ id: home.id, name: home.name, ownershipType: home.ownershipType })),
    causes: causes.map((cause) => ({ id: cause.id, code: cause.code, description: cause.description })),
    deceased: deceased.map((item) => ({ id: item.id, name: item.fullName, deathDate: item.deathDate.toISOString().slice(0, 10), graveId: item.graveId ?? null, grave: item.grave?.code ?? null, cause: item.cause?.description ?? item.causeText ?? null, doctor: `${item.doctorName} · ${item.doctorCrm}`, status: item.status, cemeteryId: item.cemeteryId })),
    processes: filteredProcesses.map((process) => { const debt = process.declarantDebtSnapshot as { hasDebt?: boolean }; return { id: process.id, receiptCode: process.receiptCode, type: process.processType, status: process.status, burialType: process.burialType ?? null, deceased: process.deceased.fullName, deceasedId: process.deceasedId, deathDate: process.deceased.deathDate.toISOString().slice(0, 10), cemeteryId: process.cemeteryId ?? null, grave: process.grave?.code ?? null, chapel: process.chapel?.name ?? null, funeralHome: funeralNames.get(process.funeralHomeId ?? "") ?? null, scheduledAt: process.scheduledAt.toISOString(), performedAt: process.performedAt?.toISOString() ?? null, declarant: names.get(process.declarantTaxpayerId) ?? process.declarantTaxpayerId, declarantHasDebt: Boolean(debt.hasDebt) }; }),
    movements: movements.map((movement) => ({ id: movement.id, type: movement.movementType, date: movement.movementDate.toISOString().slice(0, 10), deceased: movement.deceased?.fullName ?? null, grave: movement.grave.code, from: graveOf(movement.fromGraveId ?? null)?.code ?? null, to: graveOf(movement.toGraveId ?? null)?.code ?? movement.destinationDescription ?? null, feeAssessmentId: movement.feeAssessmentId ?? null })),
    concessions: concessions.map((concession) => ({ id: concession.id, grave: concession.grave.code, holder: concession.holderName, type: concession.concessionType, endsAt: concession.endsAt?.toISOString().slice(0, 10) ?? null, status: concession.status, feeAssessmentId: concession.feeAssessmentId ?? null })),
    taxpayers: taxpayers.map((row) => ({ id: row.id, name: names.get(row.id) ?? row.id, person: Boolean(row.person) })),
    fields: identificationFields.map((field) => ({ id: field.id, cemeteryId: field.cemeteryId, targetType: field.targetType, key: field.fieldKey, label: field.label, valueType: field.valueType, required: field.required })),
    feeRules: feeRules.map((rule) => ({ id: rule.id, cemeteryId: rule.cemeteryId ?? null, eventType: rule.eventType, label: rule.label, formula: rule.formula, baseAmount: Number(rule.baseAmount) })),
    documents,
    attachments: attachments.map((attachment) => ({ id: attachment.id, targetType: attachment.targetType, targetId: attachment.targetId, title: attachment.document.title, fileUrl: attachment.document.fileUrl })),
    histories: histories.map((history) => ({ id: history.id, targetType: history.targetType, targetId: history.targetId, fieldName: history.fieldName, previousValue: history.previousValue === null ? null : JSON.stringify(history.previousValue), newValue: history.newValue === null ? null : JSON.stringify(history.newValue), actorUsuarioId: history.actorUsuarioId, createdAt: history.createdAt.toISOString() })),
    fees: feeAssessments.map((assessment) => ({ id: assessment.id, number: assessment.assessmentNumber ?? assessment.id, taxpayer: names.get(assessment.taxpayerId) ?? assessment.taxpayerId, total: Number(assessment.finalValueDecimal ?? assessment.originalValueDecimal ?? assessment.originalValue), guides: assessment.guides.map((guide) => ({ id: guide.id, number: guide.guideNumber ?? guide.id, status: guide.status, total: Number(guide.totalValueDecimal ?? guide.totalValue) })) })),
  }} />;
}
