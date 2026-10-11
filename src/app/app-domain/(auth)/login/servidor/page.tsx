"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { municipality } from "@/lib/platform/municipality";
import { firstAccess } from "./actions";

const input = "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm";

export default function PrimeiroAcessoServidorPage() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (data.password !== data.confirm) { setError("As senhas não conferem."); return; }
    setError("");
    start(async () => {
      const r = await firstAccess(data);
      if (r.error) setError(r.error);
      else setDone(true);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <img src={municipality.coatOfArms} alt="" className="mx-auto h-14" />
        <h1 className="mt-3 text-center text-lg font-bold text-slate-900">Portal do Servidor</h1>
        <p className="text-center text-xs text-slate-600">Primeiro acesso ou nova senha — {municipality.prefectureName}</p>
        {done ? (
          <div className="mt-5 space-y-3 text-center">
            <p className="text-sm text-emerald-700">Acesso liberado. Entre com seu CPF e a senha criada.</p>
            <Link href="/login?returnTo=/portal-servidor" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-700 text-sm font-semibold text-white">Entrar</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">CPF<input name="cpf" required inputMode="numeric" autoComplete="username" placeholder="000.000.000-00" className={input} /></label>
            <label className="block text-xs font-semibold text-slate-700">Matrícula<input name="registration" required className={input} /></label>
            <label className="block text-xs font-semibold text-slate-700">Data de admissão<input name="admissionDate" type="date" required className={input} /></label>
            <label className="block text-xs font-semibold text-slate-700">Nova senha<input name="password" type="password" minLength={8} required autoComplete="new-password" className={input} /></label>
            <label className="block text-xs font-semibold text-slate-700">Confirmar senha<input name="confirm" type="password" minLength={8} required autoComplete="new-password" className={input} /></label>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button disabled={pending} className="h-10 w-full rounded-md bg-emerald-700 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Verificando..." : "Liberar acesso"}</button>
            <Link href="/login" className="block text-center text-xs text-slate-600 hover:underline">Voltar ao login</Link>
          </form>
        )}
      </section>
    </main>
  );
}
