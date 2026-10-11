"use client";

import { useState } from "react";

export function CnabForm({ href }: { href: string }) {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setError(null); setInfo(null);
    const qs = new URLSearchParams(Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)])));
    const res = await fetch(`${href}&${qs}`);
    if (!res.ok) { setError((await res.json().catch(() => null))?.error ?? "Falha ao gerar a remessa."); return; }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "folha.rem";
    a.click();
    URL.revokeObjectURL(a.href);
    setInfo(`Remessa gerada com ${res.headers.get("X-Cnab-Count") ?? 0} pagamento(s).`);
  }

  const field = "h-8 rounded-md border border-slate-200 px-2 text-xs dark:border-slate-700 dark:bg-slate-950";
  return (
    <form action={submit} className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3">
      <p className="w-full text-xs font-medium">Remessa bancária CNAB 240 (pagamento de salários)</p>
      <input name="banco" placeholder="Banco (ex.: 001)" maxLength={3} required className={`${field} w-28`} />
      <input name="agencia" placeholder="Agência" required className={`${field} w-24`} />
      <input name="conta" placeholder="Conta da Prefeitura" required className={`${field} w-40`} />
      <input name="convenio" placeholder="Convênio" className={`${field} w-32`} />
      <input name="data" type="date" required className={field} />
      <button type="submit" className="h-8 rounded-md bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700">Gerar CNAB</button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
      {info && <p className="w-full text-xs text-emerald-700">{info}</p>}
    </form>
  );
}
