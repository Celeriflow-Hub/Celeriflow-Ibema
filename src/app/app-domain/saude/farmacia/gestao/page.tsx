import Link from "next/link";
import { Pill } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { consumptionSummary, dispensations, losses, stockPosition } from "@/lib/saude/pharmacy-management";
import { EXPIRY_LABEL, PORTARIA_344_LABEL, PORTARIA_344_LISTS } from "@/lib/saude/pharmacy-engine";
import { saveMinMax, saveProductRegulatory } from "./actions";

export const dynamic = "force-dynamic";

const TABS = [["alertas", "Alertas"], ["posicao", "Posição de estoque"], ["consumo", "Consumo"], ["perdas", "Perdas"], ["controlados", "Livro de controlados"], ["produtos", "CATMAT e Portaria 344"], ["arquivos", "Arquivos (BNAFAR/SAGRES)"]] as const;
const inp = "h-8 rounded border border-slate-300 bg-white px-2 text-xs";
const btn = "h-8 rounded bg-emerald-700 px-3 text-xs font-semibold text-white";
const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (d: Date | null) => (d ? d.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—");
const levelLabel = { ZERADO: "Zerado", ABAIXO_MINIMO: "Abaixo do mínimo", ACIMA_MAXIMO: "Acima do máximo", ADEQUADO: "Adequado" } as const;

function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return <section className="rounded border border-slate-200 bg-white p-3 text-xs"><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">{title}</h2>{actions}</div>{children}</section>;
}
function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <p className="text-slate-500">Nenhum registro.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50"><tr>{head.map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t border-slate-100">{r.map((c, j) => <td key={j} className="p-2 align-top">{c}</td>)}</tr>)}</tbody></table></div>;
}

export default async function FarmaciaGestaoPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const aba = TABS.some(([k]) => k === sp.aba) ? sp.aba! : "alertas";
  const now = new Date();
  const mes = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.mes ?? "") ? sp.mes! : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const ctx = await getTenantContextForModule("SAUDE");
  const exportLink = (tipo: string) => <a href={`/api/saude/farmacia/exportar?tipo=${tipo}&mes=${mes}`} className="rounded border px-3 py-1 font-semibold">Baixar planilha (CSV)</a>;

  const needsPosition = aba === "alertas" || aba === "posicao";
  const position = needsPosition ? await stockPosition(ctx, mes) : null;
  const consumo = aba === "consumo" ? await consumptionSummary(ctx, mes) : [];
  const perdas = aba === "perdas" ? await losses(ctx, mes) : [];
  const controlados = aba === "controlados" ? await dispensations(ctx, mes, true) : [];
  const produtos = aba === "produtos" ? await ctx.prisma.healthMaterialProfile.findMany({ where: { isActive: true }, include: { material: { select: { name: true } } }, orderBy: { material: { name: "asc" } }, take: 1000 }) : [];

  return (
    <PageFrame className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-1 py-1 md:px-2">
      <PageHeader title="Farmácia — Gestão e controle" icon={<Pill className="size-4 shrink-0 text-emerald-600" />} />
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <nav className="flex flex-wrap gap-1">{TABS.map(([k, t]) => <Link key={k} href={`?aba=${k}&mes=${mes}`} className={`rounded border px-3 py-1 ${k === aba ? "border-emerald-700 bg-emerald-50 font-semibold text-emerald-800" : "bg-white"}`}>{t}</Link>)}</nav>
        <form className="ml-auto flex items-center gap-1"><input type="hidden" name="aba" value={aba} /><label>Competência <input type="month" name="mes" defaultValue={mes} className={inp} /></label><button className="h-8 rounded border px-3">Aplicar</button></form>
        <Link href="/saude/farmacia" className="underline">Voltar às operações da farmácia</Link>
      </div>
      {sp.erro && <p role="alert" className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">{sp.erro}</p>}
      {sp.ok && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">Registro salvo.</p>}

      {aba === "alertas" && position && <div className="grid gap-3 md:grid-cols-2">
        <Card title={`Lotes vencidos (${position.lots.filter((l) => l.status === "VENCIDO").length})`}><Table head={["Produto", "Estoque", "Lote", "Validade", "Qtd."]} rows={position.lots.filter((l) => l.status === "VENCIDO").map((l) => [l.material, l.warehouse, l.batch, date(l.expiration), l.quantity])} /></Card>
        <Card title={`Vencendo em até 90 dias (${position.lots.filter((l) => l.status.startsWith("VENCE")).length})`}><Table head={["Produto", "Lote", "Validade", "Faixa", "Qtd."]} rows={position.lots.filter((l) => l.status.startsWith("VENCE")).map((l) => [l.material, l.batch, date(l.expiration), EXPIRY_LABEL[l.status], l.quantity])} /></Card>
        <Card title={`Abaixo do estoque mínimo (${position.belowMinCount})`}><Table head={["Produto", "Estoque", "Saldo", "Mínimo", "Cobertura"]} rows={position.products.filter((p) => p.level === "ABAIXO_MINIMO").map((p) => [p.material, p.warehouse, p.quantity, p.min, p.coverage == null ? "—" : `${p.coverage} dias`])} />{position.zeroedPolicies.length > 0 && <p className="mt-2 text-red-700">{position.zeroedPolicies.length} produto(s) com mínimo definido estão zerados.</p>}</Card>
        <Card title="Lotes bloqueados"><Table head={["Produto", "Lote", "Estoque"]} rows={position.lots.filter((l) => l.blocked).map((l) => [l.material, l.batch, l.warehouse])} /></Card>
      </div>}

      {aba === "posicao" && position && <Card title="Posição de estoque por unidade" actions={exportLink("posicao")}>
        <Table head={["Produto", "CATMAT", "Estoque", "Saldo", "Consumo no mês", "Cobertura", "Situação", "Mínimo / máximo"]} rows={position.products.map((p) => [p.material, p.catmat ?? "—", p.warehouse, p.quantity, p.consumed, p.coverage == null ? "—" : `${p.coverage} dias`, <span key="l" className={p.level === "ADEQUADO" ? "" : "font-semibold text-amber-700"}>{levelLabel[p.level]}</span>,
          <form key="f" action={saveMinMax} className="flex gap-1"><input type="hidden" name="warehouseId" value={p.warehouseId} /><input type="hidden" name="materialId" value={p.materialId} /><input name="min" defaultValue={p.min} className={`${inp} w-16`} /><input name="max" defaultValue={p.max} className={`${inp} w-16`} /><button className={btn}>Salvar</button></form>])} />
        <p className="mt-2 text-slate-500">Valor total em estoque: {money(position.lots.reduce((s, l) => s + l.value, 0))}</p>
      </Card>}

      {aba === "consumo" && <Card title={`Consumo por medicamento — ${mes}`} actions={exportLink("consumo")}><Table head={["Medicamento", "CATMAT", "Quantidade", "Pacientes", "Valor"]} rows={consumo.map((c) => [c.medicine, c.catmat ?? "—", c.quantity, c.patients, money(c.value)])} /></Card>}

      {aba === "perdas" && <Card title={`Perdas e baixas — ${mes}`} actions={exportLink("perdas")}><Table head={["Data", "Produto", "Estoque", "Lote", "Qtd.", "Valor", "Categoria", "Motivo"]} rows={perdas.map((l) => [date(l.date), l.material, l.warehouse, l.batch ?? "—", l.quantity, money(l.value), l.category, l.reason])} /><p className="mt-2 text-slate-500">Total: {money(perdas.reduce((s, l) => s + l.value, 0))}. As baixas são lançadas em Farmácia → operações.</p></Card>}

      {aba === "controlados" && <Card title={`Livro de registro de controlados (Portaria 344/98) — ${mes}`} actions={exportLink("controlados")}><Table head={["Data", "Medicamento", "Lista", "Receituário", "Lote", "Qtd.", "Paciente", "CNS/CPF", "Dispensado por"]} rows={controlados.map((r) => [date(r.date), r.medicine, r.list344 ?? "—", r.prescriptionType, r.batch ?? "—", r.quantity, r.patient, r.cns ?? r.cpf ?? "—", r.professional ?? "—"])} /><p className="mt-2 text-slate-500">A abertura e o fechamento do livro por período continuam em Farmácia → operações.</p></Card>}

      {aba === "produtos" && <Card title="Código CATMAT/BR e lista da Portaria 344"><Table head={["Produto", "CATMAT", "Lista 344", ""]} rows={produtos.map((p) => [p.material.name, p.catmatCode ?? "—", p.portaria344List ?? "—",
        <form key="f" action={saveProductRegulatory} className="flex gap-1"><input type="hidden" name="materialId" value={p.materialId} /><input name="catmatCode" defaultValue={p.catmatCode ?? ""} placeholder="CATMAT" className={`${inp} w-28`} /><select name="portaria344List" defaultValue={p.portaria344List ?? ""} className={inp}><option value="">Não controlado</option>{PORTARIA_344_LISTS.map((l) => <option key={l} value={l}>{l} — {PORTARIA_344_LABEL[l]}</option>)}</select><button className={btn}>Salvar</button></form>])} /></Card>}

      {aba === "arquivos" && <div className="grid gap-3 md:grid-cols-2">
        <Card title="BNAFAR / Hórus" actions={exportLink("bnafar")}><p>Arquivo de dispensações da competência {mes} com IBGE do município, CNES, CATMAT, lote, validade, quantidade e CNS/CPF do paciente, para carga no BNAFAR ou conferência no Hórus.</p></Card>
        <Card title="SAGRES Farmácia — TCE-PB"><p>A validação e a geração do arquivo SAGRES Farmácia da competência ficam em <Link href="/prestacao-contas" className="underline">Prestação de Contas</Link>.</p></Card>
      </div>}
    </PageFrame>
  );
}
