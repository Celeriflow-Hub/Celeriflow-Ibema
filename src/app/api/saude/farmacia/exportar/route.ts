import { NextRequest, NextResponse } from "next/server";
import { AccessError, getTenantContextForModule } from "@/lib/platform/tenant-context";
import { consumptionSummary, dispensations, losses, stockPosition } from "@/lib/saude/pharmacy-management";
import { csv, EXPIRY_LABEL } from "@/lib/saude/pharmacy-engine";
import { municipality } from "@/lib/platform/municipality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const d = (v: Date | null) => (v ? v.toISOString().slice(0, 10) : "");

export async function GET(request: NextRequest) {
  try {
    const ctx = await getTenantContextForModule("SAUDE");
    const tipo = request.nextUrl.searchParams.get("tipo") ?? "";
    const mes = request.nextUrl.searchParams.get("mes") ?? "";
    let rows: (string | number | null)[][];
    if (tipo === "posicao") {
      const { lots } = await stockPosition(ctx, mes);
      rows = [["Produto", "CATMAT", "Estoque", "Lote", "Validade", "Situação", "Quantidade", "Valor"], ...lots.map((l) => [l.material, l.catmat, l.warehouse, l.batch, d(l.expiration), EXPIRY_LABEL[l.status], l.quantity, l.value.toFixed(2)])];
    } else if (tipo === "consumo") {
      rows = [["Medicamento", "CATMAT", "Quantidade dispensada", "Pacientes atendidos", "Valor"], ...(await consumptionSummary(ctx, mes)).map((c) => [c.medicine, c.catmat, c.quantity, c.patients, c.value.toFixed(2)])];
    } else if (tipo === "perdas") {
      rows = [["Data", "Produto", "Estoque", "Lote", "Quantidade", "Valor", "Categoria", "Motivo"], ...(await losses(ctx, mes)).map((l) => [d(l.date), l.material, l.warehouse, l.batch, l.quantity, l.value.toFixed(2), l.category, l.reason])];
    } else if (tipo === "controlados") {
      rows = [["Data", "Medicamento", "Lista (Portaria 344)", "Receituário", "Lote", "Quantidade", "Paciente", "CNS", "CPF", "Unidade", "Dispensado por"], ...(await dispensations(ctx, mes, true)).map((r) => [d(r.date), r.medicine, r.list344, r.prescriptionType, r.batch, r.quantity, r.patient, r.cns, r.cpf, r.unit, r.professional])];
    } else if (tipo === "bnafar") {
      // Layout de apoio para carga no BNAFAR/Hórus: uma linha por dispensação.
      rows = [["IBGE_MUNICIPIO", "CNES", "DATA_DISPENSACAO", "CATMAT", "MEDICAMENTO", "LOTE", "VALIDADE", "QUANTIDADE", "CNS_PACIENTE", "CPF_PACIENTE"], ...(await dispensations(ctx, mes)).map((r) => [municipality.ibgeCode, r.cnes, d(r.date), r.catmat, r.medicine, r.batch, d(r.expiration), r.quantity, r.cns, r.cpf?.replace(/\D/g, "") ?? null])];
    } else return NextResponse.json({ error: "Relatório inválido." }, { status: 400 });
    return new NextResponse(csv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="farmacia_${tipo}_${mes}.csv"`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof AccessError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível gerar o arquivo." }, { status: 400 });
  }
}
