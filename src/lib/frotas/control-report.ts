import { Prisma } from "@prisma/client";
import type { AppContext } from "@/lib/platform/tenant-context";
import type { InternalReportDataset } from "@/lib/financeiro/report-delivery";
import { fleetScope, departmentWhere } from "./service";
import { queryFleetControl } from "./control-queries";
import { controlQuerySchema } from "./control-policy";
import { FleetControlError, scopedFleetUnit } from "./control-access";

export type FleetControlReportInput = { query: unknown; documentType?: "authorization" | "trip" | "blankFuel" | "blankTrip"; documentId?: string; unitIds?: string[] };
const date = (value: Date | null | undefined) => value?.toISOString() || "Não informado";
const amount = (value: Prisma.Decimal | null | undefined, scale = 2) => value === null || value === undefined ? "Não informado" : value.toFixed(scale);
export async function buildFleetControlReport(context: AppContext, input: FleetControlReportInput): Promise<InternalReportDataset> {
  const query = controlQuerySchema.parse(input.query), scope = fleetScope(context), db = context.prisma;
  let title = "Frota — relatório operacional", sections: InternalReportDataset["sections"] = [];
  const warnings: string[] = [];
  if (input.documentType === "blankFuel" || input.documentType === "blankTrip") {
    title = input.documentType === "blankFuel" ? "Autorização de abastecimento — formulário em branco" : "Deslocamento/guarita — planilha em branco";
    const fields = input.documentType === "blankFuel" ? ["Número/ano", "Veículo/placa", "Setor", "Motorista", "Posto/fornecedor", "Combustível", "Litros autorizados", "Leitura", "Data de emissão", "Validade", "Assinatura do responsável", "Confirmação de execução"] : ["Veículo/placa", "Motorista/CNH", "Setor", "Finalidade", "Destino", "Data/hora de saída", "Marcador de saída", "Data/hora de chegada", "Marcador de chegada", "Assinatura/observações"];
    sections = [{ title: "Preenchimento manual", rows: fields.map((field) => ({ Campo: field, Preenchimento: "________________________________________________" })) }];
    warnings.push("Formulário em branco: impressão não cria autorização, consumo, viagem, despesa ou pagamento no banco.");
  } else if (input.documentType === "authorization") {
    const authorization = await db.fleetAuthorization.findUnique({ where: { id: input.documentId || "" } });
    if (!authorization) throw new FleetControlError("Autorização não encontrada.");
    const unit = await scopedFleetUnit(db, scope, authorization.unitId, false);
    const provider = authorization.providerId ? await db.fleetProvider.findUnique({ where: { id: authorization.providerId } }) : null;
    const supplier = provider ? await db.supplier.findUnique({ where: { id: provider.supplierId }, select: { company: { select: { corporateName: true, cnpj: true } } } }) : null;
    title = `${authorization.kind === "ABASTECIMENTO" ? "Autorização de abastecimento" : "Autorização de serviço"} ${authorization.code}`;
    sections = [{ title: "Autorização cadastrada", rows: [{ Código: authorization.code, Situação: authorization.status, Unidade: `${unit.code} · ${unit.name}`, Placa: unit.plate || "Não aplicável", Origem: authorization.origin, Prestador: supplier?.company?.corporateName || "Próprio", CNPJ: supplier?.company?.cnpj || "Não aplicável", Finalidade: authorization.description, Emissão: date(authorization.issuedAt), Validade: date(authorization.validUntil), "Litros autorizados": amount(authorization.authorizedQuantity, 3), "Valor limite": amount(authorization.authorizedAmount), "Execução efetiva": date(authorization.executedAt), "Litros executados": amount(authorization.actualQuantity, 3), "Custo realizado": amount(authorization.actualAmount), Contrato: authorization.contractId || "Sem vínculo", "Compra/dispensa/licitação": authorization.purchaseProcessId || "Sem vínculo", "Ordem de serviço": authorization.workOrderId || "Não aplicável" }] }];
    warnings.push("A autorização não comprova execução/pagamento. O código externo de conferência é entregue separadamente ao prestador.");
  } else if (input.documentType === "trip") {
    const trip = await db.fleetTrip.findUnique({ where: { id: input.documentId || "" } }); if (!trip) throw new FleetControlError("Viagem não encontrada.");
    const unit = await scopedFleetUnit(db, scope, trip.unitId, false);
    title = `Planilha de deslocamento — ${unit.code}`;
    const gates = await db.fleetGateEvent.findMany({ where: { tripId: trip.id }, orderBy: { occurredAt: "asc" } });
    sections = [{ title: "Saída, acompanhamento e retorno", rows: [{ Unidade: `${unit.code} · ${unit.name}`, Motorista: (trip.driverSnapshot as { name: string }).name, Finalidade: trip.purpose, Destino: trip.destination, Saída: date(trip.departedAt), Retorno: date(trip.returnedAt), Marcador: trip.meterType, Inicial: amount(trip.startReading, 3), Final: amount(trip.endReading, 3), "Percorrido (unidade do marcador)": trip.startReading !== null && trip.endReading !== null ? trip.endReading.sub(trip.startReading).toString() : "Não aplicável/aberto", Rota: trip.routeSnapshot || "Sem rota", Checklist: JSON.stringify(trip.checklist) }] }, { title: "Eventos únicos da guarita", rows: gates.map((gate) => ({ Movimento: gate.kind, Horário: date(gate.occurredAt), Leitura: amount(gate.reading, 3) })) }];
  } else if (query.area === "relatorios") {
    const where = { ...departmentWhere(scope), ...(input.unitIds?.length ? { id: { in: input.unitIds } } : query.unitId ? { id: query.unitId } : {}) };
    const units = await db.fleetUnit.findMany({ where, select: { id: true, code: true, name: true, plate: true, category: true, asset: { select: { patrimonyNumber: true, acquisitionDate: true } } }, orderBy: { code: "asc" } });
    if (input.unitIds?.length && units.length !== new Set(input.unitIds).size) throw new FleetControlError("Uma das unidades está fora da repartição autorizada.");
    title = "Dossiê integral de veículos, máquinas e equipamentos";
    for (const unit of units) {
      sections.push({ title: `${unit.code} · ${unit.name}`, rows: [{ Unidade: unit.code, Categoria: unit.category, Placa: unit.plate || "Não aplicável", Patrimônio: unit.asset?.patrimonyNumber || "Sem vínculo", Aquisição: date(unit.asset?.acquisitionDate) }] });
      for (const area of ["cadastro", "agenda", "guarita", "abastecimento", "autorizacoes", "componentes", "multas", "sinistros", "anexos"] as const) {
        const list = await queryFleetControl(context, { ...query, area, unitId: unit.id, page: 1 }, true);
        sections.push({ title: `${unit.code} — ${area}`, rows: list.rows.map((row) => ({ Registro: row.id, Identificação: row.label, Situação: row.status, ...row.detail })) });
      }
      const range = { ...(query.from ? { gte: new Date(`${query.from}T00:00:00Z`) } : {}), ...(query.to ? { lt: new Date(new Date(`${query.to}T00:00:00Z`).getTime() + 86400000) } : {}) };
      const [usages, documents, plans, orders, consumptions, expenses, events] = await Promise.all([
        db.fleetUsage.findMany({ where: { unitId: unit.id, startedAt: range }, orderBy: { startedAt: "asc" } }), db.fleetDocument.findMany({ where: { unitId: unit.id, dueAt: range }, orderBy: { dueAt: "asc" } }),
        db.fleetPlan.findMany({ where: { unitId: unit.id, nextDueAt: range } }), db.fleetWorkOrder.findMany({ where: { unitId: unit.id, scheduledAt: range } }), db.fleetConsumption.findMany({ where: { unitId: unit.id, occurredAt: range } }),
        db.fleetExpense.findMany({ where: { unitId: unit.id, occurredAt: range }, orderBy: { occurredAt: "asc" } }), db.fleetControlEvent.findMany({ where: { unitId: unit.id, createdAt: range }, orderBy: { createdAt: "asc" } }),
      ]);
      sections.push({ title: `${unit.code} — utilização canônica (uma por retorno)`, rows: usages.map((row) => ({ Registro: row.id, Início: date(row.startedAt), Fim: date(row.endedAt), Finalidade: row.purpose, Condutor: row.employeeName || "Não informado", Marcador: row.meterType, Inicial: amount(row.initialReading, 3), Final: amount(row.finalReading, 3), Rota: row.routeSnapshot || "Sem rota" })) });
      sections.push({ title: `${unit.code} — seguros/licenciamento/obrigações previstos e realizados`, rows: documents.map((row) => ({ Registro: row.id, Tipo: `${row.kind} / ${row.type}`, Documento: row.title, Apólice: row.reference, Seguradora: row.insurerName || "Não informada", Início: date(row.startsAt), Programação: date(row.scheduledAt), Vencimento: date(row.dueAt), Cumprimento: date(row.fulfilledAt), Valor: amount(row.value), Situação: row.status })) });
      sections.push({ title: `${unit.code} — planos e OS`, rows: [...plans.map((row) => ({ Registro: row.id, Tipo: "PLANO", Serviços: row.services, Programação: date(row.nextDueAt), Realizado: "Não é execução", Previsto: amount(row.estimatedCost) })), ...orders.map((row) => ({ Registro: row.id, Tipo: row.type, Serviços: row.services, Programação: date(row.scheduledAt), Realizado: date(row.completedAt), Previsto: amount(row.estimatedCost), "Custo realizado": amount(row.actualCost), Situação: row.status }))] });
      sections.push({ title: `${unit.code} — consumos e origem (não somar novamente ao gasto)`, rows: consumptions.map((row) => ({ Registro: row.id, Origem: row.origin, Material: row.material, Quantidade: `${row.quantity} ${row.measurementUnit}`, Custo: amount(row.cost), Fornecedor: row.supplierName || "Não informado", "Saída de estoque": row.stockMovementId || "Sem vínculo" })) });
      const unknown = expenses.filter((row) => row.amount === null).length, known = expenses.reduce((sum, row) => sum.add(row.amount || 0), new Prisma.Decimal(0));
      if (unknown) warnings.push(`${unit.code}: ${unknown} gasto(s) sem valor. Total conhecido parcial, não equivalente a zero para os desconhecidos.`);
      sections.push({ title: `${unit.code} — gastos canônicos únicos`, rows: [...expenses.map((row) => ({ Registro: row.id, Natureza: row.nature, Data: date(row.occurredAt), Descrição: row.description, Valor: amount(row.amount), Fonte: `${row.sourceType}:${row.sourceId}`, Fornecedor: row.supplierName || "Não informado", Contrato: row.contractId || "Não vinculado" })), { "Total realizado conhecido": known.toFixed(2), "Valores desconhecidos": unknown, Conciliação: unknown ? "PARCIAL" : "COMPLETO_DO_FILTRO" }] });
      sections.push({ title: `${unit.code} — histórico imutável de operações`, rows: events.map((row) => ({ Operação: row.operation, Registro: row.targetId, Data: date(row.createdAt), Ator: row.actorId, "Hash da confirmação": row.payloadHash })) });
    }
  } else {
    const list = await queryFleetControl(context, query, true);
    title = `Frota — ${query.area}`;
    sections = [{ title: "Recorte completo autorizado", rows: list.rows.map((row) => ({ Identificação: row.label, Registro: row.id, Situação: row.status, ...row.detail })) }, { title: "Total do filtro", rows: [{ Registros: list.total }] }];
  }
  const unitIds = (await db.fleetUnit.findMany({ where: { ...departmentWhere(scope), ...(input.unitIds?.length ? { id: { in: input.unitIds } } : query.unitId ? { id: query.unitId } : {}) }, select: { id: true, departmentId: true } }));
  if (!input.documentType) {
    const expenses = await db.fleetExpense.findMany({ where: { unitId: { in: unitIds.map((row) => row.id) }, occurredAt: { ...(query.from ? { gte: new Date(`${query.from}T00:00:00Z`) } : {}), ...(query.to ? { lt: new Date(new Date(`${query.to}T00:00:00Z`).getTime() + 86400000) } : {}) } }, select: { unitId: true, nature: true, occurredAt: true, supplierId: true, supplierName: true, amount: true } });
    const unitMap = new Map(unitIds.map((row) => [row.id, row.departmentId || "SEM_SETOR"]));
    const groups = new Map<string, { known: Prisma.Decimal; unknown: number; count: number }>();
    for (const expense of expenses) for (const [dimension, value] of [["REPARTICAO", unitMap.get(expense.unitId)!], ["VEICULO", expense.unitId], ["FORNECEDOR", expense.supplierName || expense.supplierId || "NAO_INFORMADO"], ["PERIODO", expense.occurredAt.toISOString().slice(0, 7)]]) { const key = `${dimension}:${value}`, group = groups.get(key) || { known: new Prisma.Decimal(0), unknown: 0, count: 0 }; group.count++; if (expense.amount === null) group.unknown++; else group.known = group.known.add(expense.amount); groups.set(key, group); }
    sections.push({ title: "Despesas agrupadas — fonte única FleetExpense", rows: [...groups].map(([key, group]) => ({ Agrupamento: key, Registros: group.count, "Valor conhecido": group.known.toFixed(2), "Custos desconhecidos": group.unknown, Qualificação: group.unknown ? "TOTAL_PARCIAL" : "TOTAL_DO_FILTRO" })) });
  }
  return { title, year: Number((query.from || new Date().toISOString()).slice(0, 4)), warnings, metadata: { status: warnings.length ? "INTERNAL_PARTIAL" : "INTERNAL_REVIEW", scope: scope.administrator ? "Frota — setores autorizados" : "Frota — repartição atual", referencePeriod: `${query.from || "início"} a ${query.to || "atual"} | ${query.unitId || "unidades autorizadas"}`, statutoryCompleteness: "NOT_STATUTORY", publicSnapshotEligible: false, publicSnapshotCondition: "Relatório operacional privado" }, sections };
}
