"use client";
import { useState, useTransition } from "react";
import { requestRecertificationCorrectionAction } from "./actions";

export function RecertificationCorrectionForm({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition(), [error, setError] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setError("");
    startTransition(async () => { try { const result = await requestRecertificationCorrectionAction({ requestId, instructions: String(data.get("instructions")) }); setError(result.error); } catch { setError("Não foi possível solicitar correção."); } });
  }
  return <form onSubmit={submit} className="mt-3 space-y-2"><label className="flex flex-col gap-1">Pendência para correção<textarea name="instructions" required minLength={10} maxLength={4000} disabled={pending} className="rounded border p-2" /></label><button disabled={pending} className="rounded border px-3 py-2 font-semibold">{pending ? "Registrando…" : "Devolver para correção"}</button>{error && <p role="alert" className="text-red-700">{error}</p>}</form>;
}
