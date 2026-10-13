import { getTenantContextForModule, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { readMunicipalCosts } from "@/lib/financeiro/cost-overview";
import { CostsClient } from "./CostsClient";
import { costReportQuery, municipalCostFilters } from "@/lib/financeiro/cost-query";

export default async function CostsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { prisma, user } = await getTenantContextForModule("FINANCEIRO");
  const actor = { usuarioId: user.id, allowedBudgetUnitIds: isSystemAdministrator(user) ? undefined : user.allowedBudgetUnitIds };
  const years = await prisma.financialYear.findMany({ where: { governmentEntityId: { not: null }, ...(actor.allowedBudgetUnitIds ? { governmentEntity: { planningUnits: { some: { budgetUnitId: { in: actor.allowedBudgetUnitIds } } } } } : {}) }, include: { governmentEntity: { select: { name: true } } }, orderBy: [{ year: "desc" }, { id: "asc" }] });
  const query = await searchParams;
  const yearId = typeof query.yearId === "string" ? query.yearId : undefined;
  const selected = years.find(year => year.id === yearId) ?? years[0];
  if (!selected) return <p className="p-5">Nenhum exercício com entidade conciliada disponível para Custos.</p>;
  const filters = costReportQuery.safeParse({ ...query, yearId: selected.id });
  if (!filters.success) return <p className="p-5">{filters.error.issues[0]?.message ?? "Filtros inválidos."}</p>;
  const [overview, instruments, appropriations] = await Promise.all([
    readMunicipalCosts(prisma, actor, selected.id, municipalCostFilters(filters.data)),
    prisma.planningInstrument.findMany({ where: { governmentEntityId: selected.governmentEntityId!, kind: "LOA", startYear: selected.year }, select: { id: true, title: true } }),
    prisma.budgetAppropriation.findMany({ where: { financialYearId: selected.id, ...(actor.allowedBudgetUnitIds ? { budgetUnitId: { in: actor.allowedBudgetUnitIds } } : {}) }, select: { id: true, code: true, budgetUnitId: true }, orderBy: { code: "asc" } }),
  ]);
  return <CostsClient data={JSON.parse(JSON.stringify(overview))} years={years.map(year => ({ id: year.id, name: `${year.governmentEntity?.name} — ${year.year}` }))} instruments={instruments} appropriations={appropriations} />;
}
