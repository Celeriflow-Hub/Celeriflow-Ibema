"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createEnvRequest } from "../actions";

export function NewRequestSheet() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createEnvRequest(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<button className="flex h-8 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700" />}>
        <FileText className="h-5 w-5" />
        Nova Solicitação
      </SheetTrigger>
      <SheetContent side="right" className="w-[calc(100vw-1rem)] overflow-y-auto sm:w-[34rem]">
        <SheetHeader>
          <SheetTitle>Registrar Solicitação Ambiental</SheetTitle>
          <SheetDescription>
            Cadastre uma nova solicitação de poda, supressão ou autorização.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 pb-2">
          {error && <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Solicitação</label>
            <select name="requestType" className="w-full rounded-md border p-2" required>
              <option value="">Selecione...</option>
              <option value="Poda">Poda</option>
              <option value="Supressão">Supressão</option>
              <option value="Autorização">Autorização</option>
              <option value="Análise de Projeto">Análise de Projeto</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Solicitante</label>
            <input name="requesterName" className="w-full rounded-md border p-2" placeholder="Nome do solicitante" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição / Requerimento</label>
            <textarea name="description" required className="w-full rounded-md border p-2" rows={4} placeholder="Descreva o pedido e sua justificativa..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço / Local</label>
            <input name="address" className="w-full rounded-md border p-2" placeholder="Rua, lote, bairro ou referência" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status inicial</label>
            <select name="status" defaultValue="Solicitado" className="w-full rounded-md border p-2">
              <option value="Solicitado">Solicitado</option>
              <option value="Em Vistoria">Em Vistoria</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Autorizado">Autorizado</option>
              <option value="Negado">Negado</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setOpen(false)} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
              {loading ? "Salvando..." : "Salvar Solicitação"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
