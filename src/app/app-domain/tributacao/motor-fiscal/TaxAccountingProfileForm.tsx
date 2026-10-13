"use client";

import { useState, useTransition } from "react";
import { saveTaxAccountingProfileAction } from "../operacoes/actions";

type Option = { id: string; label: string };
type Catalog = Option & { accounts: Array<Option & { nature: string }> };
export function TaxAccountingProfileForm({ taxes, units, catalogs, profiles }: { taxes: Option[]; units: Option[]; catalogs: Catalog[]; profiles: Array<Option & { taxId: string; budgetUnitId: string; from: string; until: string | null; version: number }> }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [catalogId, setCatalogId] = useState("");
  const [key, setKey] = useState("");
  const accounts = catalogs.find(catalog => catalog.id === catalogId)?.accounts ?? [];
  return <details className="shrink-0 rounded-md border border-slate-200 bg-white p-2.5">
    <summary className="cursor-pointer text-xs font-bold text-slate-700">Perfis contábeis tributários por unidade gestora</summary>
    <p className="mt-2 text-xs text-slate-600">Cada edição preserva contas e vigência. Novas constituições usam o perfil vigente; operações posteriores conservam as contas da origem reconhecida.</p>
    <form className="mt-2 grid gap-2 sm:grid-cols-3" action={form => {
      const requestKey = key || crypto.randomUUID();
      setKey(requestKey);
      const value = (name: string) => String(form.get(name) || "");
      startTransition(async () => {
        const result = await saveTaxAccountingProfileAction({ taxId: value("taxId"), budgetUnitId: value("budgetUnitId"), catalogVersionId: catalogId, receivableAccountId: value("receivableAccountId"), revenueAccountId: value("revenueAccountId"), deductionAccountId: value("deductionAccountId"), lossAccountId: value("lossAccountId"), effectiveFrom: value("effectiveFrom"), effectiveUntil: value("effectiveUntil"), reason: value("reason"), supersedesEntryId: value("supersedesEntryId") || undefined, idempotencyKey: requestKey });
        setMessage(result.error ?? "Edição registrada com histórico e auditoria.");
        if (!result.error) setKey("");
      });
    }}>
      <select name="taxId" aria-label="Tributo do perfil" required className="h-8 rounded border px-2 text-xs"><option value="">Tributo</option>{taxes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="budgetUnitId" aria-label="Unidade gestora do perfil" required className="h-8 rounded border px-2 text-xs"><option value="">Unidade gestora</option>{units.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select value={catalogId} onChange={event => setCatalogId(event.target.value)} aria-label="Edição contábil publicada" required className="h-8 rounded border px-2 text-xs"><option value="">Edição municipal publicada</option>{catalogs.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      {([ ["receivableAccountId", "Direito a receber", "D"], ["revenueAccountId", "VPA", "C"], ["deductionAccountId", "Dedução da VPA", "D"], ["lossAccountId", "Desincorporação", "D"] ] as const).map(([name, label, nature]) => <select key={`${catalogId}:${name}`} name={name} aria-label={label} required className="h-8 rounded border px-2 text-xs"><option value="">{label}</option>{accounts.filter(item => item.nature === nature).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>)}
      <label className="text-xs">Início da vigência<input name="effectiveFrom" type="date" required className="ml-2 h-8 rounded border px-2" /></label>
      <label className="text-xs">Fim da vigência<input name="effectiveUntil" type="date" required className="ml-2 h-8 rounded border px-2" /></label>
      <select name="supersedesEntryId" aria-label="Edição substituída" className="h-8 rounded border px-2 text-xs"><option value="">Novo perfil sem sobreposição</option>{profiles.map(item => <option key={item.id} value={item.id}>{item.label} · v{item.version} · {item.from}</option>)}</select>
      <input name="reason" aria-label="Fundamento do perfil" required minLength={10} maxLength={2000} placeholder="Fundamento da parametrização" className="h-8 rounded border px-2 text-xs sm:col-span-2" />
      <button disabled={pending || !catalogId || !units.length} className="h-8 rounded bg-slate-700 px-3 text-xs font-semibold text-white disabled:opacity-50">Registrar edição</button>
    </form>
    {message && <p role="status" className="mt-2 text-xs">{message}</p>}
    <ul className="mt-2 max-h-32 overflow-auto text-xs text-slate-600">{profiles.map(item => <li key={item.id}>{item.label} · v{item.version} · {item.from} a {item.until ?? "sem término"}</li>)}</ul>
  </details>;
}
