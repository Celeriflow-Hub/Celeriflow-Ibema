import type { AppContext } from "@/lib/platform/tenant-context";
import { assertBudgetUnitAccess, canPerformModuleOperation } from "@/lib/platform/tenant-context";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";
import { certificateInput, reasonInput, assertCertificateReason } from "./certificate-policy";
import { assertSstClinicalAccess } from "./access";
import { z } from "zod";
import { getProtocolContext, protocolScope } from "@/lib/protocols/access";
import { SstValidationError } from "./errors";

export async function registerCertificate(context: AppContext, raw: unknown) {
  const input = certificateInput.parse(raw);
  await assertSstClinicalAccess(context, input.budgetUnitId);
  if (input.processId) {
    const protocolContext = await getProtocolContext();
    const process = await protocolContext.prisma.process.findFirst({ where: { AND: [{ id: input.processId }, protocolScope(protocolContext)] }, select: { id: true } });
    if (!process) throw new SstValidationError("Processo não encontrado ou sem acesso ao seu setor.");
  }
  return context.prisma.$transaction(async (tx) => {
    const [unit, employee, reason, issuer] = await Promise.all([
      tx.budgetUnit.findUnique({ where: { id: input.budgetUnitId } }),
      tx.employee.findUnique({ where: { id: input.employeeId } }),
      tx.sstCertificateReason.findUnique({ where: { id: input.reasonId } }),
      tx.person.findUnique({ where: { id: input.issuerPersonId }, select: { id: true } }),
    ]);
    if (!unit || !employee?.isActive || employee.secretariatId !== unit.secretariatId) throw new SstValidationError("A lotação do servidor não é compatível com a unidade gestora selecionada.");
    if (!issuer || !reason?.isActive || reason.budgetUnitId !== unit.id) throw new SstValidationError("Emitente ou motivo inválido.");
    assertCertificateReason(reason, employee.roleId, input.dependentId);
    const dependent = input.dependentId ? await tx.dependent.findFirst({ where: { id: input.dependentId, employeeId: employee.id } }) : null;
    if (input.dependentId && !dependent) throw new SstValidationError("O dependente não pertence ao servidor.");
    const presentedAt = reason.autoPresentedAt ? new Date() : new Date(input.presentedAt);
    if (!Number.isFinite(presentedAt.getTime())) throw new SstValidationError("Informe uma data de apresentação válida.");
    const protocolNumber = reason.autoProtocol ? `SST-${input.submissionKey}` : input.protocolNumber;
    if (!protocolNumber) throw new SstValidationError("Informe o protocolo de entrega.");
    const existing = await tx.sstMedicalCertificate.findUnique({ where: { budgetUnitId_protocolNumber: { budgetUnitId: unit.id, protocolNumber } } });
    if (existing) {
      const sameRequest = reason.autoProtocol && existing.createdById === context.user.id && existing.employeeId === employee.id && existing.reasonId === reason.id && existing.issuerPersonId === issuer.id && existing.issuerCouncil === input.issuerCouncil && existing.startsAt.getTime() === input.startsAt.getTime() && existing.endsAt.getTime() === input.endsAt.getTime() && (existing.dependentId || "") === input.dependentId && (existing.processId || "") === input.processId && (reason.autoPresentedAt || existing.presentedAt.getTime() === presentedAt.getTime()) && [...existing.cidCodes].sort().join(",") === [...new Set(input.cidCodes)].sort().join(",");
      if (!sameRequest) throw new SstValidationError("O protocolo já foi utilizado. Confira os dados antes de registrar outro atestado.");
      return { id: existing.id, printReceipt: reason.printReceipt, suggestLeave: reason.suggestLeave };
    }
    const record = await tx.sstMedicalCertificate.create({ data: {
      budgetUnitId: unit.id, employeeId: employee.id, reasonId: reason.id,
      issuerPersonId: issuer.id, issuerCouncil: input.issuerCouncil,
      dependentId: dependent?.id, relationship: dependent?.relationship,
      startsAt: input.startsAt, endsAt: input.endsAt, presentedAt, protocolNumber,
      processId: input.processId || null,
      cidCodes: [...new Set(input.cidCodes)], roleIdSnapshot: employee.roleId,
      departmentIdSnapshot: employee.departmentId, createdById: context.user.id,
    } });
    await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "SST_CERTIFICATE", targetId: record.id });
    return { id: record.id, printReceipt: reason.printReceipt, suggestLeave: reason.suggestLeave };
  });
}

export async function registerCertificateReason(context: AppContext, raw: unknown) {
  const input = reasonInput.parse(raw);
  assertBudgetUnitAccess(context.user, input.budgetUnitId);
  return context.prisma.$transaction(async (tx) => {
    const unit = await tx.budgetUnit.findUnique({ where: { id: input.budgetUnitId } });
    if (!unit) throw new SstValidationError("Unidade gestora não encontrada.");
    const roleIds = [...new Set(input.restrictedRoleIds)];
    if (roleIds.length && await tx.role.count({ where: { id: { in: roleIds } } }) !== roleIds.length) throw new SstValidationError("Um dos cargos selecionados não existe no cadastro funcional.");
    const record = await tx.sstCertificateReason.create({ data: input });
    await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "SST_REASON", targetId: record.id });
    return record.id;
  });
}

const assessmentInput = z.object({
  certificateId: z.string().min(1), examinerPersonId: z.string().min(1),
  examinerCouncil: z.string().trim().min(2).max(100),
  opinion: z.string().trim().min(10).max(10000),
  decision: z.enum(["APPROVED", "REJECTED"]), assessedAt: z.coerce.date(),
  confirmLeave: z.boolean().default(false),
});

export async function assessCertificate(context: AppContext, raw: unknown) {
  const input = assessmentInput.parse(raw);
  const original = await context.prisma.sstMedicalCertificate.findUnique({ where: { id: input.certificateId }, select: { budgetUnitId: true } });
  if (!original) throw new SstValidationError("Atestado não encontrado.");
  await assertSstClinicalAccess(context, original.budgetUnitId, true);
  return context.prisma.$transaction(async (tx) => {
    // Claim the state atomically: competing requests cannot generate duplicate leaves.
    const claimed = await tx.sstMedicalCertificate.updateMany({ where: { id: input.certificateId, status: "RECEIVED" }, data: { status: input.decision } });
    if (claimed.count !== 1) throw new SstValidationError("Este atestado já possui uma decisão. Atualize a consulta.");
    const certificate = await tx.sstMedicalCertificate.findUniqueOrThrow({ where: { id: input.certificateId }, include: { reason: true } });
    const examiner = await tx.person.findUnique({ where: { id: input.examinerPersonId }, select: { id: true } });
    if (!examiner) throw new SstValidationError("Perito não encontrado no Cadastro Único.");
    if (input.assessedAt > new Date()) throw new SstValidationError("A perícia não pode ter data futura.");
    const generateLeave = input.decision === "APPROVED" && (certificate.reason.createLeaveOnApproval || input.confirmLeave);
    if (generateLeave) {
      if (!canPerformModuleOperation(context.user, "RH", "create")) throw new SstValidationError("A integração exige permissão de inclusão no RH.");
      const activeRh = await tx.configuracaoModulo.findUnique({ where: { codigo: "RH" } });
      if (activeRh?.ativo === false) throw new SstValidationError("O módulo RH está desativado.");
      const conflict = await tx.leave.findFirst({ where: { employeeId: certificate.employeeId, status: "Ativa", startDate: { lte: certificate.endsAt }, endDate: { gte: certificate.startsAt } }, select: { id: true } });
      if (conflict) throw new SstValidationError("Já existe afastamento ativo neste período. Revise o vínculo antes de deferir.");
      const leave = await tx.leave.create({ data: { employeeId: certificate.employeeId, type: certificate.reason.leaveType, startDate: certificate.startsAt, endDate: certificate.endsAt, reason: `Atestado ocupacional ${certificate.protocolNumber}`, status: "Ativa" } });
      await tx.sstMedicalCertificate.update({ where: { id: certificate.id }, data: { leaveId: leave.id } });
    }
    await tx.sstMedicalAssessment.create({ data: { certificateId: certificate.id, examinerPersonId: examiner.id, examinerCouncil: input.examinerCouncil, decision: input.decision, opinion: input.opinion, assessedAt: input.assessedAt, createdById: context.user.id } });
    await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "SST_ASSESSMENT", targetId: certificate.id });
    return certificate.id;
  });
}
