import type { Metadata } from "next";
import { stationConfirm } from "../actions";

export const metadata: Metadata = { title: "Portal da Frota — Posto credenciado" };
const inp = "mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm";

export default async function PostoPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Confirmar abastecimento</h1>
      <p className="mt-2 text-sm text-slate-600">Para postos credenciados. Use o código da ordem e o código de conferência apresentados pelo motorista.</p>
      {sp.erro && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{sp.erro}</p>}
      {sp.ok && <p role="status" className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{sp.ok}</p>}
      <form action={stationConfirm} className="mt-5 flex flex-col gap-3 text-sm">
        <label>Código da ordem<input name="code" placeholder="OA-2026-000001" required className={inp} /></label>
        <label>CNPJ do posto<input name="cnpj" inputMode="numeric" required className={inp} /></label>
        <label>Código de conferência<input name="token" autoComplete="off" required className={inp} /></label>
        <label>Litros abastecidos<input name="liters" inputMode="decimal" required className={inp} /></label>
        <label>Leitura do painel (km ou horas)<input name="reading" inputMode="decimal" required className={inp} /></label>
        <label>Preço por litro (opcional)<input name="price" inputMode="decimal" className={inp} /></label>
        <button className="h-11 rounded-md bg-emerald-700 font-semibold text-white">Confirmar abastecimento</button>
      </form>
    </main>
  );
}

// Render on request: the shared portal layout queries the database.
export const dynamic = "force-dynamic";
