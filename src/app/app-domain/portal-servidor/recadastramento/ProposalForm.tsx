"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitMyRecertification } from "./actions";

const labels: Record<string, string> = { email: "E-mail", phonePrimary: "Telefone principal", phoneSecondary: "Telefone secundário", whatsapp: "WhatsApp", maritalStatus: "Estado civil", profession: "Profissão", educationLevel: "Escolaridade" };
export function ProposalForm({ campaignRuleId, values }: { campaignRuleId: string; values: Record<string, string> }) {
  const [message, setMessage] = useState(""); const [pending, setPending] = useState(false); const router = useRouter();
  async function submit(data: FormData) {
    setPending(true);
    try {
      const result = await submitMyRecertification(Object.fromEntries([...data].map(([key, value]) => [key, String(value)])));
      setMessage(result.error || `Proposta registrada: ${result.id}`); if (!result.error) router.refresh();
    } catch { setMessage("Falha de comunicação. Consulte o pedido antes de repetir."); } finally { setPending(false); }
  }
  return <form action={submit} className="mt-2 grid gap-2 text-xs sm:grid-cols-3"><input type="hidden" name="campaignRuleId" value={campaignRuleId} />{Object.entries(values).map(([name, value]) => <label key={name}>{labels[name]}<input name={name} type={name === "email" ? "email" : "text"} defaultValue={value} maxLength={250} className="mt-1 block h-8 w-full rounded border px-2" /></label>)}<button disabled={pending} className="rounded bg-blue-700 px-3 py-2 text-white">{pending ? "Enviando…" : "Enviar proposta para análise"}</button>{message && <p role="status" className="sm:col-span-3">{message}</p>}</form>;
}
