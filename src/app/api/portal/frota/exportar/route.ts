import { prisma } from "@/lib/prisma";
import { loadPublicFleetReport, publicFleetCsv, publicFleetMonth } from "@/lib/frotas/public-report";
import { checkFleetPortalThrottle, fleetPortalSource, FleetPortalThrottled } from "@/lib/frotas/public-rate-limit";

export const dynamic = "force-dynamic";

/** Public, strictly sanitized CSV using exactly the same monthly data as the page. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const competence = url.searchParams.get("mes") ?? "";
  const department = url.searchParams.get("setor") ?? "";
  try { publicFleetMonth(competence); } catch {
    return new Response("Competência inválida.", { status: 400 });
  }
  if (department.length > 128) return new Response("Filtro inválido.", { status: 400 });
  try {
    const source = fleetPortalSource(request.headers);
    if (source !== "unresolved") await checkFleetPortalThrottle(prisma, "export", "source", source, 60);
    const report = await loadPublicFleetReport(prisma, competence, department);
    return new Response(publicFleetCsv(report), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="frota-publica-${competence}.csv"`,
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof FleetPortalThrottled) return new Response(error.message, { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } });
    return new Response("Consulta temporariamente indisponível.", { status: 503 });
  }
}
