"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelPortalRequest, createPortalRequest } from "./actions";

const input = "h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs";

export function RequestForm() {
  const [kind, setKind] = useState("FERIAS");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const form = e.currentTarget;
    start(async () => {
      const r = await createPortalRequest({ ...data, kind });
      if (r.error) setMsg({ ok: false, text: r.error });
      else { setMsg({ ok: true, text: "Solicitação enviada ao RH." }); form.reset(); router.refresh(); }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2 border border-slate-300 bg-white p-3 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Nova solicitação</h2>
      <label className="block text-[11px] font-semibold text-slate-600">Tipo
        <select value={kind} onChange={(e) => { setKind(e.target.value); setMsg(null); }} className={input}>
          <option value="FERIAS">Férias</option>
          <option value="LICENCA">Licença / afastamento</option>
          <option value="ATUALIZACAO_CADASTRAL">Atualização cadastral</option>
        </select>
      </label>
      {kind === "FERIAS" && (
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px] font-semibold text-slate-600">Início<input required type="date" name="start" className={input} /></label>
          <label className="text-[11px] font-semibold text-slate-600">Dias<select name="days" defaultValue="30" className={input}>{[30, 20, 15, 10].map((d) => <option key={d}>{d}</option>)}</select></label>
        </div>
      )}
      {kind === "LICENCA" && (
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2 text-[11px] font-semibold text-slate-600">Tipo de licença
            <select name="leaveType" className={input}>{["Licença médica", "Licença maternidade", "Licença paternidade", "Licença para capacitação", "Licença sem vencimento", "Outro afastamento"].map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="text-[11px] font-semibold text-slate-600">Início<input required type="date" name="start" className={input} /></label>
          <label className="text-[11px] font-semibold text-slate-600">Fim<input required type="date" name="end" className={input} /></label>
        </div>
      )}
      {kind === "ATUALIZACAO_CADASTRAL" && (
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2 text-[11px] font-semibold text-slate-600">E-mail<input type="email" name="email" className={input} /></label>
          <label className="col-span-2 text-[11px] font-semibold text-slate-600">Telefone<input name="phone" inputMode="tel" className={input} /></label>
          <label className="text-[11px] font-semibold text-slate-600">Banco (código)<input name="bankCode" inputMode="numeric" maxLength={3} className={input} /></label>
          <label className="text-[11px] font-semibold text-slate-600">Agência<input name="bankAgency" className={input} /></label>
          <label className="col-span-2 text-[11px] font-semibold text-slate-600">Conta<input name="bankAccount" className={input} /></label>
        </div>
      )}
      <label className="block text-[11px] font-semibold text-slate-600">Observação<textarea name="justification" maxLength={500} rows={2} className="w-full rounded border border-slate-300 p-2 text-xs" /></label>
      {msg && <p className={`text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      <button disabled={pending} className="h-8 w-full rounded bg-emerald-700 px-3 text-xs font-semibold text-white disabled:opacity-50">{pending ? "Enviando..." : "Enviar ao RH"}</button>
    </form>
  );
}

export function CancelButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button disabled={pending} onClick={() => start(async () => { const r = await cancelPortalRequest(id); if (r.error) alert(r.error); router.refresh(); })} className="text-[11px] font-semibold text-red-700 hover:underline disabled:opacity-50">
      Cancelar
    </button>
  );
}
