"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acquireAssetFromReceiptAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type ReceiptItem = { id: string; label: string; remaining: number };
type Option = { id: string; name: string };

export function AssetReceiptForm({ receiptItems, categories, departments, employees }: { receiptItems: ReceiptItem[]; categories: Option[]; departments: Option[]; employees: Option[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [data, setData] = useState({ purchaseReceiptItemId: "", patrimonyNumber: "", name: "", categoryId: "", departmentId: "", responsibleId: "", brand: "", model: "", serialNumber: "" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await acquireAssetFromReceiptAction(data);
    setPending(false);
    if (result.error) return alert(result.error);
    router.push("/patrimonio/bens");
  }

  return (
    <PageFrame className="max-w-5xl space-y-2">
      <PageHeader title="Tombar Bem Recebido" action={<Link href="/patrimonio/bens" aria-label="Voltar"><Button variant="outline" size="sm">Cancelar</Button></Link>} />
      <p className="text-xs text-muted-foreground">Cada tombamento deve ser vinculado a um item de recebimento aprovado.</p>
      <form onSubmit={submit} className="grid gap-3 rounded-md border bg-white p-3 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2"><Label>Item recebido</Label><Select value={data.purchaseReceiptItemId} onValueChange={(purchaseReceiptItemId) => setData({ ...data, purchaseReceiptItemId: purchaseReceiptItemId ?? "" })}><SelectTrigger><SelectValue placeholder="Selecione o item recebido" /></SelectTrigger><SelectContent>{receiptItems.map((item) => <SelectItem key={item.id} value={item.id}>{item.label} ({item.remaining} disponível)</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Número de tombamento</Label><Input required value={data.patrimonyNumber} onChange={(event) => setData({ ...data, patrimonyNumber: event.target.value })} /></div>
        <div className="space-y-2"><Label>Nome do bem</Label><Input required value={data.name} onChange={(event) => setData({ ...data, name: event.target.value })} /></div>
        <div className="space-y-2"><Label>Categoria patrimonial</Label><Select value={data.categoryId} onValueChange={(categoryId) => setData({ ...data, categoryId: categoryId ?? "" })}><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Setor responsável</Label><Select value={data.departmentId} onValueChange={(departmentId) => setData({ ...data, departmentId: departmentId ?? "" })}><SelectTrigger><SelectValue placeholder="Não alocar agora" /></SelectTrigger><SelectContent>{departments.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Marca</Label><Input value={data.brand} onChange={(event) => setData({ ...data, brand: event.target.value })} /></div>
        <div className="space-y-2"><Label>Modelo</Label><Input value={data.model} onChange={(event) => setData({ ...data, model: event.target.value })} /></div>
        <div className="space-y-2"><Label>Número de série</Label><Input value={data.serialNumber} onChange={(event) => setData({ ...data, serialNumber: event.target.value })} /></div>
        <div className="space-y-2"><Label>Servidor responsável</Label><Select value={data.responsibleId} onValueChange={(responsibleId) => setData({ ...data, responsibleId: responsibleId ?? "" })}><SelectTrigger><SelectValue placeholder="Não atribuir agora" /></SelectTrigger><SelectContent>{employees.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex justify-end gap-2 border-t pt-3 md:col-span-2"><Link href="/patrimonio/bens"><Button type="button" variant="outline">Cancelar</Button></Link><Button type="submit" disabled={pending || !data.purchaseReceiptItemId || !data.categoryId}>{pending ? "Tombando..." : "Registrar tombamento"}</Button></div>
      </form>
    </PageFrame>
  );
}
