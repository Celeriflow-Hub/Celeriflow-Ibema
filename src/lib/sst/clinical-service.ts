import { createHash } from "node:crypto";
import { AccessError, canPerformModuleOperation, isSystemAdministrator, type AppContext } from "@/lib/platform/tenant-context";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";
import { professionalInput, clinicalRecordInput, vaccinationInput, disciplineInput, type ClinicalDiscipline } from "./clinical-policy";
import { assertDisciplineAccess } from "./clinical-access";
import { questionnaireQuestions, validateQuestionnaireAnswers } from "./questionnaire-policy";
import { SstValidationError } from "./errors";
import type { Prisma } from "@prisma/client";

const hash = (input: unknown) => createHash("sha256").update(JSON.stringify(input)).digest("hex");
const day = (value: Date) => new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(value)}T00:00:00Z`);
function assertCreate(context: AppContext) { if (!canPerformModuleOperation(context.user, "SST", "create")) throw new AccessError("O perfil não permite incluir registros SST.", 403); }

export async function registerProfessionalRole(context: AppContext, raw: unknown) {
  if (!isSystemAdministrator(context.user)) throw new AccessError("Habilitação profissional exige administração técnica.", 403);
  const input = professionalInput.parse(raw);
  return context.prisma.$transaction(async (tx) => {
    // Lock the UG/discipline: the same user cannot be linked concurrently to two people.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`SST_PROFESSIONAL:${input.budgetUnitId}:${input.discipline}`}))`;
    if (!await tx.person.findUnique({ where: { id: input.personId }, select: { id: true } }) || !await tx.budgetUnit.findUnique({ where: { id: input.budgetUnitId }, select: { id: true } })) throw new SstValidationError("Pessoa ou UG não encontrada.");
    if (input.usuarioId && !await tx.usuario.findFirst({ where: { id: input.usuarioId, ativo: true }, select: { id: true } })) throw new SstValidationError("Usuário inexistente ou inativo.");
    const conflict = await tx.sstProfessionalRole.findFirst({ where: { budgetUnitId: input.budgetUnitId, discipline: input.discipline, isActive: true, OR: [{ personId: input.personId }, ...(input.usuarioId ? [{ usuarioId: input.usuarioId }] : [])], startsAt: { lte: input.endsAt }, endsAt: { gte: input.startsAt } } });
    if (conflict) throw new SstValidationError("Já existe habilitação sobreposta para a pessoa ou usuário nesta atuação/UG.");
    const record = await tx.sstProfessionalRole.create({ data: { ...input, usuarioId: input.usuarioId || null, createdById: context.user.id } });
    await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "SST_PROFESSIONAL", targetId: record.id });
    return record.id;
  });
}

async function professional(tx: Prisma.TransactionClient, context: AppContext, id: string, budgetUnitId: string, discipline: ClinicalDiscipline, when: Date, civilDate = false) {
  const date = civilDate ? when : day(when);
  await tx.$queryRaw`SELECT "id" FROM "SstProfessionalRole" WHERE "id" = ${id} FOR SHARE`;
  const record = await tx.sstProfessionalRole.findFirst({ where: { id, budgetUnitId, discipline, isActive: true, startsAt: { lte: date }, endsAt: { gte: date } }, include: { person: { select: { fullName: true } } } });
  if (!record || (!isSystemAdministrator(context.user) && record.usuarioId !== context.user.id)) throw new SstValidationError("Profissional fora da vigência, da UG/atuação ou sem vínculo com o usuário registrador.");
  return record;
}

export async function registerClinicalRecord(context: AppContext, raw: unknown) {
  assertCreate(context);
  const input = clinicalRecordInput.parse(raw);
  await assertDisciplineAccess(context, input.budgetUnitId, input.discipline, true);
  if (input.attendedAt > new Date()) throw new SstValidationError("Atendimento não pode ter data futura.");
  return context.prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`SST_CLINICAL:${input.budgetUnitId}:${input.submissionKey}`}))`;
    const questionnaire = input.questionnaireVersionId ? await tx.sstQuestionnaireVersion.findUnique({ where: { id: input.questionnaireVersionId } }) : null;
    if (input.questionnaireVersionId && (!questionnaire || questionnaire.budgetUnitId !== input.budgetUnitId || questionnaire.discipline !== input.discipline)) throw new SstValidationError("Questionário incompatível com a UG ou atuação.");
    const questions = questionnaire ? questionnaireQuestions.parse(questionnaire.questions) : [];
    const answers = questionnaire ? validateQuestionnaireAnswers(questions, input.answers) : {};
    const requestHash = hash({ ...input, answers });
    const existing = await tx.sstClinicalRecord.findUnique({ where: { budgetUnitId_submissionKey: { budgetUnitId: input.budgetUnitId, submissionKey: input.submissionKey } } });
    if (existing) { if (existing.createdById !== context.user.id || existing.requestHash !== requestHash) throw new SstValidationError("Submissão já utilizada com outros dados."); return existing.id; }
    const [author, subject, unit] = await Promise.all([
      professional(tx, context, input.professionalRoleId, input.budgetUnitId, input.discipline, input.attendedAt),
      tx.person.findUnique({ where: { id: input.personId }, include: { employee: { select: { secretariatId: true } } } }),
      tx.budgetUnit.findUniqueOrThrow({ where: { id: input.budgetUnitId } }),
    ]);
    if (!subject || (subject.employee && subject.employee.secretariatId !== unit.secretariatId)) throw new SstValidationError("Pessoa/vínculo funcional incompatível com a UG.");
    const medicineIds = input.requests.flatMap((request) => request.kind === "MEDICATION" ? [request.medicineId] : []);
    const medicines = medicineIds.length ? await tx.medicine.findMany({ where: { id: { in: [...new Set(medicineIds)] }, isActive: true }, select: { id: true, name: true } }) : [];
    if (medicines.length !== new Set(medicineIds).size) throw new SstValidationError("Medicamento inexistente ou inativo no catálogo canônico.");
    const record = await tx.sstClinicalRecord.create({ data: {
      ...input, cidCodes: [...new Set(input.cidCodes)], questionnaireVersionId: questionnaire?.id || null,
      questionnaireSnapshot: questionnaire ? { title: questionnaire.title, code: questionnaire.code, version: questionnaire.version, questions } : {}, answers,
      requests: input.requests.map((request) => request.kind === "MEDICATION" ? { ...request, description: medicines.find((medicine) => medicine.id === request.medicineId)!.name } : request),
      snapshot: { personName: subject.fullName, professionalName: author.person.fullName, council: author.council, unitName: unit.name, recordedByName: context.user.name },
      requestHash, createdById: context.user.id,
    } });
    await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "SST_CLINICAL_RECORD", targetId: record.id });
    return record.id;
  });
}

export async function registerOccupationalVaccination(context: AppContext, raw: unknown) {
  assertCreate(context);
  const input = vaccinationInput.parse(raw);
  const role = await context.prisma.sstProfessionalRole.findUnique({ where: { id: input.professionalRoleId }, select: { discipline: true } });
  const discipline = disciplineInput.parse(role?.discipline);
  if (discipline !== "MEDICINE" && discipline !== "NURSING") throw new SstValidationError("Registro vacinal exige profissional de Medicina ou Enfermagem.");
  await assertDisciplineAccess(context, input.budgetUnitId, discipline, true);
  if (input.administeredAt > day(new Date())) throw new SstValidationError("Vacinação não pode ter data futura.");
  const requestHash = hash(input);
  return context.prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`SST_VACCINE:${input.budgetUnitId}:${input.submissionKey}`}))`;
    const existing = await tx.sstVaccination.findUnique({ where: { budgetUnitId_submissionKey: { budgetUnitId: input.budgetUnitId, submissionKey: input.submissionKey } } });
    if (existing) { if (existing.createdById !== context.user.id || existing.requestHash !== requestHash) throw new SstValidationError("Submissão já utilizada com outros dados."); return existing.id; }
    const [author, person, unit, vaccine] = await Promise.all([professional(tx, context, input.professionalRoleId, input.budgetUnitId, discipline, input.administeredAt, true), tx.person.findUnique({ where: { id: input.personId }, include: { employee: { select: { secretariatId: true } } } }), tx.budgetUnit.findUniqueOrThrow({ where: { id: input.budgetUnitId } }), tx.vaccine.findFirst({ where: { id: input.vaccineId, isActive: true } })]);
    if (!person?.employee || person.employee.secretariatId !== unit.secretariatId || !vaccine) throw new SstValidationError("Servidor ou vacina incompatível com o cadastro ocupacional.");
    const record = await tx.sstVaccination.create({ data: { ...input, snapshot: { personName: person.fullName, professionalName: author.person.fullName, council: author.council, unitName: unit.name, vaccineName: vaccine.name, recordedByName: context.user.name }, requestHash, createdById: context.user.id } });
    await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "SST_VACCINATION", targetId: record.id });
    return record.id;
  });
}
