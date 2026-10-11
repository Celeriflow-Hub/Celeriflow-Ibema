import Link from "next/link";
import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { listMyRecertificationCampaigns } from "@/lib/rh/recertification";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { ProposalForm } from "./ProposalForm";

export const dynamic = "force-dynamic";
export default async function RecertificationPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const access = await getEmployeePortalAccess();
  if (access.status !== "AVAILABLE") return <p className="p-4">Cadastro funcional indisponível.</p>;
  const employee = await access.context.prisma.employee.findUniqueOrThrow({ where: { id: access.employee.id }, include: { person: true } });
  if (!employee.person) return <p className="p-4">Vinculação ao Cadastro Único pendente.</p>;
  const campaigns = await listMyRecertificationCampaigns(access.context.prisma, employee.id);
  const page = Math.min(Math.max(1, Number.parseInt((await searchParams).page || "1") || 1), Math.max(1, Math.ceil(campaigns.length / 20))); const now = new Date();
  return <div className="flex min-h-0 flex-1 flex-col gap-2 p-3"><ErpPageTitle title="Recadastramento" description="As propostas são aplicadas ao Cadastro Único somente após deferimento pelo RH." action={<Link href="/portal-servidor/solicitacoes-rh">Meus pedidos</Link>} />
    {campaigns.slice((page - 1) * 20, page * 20).map(campaign => <section key={campaign.id} className="rounded border bg-white p-3 text-xs"><strong>{campaign.name}</strong><p>{campaign.startsAt} até {campaign.endsAt}</p><p className="whitespace-pre-wrap">{campaign.instructions}</p>{campaign.request ? <p>Resposta registrada · {campaign.request.status} · {campaign.request.decision || "Aguardando análise do RH"}</p> : now >= new Date(campaign.startsAt) && now <= new Date(campaign.endsAt) ? <ProposalForm campaignRuleId={campaign.id} values={Object.fromEntries(campaign.fields.map(field => [field, employee.person![field] || ""]))} /> : <p>Fora do período de resposta.</p>}</section>)}
    {!campaigns.length && <p className="text-sm">Nenhuma campanha atribuída ao seu cadastro.</p>}
    <ErpPagination page={page} total={campaigns.length} pageSize={20} label="campanhas" previousHref={`?page=${page - 1}`} nextHref={`?page=${page + 1}`} />
  </div>;
}
