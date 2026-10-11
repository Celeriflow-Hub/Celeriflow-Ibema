import Link from "next/link";
import { z } from "zod";
import { notFound } from "next/navigation";
import { getTenantContextForModule, getTenantContextForModuleOperation, canPerformModuleOperation } from "@/lib/platform/tenant-context";
import { assertDisciplineAccess } from "@/lib/sst/clinical-access";
import { clinicalDisciplines, disciplineInput, clinicalSnapshot, clinicalRequest } from "@/lib/sst/clinical-policy";
import { questionnaireQuestions } from "@/lib/sst/questionnaire-policy";
import { QuestionnaireDocument } from "../../questionarios/QuestionnaireDocument";
import { QuestionnairePrint } from "../../questionarios/QuestionnairePrint";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";

export default async function SstClinicalDetails({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ print?: string; report?: string }> }) {
  const search = await searchParams;
  const printing = search.print === "1";
  const context = printing ? await getTenantContextForModuleOperation("SST", "issueReports") : await getTenantContextForModule("SST");
  const { id } = await params;
  const scope = await context.prisma.sstClinicalRecord.findUnique({ where: { id }, select: { budgetUnitId: true, discipline: true } });
  if (!scope) notFound();
  const discipline = disciplineInput.parse(scope.discipline);
  await assertDisciplineAccess(context, scope.budgetUnitId, discipline);
  const record = await context.prisma.sstClinicalRecord.findUniqueOrThrow({ where: { id } });
  const snapshot = clinicalSnapshot.parse(record.snapshot);
  const questionnaire = record.questionnaireVersionId ? z.object({ title: z.string(), version: z.number(), questions: questionnaireQuestions }).parse(record.questionnaireSnapshot) : null;
  const requests = z.array(clinicalRequest).parse(record.requests);
  const report = search.report === "requests" ? "Solicitações e encaminhamentos" : search.report === "opinion" && discipline === "MEDICINE" ? "Laudo médico ocupacional" : `Prontuário ocupacional · ${clinicalDisciplines[discipline]}`;
  await writeAuditEvent(context.prisma, { actorUsuarioId: context.user.id, eventType: printing ? auditEventTypes.reportIssued : auditEventTypes.pageView, targetType: "SST_CLINICAL_RECORD", targetId: id });
  return <div className="space-y-4 p-4">
    <nav className="flex flex-wrap gap-4 print:hidden">
      <Link className="underline" href={`/sst/prontuarios?discipline=${discipline}&budgetUnitId=${record.budgetUnitId}`}>Voltar à consulta</Link>
      {printing ? <QuestionnairePrint/> : canPerformModuleOperation(context.user, "SST", "issueReports") && <>
        <Link className="underline" href="?print=1">Emitir prontuário</Link>
        <Link className="underline" href="?print=1&report=requests">Emitir solicitações</Link>
        {discipline === "MEDICINE" && <Link className="underline" href="?print=1&report=opinion">Emitir laudo</Link>}
      </>}
    </nav>
    <article data-sst-questionnaire className="mx-auto max-w-4xl space-y-4 rounded border bg-white p-6 text-black">
      <h1 className="text-xl font-semibold">{report}</h1>
      <p>Pessoa: {snapshot.personName} · UG: {snapshot.unitName}</p>
      <p>Profissional: {snapshot.professionalName} · {snapshot.council}</p>
      <p>Atendimento: {record.attendedAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} · Registrador: {snapshot.recordedByName}</p>
      <p className="whitespace-pre-wrap">Contexto: {record.occupationalContext}</p>
      {search.report !== "requests" && <>
        <h2 className="font-semibold">Atendimento</h2><p className="whitespace-pre-wrap">{record.narrative}</p>
        <h2 className="font-semibold">Parecer</h2><p className="whitespace-pre-wrap">{record.opinion}</p>
        <p className="whitespace-pre-wrap">Diagnóstico: {record.diagnosis || "Não informado"}</p>
        <p>CIDs: {record.cidCodes.join("; ") || "Não informados"}</p>
      </>}
      {requests.map((request,index) => <section key={index} className="space-y-2 rounded border p-3">
        <h2 className="font-semibold">{request.kind} · {request.description}</h2><p className="whitespace-pre-wrap">{request.instructions}</p>
        {request.kind === "MEDICATION" && <p>Quantidade: {request.quantity} · Dias: {request.days}</p>}
      </section>)}
      {questionnaire && search.report !== "requests" && <section>
        <h2 className="font-semibold">{questionnaire.title} v{questionnaire.version}</h2>
        <QuestionnaireDocument questions={questionnaire.questions} answers={z.record(z.string(), z.unknown()).parse(record.answers)}/>
      </section>}
      {printing && <div className="pt-8">________________________________________<p>Assinatura do profissional</p></div>}
    </article>
  </div>;
}
