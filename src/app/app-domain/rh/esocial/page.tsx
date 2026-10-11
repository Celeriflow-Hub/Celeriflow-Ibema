import Link from "next/link";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { describeHrExternalReadiness } from "@/lib/rh/external-configuration";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { EsocialConfigurationForm } from "./ConfigurationForm";

export const dynamic = "force-dynamic";
export default async function RhEsocialPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { prisma } = await getTenantContextForModule("RH");
  const readiness = await describeHrExternalReadiness(prisma);
  const total = await prisma.hrIntegrationEvent.count({ where: { domain: "ESOCIAL" } });
  const page = Math.min(Math.max(1, Number.parseInt((await searchParams).page || "1") || 1), Math.max(1, Math.ceil(total / 20)));
  const events = await prisma.hrIntegrationEvent.findMany({ where: { domain: "ESOCIAL" }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 20, skip: (page - 1) * 20 });
  return <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
    <ErpPageTitle title="eSocial · preparação de RH/Folha" description="Parâmetros e origens segregados por ambiente. Não há transmissão ativa neste incremento." action={<Link href="/rh/operacoes">Operações</Link>} />
    <div className="grid gap-2 sm:grid-cols-2">{readiness.map(row => <section key={row.environment} className="rounded border bg-white p-3 text-xs"><strong>{row.environment}</strong><p>{row.status}</p><p>{row.configured ? "Parâmetros preenchidos; cliente de transmissão pendente." : "Aguardando parâmetros oficiais."}</p></section>)}</div>
    <EsocialConfigurationForm />
    <table className="w-full border bg-white text-left text-xs"><thead><tr><th className="p-2">Origem</th><th>Ambiente</th><th>Estado</th><th>Conferência</th></tr></thead><tbody>{events.map(event => <tr key={event.id} className="h-7 border-t"><td className="truncate px-2" title={event.sourceKey}>{event.eventType} · {event.sourceKey}</td><td>{event.environment}</td><td>{event.status}</td><td><Link href={`/api/rh/integracoes/${event.id}`}>Baixar origem JSON</Link></td></tr>)}</tbody></table>
    <ErpPagination page={page} total={total} pageSize={20} label="origens" previousHref={`?page=${page - 1}`} nextHref={`?page=${page + 1}`} />
  </div>;
}
