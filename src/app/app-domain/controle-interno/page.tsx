import { getTenantContextForModule, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { ControlClient } from "./ControlClient";
import { ControlChecklistsClient } from "./ControlChecklistsClient";
import { readControlChecklist } from "@/lib/c7/control-checklists";
import { readControlNotice } from "@/lib/c7/control-notifications";
import { ControlNotificationsClient } from "./ControlNotificationsClient";
import type { Prisma } from "@prisma/client";
import { readControlAgenda } from "@/lib/c7/control-agenda";
import { ControlAgendaClient } from "./ControlAgendaClient";

export default async function ControleInternoPage() {
  const { prisma, user } = await getTenantContextForModule("ADMINISTRACAO");
  const units = await prisma.budgetUnit.findMany({ where: { ...(isSystemAdministrator(user) ? {} : { id: { in: user.allowedBudgetUnitIds } }), planningEntityUnit: { isNot: null } }, select: { id: true, name: true, secretariatId: true, planningEntityUnit: { select: { governmentEntityId: true, governmentEntity: { select: { name: true } } } } }, orderBy: { code: "asc" } });
  const [plans, employees, documents, recipients, centers, agenda] = await Promise.all([
    prisma.internalControlPlan.findMany({ where: isSystemAdministrator(user) ? {} : { budgetUnitId: { in: units.map((unit) => unit.id) } }, include: { budgetUnit: { select: { name: true } }, findings: { orderBy: { createdAt: "desc" } }, events: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] } }, orderBy: { createdAt: "desc" } }),
    prisma.employee.findMany({ where: { isActive: true, ...(isSystemAdministrator(user) ? {} : { secretariatId: { in: units.map((unit) => unit.secretariatId) } }) }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.document.findMany({ where: { status: "Válido" }, select: { id: true, title: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.usuario.findMany({ where: { ativo: true, unidadesGestoras: { some: { budgetUnitId: { in: units.map(unit => unit.id) } } } }, select: { id: true, nome: true, unidadesGestoras: { select: { budgetUnitId: true } } }, orderBy: { nome: "asc" } }),
    prisma.costCenter.findMany({ where: { isActive: true, OR: units.map(unit => ({ secretariatId: unit.secretariatId, governmentEntityId: unit.planningEntityUnit?.governmentEntityId ?? "" })) }, select: { id: true, name: true, secretariatId: true, governmentEntityId: true }, orderBy: { code: "asc" } }),
    readControlAgenda(prisma, { usuarioId: user.id, allowedBudgetUnitIds: isSystemAdministrator(user) ? undefined : user.allowedBudgetUnitIds }),
  ]);
  const notices = plans.flatMap(plan => plan.events.filter(event => event.eventType === "CONTROL_NOTICE_SENT").flatMap(event => {
    const notice = readControlNotice(event.snapshot);
    if (!notice || (notice.recipientId !== user.id && event.actorId !== user.id && plan.ownerId !== user.id)) return [];
    const response = plan.events.find(item => item.eventType === "CONTROL_NOTICE_RESPONDED" && (item.snapshot as Prisma.JsonObject).noticeId === event.id);
    const review = plan.events.find(item => item.eventType === "CONTROL_NOTICE_REVIEWED" && (item.snapshot as Prisma.JsonObject).noticeId === event.id);
    return [{ ...notice, id: event.id, planId: plan.id, actorId: event.actorId, message: event.reason, recipientName: recipients.find(recipient => recipient.id === notice.recipientId)?.nome ?? notice.recipientId, response: response?.reason ?? null, review: review ? { reason: review.reason, accepted: (review.snapshot as Prisma.JsonObject).accepted === true } : null }];
  }));
  const visibleNoticeIds = new Set(notices.map(notice => notice.id));
  const visiblePlans = plans.map(plan => ({ ...plan, events: plan.events.filter(event => {
    if (event.eventType === "CONTROL_NOTICE_SENT") return visibleNoticeIds.has(event.id);
    if (["CONTROL_NOTICE_RESPONDED", "CONTROL_NOTICE_REVIEWED"].includes(event.eventType)) return visibleNoticeIds.has(String((event.snapshot as Prisma.JsonObject).noticeId));
    if (event.eventType.startsWith("CONTROL_OBLIGATION_")) {
      if (event.eventType === "CONTROL_OBLIGATION_ALERTED") return (event.snapshot as Prisma.JsonObject).recipientId === user.id || plan.ownerId === user.id;
      const id = event.eventType === "CONTROL_OBLIGATION_SCHEDULED" ? event.id : String((event.snapshot as Prisma.JsonObject).obligationId);
      return agenda.some(item => item.id === id);
    }
    return true;
  }) }));
  return (
    <PageFrame className="space-y-2 [&>div]:space-y-4 [&>div]:p-0 [&>div>div:first-child]:hidden">
      <PageHeader title="Controle Interno" />
      <ControlClient plans={visiblePlans} employees={employees} documents={documents} budgetUnits={units.map((unit) => ({ id: unit.id, name: `${unit.planningEntityUnit?.governmentEntity.name} — ${unit.name}` }))} />
      <ControlChecklistsClient plans={plans.map(plan => ({ id: plan.id, title: plan.title, status: plan.status }))} editions={plans.flatMap(plan => plan.events.filter(event => event.eventType === "CHECKLIST_PUBLISHED").flatMap(event => { const checklist = readControlChecklist(event.snapshot); return checklist ? [{ id: event.id, planId: plan.id, ...checklist }] : []; }))} />
      <ControlNotificationsClient plans={plans.map(plan => ({ id: plan.id, title: plan.title, ownerId: plan.ownerId, budgetUnitId: plan.budgetUnitId, status: plan.status, findings: plan.findings.map(finding => ({ id: finding.id, title: finding.title, status: finding.status })) }))} notices={notices} recipients={recipients.map(recipient => ({ id: recipient.id, name: recipient.nome, budgetUnitIds: recipient.unidadesGestoras.map(unit => unit.budgetUnitId) }))} documents={documents} userId={user.id} />
      <ControlAgendaClient agenda={agenda} plans={plans.map(plan => ({ id: plan.id, title: plan.title, ownerId: plan.ownerId, status: plan.status, budgetUnitId: plan.budgetUnitId }))} recipients={recipients.map(recipient => ({ id: recipient.id, name: recipient.nome, budgetUnitIds: recipient.unidadesGestoras.map(unit => unit.budgetUnitId) }))} centers={centers.map(center => ({ id: center.id, name: center.name, budgetUnitIds: units.filter(unit => unit.secretariatId === center.secretariatId && unit.planningEntityUnit?.governmentEntityId === center.governmentEntityId).map(unit => unit.id) }))} userId={user.id} />
    </PageFrame>
  );
}
