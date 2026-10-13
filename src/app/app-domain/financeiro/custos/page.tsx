import { canViewModule, getTenantContextForModule, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { readMunicipalCosts } from "@/lib/financeiro/cost-overview";
import { CostsClient } from "./CostsClient";
import { costReportQuery, municipalCostFilters } from "@/lib/financeiro/cost-query";
import { readPayrollCostOptions } from "@/lib/financeiro/cost-payroll-options";
import { PayrollCostRulesClient } from "./PayrollCostRulesClient";

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
  const payrollAuthorized = canViewModule(user, "RH") && await prisma.configuracaoModulo.count({ where: { codigo: "RH", ativo: true } }) > 0;
  const payrollOptions = payrollAuthorized ? await readPayrollCostOptions(prisma, actor, selected.id) : null;
  const [overview, instruments, appropriations] = await Promise.all([
    readMunicipalCosts(prisma, actor, selected.id, municipalCostFilters(filters.data)),
    prisma.planningInstrument.findMany({ where: { governmentEntityId: selected.governmentEntityId!, kind: "LOA", startYear: selected.year }, select: { id: true, title: true } }),
    prisma.budgetAppropriation.findMany({ where: { financialYearId: selected.id, ...(actor.allowedBudgetUnitIds ? { budgetUnitId: { in: actor.allowedBudgetUnitIds } } : {}) }, select: { id: true, code: true, budgetUnitId: true }, orderBy: { code: "asc" } }),
  ]);
  return <><CostsClient data={JSON.parse(JSON.stringify(overview))} years={years.map(year => ({ id: year.id, name: `${year.governmentEntity?.name} — ${year.year}` }))} instruments={instruments} appropriations={appropriations} />{payrollOptions && <PayrollCostRulesClient yearId={selected.id} year={selected.year} units={overview.units} objects={overview.objects} items={overview.items} options={payrollOptions} />}<section className="space-y-3 p-5"><h2 className="font-semibold">Devoluções de consumo e teto líquido das origens</h2>{overview.sources.filter(source => source.reductions.length).map(source => <article key={source.id} className="rounded border p-3 text-sm"><p>{source.sourceType} · {source.sourceId} · original {source.amount} BRL · devolvido {source.reduced} BRL · líquido {source.netAmount} BRL · saldo a apropriar {source.pending} BRL</p>{source.reductions.map(reduction => <details key={reduction.id} className="mt-2"><summary>{reduction.date.slice(0, 10)} · devolução {reduction.amount} BRL · {reduction.reason}</summary><pre className="overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(reduction.snapshot, null, 2)}</pre></details>)}</article>)}{!overview.sources.some(source => source.reductions.length) && <p className="text-sm">Sem devoluções registradas no recorte de origens selecionado.</p>}</section></>;
}
