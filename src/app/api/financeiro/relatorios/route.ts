import { NextRequest, NextResponse } from "next/server";
import { financialReportFilename, isFinancialReportType, isReportMonth, reportDatasetCsv, reportRequiresMonth } from "@/lib/financeiro/report-delivery";
import { generateReportPdf } from "@/lib/financeiro/report-export";
import { AccessError } from "@/lib/platform/tenant-context";
import { executeReport, isReportFormat, writeReportIssuanceAudit } from "@/lib/reports/report-engine";
import { getRegisteredReportDefinition } from "@/lib/reports/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const financialYearId = request.nextUrl.searchParams.get("financialYearId");
    const reportType = request.nextUrl.searchParams.get("reportType");
    const formatParameter = request.nextUrl.searchParams.get("format") ?? "CSV";
    const format = formatParameter.toLowerCase();
    if (!financialYearId || !isFinancialReportType(reportType) || !isReportFormat(format)) {
      return NextResponse.json({ error: "Selecione um exercício, tipo de relatório e formato válidos." }, { status: 400 });
    }
    const monthParameter = request.nextUrl.searchParams.get("month");
    const month = monthParameter === null || monthParameter === "" ? undefined : Number(monthParameter);
    if ((reportRequiresMonth(reportType) && !isReportMonth(month ?? null)) || (month !== undefined && !isReportMonth(month))) {
      return NextResponse.json({ error: "Informe um mês válido para o relatório selecionado." }, { status: 400 });
    }

    const execution = await executeReport(
      getRegisteredReportDefinition("finance.internal"),
      { financialYearId, reportType, month },
      format,
    );
    const dataset = execution.dataset.report;
    if (format === "preview") {
      return NextResponse.json({ reportKey: execution.key, format, dataset }, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const body = format === "csv" ? reportDatasetCsv(dataset).csv : await generateReportPdf(dataset);
    const contentType = format === "csv"
      ? "text/csv; charset=utf-8"
      : "application/pdf";
    const filename = financialReportFilename(reportType, dataset.year, format === "csv" ? "CSV" : "PDF");
    await writeReportIssuanceAudit(execution);

    return new NextResponse(body as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Erro ao emitir relatório financeiro:", error);
    return NextResponse.json({ error: "Não foi possível emitir o relatório financeiro." }, { status: 500 });
  }
}
