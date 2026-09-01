"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveContract } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type ContractData = {
  id: string;
  processId: string;
  supplierId: string;
  secretariatId: string;
  number: string;
  object: string;
  initialValue: number;
  status: string;
  startDate: Date;
  endDate: Date;
};

type ProcessOption = {
  id: string;
  number: string;
  object: string;
  estimatedValue: number | null;
};

type SecretariatOption = { id: string; name: string };

type SupplierOption = {
  id: string;
  company: { corporateName: string; tradeName: string | null } | null;
};

type ContratoFormProps = {
  data?: ContractData;
  processos?: ProcessOption[];
  secretarias?: SecretariatOption[];
  fornecedores?: SupplierOption[];
};

export function ContratoForm({ data, processos = [], secretarias = [], fornecedores = [] }: ContratoFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string>(data?.processId || "");

  const selectedProcess = processos.find(p => p.id === selectedProcessId);
  const calculatedTotal = selectedProcess?.estimatedValue ?? data?.initialValue ?? 0;
  const dateValue = (value?: Date) => value ? new Date(value).toISOString().slice(0, 10) : "";

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    formData.set("initialValue", calculatedTotal.toString());
    const result = await saveContract(formData);
    setIsSaving(false);
    
    if (result.success) {
      router.push("/compras/contratos");
    } else {
      alert(result.error);
    }
  }

  return (
    <PageFrame className="space-y-2">
      <PageHeader title={data ? "Editar Contrato" : "Novo Contrato"} action={<Link href="/compras/contratos" aria-label="Voltar"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link>} />

      <Card className="max-w-5xl rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Dados do Contrato Administrativo</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <form action={handleSubmit} className="space-y-4">
            {data && <input type="hidden" name="id" value={data.id} />}
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="number">Número do Contrato</Label>
                <Input id="number" name="number" defaultValue={data?.number || ""} placeholder="Ex: CONT 001/2026 (Auto-gerado se vazio)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processId">Processo Vinculado</Label>
                <Select name="processId" value={selectedProcessId} onValueChange={(val) => setSelectedProcessId(val || "")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o processo" />
                  </SelectTrigger>
                  <SelectContent>
                    {processos.map(proc => (
                      <SelectItem key={proc.id} value={proc.id}>{proc.number} - {proc.object?.substring(0, 30)}...</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Início da vigência</Label>
                <Input id="startDate" name="startDate" type="date" required defaultValue={dateValue(data?.startDate)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fim da vigência</Label>
                <Input id="endDate" name="endDate" type="date" required defaultValue={dateValue(data?.endDate)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Situação</Label>
                <Select name="status" defaultValue={data?.status || "Minuta"} required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minuta">Minuta</SelectItem>
                    <SelectItem value="Vigente">Vigente</SelectItem>
                    <SelectItem value="Encerrado">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplierId">Fornecedor</Label>
                <Select name="supplierId" defaultValue={data?.supplierId || ""} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map(forn => (
                      <SelectItem key={forn.id} value={forn.id}>{forn.company?.corporateName || forn.company?.tradeName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretariatId">Secretaria</Label>
                <Select name="secretariatId" defaultValue={data?.secretariatId || ""} required>
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
            </div>

            <div className="space-y-2">
              <Label>Valor Total (R$)</Label>
              <div className="text-2xl font-bold text-slate-700 h-10 flex items-center">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculatedTotal)}
              </div>
              <input type="hidden" name="initialValue" value={calculatedTotal} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="object">Objeto do Contrato</Label>
              <Textarea id="object" name="object" defaultValue={data?.object || ""} required rows={4} />
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Link href="/compras/contratos">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Contrato"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageFrame>
  );
}
