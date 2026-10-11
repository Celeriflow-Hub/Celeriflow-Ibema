import type { Metadata } from "next";
import Link from "next/link";
import { PortalBreadcrumb } from "@/components/portal-institucional/PortalShell";
import { MUNICIPALITY_INSTITUTION_NAME } from "@/lib/municipality-identity";

export const metadata: Metadata = {
  title: `Serviços | ${MUNICIPALITY_INSTITUTION_NAME}`,
  description: `Todos os serviços do portal oficial de ${MUNICIPALITY_INSTITUTION_NAME}.`,
};

const GROUPS: { id: string; title: string; items: { label: string; href: string; external?: boolean }[] }[] = [
  {
    id: "informacao",
    title: "Informação e participação",
    items: [
      { label: "Acesso à Informação (e-SIC)", href: "/portal/acesso-informacao" },
      { label: "Ouvidoria", href: "/portal/ouvidoria" },
      { label: "Notícias oficiais", href: "/portal/noticias" },
      { label: "Perguntas Frequentes", href: "/portal/perguntas-frequentes" },
    ],
  },
  {
    id: "transparencia",
    title: "Transparência e contas públicas",
    items: [
      { label: "Portal da Transparência", href: "/portal-transparencia" },
      { label: "Licitações e Contratos", href: "/portal/licitacoes-e-contratos" },
      { label: "Leis Municipais", href: "/portal/leis-municipais" },
      { label: "Dados Abertos (CSV)", href: "/portal/dados-abertos" },
    ],
  },
  {
    id: "certidoes",
    title: "Certidões e documentos",
    items: [
      { label: "Avisos de processos", href: "/portal-protocolos" },
      { label: "Leis municipais", href: "/portal/leis-municipais" },
    ],
  },
  {
    id: "tributos",
    title: "Tributos e empresas",
    items: [
      { label: "Portal Tributário", href: "/portal/tributario" },
      { label: "Atendimento ao contribuinte", href: "/portal/contato" },
    ],
  },
  {
    id: "servidor",
    title: "Servidor municipal",
    items: [
      { label: "Atendimento ao servidor", href: "/portal/contato" },
    ],
  },
];

export default function ServicosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
      <PortalBreadcrumb current="Todos Serviços" />
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Todos os serviços</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Acesso rápido aos serviços e sistemas de {MUNICIPALITY_INSTITUTION_NAME}.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-28 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-[#0e4c7e]">{group.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="font-medium text-slate-700 hover:text-[#0e4c7e] hover:underline">{item.label}</a>
                  ) : (
                    <Link href={item.href} className="font-medium text-slate-700 hover:text-[#0e4c7e] hover:underline">{item.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
