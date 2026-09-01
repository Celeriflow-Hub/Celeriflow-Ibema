import { AssetLifecycleClient } from "./AssetLifecycleClient";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default async function AssetLifecyclePage() {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const [assets, writeOffs, adjustments] = await Promise.all([
    prisma.asset.findMany({
      orderBy: { patrimonyNumber: "asc" },
      include: {
        category: { select: { name: true, lifeSpan: true } },
        valueHistory: { orderBy: { referenceMonth: "desc" }, take: 1 },
      },
    }),
    prisma.assetWriteOff.findMany({
      orderBy: { date: "desc" },
      take: 20,
      include: { asset: { select: { patrimonyNumber: true, name: true } }, integrationPending: true, accountingTransaction: { select: { id: true } } },
    }),
    prisma.assetValueAdjustment.findMany({
      orderBy: { date: "desc" }, take: 20,
      include: { asset: { select: { patrimonyNumber: true, name: true } } },
    }),
  ]);
  const activeAssets = assets.filter((asset) => asset.status !== "Baixado");
  const totalBookValue = activeAssets.reduce((total, asset) => total + asset.currentValue, 0);
  const initialCompetence = new Date().toISOString().slice(0, 7);

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Ciclo de Vida dos Bens" />
      <p className="text-xs text-muted-foreground">Depreciação, valor contábil e evidências de baixa patrimonial.</p>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border bg-white p-3"><p className="text-xs text-muted-foreground">Bens em operação</p><p className="text-xl font-bold">{activeAssets.length}</p></div>
        <div className="rounded-md border bg-white p-3"><p className="text-xs text-muted-foreground">Valor contábil ativo</p><p className="text-xl font-bold">{currency(totalBookValue)}</p></div>
        <div className="rounded-md border bg-white p-3"><p className="text-xs text-muted-foreground">Baixas registradas</p><p className="text-xl font-bold">{writeOffs.length}</p></div>
      </div>

      <AssetLifecycleClient
        assets={activeAssets.map((asset) => ({ id: asset.id, patrimonyNumber: asset.patrimonyNumber, name: asset.name, currentValue: asset.currentValue }))}
        initialCompetence={initialCompetence}
      />

      <section className="rounded-md border bg-white">
        <div className="border-b p-4"><h3 className="font-semibold">Posição e último lançamento</h3></div>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground"><tr><th className="p-3">Tombamento</th><th className="p-3">Categoria</th><th className="p-3">Valor contábil</th><th className="p-3">Última competência</th><th className="p-3">Depreciação</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {assets.map((asset) => {
                const history = asset.valueHistory[0];
                return <tr key={asset.id} className="border-t"><td className="p-3 font-medium">{asset.patrimonyNumber}<br /><span className="font-normal text-muted-foreground">{asset.name}</span></td><td className="p-3">{asset.category.name}<br /><span className="text-muted-foreground">{asset.category.lifeSpan} meses</span></td><td className="p-3">{currency(asset.currentValue)}</td><td className="p-3">{history ? history.referenceMonth.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric", timeZone: "UTC" }) : "Sem lançamento"}</td><td className="p-3">{history ? currency(history.depreciation) : "-"}</td><td className="p-3">{asset.status}</td></tr>;
              })}
              {assets.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum bem patrimonial encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border bg-white">
        <div className="border-b p-4"><h3 className="font-semibold">Evidências de baixa e alienação</h3></div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm"><thead className="bg-muted text-muted-foreground"><tr><th className="p-3">Data</th><th className="p-3">Bem</th><th className="p-3">Tipo</th><th className="p-3">Valor contábil</th><th className="p-3">Recebido</th><th className="p-3">Ganho/perda</th><th className="p-3">Integração</th></tr></thead><tbody>
            {writeOffs.map((writeOff) => <tr key={writeOff.id} className="border-t"><td className="p-3">{writeOff.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td><td className="p-3">{writeOff.asset.patrimonyNumber} - {writeOff.asset.name}</td><td className="p-3">{writeOff.type}</td><td className="p-3">{currency(writeOff.bookValue)}</td><td className="p-3">{currency(writeOff.disposalValue)}</td><td className="p-3">{currency(writeOff.gainLoss)}</td><td className="p-3">{writeOff.accountingTransaction ? "Contabilizado" : writeOff.integrationPending ? `Pendente: ${writeOff.integrationPending.expectedEventCode}` : "Sem resultado"}</td></tr>)}
            {writeOffs.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhuma baixa registrada.</td></tr>}
          </tbody></table>
        </div>
      </section>

      <section className="rounded-md border bg-white">
        <div className="border-b p-4"><h3 className="font-semibold">Reavaliações, impairment e custos posteriores</h3></div>
        <div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left text-sm"><thead className="bg-muted text-muted-foreground"><tr><th className="p-3">Data</th><th className="p-3">Bem</th><th className="p-3">Tipo</th><th className="p-3">Variação</th><th className="p-3">Valor final</th><th className="p-3">Evidência</th></tr></thead><tbody>
          {adjustments.map((adjustment) => <tr key={adjustment.id} className="border-t"><td className="p-3">{adjustment.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td><td className="p-3">{adjustment.asset.patrimonyNumber} - {adjustment.asset.name}</td><td className="p-3">{adjustment.type}</td><td className="p-3">{currency(adjustment.adjustmentValue)}</td><td className="p-3">{currency(adjustment.closingValue)}</td><td className="p-3">{adjustment.evidence}</td></tr>)}
          {adjustments.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum ajuste de valor registrado.</td></tr>}
        </tbody></table></div>
      </section>
    </PageFrame>
  );
}
