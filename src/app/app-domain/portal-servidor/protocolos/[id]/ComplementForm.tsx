"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { complementMyFunctionalRequest } from "../../servicos/actions";

export function ComplementForm({ requestId, requestKey }: { requestId: string; requestKey: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget); setPending(true); setError("");
    try {
      const result = await complementMyFunctionalRequest({ requestId, requestKey, description: String(data.get("description") || "") });
      if (result.error) setError(result.error); else router.refresh();
    } catch { setError("Não foi possível enviar o complemento."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="space-y-2 rounded border border-amber-300 bg-amber-50 p-3"><label htmlFor="functional-complement" className="text-sm font-semibold">Responder à pendência</label><textarea id="functional-complement" name="description" required minLength={10} maxLength={4000} rows={4} disabled={pending} className="w-full rounded border border-slate-300 bg-white p-2 text-sm" />{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<Button disabled={pending}>{pending ? "Enviando…" : "Enviar complemento"}</Button></form>;
}
