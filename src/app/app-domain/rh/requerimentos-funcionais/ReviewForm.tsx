"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { decideFunctionalRequestAction, requestFunctionalComplementAction } from "../servicos-funcionais/actions";

export function FunctionalReviewForm({ requestId }: { requestId: string }) {
  const router = useRouter(); const [pending, setPending] = useState(false), [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setPending(true); setError("");
    try {
      const status = String(data.get("status")), decision = String(data.get("decision") || "");
      const result = status === "COMPLEMENTO" ? await requestFunctionalComplementAction({ requestId, instructions: decision }) : await decideFunctionalRequestAction({ requestId, status, decision });
      if (result.error) setError(result.error); else router.refresh();
    } catch { setError("Não foi possível registrar a análise."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="mt-3 grid gap-2 rounded border border-slate-300 bg-slate-50 p-3 text-xs"><label htmlFor={`result-${requestId}`} className="font-semibold">Resultado da análise</label><select id={`result-${requestId}`} name="status" disabled={pending} className="h-8 rounded border bg-white px-2"><option value="COMPLEMENTO">Solicitar complementação</option><option value="DEFERIDA">Deferir e executar a providência</option><option value="INDEFERIDA">Indeferir</option></select><label htmlFor={`decision-${requestId}`}>Fundamento da decisão ou instruções ao requerente</label><textarea id={`decision-${requestId}`} name="decision" required minLength={10} maxLength={4000} disabled={pending} rows={4} className="rounded border bg-white p-2" />{error && <p role="alert" className="text-red-700">{error}</p>}<Button disabled={pending} className="w-fit">{pending ? "Processando…" : "Registrar análise"}</Button></form>;
}
