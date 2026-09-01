"use client";

import { useState } from "react";
import { ArrowRightLeft, RotateCcw, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collectRevenueAction, launchRevenueAction, recordRevenueCollectionAction, redistributeRevenueResourceSourceAction, reverseRevenueAction } from "./actions";

type Revenue = {
  id: string; date: string; value: number; stage: "LANCADA" | "ARRECADADA" | "ESTORNADA"; classification: "ORCAMENTARIA" | "INTRAORCAMENTARIA" | "REDUTORA"; history: string | null;
  revenueNature: { code: string; name: string }; resourceSource: { code: string; name: string }; resourceSourceId: string; redistributedValue: number; hasReversal: boolean;
};

const today = () => new Date().toISOString().slice(0, 10);
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const stageLabel = { LANCADA: "Lancada", ARRECADADA: "Arrecadada", ESTORNADA: "Estornada" };
const classificationLabel = { ORCAMENTARIA: "Orcamentaria", INTRAORCAMENTARIA: "Intraorcamentaria", REDUTORA: "Redutora" };

export default function ReceitasClient({ revenues, revenueNatures, resourceSources, bankAccounts }: {
  revenues: Revenue[];
  revenueNatures: { id: string; code: string; name: string }[];
  resourceSources: { id: string; code: string; name: string }[];
  bankAccounts: { id: string; bankName: string; agency: string; accountNumber: string; resourceSourceId: string | null; isActive: boolean }[];
}) {
  const [mode, setMode] = useState<"LANCAR" | "ARRECADAR">("ARRECADAR");
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ date: today(), value: 0, revenueNatureId: "", resourceSourceId: "", classification: "ORCAMENTARIA" as Revenue["classification"], bankAccountId: "", history: "" });

  async function submit() {
    setPending(true);
    const result = mode === "LANCAR"
      ? await launchRevenueAction(form)
      : await recordRevenueCollectionAction(form);
    setPending(false);
    if (result.error) return alert(result.error);
    setForm({ ...form, value: 0, history: "" });
  }

  async function collect(revenue: Revenue) {
    const bankAccountId = window.prompt("Informe o ID da conta bancaria para arrecadacao:");
    if (!bankAccountId) return;
    const result = await collectRevenueAction({ revenueId: revenue.id, date: today(), bankAccountId });
    if (result.error) alert(result.error);
  }

  async function reverse(revenue: Revenue) {
    const justification = window.prompt("Justificativa obrigatoria para o estorno:");
    if (!justification) return;
    const result = await reverseRevenueAction({ revenueId: revenue.id, date: today(), justification });
    if (result.error) alert(result.error);
  }

  async function redistribute(revenue: Revenue) {
    const destinationResourceSourceId = window.prompt("ID da fonte de destino:");
    const rawValue = window.prompt("Valor a redistribuir:");
    const history = window.prompt("Historico da redistribuicao:");
    if (!destinationResourceSourceId || !rawValue || !history) return;
    const result = await redistributeRevenueResourceSourceAction({ revenueId: revenue.id, date: today(), value: Number(rawValue.replace(",", ".")), destinationResourceSourceId, history });
    if (result.error) alert(result.error);
  }

  const compatibleAccounts = bankAccounts.filter((account) => account.isActive && account.resourceSourceId === form.resourceSourceId);
  return <main className="space-y-2 px-1 py-1 sm:px-2">
    <header className="border-b border-slate-300 bg-white px-3 py-2 shadow-sm"><h1 className="text-sm font-bold tracking-tight text-slate-900">Receitas</h1><p className="text-xs text-muted-foreground">Lançamento, arrecadação, classificação e controles internos por fonte.</p></header>
    <Card size="sm" className="rounded-md shadow-none">
      <CardHeader className="border-b pb-2"><CardTitle>Registro de Receita</CardTitle><CardDescription>Lance ou arrecade valores com a fonte e conta bancária compatíveis.</CardDescription></CardHeader>
      <CardContent className="space-y-3 pt-3">
        <div className="flex flex-wrap gap-1.5"><Button size="sm" variant={mode === "ARRECADAR" ? "default" : "outline"} onClick={() => setMode("ARRECADAR")}>Arrecadar agora</Button><Button size="sm" variant={mode === "LANCAR" ? "default" : "outline"} onClick={() => setMode("LANCAR")}>Lancamento previo</Button></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div><Label>Data</Label><Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div>
          <div><Label>Natureza</Label><Select items={revenueNatures.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))} value={form.revenueNatureId} onValueChange={(revenueNatureId) => { if (revenueNatureId) setForm({ ...form, revenueNatureId }); }}><SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent className="max-h-[300px] !w-auto min-w-[var(--anchor-width)]">{revenueNatures.map((item) => <SelectItem key={item.id} value={item.id}>{item.code} - {item.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Fonte</Label><Select items={resourceSources.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))} value={form.resourceSourceId} onValueChange={(resourceSourceId) => { if (resourceSourceId) setForm({ ...form, resourceSourceId, bankAccountId: "" }); }}><SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent className="max-h-[300px] !w-auto min-w-[var(--anchor-width)]">{resourceSources.map((item) => <SelectItem key={item.id} value={item.id}>{item.code} - {item.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Classificacao</Label><Select value={form.classification} onValueChange={(classification) => setForm({ ...form, classification: classification as Revenue["classification"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(classificationLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Valor</Label><MoneyInput value={form.value} onChange={(value) => setForm({ ...form, value })} /></div>
          {mode === "ARRECADAR" && <div><Label>Conta bancaria compativel</Label><Select value={form.bankAccountId} onValueChange={(bankAccountId) => { if (bankAccountId) setForm({ ...form, bankAccountId }); }}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{compatibleAccounts.map((item) => <SelectItem key={item.id} value={item.id}>{item.bankName} {item.agency}/{item.accountNumber}</SelectItem>)}</SelectContent></Select></div>}
        </div>
        <div><Label>Historico</Label><Input value={form.history} onChange={(event) => setForm({ ...form, history: event.target.value })} /></div>
        <Button disabled={pending} onClick={submit}>{pending ? "Registrando..." : mode === "LANCAR" ? "Lancar receita" : "Arrecadar receita"}</Button>
      </CardContent>
    </Card>
    <Card size="sm" className="rounded-md shadow-none"><CardHeader className="border-b pb-2"><CardTitle>Últimas receitas</CardTitle><CardDescription>Estornos preservam a receita de origem; redistribuições não alteram o caixa.</CardDescription></CardHeader><CardContent className="overflow-x-auto pt-3"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Data</th><th className="p-2">Natureza</th><th className="p-2">Fonte</th><th className="p-2">Valor</th><th className="p-2">Situacao</th><th className="p-2">Acoes</th></tr></thead><tbody>{revenues.map((revenue) => <tr key={revenue.id} className="border-b"><td className="p-2">{new Date(revenue.date).toLocaleDateString("pt-BR")}</td><td className="p-2">{revenue.revenueNature.code} - {revenue.revenueNature.name}</td><td className="p-2">{revenue.resourceSource.code}</td><td className="p-2">{currency.format(revenue.value)}</td><td className="p-2"><Badge variant="outline">{stageLabel[revenue.stage]}</Badge> <span className="text-muted-foreground">{classificationLabel[revenue.classification]}</span></td><td className="flex gap-1 p-2">{revenue.stage === "LANCADA" && <Button size="sm" variant="outline" onClick={() => collect(revenue)}><WalletCards className="mr-1 h-3 w-3" />Arrecadar</Button>}{revenue.stage === "ARRECADADA" && <><Button size="sm" variant="outline" onClick={() => redistribute(revenue)}><ArrowRightLeft className="mr-1 h-3 w-3" />Fonte</Button><Button size="sm" variant="outline" disabled={revenue.redistributedValue > 0} onClick={() => reverse(revenue)}><RotateCcw className="mr-1 h-3 w-3" />Estornar</Button></>}</td></tr>)}</tbody></table></CardContent></Card>
  </main>;
}
