import { prisma } from "@/lib/prisma";
import { parseTransparencyQuery } from "@/lib/transparencia/query-contract";
import { runTransparencyConsultation } from "@/lib/transparencia/consultation-service";
import { exportTransparencyCsv } from "@/lib/transparencia/consultation-export";
import { getTransparencyCollection } from "@/lib/transparencia/consultation-catalog";

export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getTransparencyCollection(slug)) return Response.json({ error: "Consulta não encontrada." }, { status: 404 });
  const search = new URL(request.url).searchParams;
  let query;
  try { query = parseTransparencyQuery(search); } catch { return Response.json({ error: "Filtros inválidos." }, { status: 400 }); }
  try {
    const result = await runTransparencyConsultation(prisma, slug, query);
    if (result.status !== "AVAILABLE" || !result.complete) return Response.json({ status: result.status, error: result.message || "Fonte indisponível.", source: result.source }, { status: 503 });
    if (search.get("format") === "csv") return new Response(exportTransparencyCsv(result.collection, { ...result, records: result.rows }, query), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${slug}-${query.source}-${query.entity}-${query.year}.csv"`, "Cache-Control": "no-store" } });
    return Response.json({ collection: result.collection, query: result.query, records: result.records, source: result.source, provenance: result.provenance, updatedAt: result.updatedAt, status: result.status, complete: result.complete, total: result.total, totals: result.totals, page: result.page, pageSize: result.pageSize }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Consulta indisponível ou filtros não permitidos." }, { status: 400 }); }
}
