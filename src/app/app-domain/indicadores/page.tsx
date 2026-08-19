import { getTenantContextForModule } from "@/lib/platform/tenant-context";

export default async function IndicadoresPage({ searchParams }: { searchParams: Promise<{ start?: string; end?: string }> }) {
  const { prisma } = await getTenantContextForModule("ADMINISTRACAO");
  const params = await searchParams;
  const start = params.start ? new Date(`${params.start}T00:00:00.000Z`) : new Date(new Date().getFullYear(), 0, 1);
  const end = params.end ? new Date(`${params.end}T23:59:59.999Z`) : new Date();
  const [plans, pendingFindings, fleetCost, payments, socialBenefits, licenses] = await Promise.all([
    prisma.internalControlPlan.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.internalControlFinding.count({ where: { status: { not: "RESOLVIDO" } } }),
    prisma.fleetOperation.aggregate({ where: { occurredAt: { gte: start, lte: end } }, _sum: { cost: true } }),
    prisma.payment.aggregate({ where: { date: { gte: start, lte: end }, status: { in: ["Emitida", "Paga"] } }, _sum: { valueDecimal: true } }),
    prisma.socialBenefitConcession.count({ where: { createdAt: { gte: start, lte: end } } }).catch(() => 0),
    prisma.environmentalLicense.count({ where: { createdAt: { gte: start, lte: end } } }).catch(() => 0),
  ]);
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const cards = [
    ["Planos de controle", plans.toString(), "Planos registrados no período"],
    ["Apontamentos pendentes", pendingFindings.toString(), "Demandam tratamento e evidência"],
    ["Custo de frotas", money.format(Number(fleetCost._sum.cost ?? 0)), "Operações de abastecimento, manutenção e OS"],
    ["Pagamentos emitidos", money.format(Number(payments._sum.valueDecimal ?? 0)), "Execução financeira no período"],
    ["Benefícios sociais", socialBenefits.toString(), "Concessões registradas"],
    ["Licenças ambientais", licenses.toString(), "Licenças emitidas ou em análise"],
  ];
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Indicadores</h1>
        <p className="text-muted-foreground mt-2">BI executivo baseado em dados operacionais, com recorte temporal.</p>
      </div>
      <form className="flex flex-wrap gap-3 rounded-lg border bg-white p-4"><label className="text-sm">Início<input className="ml-2 rounded border p-2" name="start" type="date" defaultValue={params.start} /></label><label className="text-sm">Fim<input className="ml-2 rounded border p-2" name="end" type="date" defaultValue={params.end} /></label><button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Aplicar</button></form>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title, value, description]) => <section key={title} className="rounded-xl border bg-white p-5"><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-muted-foreground">{description}</p></section>)}</div>
    </div>
  );
}
