"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { ActionButtons } from "./ActionButtons";
import { EditRequestSheet } from "./EditRequestSheet";
import { deleteEnvRequest, updateEnvRequestStatus } from "../actions";

interface EnvRequest {
  id: string;
  requestType: string;
  description: string;
  address: string | null;
  requesterName: string | null;
  status: string;
}

export function RequestRowActions({ request }: { request: EnvRequest }) {
  const [editOpen, setEditOpen] = useState(false);

  const handleStatusUpdate = async (status: "Autorizado" | "Negado") => {
    if (!confirm(`Deseja marcar esta solicitação como ${status.toLowerCase()}?`)) return;
    await updateEnvRequestStatus(request.id, status);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => handleStatusUpdate("Autorizado")}
          title="Autorizar"
          className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50"
          aria-label="Autorizar solicitação"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleStatusUpdate("Negado")}
          title="Negar"
          className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
          aria-label="Negar solicitação"
        >
          <XCircle className="h-4 w-4" />
        </button>
        <ActionButtons id={request.id} onEdit={() => setEditOpen(true)} onDelete={deleteEnvRequest} deleteLabel="Excluir Solicitação" />
      </div>
      <EditRequestSheet request={request} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
