import { Prisma } from "@prisma/client";
import type { AppContext } from "@/lib/platform/tenant-context";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import {
  healthAppointmentCompletionSchema,
  healthAppointmentCreateSchema,
  healthAppointmentTransitionSchema,
} from "./contract";
import {
  assertHealthAppointmentCanBeCompleted,
  assertHealthAppointmentTransition,
  parseBrazilDateTime,
} from "./appointment-policy";

type Tx = Prisma.TransactionClient;

export class HealthOperationError extends Error {}

async function serializable<T>(context: AppContext, operation: (tx: Tx) => Promise<T>) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await context.prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 15000,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
  throw new HealthOperationError("Nao foi possivel confirmar a operacao concorrente. Reabra a agenda e tente novamente.");
}

async function requireActiveAppointmentReferences(tx: Tx, patientId: string, unitId: string, professionalId: string | null) {
  const [patient, unit] = await Promise.all([
    tx.patient.findFirst({ where: { id: patientId, status: "Ativo" }, select: { id: true } }),
    tx.healthUnit.findFirst({ where: { id: unitId, isActive: true }, select: { id: true } }),
  ]);

  if (!patient) throw new HealthOperationError("Paciente nao encontrado ou inativo.");
  if (!unit) throw new HealthOperationError("Unidade de saude nao encontrada ou inativa.");

  if (!professionalId) return null;
  const professional = await tx.healthProfessional.findFirst({
    where: { id: professionalId, isActive: true },
    select: { id: true, unitId: true, employee: { select: { isActive: true } } },
  });
  if (!professional || !professional.employee.isActive) throw new HealthOperationError("Profissional nao encontrado ou inativo.");
  if (professional.unitId && professional.unitId !== unitId) {
    throw new HealthOperationError("O profissional selecionado deve pertencer a unidade do agendamento.");
  }
  return professional;
}

export async function createHealthAppointment(context: AppContext, raw: unknown) {
  const input = healthAppointmentCreateSchema.parse(raw);
  const date = parseBrazilDateTime(input.date);

  return serializable(context, async tx => {
    await requireActiveAppointmentReferences(tx, input.patientId, input.unitId, input.professionalId);
    const conflict = await tx.healthAppointment.findFirst({
      where: {
        date,
        status: { notIn: ["Cancelado", "Faltou"] },
        OR: [
          { patientId: input.patientId },
          ...(input.professionalId ? [{ professionalId: input.professionalId }] : []),
        ],
      },
      select: { id: true },
    });
    if (conflict) {
      throw new HealthOperationError("O paciente ou profissional ja possui um agendamento ativo nesse horario.");
    }

    const appointment = await tx.healthAppointment.create({
      data: {
        date,
        patientId: input.patientId,
        unitId: input.unitId,
        professionalId: input.professionalId,
        specialty: input.specialty,
        priority: input.priority,
        status: "Agendado",
      },
      select: { id: true },
    });
    await writeAuditEvent(tx, {
      actorUsuarioId: context.user.id,
      eventType: auditEventTypes.administrativeMutation,
      targetType: "HEALTH_APPOINTMENT",
      targetId: appointment.id,
    });
    return appointment;
  });
}

export async function transitionHealthAppointment(context: AppContext, raw: unknown) {
  const input = healthAppointmentTransitionSchema.parse(raw);

  return serializable(context, async tx => {
    const appointment = await tx.healthAppointment.findUnique({
      where: { id: input.appointmentId },
      select: { id: true, status: true, medicalRecord: { select: { id: true } } },
    });
    if (!appointment) throw new HealthOperationError("Agendamento nao encontrado.");
    if (appointment.medicalRecord) throw new HealthOperationError("O agendamento ja possui prontuario e seu status esta protegido.");
    assertHealthAppointmentTransition(appointment.status, input.status);

    const updated = await tx.healthAppointment.update({
      where: { id: appointment.id },
      data: input.status === "Cancelado"
        ? { status: input.status, cancelledAt: new Date(), cancellationReason: input.cancellationReason }
        : { status: input.status, cancelledAt: null, cancellationReason: null },
      select: { id: true },
    });
    await writeAuditEvent(tx, {
      actorUsuarioId: context.user.id,
      eventType: auditEventTypes.administrativeMutation,
      targetType: "HEALTH_APPOINTMENT",
      targetId: updated.id,
    });
    return updated;
  });
}

export async function completeHealthAppointment(context: AppContext, raw: unknown) {
  const input = healthAppointmentCompletionSchema.parse(raw);
  if (!context.user.employeeId) {
    throw new HealthOperationError("Vincule o usuario autenticado a um profissional de saude para registrar atendimento.");
  }

  try {
    return await serializable(context, async tx => {
      const professional = await tx.healthProfessional.findFirst({
        where: { employeeId: context.user.employeeId!, isActive: true },
        select: { id: true, unitId: true, employee: { select: { isActive: true } } },
      });
      if (!professional || !professional.employee.isActive) throw new HealthOperationError("O servidor autenticado nao possui cadastro ativo como profissional de saude.");

      const appointment = await tx.healthAppointment.findUnique({
        where: { id: input.appointmentId },
        select: {
          id: true,
          status: true,
          patientId: true,
          unitId: true,
          professionalId: true,
          medicalRecord: { select: { id: true } },
        },
      });
      if (!appointment) throw new HealthOperationError("Agendamento nao encontrado.");
      if (appointment.medicalRecord) throw new HealthOperationError("Este agendamento ja possui um prontuario registrado.");
      assertHealthAppointmentCanBeCompleted(appointment.status);
      if (appointment.professionalId && appointment.professionalId !== professional.id) {
        throw new HealthOperationError("O agendamento pertence a outro profissional de saude.");
      }
      if (professional.unitId && professional.unitId !== appointment.unitId) {
        throw new HealthOperationError("O profissional autenticado nao esta vinculado a unidade deste agendamento.");
      }

      const record = await tx.medicalRecord.create({
        data: {
          type: input.type,
          bloodPressure: input.bloodPressure,
          temperature: input.temperature,
          weight: input.weight,
          height: input.height,
          heartRate: input.heartRate,
          chiefComplaint: input.chiefComplaint,
          evolution: input.evolution,
          conduct: input.conduct,
          patientId: appointment.patientId,
          unitId: appointment.unitId,
          professionalId: professional.id,
          appointmentId: appointment.id,
        },
        select: { id: true },
      });
      await tx.healthAppointment.update({
        where: { id: appointment.id },
        data: { status: "Atendido", professionalId: professional.id },
      });
      await writeAuditEvent(tx, {
        actorUsuarioId: context.user.id,
        eventType: auditEventTypes.administrativeMutation,
        targetType: "MEDICAL_RECORD",
        targetId: record.id,
      });
      await writeAuditEvent(tx, {
        actorUsuarioId: context.user.id,
        eventType: auditEventTypes.administrativeMutation,
        targetType: "HEALTH_APPOINTMENT",
        targetId: appointment.id,
      });
      return record;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HealthOperationError("Este agendamento ja possui um prontuario registrado.");
    }
    throw error;
  }
}
