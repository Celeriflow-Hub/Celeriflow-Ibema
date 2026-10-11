import { Prisma, type PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { resolveContractRevision } from "./contract-timeline";
import { payrollPeriod } from "./calculation-engine";

export const hrReportInputSchema = z.object({
  kind: z.enum(["CONTRATOS", "FOLHA", "DIREITOS", "RESUMO_CONTABIL", "PREVIDENCIA", "CONTRATOS_MULTIPLOS"]), format: z.enum(["CSV", "XLSX", "PDF"]),
  q: z.string().max(200).default(""), competence: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/).optional(),
  payrollId: z.string().min(1).optional(),
});
type Report = { title: string; headers: string[]; rows: string[][] };
const payrollSnapshot = z.object({
  contract: z.object({ registration: z.string(), costCenterId: z.string().nullable(), workLocation: z.string(), employee: z.object({ name: z.string() }) }),
  regime: z.object({ code: z.string(), socialSecurityScheme: z.object({ code: z.string(), name: z.string(), regime: z.string() }).nullable() }),
  bases: z.record(z.string(), z.string()),
  items: z.array(z.object({ code: z.string(), name: z.string(), type: z.string(), value: z.string() })),
});

export async function buildHrReport(db: PrismaClient, input: z.infer<typeof hrReportInputSchema>, payrollScope: Prisma.PayrollWhereInput = {}): Promise<Report> {
  const contractWhere: Prisma.HrEmploymentContractWhereInput = input.q ? { OR: [{ registration: { contains: input.q, mode: "insensitive" } }, { employee: { name: { contains: input.q, mode: "insensitive" } } }] } : {};
  if (input.kind === "CONTRATOS") {
    const rows = await db.hrEmploymentContract.findMany({ where: contractWhere, include: { employee: { select: { name: true } } }, orderBy: [{ registration: "asc" }, { id: "asc" }] });
    return { title: "Contratos funcionais", headers: ["Matrícula", "Servidor", "Admissão", "Término", "Local", "Jornada", "Salário BRL", "Situação", "Versão"], rows: rows.map(row => [row.registration, row.employee.name, row.admittedAt.toISOString().slice(0, 10), row.endsAt?.toISOString().slice(0, 10) || "", row.workLocation, String(row.monthlyHours), row.salary.toFixed(2), row.status, String(row.version)]) };
  }
  if (input.kind === "CONTRATOS_MULTIPLOS") {
    const reference = input.competence ? payrollPeriod(input.competence).start : new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    const contracts = await db.hrEmploymentContract.findMany({ where: input.q ? { employee: { OR: [{ name: { contains: input.q, mode: "insensitive" } }, { hrContracts: { some: { registration: { contains: input.q, mode: "insensitive" } } } }] } } : {}, include: { revisions: true, employee: { select: { id: true, name: true } } }, orderBy: [{ employeeId: "asc" }, { id: "asc" }] });
    const grouped = new Map<string, { name: string; registrations: string[]; regimes: string[] }>();
    for (const contract of contracts) {
      if (!contract.revisions.some(revision => revision.effectiveFrom <= reference)) continue;
      const active = resolveContractRevision(contract, contract.revisions, { start: reference, end: reference }).contract;
      if (active.status !== "ATIVO" || active.admittedAt > reference || (active.endsAt && active.endsAt < reference)) continue;
      const group = grouped.get(contract.employeeId) || { name: contract.employee.name, registrations: [], regimes: [] };
      group.registrations.push(active.registration); group.regimes.push(active.regimeId); grouped.set(contract.employeeId, group);
    }
    return { title: "Servidores com contratos simultâneos na data de referência", headers: ["Referência", "Servidor", "Quantidade", "Matrículas", "Regimes IDs"], rows: [...grouped.values()].filter(group => group.registrations.length > 1).map(group => [reference.toISOString().slice(0, 10), group.name, String(group.registrations.length), group.registrations.join(" · "), [...new Set(group.regimes)].join(" · ")]) };
  }
  if (["FOLHA", "RESUMO_CONTABIL", "PREVIDENCIA"].includes(input.kind)) {
    const rows = await db.hrPayrollStatement.findMany({ where: { contract: contractWhere, run: { mode: "OFICIAL", status: "FECHADA", ...(input.payrollId ? { payrollId: input.payrollId } : {}), payroll: { AND: [payrollScope, ...(input.competence ? [{ competence: input.competence }] : [])] } } }, include: { contract: { select: { registration: true, employee: { select: { name: true } } } }, run: { select: { payroll: { select: { competence: true, type: true } }, scope: true } } }, orderBy: [{ run: { createdAt: "asc" } }, { id: "asc" }] });
    if (input.kind === "PREVIDENCIA") return { title: "Bases e contribuições calculadas — não comprova recolhimento", headers: ["Competência", "Escopo", "Matrícula", "Servidor", "Previdência", "Base BRL", "Segurado BRL", "Patronal BRL", "FGTS BRL", "Versão"], rows: rows.map(row => {
      const snapshot = payrollSnapshot.parse(row.snapshot); const scheme = snapshot.regime.socialSecurityScheme;
      const social = scheme ? snapshot.items.find(item => item.code === `PREVIDENCIA_${scheme.code}`)?.value || "0.00" : "0.00";
      const fgts = snapshot.items.find(item => item.code === "FGTS")?.value || "0.00";
      return [row.run.payroll.competence, row.run.scope, snapshot.contract.registration, snapshot.contract.employee.name, scheme?.name || "—", scheme ? snapshot.bases[scheme.regime] || "0.00" : "0.00", social, row.employer.sub(fgts).toFixed(2), fgts, row.id];
    }) };
    if (input.kind === "RESUMO_CONTABIL") {
      const grouped = new Map<string, { labels: string[]; value: Prisma.Decimal }>();
      for (const row of rows) {
        const snapshot = payrollSnapshot.parse(row.snapshot);
        const prefix = [row.run.payroll.competence, row.run.payroll.type, row.run.scope, snapshot.regime.code, snapshot.contract.costCenterId || "SEM_CENTRO", snapshot.contract.workLocation];
        const totals = [{ code: "TOTAL_BRUTO", type: "TOTAL", value: row.gross }, { code: "TOTAL_DESCONTOS", type: "TOTAL", value: row.deductions }, { code: "TOTAL_LIQUIDO", type: "TOTAL", value: row.net }, { code: "TOTAL_ENCARGOS", type: "TOTAL", value: row.employer }];
        for (const item of [...snapshot.items, ...totals]) {
          const labels = [...prefix, item.code, item.type]; const key = JSON.stringify(labels);
          const group = grouped.get(key) || { labels, value: new Prisma.Decimal(0) };
          group.value = group.value.add(item.value); grouped.set(key, group);
        }
      }
      return { title: "Resumo por rubrica/regime/centro/local — totais são linhas de conferência, não somar com rubricas", headers: ["Competência", "Tipo folha", "Escopo", "Regime", "Centro ID", "Local", "Rubrica/total", "Tipo linha", "Valor BRL"], rows: [...grouped.values()].sort((a, b) => JSON.stringify(a.labels).localeCompare(JSON.stringify(b.labels))).map(group => [...group.labels, group.value.toFixed(2)]) };
    }
    return { title: "Folha calculada e fechada — não comprova pagamento", headers: ["Competência", "Tipo", "Escopo", "Matrícula", "Servidor", "Bruto BRL", "Descontos BRL", "Líquido BRL", "Encargos BRL", "Versão"], rows: rows.map(row => { const snapshot = payrollSnapshot.parse(row.snapshot); return [row.run.payroll.competence, row.run.payroll.type, row.run.scope, snapshot.contract.registration, snapshot.contract.employee.name, row.gross.toFixed(2), row.deductions.toFixed(2), row.net.toFixed(2), row.employer.toFixed(2), row.id]; }) };
  }
  const entries = await db.hrRightEntry.findMany({ where: { contract: contractWhere }, include: { contract: { select: { registration: true, employee: { select: { name: true } } } } }, orderBy: [{ periodStart: "asc" }, { createdAt: "asc" }, { id: "asc" }] });
  const totals = new Map<string, { registration: string; name: string; kind: string; start: string; end: string; quantity: Prisma.Decimal; amount: Prisma.Decimal }>();
  for (const entry of entries) {
    const start = entry.periodStart.toISOString().slice(0, 10); const end = entry.periodEnd.toISOString().slice(0, 10);
    const key = `${entry.contractId}:${entry.kind}:${start}:${end}`;
    const row = totals.get(key) || { registration: entry.contract.registration, name: entry.contract.employee.name, kind: entry.kind, start, end, quantity: new Prisma.Decimal(0), amount: new Prisma.Decimal(0) };
    row.quantity = row.quantity.add(entry.quantity); row.amount = row.amount.add(entry.amount); totals.set(key, row);
  }
  return { title: "Saldos de direitos e provisões", headers: ["Matrícula", "Servidor", "Direito", "Início", "Fim", "Saldo quantidade", "Saldo BRL"], rows: [...totals.values()].map(row => [row.registration, row.name, row.kind, row.start, row.end, row.quantity.toString(), row.amount.toFixed(2)]) };
}

export async function renderHrReport(report: Report, format: "CSV" | "XLSX" | "PDF") {
  if (format === "CSV") {
    const quote = (value: string) => {
      const safe = /^[=+@]/.test(value) || /^-\D/.test(value) ? `'${value}` : value;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    return { bytes: Buffer.from("\uFEFF" + [report.headers, ...report.rows].map(row => row.map(quote).join(";")).join("\r\n"), "utf8"), contentType: "text/csv; charset=utf-8", extension: "csv" };
  }
  if (format === "XLSX") {
    const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet("Relatório RH");
    sheet.addRow(report.headers); report.rows.forEach(row => sheet.addRow(row));
    sheet.getRow(1).font = { bold: true }; sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.columns.forEach(column => { column.width = 24; });
    return { bytes: Buffer.from(await workbook.xlsx.writeBuffer()), contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx" };
  }
  const pdf = new PDFDocument({ size: "A4", margin: 35, bufferPages: true }); const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => { pdf.on("data", chunk => chunks.push(Buffer.from(chunk))); pdf.on("end", () => resolve(Buffer.concat(chunks))); pdf.on("error", reject); });
  pdf.fontSize(14).text(report.title); pdf.fontSize(9).text(`${report.rows.length} registros · relatório integral do filtro`); pdf.moveDown();
  for (const [index, row] of report.rows.entries()) {
    pdf.fontSize(9).text(`${index + 1}. ${row.map((value, col) => `${report.headers[col]}: ${value}`).join(" · ")}`);
    pdf.moveDown(0.5);
  }
  const pages = pdf.bufferedPageRange();
  for (let page = 0; page < pages.count; page++) { pdf.switchToPage(page); pdf.text(`${page + 1}/${pages.count}`, 35, pdf.page.height - 25, { lineBreak: false }); }
  pdf.end();
  return { bytes: await result, contentType: "application/pdf", extension: "pdf" };
}
