import { canViewModule, getTenantContextForModule, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { getFleetExpenseIndicators } from "@/lib/frotas/indicators";
import { dateOnly } from "@/lib/frotas/contract";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { MunicipalCostIndicators } from "./MunicipalCostIndicators";

export default async function IndicadoresPage({ searchParams }: { searchParams: Promise<{ start?: string; end?: string; costYearId?: string }> }) {
  const context = await getTenantContextForModule("ADMINISTRACAO");
  const { prisma } = context;
  const unitScope = isSystemAdministrator(context.user) ? {} : { budgetUnitId: { in: context.user.allowedBudgetUnitIds } };
  const params = await searchParams;
  const start = dateOnly(params.start || `${new Date().getFullYear()}-01-01`);
  const end = params.end ? new Date(dateOnly(params.end).getTime() + 86400000 - 1) : new Date();
  if (start > end) throw new Error("A data inicial deve ser anterior ao fim do período.");
  const [plans, pendingFindings, fleetCost, payments, socialBenefits, licenses] = await Promise.all([
    prisma.internalControlPlan.count({ where: { ...unitScope, createdAt: { gte: start, lte: end } } }),
    prisma.internalControlFinding.count({ where: { plan: unitScope, status: { not: "RESOLVIDO" } } }),
    canViewModule(context.user, "FROTAS") ? getFleetExpenseIndicators(context, start, end) : null,
    canViewModule(context.user, "FINANCEIRO") ? prisma.payment.aggregate({ where: { commitment: { appropriation: unitScope }, date: { gte: start, lte: end }, status: { in: ["Emitida", "Paga"] } }, _sum: { valueDecimal: true } }) : null,
    prisma.socialBenefitConcession.count({ where: { createdAt: { gte: start, lte: end } } }).catch(() => 0),
    prisma.environmentalLicense.count({ where: { createdAt: { gte: start, lte: end } } }).catch(() => 0),
  ]);
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const cards = [
    ["Planos de controle", plans.toString(), "Planos registrados no período"],
    ["Apontamentos pendentes", pendingFindings.toString(), "Demandam tratamento e evidência"],
    ["Gastos realizados de frotas", fleetCost ? money.format(Number(fleetCost.knownAmount)) : "Acesso restrito", fleetCost ? `${fleetCost.total} registros canônicos · ${fleetCost.missing} sem valor informado · ${fleetCost.complete ? "valoração completa" : "total conhecido parcial"}. Não equivale à apropriação contábil de custos.` : "A leitura exige permissão de Frotas e seu recorte de setor."],
    ["Pagamentos emitidos", payments ? money.format(Number(payments._sum.valueDecimal ?? 0)) : "Acesso restrito", "Execução financeira no período e nas UGs autorizadas"],
    ["Benefícios sociais", socialBenefits.toString(), "Concessões registradas"],
    ["Licenças ambientais", licenses.toString(), "Licenças emitidas ou em análise"],
  ];
  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Indicadores" />
      <form className="flex flex-wrap items-end gap-2 rounded border border-slate-300 bg-white p-2.5 shadow-sm">
        <label className="text-xs font-semibold text-slate-600">Início<input className="ml-1.5 h-8 rounded border border-slate-300 px-2 text-xs" name="start" type="date" defaultValue={params.start} /></label>
        <label className="text-xs font-semibold text-slate-600">Fim<input className="ml-1.5 h-8 rounded border border-slate-300 px-2 text-xs" name="end" type="date" defaultValue={params.end} /></label>
        <button className="h-8 rounded bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-900">Aplicar</button>
      </form>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title, value, description]) => <section key={title} className="rounded border border-slate-300 bg-white p-3 shadow-sm"><p className="text-xs font-medium text-slate-500">{title}</p><p className="mt-1 text-2xl font-bold text-slate-800">{value}</p><p className="mt-1 text-[11px] text-slate-500">{description}</p></section>)}</div>
      <MunicipalCostIndicators context={context} start={start} end={end} yearId={params.costYearId} />
    </PageFrame>
  );
}
