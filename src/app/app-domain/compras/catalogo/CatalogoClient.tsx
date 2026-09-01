"use client";

import { useState } from "react";
import { FileText, Plus, Search, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveCatalogItem, toggleCatalogItemStatus } from "./actions";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type CatalogItem = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  category: string | null;
  unit: string;
  estimatedValue: number | null;
  isActive: boolean;
};

export default function CatalogoClient({ items }: { items: CatalogItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category: "",
    unit: "UN",
    estimatedValue: 0,
    isActive: true
  });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      category: "",
      unit: "UN",
      estimatedValue: 0,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setFormData({
      code: item.code || "",
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      unit: item.unit,
      estimatedValue: item.estimatedValue || 0,
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = {
        id: editingId,
        ...formData
      };
      const result = await saveCatalogItem(dataToSave);
      if (result.success) {
        setIsModalOpen(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error saving catalog item:", error);
      alert("Ocorreu um erro ao salvar o item do catálogo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (window.confirm(`Deseja ${currentStatus ? 'inativar' : 'ativar'} este item?`)) {
      await toggleCatalogItemStatus(id, !currentStatus);
    }
  };

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Catálogo de Itens" icon={<FileText className="size-4 shrink-0 text-emerald-600" />} action={<Button size="sm" onClick={handleOpenNew}><Plus className="size-3.5" /><span className="hidden sm:inline">Novo Item</span></Button>} />

      <Card className="rounded-md">
        <CardHeader className="flex flex-col gap-2 space-y-0 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm">Itens Cadastrados</CardTitle>
            <CardDescription className="text-xs">
              Lista de todos os itens disponíveis no catálogo.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou código..." 
                className="w-full pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mb-4 opacity-20" />
              <p>Nenhum item encontrado.</p>
              <p className="text-sm">Tente mudar sua busca ou clique em &quot;Novo Item&quot;.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome / Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Valor Est.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code || '-'}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]" title={item.description || ''}>
                          {item.description || 'Sem descrição'}
                        </div>
                      </TableCell>
                      <TableCell>{item.category || '-'}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        {item.estimatedValue ? 
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.estimatedValue) 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? 'default' : 'secondary'}>
                          {item.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(item.id, item.isActive)} title={item.isActive ? "Inativar" : "Ativar"}>
                          {item.isActive ? <X className="h-4 w-4 text-rose-500" /> : <Check className="h-4 w-4 text-emerald-500" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} title="Editar">
                          <Pencil className="h-4 w-4 text-amber-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Item do Catálogo" : "Novo Item do Catálogo"}</DialogTitle>
            <DialogDescription>Preencha as informações do produto, material ou serviço.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código (Opcional)</Label>
                <Input id="code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Ex: MAT-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria (Opcional)</Label>
                <Input id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Material de Expediente" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item *</Label>
              <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Papel Sulfite A4" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Especificações técnicas ou detalhes adicionais..." className="min-h-[80px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade de Medida *</Label>
                <Input id="unit" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Ex: UN, CX, PCT, L" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Valor Estimado (R$)</Label>
                <MoneyInput id="estimatedValue" value={formData.estimatedValue} onChange={val => setFormData({...formData, estimatedValue: val})} />
              </div>
            </div>

            <div className="space-y-2 flex items-center gap-2 pt-2">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded border-slate-300" />
              <Label htmlFor="isActive" className="mb-0 cursor-pointer">Item Ativo no Catálogo</Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Item"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}
