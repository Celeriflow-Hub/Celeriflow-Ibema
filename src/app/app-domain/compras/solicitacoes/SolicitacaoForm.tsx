"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePurchaseRequest } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type RequestItem = {
  catalogItemId: string;
  customName: string;
  quantity: number;
  estimatedUnitValue: number;
};

type RequestData = {
  id: string;
  number: string;
  secretariatId: string;
  departmentId: string;
  object: string;
  justification: string;
  estimatedValue: number | null;
  items?: RequestItem[];
};

type CatalogItemOption = {
  id: string;
  code?: string | null;
  name: string;
  estimatedValue?: number | null;
};

type SecretariatOption = { id: string; name: string };
type DepartmentOption = { id: string; name: string; secretariatId: string };

type SolicitacaoFormProps = {
  data?: RequestData;
  catalogItems?: CatalogItemOption[];
  secretarias?: SecretariatOption[];
  departments?: DepartmentOption[];
};

export function SolicitacaoForm({ data, catalogItems = [], secretarias = [], departments = [] }: SolicitacaoFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const [items, setItems] = useState<RequestItem[]>(data?.items || []);
  const [secretariatId, setSecretariatId] = useState(data?.secretariatId || "");
  const [departmentId, setDepartmentId] = useState(data?.departmentId || "");
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

  const updateItem = <Field extends keyof RequestItem>(index: number, field: Field, value: RequestItem[Field]) => {
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
      object: String(formData.get("object") ?? ""),
      justification: String(formData.get("justification") ?? ""),
      estimatedValue: parseFloat(formData.get("estimatedValue") as string) || estimatedTotal,
      items,
      secretariatId,
      departmentId,
    };

    const result = await savePurchaseRequest(payload);
    setIsSaving(false);
    
    if (result.success) {
      router.push("/compras/solicitacoes");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <PageFrame className="space-y-2">
      <PageHeader title={data ? "Editar Solicitação" : "Nova Solicitação"} action={<Link href="/compras/solicitacoes" aria-label="Voltar"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link>} />

      <Card className="max-w-5xl rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Dados da Solicitação</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="number">Número da Solicitação</Label>
                <Input id="number" name="number" defaultValue={data?.number || ""} placeholder="Ex: REQ-2026-001 (Auto-gerado se vazio)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretariatId">Secretaria</Label>
                <Select value={secretariatId} onValueChange={(value) => { setSecretariatId(value ?? ""); setDepartmentId(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a Secretaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {secretarias.map(sec => (
                      <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departamento</Label>
                <Select value={departmentId} onValueChange={(value) => setDepartmentId(value ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter((department) => department.secretariatId === secretariatId).map((department) => (
                      <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor Estimado Total (R$)</Label>
              <div className="text-2xl font-bold text-slate-700">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedTotal)}
              </div>
              <input type="hidden" name="estimatedValue" value={estimatedTotal} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="object">Objeto / Finalidade Geral</Label>
              <Input id="object" name="object" defaultValue={data?.object || ""} required placeholder="Resumo do que está sendo solicitado" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justificativa</Label>
              <Textarea id="justification" name="justification" defaultValue={data?.justification || ""} required rows={3} placeholder="Por que essa contratação/compra é necessária?" />
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Itens da Solicitação</h3>
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
              <Link href="/compras/solicitacoes">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Solicitação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageFrame>
  );
}
