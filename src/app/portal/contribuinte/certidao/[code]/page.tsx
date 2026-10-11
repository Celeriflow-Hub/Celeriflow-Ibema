import Link from "next/link";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { municipality } from "@/lib/platform/municipality";
import { formatCpfCnpj } from "@/lib/tributacao/contribuinte-engine";

export const dynamic = "force-dynamic";

/** Página pública: exibe e valida a certidão pelo código de autenticidade. */
export default async function CertidaoPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cert = await prisma.taxCertificate.findUnique({ where: { authCode: code.toUpperCase() }, include: { taxpayer: { include: { person: true, company: true } } } });
  if (!cert || cert.status === "Rascunho Interno") return <main className="mx-auto max-w-xl p-8"><h1 className="text-xl font-bold">Certidão não localizada</h1><p className="mt-2 text-sm text-slate-600">Confira o código informado.</p><Link className="mt-3 inline-block underline" href="/portal/contribuinte/validar">Tentar outro código</Link></main>;
  const valid = cert.status === "Emitida" && cert.validUntil > new Date();
  const h = await headers();
  const url = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}/portal/contribuinte/certidao/${cert.authCode}`;
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 140 });
  const t = cert.taxpayer;
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={municipality.coatOfArms} alt="" className="size-14 object-contain" />
          <div><p className="font-bold">{municipality.prefectureName}</p><p className="text-xs text-slate-500">CNPJ {municipality.cnpj} · Secretaria de Finanças</p></div>
        </div>
        <h1 className="mt-5 text-center text-xl font-bold uppercase">{cert.certificateType}</h1>
        <p className="mt-4 text-sm leading-relaxed">Certificamos que, até esta data, em nome de <b>{t.company?.corporateName ?? t.person?.fullName}</b>, inscrito(a) no CPF/CNPJ <b>{formatCpfCnpj(t.company?.cnpj ?? t.person?.cpf ?? "")}</b>{cert.certificateType.includes("Negativa") && !cert.certificateType.includes("Positiva") ? ", não constam débitos tributários" : cert.certificateType.includes("Efeito") ? ", constam débitos com exigibilidade suspensa, o que lhe confere os mesmos efeitos da certidão negativa (CTN, art. 206)" : ", constam débitos tributários vencidos"} perante a Fazenda Pública Municipal de {municipality.name}/{municipality.state}, ressalvado o direito de cobrar débitos que venham a ser apurados.</p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <dl className="text-sm"><dt className="text-slate-500">Código de autenticidade</dt><dd className="font-mono font-bold">{cert.authCode}</dd><dt className="mt-2 text-slate-500">Emitida em / válida até</dt><dd>{cert.createdAt.toLocaleDateString("pt-BR")} / {cert.validUntil.toLocaleDateString("pt-BR")}</dd></dl>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR Code de validação" className="size-28" />
        </div>
        <p className={`mt-5 rounded-md p-3 text-center text-sm font-semibold ${valid ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{valid ? "Documento autêntico e dentro da validade." : cert.status === "Revogada" ? "Certidão revogada." : "Certidão fora da validade."}</p>
      </section>
    </main>
  );
}
