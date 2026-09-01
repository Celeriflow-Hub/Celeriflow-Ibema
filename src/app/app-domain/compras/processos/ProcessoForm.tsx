"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePurchaseProcess } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type ProcessItem = {
  catalogItemId: string;
  customName: string;
  quantity: number;
  estimatedUnitValue: number;
};

type ProcessData = {
  id: string;
  number: string;
  type: string;
  modality: string | null;
  object: string;
  estimatedValue: number | null;
  items?: ProcessItem[];
  purchaseRequestId?: string | null;
};

type CatalogItemOption = {
  id: string;
  code?: string | null;
  name: string;
  estimatedValue?: number | null;
};

type ProcessoFormProps = {
  data?: ProcessData;
  catalogItems?: CatalogItemOption[];
  purchaseRequests?: { id: string; number: string; object: string }[];
};

export function ProcessoForm({ data, catalogItems = [], purchaseRequests = [] }: ProcessoFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const [items, setItems] = useState<ProcessItem[]>(data?.items || []);
  const [purchaseRequestId, setPurchaseRequestId] = useState(data?.purchaseRequestId || "");
  const estimatedTotal = items.length > 0
    ? items.reduce((acc, curr) => acc + (curr.quantity * (curr.estimatedUnitValue || 0)), 0)
    : data?.estimatedValue || 0;

  const handleAddItem = () => {
    setItems([...items, { catalogItemId: "", customName: "", quantity: 1, estimatedUnitValue: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = <Field extends keyof ProcessItem>(index: number, field: Field, value: ProcessItem[Field]) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto fill unit value if catalog item is selected
    if (field === 'catalogItemId' && value !== 'custom') {
      const catalogItem = catalogItems.find(c => c.id === value);
      if (catalogItem && catalogItem.estimatedValue) {
        newItems[index].estimatedUnitValue = catalogItem.estimatedValue;
      }
      newItems[index].customName = ""; // clear custom name if selecting catalog
    }
    
    setItems(newItems);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      id: data?.id,
      number: String(formData.get("number") ?? ""),
      type: String(formData.get("type") ?? ""),
      modality: String(formData.get("modality") ?? ""),
      object: String(formData.get("object") ?? ""),
      estimatedValue: parseFloat(formData.get("estimatedValue") as string) || estimatedTotal,
      items,
      purchaseRequestId,
    };

    const result = await savePurchaseProcess(payload);
    setIsSaving(false);
    
    if (result.success) {
      router.push("/compras/processos");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <PageFrame className="space-y-2">
      <PageHeader title={data ? "Editar Processo" : "Novo Processo"} action={<Link href="/compras/processos" aria-label="Voltar"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link>} />

      <Card className="max-w-5xl rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Dados do Processo de Compra</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="number">Número do Processo</Label>
                <Input id="number" name="number" defaultValue={data?.number || ""} placeholder="Ex: PROC-2026-001 (Auto-gerado se vazio)" />
              </div>
              <div className="space-y-2">
                <Label>Valor Estimado Total (R$)</Label>
                <div className="text-2xl font-bold text-slate-700 h-10 flex items-center">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedTotal)}
                </div>
                <input type="hidden" name="estimatedValue" value={estimatedTotal} />
              </div>
            </div>

            {!data && (
              <div className="space-y-2">
                <Label htmlFor="purchaseRequestId">Solicitação aprovada de origem</Label>
                <Select value={purchaseRequestId} onValueChange={(value) => setPurchaseRequestId(value ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Selecione a solicitação aprovada" /></SelectTrigger>
                  <SelectContent>
                    {purchaseRequests.map((request) => <SelectItem key={request.id} value={request.id}>{request.number} - {request.object}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Os itens canônicos da solicitação aprovada serão copiados sem substituir IDs de catálogo ou material.</p>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Input id="type" name="type" defaultValue={data?.type || ""} required placeholder="Ex: Comum, Registro de Preços" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modality">Modalidade</Label>
                <Input id="modality" name="modality" defaultValue={data?.modality || ""} required placeholder="Ex: Pregão Eletrônico, Dispensa" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="object">Objeto</Label>
              <Textarea id="object" name="object" defaultValue={data?.object || ""} required rows={3} />
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Itens do Processo</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-6 text-slate-500 border rounded-lg bg-slate-50">
                  Nenhum item adicionado. Clique em &quot;Adicionar Item&quot;.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="relative flex items-start gap-3 rounded-md border bg-slate-50 p-3">
                      <div className="grid flex-1 grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-6 space-y-2">
                          <Label>Produto ou Serviço *</Label>
                          <Select 
                            value={item.catalogItemId || (item.customName ? "custom" : "")} 
                            onValueChange={(val) => updateItem(index, 'catalogItemId', val ?? "")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione do Catálogo ou Serviço Customizado..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">-- Serviço / Item Fora do Catálogo --</SelectItem>
                              {catalogItems.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.code ? `[${c.code}] ` : ''}{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {item.catalogItemId === "custom" && (
                            <Input 
                              placeholder="Descreva o serviço ou item..." 
                              value={item.customName} 
                              onChange={(e) => updateItem(index, 'customName', e.target.value)}
                              className="mt-2"
                              required
                            />
                          )}
                        </div>
                        <div className="col-span-6 md:col-span-3 space-y-2">
                          <Label>Quantidade *</Label>
                          <Input 
                            type="number" 
                            min="0.01" 
                            step="0.01" 
                            value={item.quantity} 
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} 
                            required 
                          />
                        </div>
                        <div className="col-span-6 md:col-span-3 space-y-2">
                          <Label>Valor Unit. (R$)</Label>
                          <MoneyInput 
                            value={item.estimatedUnitValue || 0} 
                            onChange={(val) => updateItem(index, 'estimatedUnitValue', val)} 
                          />
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 mt-6"
                        onClick={() => handleRemoveItem(index)}
                        title="Remover Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Link href="/compras/processos">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Processo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageFrame>
  );
}
