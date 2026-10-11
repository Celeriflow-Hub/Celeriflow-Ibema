import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantContextForModule, canPerformModuleOperation } from "@/lib/platform/tenant-context";
import { assertSstClinicalAccess } from "@/lib/sst/access";
import { asoKinds, asoResults, asoSnapshot, asoExamSnapshot, formatSstCivilDate } from "@/lib/sst/aso-policy";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";

export default async function SstAsoDetails({ params }: { params: Promise<{ id: string }> }) {
  const context = await getTenantContextForModule("SST");
  const { id } = await params;
  const scope = await context.prisma.sstAso.findUnique({ where: { id }, select: { budgetUnitId: true } });
  if (!scope) notFound();
  await assertSstClinicalAccess(context, scope.budgetUnitId);
  const record = await context.prisma.sstAso.findUniqueOrThrow({ where: { id }, include: { exams: { orderBy: { id: "asc" } } } });
  const snapshot = asoSnapshot.parse(record.snapshot);
  await writeAuditEvent(context.prisma, { actorUsuarioId: context.user.id, eventType: auditEventTypes.pageView, targetType: "SST_ASO_CLINICAL", targetId: record.id });
  return <div className="space-y-4 p-4"><header className="space-y-2"><h1 className="text-xl font-semibold">ASO · {snapshot.personName}</h1><Link href="/sst/aso" className="mr-4 underline">Voltar à consulta</Link>{canPerformModuleOperation(context.user, "SST", "issueReports") && <Link href={`/sst/aso/${id}/imprimir`} className="underline">Emitir documento para impressão</Link>}</header>
    <Link className="inline-block rounded border px-3 py-2" href={`/sst/aso/${id}/anamnese`}>Anamnese e histórico de revisões</Link>
    <section className="grid gap-2 rounded border p-4 sm:grid-cols-2"><p>UG: {snapshot.unitName}</p><p>CPF: {snapshot.cpf}</p><p>Matrícula: {snapshot.registration || "Candidato sem vínculo"}</p><p>Referência do candidato: {record.candidateReference || "Não aplicável"}</p><p>Cargo: {snapshot.role || "Não informado"}</p><p>Local: {snapshot.department || "Não informado"}</p><p>Tipo: {asoKinds[record.kind as keyof typeof asoKinds]}</p><p>Conclusão: {asoResults[record.result as keyof typeof asoResults]}</p><p>Realização: {formatSstCivilDate(record.performedAt)}</p><p>Vencimento: {formatSstCivilDate(record.validUntil)}</p><p>Médico: {snapshot.examinerName} · {record.examinerCouncil}</p><p>PCMSO: {snapshot.programCode} v{snapshot.programVersion} · GHE {snapshot.group.code} {snapshot.group.name}</p></section>
    {record.recommendations && <section className="rounded border p-4"><h2 className="font-semibold">Restrições e recomendações</h2><p className="whitespace-pre-wrap">{record.recommendations}</p></section>}
    <h2 className="text-lg font-semibold">Exames associados</h2>{record.exams.map((exam) => { const details = asoExamSnapshot.parse(exam.snapshot); return <section key={exam.id} className="space-y-2 rounded border p-4"><h3 className="font-semibold">{exam.name} · {exam.kind}</h3><p>Origem: {exam.source === "APRESENTADO" ? "Apresentado pelo paciente" : "Realizado"}</p><p>Realização: {formatSstCivilDate(exam.performedAt)} · Validade: {formatSstCivilDate(exam.validUntil)}</p><p>Profissional: {details.professionalName} · {exam.professionalCouncil}</p><p>Laboratório: {details.laboratoryName || "Não informado"} · Laudo: {exam.reportNumber || "Não informado"}</p><p className="whitespace-pre-wrap">{exam.result}</p></section>; })}
  </div>;
}
