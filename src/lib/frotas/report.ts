import PDFDocument from "pdfkit";
import type { InternalReportDataset } from "@/lib/financeiro/report-delivery";
import { createReportTemplatePresentation, reportTemplateScope } from "@/lib/reports/report-template";
import { renderTabularCsv, renderTabularPrintHtml, renderTabularTxt, renderTabularXlsx, type TabularReportPresentation } from "@/lib/reports/tabular-renderers";
import { executeReport, writeReportIssuanceAudit, type ReportDefinition, type ReportFormat } from "@/lib/reports/report-engine";
import type { AppContext } from "@/lib/platform/tenant-context";
import { areaTitles, money, queryFleet } from "./queries";
import { departmentWhere, FleetError, fleetScope } from "./service";
import { labels, type FleetQuery } from "./contract";
import { buildDossieSections } from "./report-dossie";
import { renderOfficialDocument } from "@/lib/platform/official-document";

type Input = { query: FleetQuery; documentType?: "plan" | "order" | "auth"; documentId?: string };
const titles = { frota: "Listagem geral da frota", vencimentos: "Vencimentos de documentos", abastecimentos: "Abastecimentos por período e veículo", gastos: "Gastos realizados da frota", manutencoes: "Manutenções efetuadas", dossie: "Dossiê multi-veículo consolidado" };

export async function createFleetReportDataset(context: AppContext, input: Input): Promise<InternalReportDataset> {
  const q = input.query, scope = fleetScope(context);
  let title: string, sections: InternalReportDataset["sections"];
  const warnings: string[] = [];
  const date = (v: Date | null | undefined) => v?.toISOString().slice(0, 10) || "Não informado";

  if (input.documentType) {
    if (!input.documentId) throw new FleetError("Selecione o documento (plano, ordem ou autorização).");
    if (input.documentType === "auth") {
      const auth = await context.prisma.fleetServiceAuthorization.findFirst({ where: { id: input.documentId, unit: departmentWhere(scope) }, include: { unit: true } });
      if (!auth) throw new FleetError("Autorização não encontrada.");
      title = `Autorização de Serviço nº ${auth.code}`;
      sections = [
        { title: "Identificação da Autorização", rows: [{ "Código": auth.code, "Situação": auth.status, "Emissão": date(auth.createdAt), "Validade": date(auth.validUntil), "Execução": auth.executedAt ? date(auth.executedAt) : "Pendente" }] },
        { title: "Dados do Veículo", rows: [{ "Código/Placa": `${auth.unit.code}${auth.unit.plate ? ` / ${auth.unit.plate}` : ""}`, "Descrição": auth.unit.name, "Marca/Modelo": `${auth.unit.brand || "—"} / ${auth.unit.model || "—"}`, "RENAVAM": auth.unit.renavam || "—" }] },
        { title: "Serviço e Fornecedor", rows: [{ "Fornecedor": auth.supplierName, "CNPJ": auth.supplierCnpj || "—", "Descrição do Serviço": auth.description, "Valor Limite": money(auth.amountLimit), "Valor Executado": auth.amountActual ? money(auth.amountActual) : "—" }] },
        { title: "Contratação", rows: [{ "Tipo": auth.procurementKind || "Não informado", "Referência": auth.procurementRef || "—" }] }
      ];
    } else {
      const order = input.documentType === "order" ? await context.prisma.fleetWorkOrder.findFirst({ where: { id: input.documentId, unit: departmentWhere(scope) }, include: { unit: true } }) : null;
      const plan = input.documentType === "plan" ? await context.prisma.fleetPlan.findFirst({ where: { id: input.documentId, unit: departmentWhere(scope) }, include: { unit: true } }) : null;
      const doc = order || plan;
      if (!doc) throw new FleetError("Documento não encontrado ou fora do seu setor.");
      title = `${order ? "Ordem de serviço" : "Plano de manutenção"} · ${doc.title}`;
      sections = [{ title: "Identificação", rows: [{ "Identificação": doc.id, "Unidade": `${doc.unit.code} · ${doc.unit.name}`, "Categoria": labels[doc.unit.category], "Tipo": labels[doc.type], "Programação": order ? date(order.scheduledAt) : date(plan!.nextDueAt), "Periodicidade": `${doc.intervalDays} dias`, "Previsto": money(doc.estimatedCost), ...(order ? { "Plano de origem": order.planId, "Situação": labels[order.status], "Conclusão": date(order.completedAt), "Custo dos serviços realizados": order.status === "CONCLUIDA" ? money(order.actualCost) : "Ainda não realizado" } : {}) }] },
        { title: "Serviços programados", rows: doc.services.split(/\r?\n/).filter(Boolean).map((service, i) => ({ "Item": i + 1, "Serviço": service })) },
        ...(order?.performed ? [{ title: "Execução", rows: [{ "Serviços realizados": order.performed, "Resultado": order.result || "—" }] }] : [])];
    }
  } else if (q.area === "relatorios" && q.report === "dossie") {
    const unitIds = q.unitIds ? q.unitIds.split(",") : q.unitId ? [q.unitId] : [];
    if (!unitIds.length) throw new FleetError("Selecione ao menos um veículo para o dossiê.");
    const units = await context.prisma.fleetUnit.findMany({ where: { id: { in: unitIds }, ...departmentWhere(scope) }, include: { consumptions: { orderBy: { occurredAt: "desc" } }, expenses: { where: { nature: "MANUTENCAO" }, orderBy: { occurredAt: "desc" } }, usages: { orderBy: { startedAt: "desc" } } }, orderBy: { code: "asc" } });
    if (!units.length) throw new FleetError("Nenhum veículo autorizado encontrado para o dossiê.");
    const fines = await context.prisma.fleetFine.findMany({ where: { unitId: { in: unitIds } } });
    const occurrences = await context.prisma.fleetOccurrence.findMany({ where: { unitId: { in: unitIds } } });
    title = titles.dossie;
    const dt = (d: Date | null) => d ? d.toLocaleDateString("pt-BR") : "—";
    sections = buildDossieSections(
      units.map(u => ({
        id: u.id, code: u.code, plate: u.plate, name: u.name, category: u.category, status: u.status,
        brand: u.brand, model: u.model, year: u.year, renavam: u.renavam,
        consumptions: u.consumptions.map(c => ({ occurredAt: c.occurredAt, material: c.material, quantity: c.quantity.toString(), measurementUnit: c.measurementUnit, cost: c.cost ? c.cost.toNumber() : null })),
        expenses: u.expenses.map(e => ({ occurredAt: e.occurredAt, description: e.description, amount: e.amount ? e.amount.toNumber() : null })),
        usages: u.usages.map(t => ({ startedAt: t.startedAt, endedAt: t.endedAt, purpose: t.purpose, initialReading: t.initialReading ? t.initialReading.toNumber() : null, finalReading: t.finalReading ? t.finalReading.toNumber() : null })),
      })),
      fines.map(f => ({ unitId: f.unitId, occurredAt: f.occurredAt, aitNumber: f.aitNumber, infraction: f.infraction, amount: f.amount.toNumber(), status: f.status })),
      occurrences.map(o => ({ unitId: o.unitId, occurredAt: o.occurredAt, type: o.type, description: o.description, involvedValue: o.involvedValue ? o.involvedValue.toNumber() : null })),
      { label: v => labels[v] || v, money: v => `R$ ${v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`, date: dt },
    );
  } else {
    if (q.area === "relatorios" && ["vencimentos", "abastecimentos"].includes(q.report) && (!q.from || !q.to)) throw new FleetError("Informe as duas datas do período para emitir este relatório.");
    const list = await queryFleet(context, q, true);
    title = q.area === "relatorios" ? titles[q.report as keyof typeof titles] : areaTitles[q.area];
    const table = list.rows.map(v => Object.fromEntries(list.columns.map(c => [c.label, v.cells[c.key] || "—"])));
    const totals: Record<string, string | number> = { "Registros do recorte completo": list.total };
    if (list.amount !== null) totals["Gasto realizado conhecido"] = money(new (await import("@prisma/client")).Prisma.Decimal(list.amount));
    for (const [unit, quantity] of Object.entries(list.quantities)) totals[`Quantidade (${unit})`] = quantity;
    if ((q.area === "relatorios" && q.report === "frota") || q.area === "frota") for (const category of ["Veículo", "Máquina", "Equipamento", "Agregado"]) totals[category] = list.rows.filter(v => v.cells.category === category).length;
    if (list.missingCosts) warnings.push(`${list.missingCosts} registro(s) com custo não informado. O total conhecido é parcial.`);
    sections = [{ title: "Registros", rows: table }, { title: "Totais do recorte completo", rows: [totals] }];
  }
  const filterIds = q.unitId ? [q.unitId] : q.unitIds ? q.unitIds.split(",") : [];
  const filteredUnits = filterIds.length ? await context.prisma.fleetUnit.findMany({ where: { id: { in: filterIds }, ...departmentWhere(scope) }, select: { code: true, name: true }, orderBy: { code: "asc" } }) : [];
  const filters = [q.from || q.to ? `${q.from || "Sem início"} a ${q.to || "Sem fim"} (datas inclusivas)` : "Sem limite de período", q.q ? `Busca: ${q.q}` : null, filterIds.length ? `Unidades: ${filteredUnits.map(v => `${v.code} · ${v.name}`).join("; ") || "nenhuma unidade autorizada encontrada"}` : "Todas as unidades autorizadas", q.category ? `Categoria: ${labels[q.category]}` : null, q.status ? `Situação: ${labels[q.status] || q.status}` : null, q.type ? `Tipo: ${labels[q.type] || q.type}` : null, q.origin ? `Origem: ${labels[q.origin]}` : null].filter(Boolean).join(" | ");
  return { title, year: Number((q.from || new Date().toISOString()).slice(0, 4)), warnings, metadata: { status: warnings.length ? "INTERNAL_PARTIAL" : "INTERNAL_REVIEW", scope: scope.administrator ? "Frotas · todos os setores autorizados" : "Frotas · setor do usuário", referencePeriod: filters, statutoryCompleteness: "NOT_STATUTORY", publicSnapshotEligible: false, publicSnapshotCondition: "Relatório operacional interno" }, sections };
}

const definition: ReportDefinition<Input, InternalReportDataset> = { key: "frotas-operacional", moduleCode: "FROTAS", createDataset: createFleetReportDataset, auditTarget: () => ({ targetType: "FLEET_REPORT", targetId: "frotas-operacional" }) };

export async function renderFleetPdf(dataset: InternalReportDataset, presentation: TabularReportPresentation): Promise<Uint8Array> {
  const pdf = new PDFDocument({ size: "A4", layout: presentation.template.orientation === "LANDSCAPE" ? "landscape" : "portrait", margin: 40, bufferPages: true });
  const chunks: Buffer[] = [];
  const done = new Promise<Uint8Array>((resolve, reject) => { pdf.on("data", chunk => chunks.push(chunk)); pdf.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks)))); pdf.on("error", reject); });
  pdf.info.Title = dataset.title; pdf.info.Author = presentation.institution?.name || "CeleriFlow";
  pdf.font("Helvetica-Bold").fontSize(16).fillColor("#173c60").text(dataset.title);
  pdf.font("Helvetica").fontSize(10).fillColor("#334155").text(presentation.institution?.name || "Instituição não configurada");
  if (presentation.template.header) pdf.text(presentation.template.header);
  pdf.text(dataset.metadata.referencePeriod).moveDown();
  for (const warning of dataset.warnings) pdf.fillColor("#92400e").text(warning);
  for (const section of dataset.sections) {
    if (pdf.y > pdf.page.height - 120) pdf.addPage();
    pdf.fillColor("#173c60").font("Helvetica-Bold").fontSize(12).text(section.title).moveDown(0.5);
    for (const row of section.rows) {
      if (pdf.y > pdf.page.height - 100) pdf.addPage();
      pdf.font("Helvetica").fontSize(10).fillColor("#0f172a").text(Object.entries(row).map(([k, v]) => `${k}: ${v}`).join("\n")).moveDown(0.7);
    }
  }
  if (presentation.template.footer) pdf.text(presentation.template.footer);
  if (presentation.emission) pdf.fontSize(9).text(`Emitido em ${presentation.emission.issuedAt} por ${presentation.emission.issuedBy}.`);
  const range = pdf.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) { pdf.switchToPage(i); pdf.fontSize(9).fillColor("#64748b").text(`${i + 1} / ${range.count}`, 40, pdf.page.height - 28, { lineBreak: false }); }
  pdf.end(); return done;
}

export async function issueFleetReport(input: Input, format: ReportFormat) {
  const execution = await executeReport(definition, input, format);
  const [institution, template] = await Promise.all([execution.context.prisma.institution.findFirst({ select: { name: true, legalName: true, cnpj: true, address: true, city: true, state: true } }), execution.context.prisma.reportTemplate.findUnique({ where: { scope: reportTemplateScope } })]);
  const templatePresentation = createReportTemplatePresentation(template);
  const presentation: TabularReportPresentation = { institution, template: templatePresentation, emission: templatePresentation.includeEmissionMetadata ? { issuedAt: new Date().toISOString(), issuedBy: execution.context.user.name } : null };
  const dataset = execution.dataset;
  let body: string | Uint8Array, contentType: string;

  if (input.documentType === "auth" && format === "print") {
    const sections = dataset.sections.map(s => ({
      title: s.title,
      head: s.rows.length > 0 ? Object.keys(s.rows[0]) : [],
      rows: s.rows.map(r => Object.values(r) as (string | number)[])
    }));
    body = renderOfficialDocument({
      title: dataset.title,
      sections,
      code: input.documentId,
      department: "Departamento de Frotas"
    });
    contentType = "text/html; charset=utf-8";
  } else {
    switch (format) {
      case "pdf": body = await renderFleetPdf(dataset, presentation); contentType = "application/pdf"; break;
      case "xlsx": body = await renderTabularXlsx(dataset, presentation); contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; break;
      case "csv": body = "\uFEFF" + renderTabularCsv(dataset, presentation); contentType = "text/csv; charset=utf-8"; break;
      case "txt": body = renderTabularTxt(dataset, presentation); contentType = "text/plain; charset=utf-8"; break;
      case "print": body = renderTabularPrintHtml(dataset, presentation); contentType = "text/html; charset=utf-8"; break;
      default: throw new FleetError("Formato de emissão inválido.");
    }
  }
  await writeReportIssuanceAudit(execution);
  return { body, contentType };
}
