import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PortalBreadcrumb } from "@/components/portal-institucional/PortalShell";
import { municipality, fullAddress } from "@/lib/platform/municipality";

export const metadata: Metadata = {
  title: `Contato | ${municipality.cityHallShort}`,
  description: `Canais de contato da ${municipality.prefectureName}.`,
};

export const dynamic = "force-dynamic";

export default async function ContatoPage() {
  let institution: { name: string; address: string | null; city: string | null; state: string | null; phone: string | null; email: string | null; website: string | null } | null = null;
  try {
    institution = await prisma.institution.findFirst({
      select: { name: true, address: true, city: true, state: true, phone: true, email: true, website: true },
    });
  } catch {
    institution = null;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-9 sm:px-6">
      <PortalBreadcrumb current="Contato" />
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Contato institucional</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Canais oficiais da {institution?.name ?? municipality.prefectureName}.</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-slate-900">{institution?.name ?? municipality.prefectureName}</h2>
        <dl className="mt-4 space-y-3 text-sm text-slate-700">
          <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[#00843d]" aria-hidden="true" /><dd>{fullAddress()}{institution?.address ? ` · ${institution.address}` : ""}</dd></div>
          <div className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-[#00843d]" aria-hidden="true" /><dd>{institution?.phone ?? "(28) 3551-1166 / (28) 3551-1177"}</dd></div>
          <div className="flex gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-[#00843d]" aria-hidden="true" />
            <dd>{institution?.email ? <a href={`mailto:${institution.email}`} className="font-semibold text-[#0e4c7e] hover:underline">{institution.email}</a> : <a href="mailto:gabinete@dslourenco.es.gov.br" className="font-semibold text-[#0e4c7e] hover:underline">gabinete@dslourenco.es.gov.br</a>}</dd>
          </div>
        </dl>
        <p className="mt-5 text-sm text-slate-600">
          Para manifestações, solicitações e denúncias, utilize a <a href="/portal/ouvidoria" className="font-bold text-[#0e4c7e] hover:underline">Ouvidoria</a> ou o{" "}
          <a href="/portal/acesso-informacao" className="font-bold text-[#0e4c7e] hover:underline">Acesso à Informação</a>.
        </p>
      </div>
    </main>
  );
}
