import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantContextForModuleOperation, AccessError } from "@/lib/platform/tenant-context";
import { certificateReport } from "@/lib/sst/report-service";
import { SstValidationError } from "@/lib/sst/errors";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContextForModuleOperation("SST", "issueReports");
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const report = await certificateReport(context, { ...params, from: `${params.from || ""}T00:00:00-03:00`, until: `${params.until || ""}T23:59:59.999-03:00` });
    const summary = params.kind === "absenteismo";
    const rows: unknown[][] = summary
      ? [["Servidor", "Atestados", "Horas planejadas", "Horas atestadas aceitas", "Indice (%)", "Dias corridos aceitos"], ...report.statistics.map((item) => [item.name, item.certificateCount, item.plannedMinutes / 60, item.absentMinutes / 60, item.index, item.acceptedCalendarDays])]
      : [["Protocolo", "Servidor", "Matricula", "Emitente", "Motivo", "Inicio (ISO)", "Fim (ISO)", "Situacao", "CIDs"], ...report.records.map((item) => [item.protocolNumber, item.employee.name, item.employee.registration, item.issuer.fullName, item.reason.name, item.startsAt.toISOString(), item.endsAt.toISOString(), item.status, item.cidCodes.join(", ")])];
    await writeAuditEvent(context.prisma, { actorUsuarioId: context.user.id, eventType: auditEventTypes.reportIssued, targetType: "SST_REPORT_CSV", targetId: params.budgetUnitId });
    return new NextResponse(`\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="sst-${summary ? "absenteismo" : "atestados"}.csv"`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof AccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof z.ZodError || error instanceof SstValidationError) return NextResponse.json({ error: "Confira os filtros e o período do relatório." }, { status: 400 });
    return NextResponse.json({ error: "Não foi possível emitir o relatório." }, { status: 500 });
  }
}
