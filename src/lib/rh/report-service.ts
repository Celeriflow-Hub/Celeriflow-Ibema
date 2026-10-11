import { Prisma, type PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { z } from "zod";

export const hrReportInputSchema = z.object({
  kind: z.enum(["CONTRATOS", "FOLHA", "DIREITOS"]), format: z.enum(["CSV", "XLSX", "PDF"]),
  q: z.string().max(200).default(""), competence: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/).optional(),
  payrollId: z.string().min(1).optional(),
});
type Report = { title: string; headers: string[]; rows: string[][] };

export async function buildHrReport(db: PrismaClient, input: z.infer<typeof hrReportInputSchema>, payrollScope: Prisma.PayrollWhereInput = {}): Promise<Report> {
  const contractWhere: Prisma.HrEmploymentContractWhereInput = input.q ? { OR: [{ registration: { contains: input.q, mode: "insensitive" } }, { employee: { name: { contains: input.q, mode: "insensitive" } } }] } : {};
  if (input.kind === "CONTRATOS") {
    const rows = await db.hrEmploymentContract.findMany({ where: contractWhere, include: { employee: { select: { name: true } } }, orderBy: [{ registration: "asc" }, { id: "asc" }] });
    return { title: "Contratos funcionais", headers: ["Matrícula", "Servidor", "Admissão", "Término", "Local", "Jornada", "Salário BRL", "Situação", "Versão"], rows: rows.map(row => [row.registration, row.employee.name, row.admittedAt.toISOString().slice(0, 10), row.endsAt?.toISOString().slice(0, 10) || "", row.workLocation, String(row.monthlyHours), row.salary.toFixed(2), row.status, String(row.version)]) };
  }
  if (input.kind === "FOLHA") {
    const rows = await db.hrPayrollStatement.findMany({ where: { contract: contractWhere, run: { mode: "OFICIAL", status: "FECHADA", ...(input.payrollId ? { payrollId: input.payrollId } : {}), payroll: { AND: [payrollScope, ...(input.competence ? [{ competence: input.competence }] : [])] } } }, include: { contract: { select: { registration: true, employee: { select: { name: true } } } }, run: { select: { payroll: { select: { competence: true, type: true } }, scope: true } } }, orderBy: [{ run: { createdAt: "asc" } }, { id: "asc" }] });
    return { title: "Folha calculada e fechada — não comprova pagamento", headers: ["Competência", "Tipo", "Escopo", "Matrícula", "Servidor", "Bruto BRL", "Descontos BRL", "Líquido BRL", "Encargos BRL", "Versão"], rows: rows.map(row => [row.run.payroll.competence, row.run.payroll.type, row.run.scope, row.contract.registration, row.contract.employee.name, row.gross.toFixed(2), row.deductions.toFixed(2), row.net.toFixed(2), row.employer.toFixed(2), row.id]) };
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
