import Link from "next/link";
import { z } from "zod";
import { getTenantContextForModule, canPerformModuleOperation, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { sstUnitWhere } from "@/lib/sst/access";
import { asoKinds, asoResults, asoGroupSnapshot, sstCivilDate, formatSstCivilDate } from "@/lib/sst/aso-policy";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { AsoForm } from "./AsoForm";
import type { Prisma } from "@prisma/client";

type Search = { budgetUnitId?: string; q?: string; personQ?: string; laboratoryQ?: string; expiresFrom?: string; expiresTo?: string; page?: string };

export default async function SstAsoPage({ searchParams }: { searchParams: Promise<Search> }) {
  const context = await getTenantContextForModule("SST");
  const params = await searchParams;
  const units = await context.prisma.budgetUnit.findMany({ where: {
    ...sstUnitWhere(context),
    ...(isSystemAdministrator(context.user) ? {} : { sstAccessGrants: { some: { usuarioId: context.user.id, isActive: true, canReadClinical: true } } }),
  }, select: { id: true, name: true }, orderBy: [{ name: "asc" }, { id: "asc" }] });
  const unit = units.find((item) => item.id === params.budgetUnitId);
  const from = params.expiresFrom ? sstCivilDate.safeParse(params.expiresFrom) : null;
  const to = params.expiresTo ? sstCivilDate.safeParse(params.expiresTo) : null;
  const invalidDates = (from && !from.success) || (to && !to.success) || (from?.success && to?.success && from.data > to.data);
  const where: Prisma.SstAsoWhereInput = {
    budgetUnitId: { in: invalidDates ? [] : params.budgetUnitId ? unit ? [unit.id] : [] : units.map((item) => item.id) },
    ...(params.q?.trim() ? { person: { fullName: { contains: params.q.trim().slice(0, 200), mode: "insensitive" } } } : {}),
    validUntil: { ...(from?.success ? { gte: from.data } : {}), ...(to?.success ? { lte: to.data } : {}) },
  };
  const total = await context.prisma.sstAso.count({ where });
  const requestedPage = Number(params.page);
  const page = Math.min(Number.isFinite(requestedPage) ? Math.max(1, Math.trunc(requestedPage)) : 1, Math.max(1, Math.ceil(total / 20)));
  const records = await context.prisma.sstAso.findMany({ where, take: 20, skip: (page - 1) * 20, orderBy: [{ performedAt: "desc" }, { id: "asc" }], select: { id: true, kind: true, result: true, performedAt: true, validUntil: true, snapshot: true } });
  if (units.length) await writeAuditEvent(context.prisma, { actorUsuarioId: context.user.id, eventType: auditEventTypes.pageView, targetType: "SST_ASO_LIST", targetId: unit?.id || "AUTHORIZED_UNITS" });
  const grant = unit && !isSystemAdministrator(context.user) ? await context.prisma.sstAccessGrant.findUnique({ where: { usuarioId_budgetUnitId: { usuarioId: context.user.id, budgetUnitId: unit.id } }, select: { canAssess: true } }) : null;
  const canCreate = !!unit && canPerformModuleOperation(context.user, "SST", "create") && (isSystemAdministrator(context.user) || !!grant?.canAssess);
  const personTerms = canCreate ? (params.personQ || "").split(";").map((term) => term.trim().slice(0, 200)).filter((term) => term.length >= 3).slice(0, 5) : [];
  const personMatches = await Promise.all(personTerms.map((term) => context.prisma.person.findMany({ where: { fullName: { contains: term, mode: "insensitive" } }, take: 20, orderBy: [{ fullName: "asc" }, { id: "asc" }], select: { id: true, fullName: true } })));
  const people = [...new Map(personMatches.flat().map((person) => [person.id, person])).values()].sort((a, b) => a.fullName.localeCompare(b.fullName, "pt-BR"));
  const laboratories = canCreate && params.laboratoryQ && params.laboratoryQ.trim().length >= 3 ? await context.prisma.company.findMany({ where: { corporateName: { contains: params.laboratoryQ.trim().slice(0, 200), mode: "insensitive" } }, take: 20, orderBy: [{ corporateName: "asc" }, { id: "asc" }], select: { id: true, corporateName: true } }) : [];
  const groups = canCreate && unit ? await context.prisma.sstProgramExposureGroup.findMany({ where: { program: { budgetUnitId: unit.id, kind: "PCMSO" } }, take: 200, orderBy: [{ program: { createdAt: "desc" } }, { id: "asc" }], include: { program: { select: { code: true, version: true } } } }) : [];
  const programs = groups.map((entry) => { const group = asoGroupSnapshot.parse(entry.groupSnapshot); return { id: entry.id, label: `${entry.program.code} v${entry.program.version} · ${group.code} · ${group.name}`, exams: z.array(z.object({ name: z.string(), occasion: z.string() })).parse(entry.exams) }; });
  const href = (value: number) => `/sst/aso?${new URLSearchParams({ budgetUnitId: params.budgetUnitId || "", q: params.q || "", personQ: params.personQ || "", laboratoryQ: params.laboratoryQ || "", expiresFrom: params.expiresFrom || "", expiresTo: params.expiresTo || "", page: String(value) })}`;
  const field = "min-w-0 rounded border p-2";
  return <div className="space-y-4 p-4">
    <header><h1 className="text-xl font-semibold">Exames ocupacionais e ASO</h1><p className="text-sm">Consulta clínica por UG, com vencimentos e versões do PCMSO.</p></header>
    {!units.length && <p role="status" className="rounded border p-3">Não há unidade gestora com autorização clínica ocupacional para este perfil.</p>}
    <form className="grid gap-3 rounded border p-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="grid gap-1">Unidade gestora<select name="budgetUnitId" defaultValue={params.budgetUnitId} className={field}><option value="">Todas as UGs autorizadas</option>{units.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="grid gap-1">Nome do servidor/candidato<input name="q" defaultValue={params.q} className={field}/></label>
      <label className="grid gap-1">Vencimento inicial<input type="date" name="expiresFrom" defaultValue={params.expiresFrom} className={field}/></label>
      <label className="grid gap-1">Vencimento final<input type="date" name="expiresTo" defaultValue={params.expiresTo} className={field}/></label>
      <label className="grid gap-1">Pessoa e profissionais (até 5 nomes separados por ;)<input name="personQ" defaultValue={params.personQ} placeholder="Nome do candidato; Nome do médico" className={field}/></label>
      <label className="grid gap-1">Laboratórios para o formulário (mínimo 3 letras)<input name="laboratoryQ" defaultValue={params.laboratoryQ} className={field}/></label>
      <button className="w-fit rounded border px-4 py-2">Filtrar e carregar opções</button>
    </form>
    {invalidDates && <p role="alert">Informe um intervalo de vencimentos válido.</p>}
    {params.budgetUnitId && !unit && <p role="alert">A UG selecionada não está entre as unidades clínicas autorizadas.</p>}
    {canCreate && unit && <details className="rounded border p-3"><summary className="cursor-pointer font-semibold">Registrar ASO e exames</summary><p className="my-3 text-sm">Carregue a pessoa e os profissionais antes de preencher: até 5 nomes separados por ponto e vírgula, mínimo 3 letras, 20 resultados por nome; laboratório com 20 resultados e até 200 grupos de versões PCMSO. O servidor precisa estar vinculado à pessoa no RH.</p><AsoForm key={`${unit.id}:${params.personQ || ""}:${params.laboratoryQ || ""}`} budgetUnitId={unit.id} people={people} laboratories={laboratories} programs={programs}/></details>}
    <p className="text-sm">{total} ASO(s) no filtro · 20 registros por página</p>
    <table className="w-full table-fixed text-left text-sm"><thead><tr><th className="p-2">Pessoa / tipo</th><th className="p-2">Realização</th><th className="p-2">Vencimento</th><th className="p-2">Conclusão</th><th className="p-2">Ficha</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b"><td className="break-words p-2">{z.object({ personName: z.string() }).parse(record.snapshot).personName}<br/>{asoKinds[record.kind as keyof typeof asoKinds]}</td><td className="p-2">{formatSstCivilDate(record.performedAt)}</td><td className="p-2">{formatSstCivilDate(record.validUntil)}</td><td className="break-words p-2">{asoResults[record.result as keyof typeof asoResults]}</td><td className="p-2"><Link className="underline" href={`/sst/aso/${record.id}`}>Abrir</Link></td></tr>)}</tbody></table>
    {!records.length && <p className="rounded border p-3">Nenhum ASO encontrado.</p>}
    <ErpPagination page={page} total={total} previousHref={href(page - 1)} nextHref={href(page + 1)}/>
  </div>;
}
