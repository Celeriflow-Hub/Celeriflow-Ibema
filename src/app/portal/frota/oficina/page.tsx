import type { Metadata } from "next";
import { workshopReport } from "../actions";

export const metadata: Metadata = { title: "Portal da Frota — Oficina" };
const inp = "mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm";

export default async function OficinaPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Registrar serviço executado</h1>
      <p className="mt-2 text-sm text-slate-600">Para oficinas contratadas. Informe o código da ordem de serviço e o código de conferência recebidos do setor de frota. Somente a oficina autorizada pela Frota poderá enviar o registro.</p>
      {sp.erro && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{sp.erro}</p>}
      {sp.ok && <p role="status" className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{sp.ok}</p>}
      <form action={workshopReport} className="mt-5 flex flex-col gap-3 text-sm">
        <label>Código da ordem de serviço<input name="code" required className={inp} /></label>
        <label>Código de conferência<input name="token" autoComplete="off" required className={inp} /></label>
        <label>CNPJ da oficina<input name="cnpj" inputMode="numeric" required className={inp} /></label>
        <label>Nome da oficina<input name="name" required className={inp} /></label>
        <label>Serviço executado<textarea name="performed" required rows={4} className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm" /></label>
        <label>Peças trocadas<textarea name="parts" rows={2} className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm" /></label>
        <label>Valor (R$)<input name="amount" inputMode="decimal" className={inp} /></label>
        <label>Leitura do painel<input name="reading" inputMode="decimal" className={inp} /></label>
        <button className="h-11 rounded-md bg-emerald-700 font-semibold text-white">Enviar registro</button>
      </form>
    </main>
  );
}

// Render on request: the shared portal layout queries the database.
export const dynamic = "force-dynamic";
