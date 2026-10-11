import type { AppContext } from "@/lib/platform/tenant-context";
import { assertSstClinicalAccess } from "./access";
import { absenceMinutes } from "./certificate-policy";
import { z } from "zod";
import { SstValidationError } from "./errors";
import type { Prisma } from "@prisma/client";

export const reportInput = z.object({
  budgetUnitId: z.string().min(1), from: z.coerce.date(), until: z.coerce.date(),
  employeeId: z.string().default(""), roleId: z.string().default(""), departmentId: z.string().default(""),
  reasonId: z.string().default(""), issuerPersonId: z.string().default(""), cid: z.string().trim().toUpperCase().default(""),
  status: z.enum(["", "RECEIVED", "APPROVED", "REJECTED"]).default(""),
}).refine((value) => value.until > value.from && value.until.getTime() - value.from.getTime() <= 366 * 86400000, "Selecione um período de até um ano.");

export async function certificateReport(context: AppContext, raw: unknown) {
  const input = reportInput.parse(raw);
  await assertSstClinicalAccess(context, input.budgetUnitId);
  const where: Prisma.SstMedicalCertificateWhereInput = {
    budgetUnitId: input.budgetUnitId, startsAt: { lt: input.until }, endsAt: { gt: input.from },
    ...(input.employeeId ? { employeeId: input.employeeId } : {}), ...(input.roleId ? { roleIdSnapshot: input.roleId } : {}),
    ...(input.departmentId ? { departmentIdSnapshot: input.departmentId } : {}), ...(input.reasonId ? { reasonId: input.reasonId } : {}),
    ...(input.issuerPersonId ? { issuerPersonId: input.issuerPersonId } : {}), ...(input.cid ? { cidCodes: { has: input.cid } } : {}),
    ...(input.status ? { status: input.status } : {}),
  };
  const total = await context.prisma.sstMedicalCertificate.count({ where });
  if (total > 10000) throw new SstValidationError("O período possui mais de 10.000 atestados. Restrinja os filtros para emitir o relatório.");
  const records = await context.prisma.sstMedicalCertificate.findMany({ where, take: 10000, orderBy: [{ startsAt: "asc" }, { id: "asc" }], select: {
    id: true, employeeId: true, startsAt: true, endsAt: true, cidCodes: true, status: true, protocolNumber: true,
    employee: { select: { name: true, registration: true, person: { select: { birthDate: true } } } },
    issuer: { select: { fullName: true } }, reason: { select: { name: true } },
  } });
  const plannedWhere: Prisma.SstPlannedShiftWhereInput = { budgetUnitId: input.budgetUnitId, ...(input.employeeId ? { employeeId: input.employeeId } : {}), ...(input.roleId ? { roleIdSnapshot: input.roleId } : {}), ...(input.departmentId ? { departmentIdSnapshot: input.departmentId } : {}), startsAt: { lt: input.until }, endsAt: { gt: input.from } };
  if (await context.prisma.sstPlannedShift.count({ where: plannedWhere }) > 50000) throw new SstValidationError("Restrinja o período: há mais de 50.000 turnos planejados.");
  const planned = await context.prisma.sstPlannedShift.findMany({ where: plannedWhere, take: 50000, include: { employee: { select: { name: true } } } });
  const employees = [...new Set([...records.map((item) => item.employeeId), ...planned.map((item) => item.employeeId)])];
  const clipped = (value: { startsAt: Date; endsAt: Date }) => ({ start: new Date(Math.max(value.startsAt.getTime(), input.from.getTime())), end: new Date(Math.min(value.endsAt.getTime(), input.until.getTime())) });
  const statistics = employees.map((employeeId) => {
    const certificates = records.filter((item) => item.employeeId === employeeId);
    // Only approved certificates count as accepted absence; received/rejected remain in operational counts.
    const minutes = absenceMinutes(planned.filter((item) => item.employeeId === employeeId).map(clipped), certificates.filter((item) => item.status === "APPROVED").map(clipped));
    const acceptedCalendarDays = absenceMinutes([{ start: input.from, end: input.until }], certificates.filter((item) => item.status === "APPROVED").map(clipped)).absentMinutes / 1440;
    return { employeeId, name: certificates[0]?.employee.name || planned.find((item) => item.employeeId === employeeId)!.employee.name, ...minutes, acceptedCalendarDays, certificateCount: certificates.length };
  });
  const cidCounts: Record<string, number> = {};
  for (const record of records) for (const cid of new Set(record.cidCodes)) cidCounts[cid] = (cidCounts[cid] || 0) + 1;
  const people = new Map(records.map((record) => [record.employeeId, record.employee.person?.birthDate]));
  const ages = [...people.values()].flatMap((birthDate) => birthDate && birthDate < input.until ? [(input.until.getTime() - birthDate.getTime()) / (365.2425 * 86400000)] : []);
  return { records, statistics, cidCounts, total, meanAge: ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : null };
}
