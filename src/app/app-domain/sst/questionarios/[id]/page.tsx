import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantContextForModule, getTenantContextForModuleOperation, canPerformModuleOperation } from "@/lib/platform/tenant-context";
import { assertSstClinicalAccess } from "@/lib/sst/access";
import { questionnaireQuestions } from "@/lib/sst/questionnaire-policy";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";
import { QuestionnaireDocument } from "../QuestionnaireDocument";
import { QuestionnairePrint } from "../QuestionnairePrint";

export default async function SstQuestionnaireDetails({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ print?: string }> }) {
  const printing = (await searchParams).print === "1";
  const context = printing ? await getTenantContextForModuleOperation("SST", "issueReports") : await getTenantContextForModule("SST");
  const { id } = await params;
  const scope = await context.prisma.sstQuestionnaireVersion.findUnique({ where: { id }, select: { budgetUnitId: true } });
  if (!scope) notFound();
  await assertSstClinicalAccess(context, scope.budgetUnitId);
  const record = await context.prisma.sstQuestionnaireVersion.findUniqueOrThrow({ where: { id } });
  const questions = questionnaireQuestions.parse(record.questions);
  await writeAuditEvent(context.prisma, { actorUsuarioId: context.user.id, eventType: printing ? auditEventTypes.reportIssued : auditEventTypes.pageView, targetType: "SST_QUESTIONNAIRE", targetId: record.id });
  return <div className="space-y-4 p-4"><nav className="flex gap-4 print:hidden"><Link className="underline" href="/sst/questionarios">Voltar aos questionários</Link>{printing ? <QuestionnairePrint/> : canPerformModuleOperation(context.user, "SST", "issueReports") && <Link className="underline" href={`/sst/questionarios/${id}?print=1`}>Emitir em branco</Link>}</nav><article data-sst-questionnaire className="mx-auto max-w-4xl space-y-5 rounded border bg-white p-6 text-black"><h1 className="text-xl font-bold">{record.title}</h1><p>{record.code} · Versão {record.version} · Anamnese médica ocupacional</p>{printing && <p>Nome: ____________________________________ Data: ______________</p>}<QuestionnaireDocument questions={questions}/></article></div>;
}
