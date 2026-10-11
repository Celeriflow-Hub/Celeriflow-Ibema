import { createHash } from "node:crypto";
import { z } from "zod";
import { AccessError, canPerformModuleOperation, type AppContext } from "@/lib/platform/tenant-context";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";
import { assertSstClinicalAccess } from "./access";
import { asoInput, asoGroupSnapshot, assertAsoProgram } from "./aso-policy";
import { SstValidationError } from "./errors";

export async function registerAso(context: AppContext, raw: unknown) {
  if (!canPerformModuleOperation(context.user, "SST", "create")) throw new AccessError("O perfil não permite incluir ASO.", 403);
  const input = asoInput.parse(raw);
  await assertSstClinicalAccess(context, input.budgetUnitId, true);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (input.performedAt.toISOString().slice(0, 10) > today) throw new SstValidationError("O ASO não pode ser realizado em data futura.");
  const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  return context.prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`SST_ASO:${input.budgetUnitId}:${input.submissionKey}`}))`;
    const existing = await tx.sstAso.findUnique({ where: { budgetUnitId_submissionKey: { budgetUnitId: input.budgetUnitId, submissionKey: input.submissionKey } } });
    if (existing) {
      if (existing.createdById !== context.user.id || existing.requestHash !== requestHash) throw new SstValidationError("Esta submissão já foi utilizada com outros dados. Abra um novo formulário.");
      return existing.id;
    }
    const [unit, person, examiner, group] = await Promise.all([
      tx.budgetUnit.findUnique({ where: { id: input.budgetUnitId } }),
      tx.person.findUnique({ where: { id: input.personId }, include: { employee: { include: { role: true, department: true } } } }),
      tx.person.findUnique({ where: { id: input.examinerPersonId }, select: { fullName: true } }),
      tx.sstProgramExposureGroup.findUnique({ where: { id: input.programGroupId }, include: { program: true } }),
    ]);
    if (!unit || !person || !examiner || !group) throw new SstValidationError("Confira a pessoa, o médico, a UG e a versão PCMSO selecionados.");
    const groupSnapshot = asoGroupSnapshot.parse(group.groupSnapshot);
    const prescribedExams = z.array(z.object({ name: z.string(), occasion: z.string() })).parse(group.exams);
    assertAsoProgram(input, group.program, groupSnapshot, prescribedExams, person.employee, unit.secretariatId);
    const professionals = await tx.person.findMany({ where: { id: { in: [...new Set(input.exams.map((exam) => exam.professionalPersonId))] } }, select: { id: true, fullName: true } });
    const labIds = [...new Set(input.exams.map((exam) => exam.laboratoryCompanyId).filter(Boolean))];
    const labs = labIds.length ? await tx.company.findMany({ where: { id: { in: labIds } }, select: { id: true, corporateName: true } }) : [];
    if (professionals.length !== new Set(input.exams.map((exam) => exam.professionalPersonId)).size || labs.length !== labIds.length) throw new SstValidationError("Profissional ou laboratório não encontrado no Cadastro Único.");
    const record = await tx.sstAso.create({ data: {
      budgetUnitId: input.budgetUnitId, personId: person.id, employeeId: person.employee?.id || null,
      candidateReference: person.employee ? null : input.candidateReference,
      programGroupId: group.id, examinerPersonId: input.examinerPersonId, examinerCouncil: input.examinerCouncil,
      kind: input.kind, result: input.result, performedAt: input.performedAt, validUntil: input.validUntil,
      recommendations: input.recommendations, expectedExamCount: input.exams.length, submissionKey: input.submissionKey, requestHash, createdById: context.user.id,
      snapshot: {
        personName: person.fullName, cpf: person.cpf, registration: person.employee?.registration || null,
        role: person.employee?.role?.name || null, department: person.employee?.department?.name || null,
        unitName: unit.name, examinerName: examiner.fullName, programCode: group.program.code,
        programVersion: group.program.version, group: groupSnapshot, prescribedExams,
      },
      exams: { create: input.exams.map((exam) => ({
        ...exam, laboratoryCompanyId: exam.laboratoryCompanyId || null, reportNumber: exam.reportNumber || null,
        snapshot: { professionalName: professionals.find((person) => person.id === exam.professionalPersonId)!.fullName, laboratoryName: labs.find((lab) => lab.id === exam.laboratoryCompanyId)?.corporateName || null },
      })) },
    } });
    await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "SST_ASO", targetId: record.id });
    return record.id;
  });
}
