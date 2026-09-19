import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ChevronLeft, ChevronRight, EyeOff, MessageSquareWarning, Plus, Search } from "lucide-react";
import { canViewOmbudsmanIdentity, getOmbudsmanContextForProtocols, ombudsmanScope } from "@/lib/attendance/access";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = {
  q?: string | string[];
  type?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

function valueOf(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value || "").trim();
}

function listHref(filters: { q: string; type: string; status: string }, page = 1) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  return `/protocolos/ouvidoria${params.size ? `?${params.toString()}` : ""}`;
}

export default async function OuvidoriaProtocolosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const context = await getOmbudsmanContextForProtocols();
  const raw = await searchParams;
  const filters = {
    q: valueOf(raw.q).slice(0, 120),
    type: valueOf(raw.type),
    status: valueOf(raw.status),
  };
  const requestedPage = Number.parseInt(valueOf(raw.page), 10);
  const conditions: Prisma.OmbudsmanWhereInput[] = [ombudsmanScope(context)];
  if (filters.type) conditions.push({ type: filters.type });
  if (filters.status) conditions.push({ status: filters.status });
  if (filters.q) {
    conditions.push({
      OR: [
        { protocolNumber: { contains: filters.q, mode: "insensitive" } },
        { subject: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }
  const where: Prisma.OmbudsmanWhereInput = { AND: conditions };
  const total = await context.prisma.ombudsman.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, totalPages) : 1;
  const manifestacoes = await context.prisma.ombudsman.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      protocolNumber: true,
      type: true,
      subject: true,
      isAnonymous: true,
      isConfidential: true,
      status: true,
      createdAt: true,
      person: { select: { fullName: true } },
      accessGrants: { where: { userId: context.user.id }, select: { canViewIdentity: true } },
    },
  });
  const safeManifestacoes = manifestacoes.map((manifestacao) => ({
    ...manifestacao,
    person: canViewOmbudsmanIdentity(context, manifestacao.isConfidential, manifestacao.accessGrants.some((grant) => grant.canViewIdentity))
      ? manifestacao.person
      : null,
  }));
  const canCreateOmbudsman = context.attendanceAccess.isOmbudsman && context.attendanceAccess.canCreate;
  const firstVisible = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastVisible = Math.min(page * PAGE_SIZE, total);
  const returnTo = listHref(filters, page);

  return (
    <PageFrame className="space-y-3">
      <PageHeader
        title="Ouvidoria"
        icon={<MessageSquareWarning className="size-4 shrink-0 text-amber-700" />}
        action={canCreateOmbudsman ? <Link href="/protocolos/ouvidoria/nova" className="inline-flex h-7 items-center gap-1 rounded-md bg-amber-700 px-2 text-xs font-semibold text-white hover:bg-amber-800"><Plus className="size-3.5" />Nova manifestação</Link> : undefined}
      />
      <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><EyeOff className="mt-0.5 size-4 shrink-0" /><p><strong>Dados protegidos.</strong> A identidade e a narrativa de manifestação confidencial só aparecem para pessoas autorizadas. A listagem pesquisa protocolo e assunto, sem usar dados pessoais.</p></div>

      <form action="/protocolos/ouvidoria" method="GET" className="grid gap-2 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-[minmax(0,1fr)_160px_190px_auto_auto]">
        <label className="relative block"><span className="sr-only">Buscar manifestação</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input name="q" defaultValue={filters.q} placeholder="Protocolo ou assunto" className="h-9 w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15" /></label>
        <select name="type" defaultValue={filters.type} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="">Todos os tipos</option><option>Denúncia</option><option>Reclamação</option><option>Sugestão</option><option>Elogio</option></select>
        <select name="status" defaultValue={filters.status} className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="">Todos os status</option><option>Recebida</option><option>Em Triagem</option><option>Encaminhada</option><option>Em Apuração</option><option>Aguardando Resposta</option><option>Concluída</option></select>
        <button className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700">Aplicar</button>
        <Link href="/protocolos/ouvidoria" className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Limpar</Link>
      </form>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm" aria-label="Listagem de manifestações">
        <p className="border-b border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-600"><strong className="text-slate-900">{total}</strong> manifestação(ões) no recorte autorizado{total ? ` · exibindo ${firstVisible}–${lastVisible}` : ""}.</p>
        {safeManifestacoes.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">Nenhuma manifestação encontrada para os filtros informados.</p>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup><col className="w-[20%]" /><col className="w-[16%]" /><col className="w-[34%]" /><col className="w-[18%]" /><col className="w-[12%]" /></colgroup>
                <thead className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-600">
                  <tr><th className="px-3 py-2">Protocolo</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2">Assunto e manifestante</th><th className="px-3 py-2">Situação</th><th className="px-3 py-2 text-right">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeManifestacoes.map((item) => (
                    <tr key={item.id} className="align-top hover:bg-slate-50">
                      <td className="break-words px-3 py-2 font-semibold text-slate-900">{item.protocolNumber}</td>
                      <td className="px-3 py-2 text-slate-700">{item.type}</td>
                      <td className="break-words px-3 py-2"><p className="font-medium text-slate-800">{item.subject}</p><p className="mt-0.5 text-xs text-slate-500">{item.isAnonymous ? "Anônimo" : item.person?.fullName || "Identidade restrita"}</p></td>
                      <td className="px-3 py-2"><span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{item.status}</span></td>
                      <td className="px-3 py-2 text-right"><Link href={`/protocolos/ouvidoria/${item.id}?returnTo=${encodeURIComponent(returnTo)}`} className="text-xs font-semibold text-amber-800 hover:text-amber-950">Abrir</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-100 md:hidden">
              {safeManifestacoes.map((item) => (
                <article key={item.id} className="space-y-2 p-2.5">
                  <div className="flex items-start justify-between gap-2"><p className="font-semibold text-slate-900">{item.protocolNumber}</p><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{item.status}</span></div>
                  <div><p className="text-sm font-medium text-slate-800">{item.subject}</p><p className="text-xs text-slate-500">{item.type} · {item.isAnonymous ? "Anônimo" : item.person?.fullName || "Identidade restrita"}</p></div>
                  <div className="flex justify-between text-xs text-slate-500"><span>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</span><Link href={`/protocolos/ouvidoria/${item.id}?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-amber-800">Abrir</Link></div>
                </article>
              ))}
            </div>
          </>
        )}
        {total > 0 && <nav aria-label="Paginação de Ouvidoria" className="flex items-center justify-between border-t border-slate-200 px-3 py-2"><p className="text-xs text-slate-500">Página {page} de {totalPages}</p><div className="flex gap-2"><Link aria-disabled={page <= 1} href={listHref(filters, page - 1)} className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-semibold ${page <= 1 ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}><ChevronLeft className="size-3.5" />Anterior</Link><Link aria-disabled={page >= totalPages} href={listHref(filters, page + 1)} className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-semibold ${page >= totalPages ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>Próxima<ChevronRight className="size-3.5" /></Link></div></nav>}
      </section>
    </PageFrame>
  );
}

