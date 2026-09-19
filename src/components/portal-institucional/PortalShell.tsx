import Link from "next/link";
import { Building2, ChevronRight, Landmark, ShieldCheck } from "lucide-react";

const navigation = [
  { href: "/portal", label: "Início" },
  { href: "/portal/noticias", label: "Notícias" },
  { href: "/portal-transparencia", label: "Transparência" },
  { href: "/portal-protocolos", label: "Avisos públicos" },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f7fa] text-slate-900">
      <a
        href="#conteudo-principal"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 font-semibold text-slate-950 shadow focus:not-sr-only focus:absolute focus:left-5 focus:top-4"
      >
        Ir para o conteúdo principal
      </a>

      <div className="bg-[#073b64] text-slate-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2 text-xs sm:px-6">
          <p className="font-medium tracking-wide">Portal Institucional · Ambiente de demonstração da POC</p>
          <div className="flex items-center gap-4 text-slate-200">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Acesso público</span>
            <Link href="/portal-transparencia" className="font-semibold text-white hover:text-emerald-200">Portal da Transparência</Link>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-6">
          <Link href="/portal" className="flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#e6f0f8] text-[#073b64] ring-1 ring-[#c7dceb]">
              <Landmark className="size-6" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Prefeitura Municipal</span>
              <span className="block truncate text-xl font-bold tracking-tight text-[#073b64] sm:text-2xl">Divino São Lourenço</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <Building2 className="size-4 text-emerald-700" aria-hidden="true" />
            <span>Portal do cidadão</span>
          </div>
        </div>
        <nav aria-label="Navegação principal" className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-3 sm:px-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:bg-emerald-50 focus-visible:outline-none sm:px-4"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div id="conteudo-principal" tabIndex={-1} className="outline-none">
        {children}
      </div>

      <footer className="mt-14 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#073b64]"><Landmark className="size-4" /> Prefeitura Municipal de Divino São Lourenço</div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Ambiente demonstrativo do Portal Institucional. Esta área não solicita cadastro, documentos ou informações pessoais.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-700">
            <Link href="/portal-transparencia" className="hover:text-emerald-800 hover:underline">Transparência</Link>
            <Link href="/portal-protocolos" className="hover:text-emerald-800 hover:underline">Avisos públicos</Link>
            <Link href="/portal/noticias" className="hover:text-emerald-800 hover:underline">Notícias</Link>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-center text-xs text-slate-500">Conteúdo institucional publicado e dados públicos autorizados. Os dados pessoais permanecem protegidos.</div>
      </footer>
    </div>
  );
}

export function PortalBreadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Caminho de navegação" className="flex items-center gap-1.5 text-sm text-slate-600">
      <Link href="/portal" className="font-medium hover:text-emerald-800 hover:underline">Portal</Link>
      <ChevronRight className="size-4 text-slate-400" aria-hidden="true" />
      <span aria-current="page" className="truncate text-slate-700">{current}</span>
    </nav>
  );
}

export function PortalTextContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <div className="space-y-5 text-[1.02rem] leading-8 text-slate-700">
      {(paragraphs.length ? paragraphs : [content]).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
    </div>
  );
}
