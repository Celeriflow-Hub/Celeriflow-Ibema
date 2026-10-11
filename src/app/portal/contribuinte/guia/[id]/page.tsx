import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { municipality } from "@/lib/platform/municipality";
import { currentTaxpayerId, loadStatement, pixFor } from "@/lib/tributacao/contribuinte-portal";

export const dynamic = "force-dynamic";

export default async function GuiaPixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const taxpayerId = await currentTaxpayerId().catch(() => null);
  if (!taxpayerId) redirect("/portal/contribuinte");
  const st = await loadStatement(taxpayerId);
  const guide = st?.guides.find((g) => g.id === id);
  if (!st || !guide) redirect("/portal/contribuinte");
  const pix = guide.balance > 0 ? pixFor(guide) : null;
  const qr = pix ? await QRCode.toDataURL(pix, { margin: 1, width: 260 }) : null;
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase text-emerald-800">{municipality.prefectureName}</p>
        <h1 className="text-xl font-bold">DAM {guide.number} — segunda via</h1>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div><dt className="text-slate-500">Contribuinte</dt><dd className="font-semibold">{st.name}</dd></div>
          <div><dt className="text-slate-500">Tributo</dt><dd className="font-semibold">{guide.tax} {guide.year}</dd></div>
          <div><dt className="text-slate-500">Vencimento</dt><dd className="font-semibold">{guide.dueDate.toLocaleDateString("pt-BR")}</dd></div>
          <div><dt className="text-slate-500">Valor</dt><dd className="font-semibold">{guide.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div>
        </dl>
        {pix && qr ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR Code Pix" className="mx-auto mt-4 size-60" />
          <label className="mt-3 block text-xs font-semibold text-slate-600">Pix copia e cola<textarea readOnly value={pix} rows={4} className="mt-1 w-full rounded-md border p-2 font-mono text-xs" /></label>
          <p className="mt-2 text-xs text-slate-500">A baixa ocorre após a confirmação do banco. Pagar este código não gera nova cobrança.</p>
        </> : <p className="mt-4 text-sm">Guia sem saldo a pagar.</p>}
        <div className="mt-4 flex gap-2 print:hidden"><Link href="/portal/contribuinte" className="rounded-md border px-3 py-2 text-sm">Voltar</Link></div>
      </section>
    </main>
  );
}
