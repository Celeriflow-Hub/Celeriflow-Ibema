import type { Metadata } from "next";
import { PortalBreadcrumb } from "@/components/portal-institucional/PortalShell";
import { MUNICIPALITY_LABEL, MUNICIPALITY_NAME } from "@/lib/municipality-identity";

export const metadata: Metadata = {
  title: `História | Prefeitura de ${MUNICIPALITY_NAME}`,
  description: `História do município fictício de ${MUNICIPALITY_LABEL}.`,
};

export default function HistoriaPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-9 sm:px-6">
      <PortalBreadcrumb current="História" />
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-[#0e4c7e]">O município</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">História de {MUNICIPALITY_NAME}</h1>
      <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700 sm:p-8">
        <p>
          {MUNICIPALITY_NAME} é um município fictício de Minas Gerais, criado para representar este ambiente demonstrativo de
          gestão pública sem associá-lo a uma administração municipal real.
        </p>
        <p>
          As informações institucionais apresentadas neste portal têm caráter demonstrativo. Conteúdos oficiais cadastrados pela
          administração são identificados nas respectivas páginas de publicação.
        </p>
        <section id="sede" aria-labelledby="sede-titulo" className="rounded-lg bg-slate-50 p-5">
          <h2 id="sede-titulo" className="font-bold text-slate-900">Sede do município</h2>
          <p className="mt-2">
            A sede administrativa é representada genericamente como localizada em {MUNICIPALITY_LABEL}. Endereços e canais de
            atendimento são exibidos na página de contato somente quando cadastrados pela instituição.
          </p>
        </section>
      </div>
    </main>
  );
}
