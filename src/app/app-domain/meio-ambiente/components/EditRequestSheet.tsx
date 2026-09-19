"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { updateEnvRequest } from "../actions";

interface EnvRequest {
  id: string;
  requestType: string;
  description: string;
  address: string | null;
  requesterName: string | null;
  status: string;
}

interface EditRequestSheetProps {
  request: EnvRequest;
  open: boolean;
  onClose: () => void;
}

export function EditRequestSheet({ request, open, onClose }: EditRequestSheetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await updateEnvRequest(request.id, formData);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[calc(100vw-1rem)] overflow-y-auto sm:w-[34rem]">
        <SheetHeader>
          <SheetTitle>Editar Solicitação</SheetTitle>
          <SheetDescription>Atualize os dados e o status do requerimento ambiental.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 pb-2">
          {error && <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <select name="requestType" defaultValue={request.requestType} className="w-full rounded-md border p-2 text-sm">
              <option value="Poda">Poda</option>
              <option value="Supressão">Supressão</option>
              <option value="Autorização">Autorização</option>
              <option value="Análise de Projeto">Análise de Projeto</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Solicitante</label>
            <input name="requesterName" defaultValue={request.requesterName || ""} className="w-full rounded-md border p-2 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea name="description" defaultValue={request.description} className="w-full rounded-md border p-2 text-sm" rows={4} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço</label>
            <input name="address" defaultValue={request.address || ""} className="w-full rounded-md border p-2 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select name="status" defaultValue={request.status} className="w-full rounded-md border p-2 text-sm">
              <option value="Solicitado">Solicitado</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Em Vistoria">Em Vistoria</option>
              <option value="Autorizado">Autorizado</option>
              <option value="Negado">Negado</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={loading} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
