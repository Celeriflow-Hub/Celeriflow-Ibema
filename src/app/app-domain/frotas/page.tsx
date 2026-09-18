import { canPerformModuleOperation, getTenantContextForModule } from "@/lib/platform/tenant-context";
import { fleetQuerySchema } from "@/lib/frotas/contract";
import { queryFleet } from "@/lib/frotas/queries";
import { departmentWhere, fleetScope } from "@/lib/frotas/service";
import { FrotasClient } from "./FrotasClient";

export const dynamic = "force-dynamic";
export default async function FrotasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await getTenantContextForModule("FROTAS"), scope = fleetScope(context);
  const raw = Object.fromEntries(Object.entries(await searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const parsed = fleetQuerySchema.safeParse(raw);
  if (!parsed.success) return <div role="alert" className="rounded border border-red-200 bg-white p-5 text-sm text-red-800">Filtros inválidos: {parsed.error.issues.map(i => i.message).join(" ")} <a href="/frotas" className="underline">Limpar filtros</a></div>;
  const query = parsed.data;
  const [list, selectedUnit, selectedUnits] = await Promise.all([queryFleet(context, query), query.unitId ? context.prisma.fleetUnit.findFirst({ where: { id: query.unitId, ...departmentWhere(scope) }, select: { id: true, code: true, name: true, category: true } }) : null, query.unitIds ? context.prisma.fleetUnit.findMany({ where: { id: { in: query.unitIds.split(",") }, ...departmentWhere(scope) }, select: { id: true, code: true, name: true }, orderBy: { code: "asc" } }) : []]);
  const permissions = { create: canPerformModuleOperation(context.user, "FROTAS", "create"), update: canPerformModuleOperation(context.user, "FROTAS", "update"), issueReports: canPerformModuleOperation(context.user, "FROTAS", "issueReports") };
  return <FrotasClient key={JSON.stringify(query)} query={query} list={list} selectedUnit={selectedUnit} selectedUnits={selectedUnits.map(v => ({ id: v.id, label: `${v.code} · ${v.name}` }))} permissions={permissions} departmentId={scope.departmentId || ""} />;
}
