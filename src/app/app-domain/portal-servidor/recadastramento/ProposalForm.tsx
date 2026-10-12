"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitMyRecertification } from "./actions";

const labels: Record<string, string> = { email: "E-mail cadastral", emailSecondary: "E-mail secundário", phonePrimary: "Telefone principal", phoneSecondary: "Telefone secundário", whatsapp: "WhatsApp", maritalStatus: "Estado civil", profession: "Profissão", educationLevel: "Escolaridade", socialName: "Nome social", rg: "RG", rgIssuer: "Órgão emissor do RG", motherName: "Filiação materna", fatherName: "Filiação paterna", nationality: "Nacionalidade", birthPlace: "Naturalidade", gender: "Gênero", raceColor: "Raça/cor" };
export function ProposalForm({ campaignRuleId, values }: { campaignRuleId: string; values: Record<string, string> }) {
  const [message, setMessage] = useState(""); const [pending, setPending] = useState(false); const router = useRouter();
  async function submit(data: FormData) {
    setPending(true);
    try {
      const result = await submitMyRecertification(Object.fromEntries([...data].map(([key, value]) => [key, String(value)])));
      setMessage(result.error || `Proposta registrada: ${result.id}`); if (!result.error) router.refresh();
    } catch { setMessage("Falha de comunicação. Consulte o pedido antes de repetir."); } finally { setPending(false); }
  }
  return <form action={submit} className="mt-2 grid gap-2 text-xs sm:grid-cols-3"><input type="hidden" name="campaignRuleId" value={campaignRuleId} />{Object.entries(values).map(([name, value]) => <label key={name}>{labels[name] || name}<input name={name} type={name === "email" || name === "emailSecondary" ? "email" : "text"} defaultValue={value} maxLength={250} disabled={pending} className="mt-1 block h-8 w-full rounded border px-2" /></label>)}<p className="text-slate-600 sm:col-span-3">Alterar o e-mail cadastral não altera sua credencial de acesso institucional. A proposta permanece separada do cadastro até a conferência do RH.</p><button disabled={pending} className="rounded bg-blue-700 px-3 py-2 text-white">{pending ? "Enviando…" : "Enviar proposta para análise"}</button>{message && <p role="status" className="sm:col-span-3">{message}</p>}</form>;
}
