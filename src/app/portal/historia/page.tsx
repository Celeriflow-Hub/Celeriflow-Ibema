import type { Metadata } from "next";
import { PortalBreadcrumb } from "@/components/portal-institucional/PortalShell";
import { municipality, fullAddress } from "@/lib/platform/municipality";

export const metadata: Metadata = {
  title: `História | ${municipality.cityHallShort}`,
  description: `História do município de ${municipality.cityName}, ${municipality.stateName}.`,
};

export default function HistoriaPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-9 sm:px-6">
      <PortalBreadcrumb current="História" />
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-[#0e4c7e]">O município</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">História de {municipality.cityName}</h1>
      <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700 sm:p-8">
        <p>
          {municipality.cityName} é um município do interior da {municipality.stateName}, localizado na região do {municipality.region}.
          Como muitos municípios do semiárido paraibano, sua história está ligada à ocupação rural do território, à formação de
          comunidades locais e ao desenvolvimento de atividades econômicas ligadas ao campo.
        </p>
        <p>
          Ao longo do tempo, o município consolidou sua sede administrativa e a prestação de serviços públicos à população,
          mantendo os traços de sua cultura e das tradições locais.
        </p>
        <section id="sede" aria-labelledby="sede-titulo" className="rounded-lg bg-slate-50 p-5">
          <h2 id="sede-titulo" className="font-bold text-slate-900">Sede do município</h2>
          <p className="mt-2">
            A sede concentra o Paço Municipal, onde funcionam o Gabinete do Prefeito, as secretarias e os serviços de atendimento
            ao cidadão. O endereço oficial é {fullAddress()}.
          </p>
        </section>
      </div>
    </main>
  );
}
