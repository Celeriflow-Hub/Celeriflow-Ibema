import { getTenantContextForModule, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { ControlClient } from "./ControlClient";
import { ControlChecklistsClient } from "./ControlChecklistsClient";
import { readControlChecklist } from "@/lib/c7/control-checklists";

export default async function ControleInternoPage() {
  const { prisma, user } = await getTenantContextForModule("ADMINISTRACAO");
  const units = await prisma.budgetUnit.findMany({ where: { ...(isSystemAdministrator(user) ? {} : { id: { in: user.allowedBudgetUnitIds } }), planningEntityUnit: { isNot: null } }, select: { id: true, name: true, secretariatId: true, planningEntityUnit: { select: { governmentEntity: { select: { name: true } } } } }, orderBy: { code: "asc" } });
  const [plans, employees, documents] = await Promise.all([
    prisma.internalControlPlan.findMany({ where: isSystemAdministrator(user) ? {} : { budgetUnitId: { in: units.map((unit) => unit.id) } }, include: { budgetUnit: { select: { name: true } }, findings: { orderBy: { createdAt: "desc" } }, events: { orderBy: [{ createdAt: "desc" }, { id: "desc" }] } }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.employee.findMany({ where: { isActive: true, ...(isSystemAdministrator(user) ? {} : { secretariatId: { in: units.map((unit) => unit.secretariatId) } }) }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.document.findMany({ where: { status: "Válido" }, select: { id: true, title: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return (
    <PageFrame className="space-y-2 [&>div]:space-y-4 [&>div]:p-0 [&>div>div:first-child]:hidden">
      <PageHeader title="Controle Interno" />
      <ControlClient plans={plans} employees={employees} documents={documents} budgetUnits={units.map((unit) => ({ id: unit.id, name: `${unit.planningEntityUnit?.governmentEntity.name} — ${unit.name}` }))} />
      <ControlChecklistsClient plans={plans} editions={plans.flatMap(plan => plan.events.filter(event => event.eventType === "CHECKLIST_PUBLISHED").flatMap(event => { const checklist = readControlChecklist(event.snapshot); return checklist ? [{ id: event.id, planId: plan.id, ...checklist }] : []; }))} />
    </PageFrame>
  );
}
