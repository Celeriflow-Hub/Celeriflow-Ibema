import { getTenantContextForSystemAdministration } from "@/lib/platform/tenant-context";
import { PersonMergeClient } from "./PersonMergeClient";

export const dynamic = "force-dynamic";

export default async function PersonMergePage() {
  const { prisma } = await getTenantContextForSystemAdministration();
  const [people, requests] = await Promise.all([
    prisma.person.findMany({ where: { status: { not: "Arquivado por mesclagem" } }, select: { id: true, fullName: true, cpf: true }, orderBy: { fullName: "asc" }, take: 250 }),
    prisma.personMergeRequest.findMany({
      select: { id: true, status: true, sourcePerson: { select: { fullName: true } }, targetPerson: { select: { fullName: true } }, proposedByUsuario: { select: { nome: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  return <div className="mx-auto max-w-5xl space-y-6"><div><h1 className="text-2xl font-bold text-slate-900">Mesclagem de duplicidades PF</h1><p className="mt-1 text-sm text-slate-500">Fluxo restrito a administradores do sistema, com dupla aprovação e reversão controlada.</p></div><PersonMergeClient people={people} requests={requests.map((request) => ({ id: request.id, status: request.status, sourceName: request.sourcePerson.fullName, targetName: request.targetPerson.fullName, proposedBy: request.proposedByUsuario.nome }))} /></div>;
}
