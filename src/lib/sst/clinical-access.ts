import { AccessError, isSystemAdministrator, type AppContext } from "@/lib/platform/tenant-context";
import { assertSstClinicalAccess, sstUnitWhere } from "./access";
import { disciplineInput, type ClinicalDiscipline } from "./clinical-policy";

export async function assertDisciplineAccess(context: AppContext, budgetUnitId: string, discipline: ClinicalDiscipline, write = false) {
  await assertSstClinicalAccess(context, budgetUnitId, write);
  if (isSystemAdministrator(context.user)) return;
  const grant = await context.prisma.sstDisciplineGrant.findUnique({ where: { usuarioId_budgetUnitId_discipline: { usuarioId: context.user.id, budgetUnitId, discipline: disciplineInput.parse(discipline) } } });
  if (!grant?.isActive || !grant.canRead || (write && !grant.canWrite)) throw new AccessError("Não há autorização para esta atuação profissional na UG.", 403);
}
export function disciplineUnitWhere(context: AppContext, discipline: ClinicalDiscipline, write = false) {
  return { ...sstUnitWhere(context), ...(isSystemAdministrator(context.user) ? {} : {
    sstAccessGrants: { some: { usuarioId: context.user.id, isActive: true, canReadClinical: true, ...(write ? { canAssess: true } : {}) } },
    sstDisciplineGrants: { some: { usuarioId: context.user.id, discipline, isActive: true, canRead: true, ...(write ? { canWrite: true } : {}) } },
  }) };
}
