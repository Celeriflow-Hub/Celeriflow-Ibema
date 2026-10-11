import Link from "next/link";
import { FileBadge, LogOut, Receipt, ShieldCheck } from "lucide-react";
import { municipality } from "@/lib/platform/municipality";
import { certificateLabel } from "@/lib/tributacao/contribuinte-engine";
import { currentTaxpayerId, loadStatement } from "@/lib/tributacao/contribuinte-portal";
import { enterPortal, issueCertificate, leavePortal } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: `Portal do Contribuinte — ${municipality.prefectureName}`, description: "Segunda via de guias com Pix, extrato de débitos e certidões validáveis." };

const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (d: Date) => d.toLocaleDateString("pt-BR");

export default async function ContribuintePortalPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const id = await currentTaxpayerId().catch(() => null);
  const st = id ? await loadStatement(id) : null;

  if (!st) return (
    <main className="mx-auto max-w-md px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">{municipality.prefectureName}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Portal do Contribuinte</h1>
      <p className="mt-2 text-sm text-slate-600">Segunda via de guias com Pix, extrato de débitos e certidão negativa, sem sair de casa.</p>
      {erro && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
      <form action={enterPortal} className="mt-5 space-y-3 rounded-xl border bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium">CPF ou CNPJ<input name="document" required inputMode="numeric" autoComplete="off" className="mt-1 w-full rounded-md border px-3 py-2" /></label>
        <label className="block text-sm font-medium">Inscrição municipal ou do imóvel<input name="inscription" required autoComplete="off" className="mt-1 w-full rounded-md border px-3 py-2" /></label>
        <button className="w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white">Consultar</button>
      </form>
      <p className="mt-4 text-center text-sm"><Link className="text-emerald-800 underline" href="/portal/contribuinte/validar">Validar uma certidão</Link></p>
    </main>
  );

  const open = st.guides.filter((g) => g.balance > 0 && !/paga|cancel/i.test(g.status));
  const sit = st.fiscal.situation;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Portal do Contribuinte</p><h1 className="text-2xl font-bold text-slate-900">{st.name}</h1><p className="text-sm text-slate-500">{st.document}</p></div>
        <form action={leavePortal}><button className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm"><LogOut className="size-4" />Sair</button></form>
      </div>

      <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold"><ShieldCheck className="size-5 text-emerald-700" />Situação fiscal</h2>
        <p className="mt-1 text-sm text-slate-600">Hoje você tem direito à <b>{certificateLabel[sit]}</b>{sit !== "NEGATIVA" && ` (${st.fiscal.open.length} pendência(s) vencida(s), ${st.fiscal.suspended.length} parcelada(s)/suspensa(s))`}.</p>
        <form action={issueCertificate} className="mt-3"><button className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"><FileBadge className="size-4" />Emitir certidão</button></form>
      </section>

      <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold"><Receipt className="size-5 text-emerald-700" />Guias em aberto — segunda via e Pix</h2>
        {open.length === 0 ? <p className="mt-2 text-sm text-slate-500">Nenhuma guia em aberto.</p> : (
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs"><tr><th className="p-2">Guia</th><th className="p-2">Tributo</th><th className="p-2">Vencimento</th><th className="p-2">Saldo</th><th className="p-2"></th></tr></thead><tbody>
            {open.map((g) => <tr key={g.id} className="border-t"><td className="p-2 font-mono">{g.number}</td><td className="p-2">{g.tax} {g.year}</td><td className="p-2">{date(g.dueDate)}{g.dueDate < new Date() && <span className="ml-1 text-xs text-red-700">vencida</span>}</td><td className="p-2">{money(g.balance)}</td><td className="p-2"><Link className="font-semibold text-emerald-800 underline" href={`/portal/contribuinte/guia/${g.id}`}>Pagar com Pix</Link></td></tr>)}
          </tbody></table></div>)}
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-bold">Extrato de débitos</h2><ul className="mt-2 space-y-1 text-sm">
          {st.guides.slice(0, 30).map((g) => <li key={g.id} className="flex justify-between border-b py-1"><span>{g.tax} {g.year} · {g.status}</span><span>{money(g.balance)}</span></li>)}
          {st.debts.map((d) => <li key={d.id} className="flex justify-between border-b py-1"><span>Dívida ativa · {d.status}</span><span>{money(d.balance)}</span></li>)}
          {!st.guides.length && !st.debts.length && <li className="text-slate-500">Sem lançamentos.</li>}
        </ul></div>
        <div className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-bold">Certidões emitidas</h2><ul className="mt-2 space-y-1 text-sm">
          {st.taxpayer.taxCertificates.map((c) => <li key={c.id} className="flex justify-between border-b py-1"><Link className="text-emerald-800 underline" href={`/portal/contribuinte/certidao/${c.authCode}`}>{c.certificateType}</Link><span>até {date(c.validUntil)}</span></li>)}
          {!st.taxpayer.taxCertificates.length && <li className="text-slate-500">Nenhuma certidão emitida.</li>}
        </ul><p className="mt-3 text-xs text-slate-500">Parcelamento e NFS-e: use o acesso autenticado em <Link className="underline" href="/portal/tributario">Portal Tributário</Link>.</p></div>
      </section>
    </main>
  );
}
