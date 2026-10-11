import { NextResponse } from "next/server";
import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { arePortalPayrollStatementsEnabled } from "@/lib/rh/payroll-configuration";
import { getPayrollStatement, renderPayrollStatementPdf } from "@/lib/rh/statement-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getEmployeePortalAccess();
  if (access.status !== "AVAILABLE" || !await arePortalPayrollStatementsEnabled(access.context.prisma)) return NextResponse.json({ error: "Indisponível." }, { status: 403 });
  try {
    const statement = await getPayrollStatement(access.context.prisma, (await params).id, access.employee.id);
    return new NextResponse(new Uint8Array(await renderPayrollStatementPdf(statement)), { headers: { "Content-Type": "application/pdf", "Cache-Control": "private, no-store", "Content-Disposition": `inline; filename="demonstrativo-${statement.id}.pdf"` } });
  } catch { return NextResponse.json({ error: "Demonstrativo indisponível." }, { status: 404 }); }
}
