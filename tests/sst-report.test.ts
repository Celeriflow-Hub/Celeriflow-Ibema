import test from "node:test";
import assert from "node:assert/strict";
import { certificateReport } from "../src/lib/sst/report-service";
import type { AppContext } from "../src/lib/platform/tenant-context";

test("absence report includes planned workers without certificates in its denominator", async () => {
  const date = (value: string) => new Date(`2026-10-10T${value}:00Z`);
  const records = [{ id: "c", employeeId: "absent", startsAt: date("08:00"), endsAt: date("12:00"), status: "APPROVED", cidCodes: ["M54.5"], employee: { name: "Ausente", person: { birthDate: null } } }];
  const planned = [{ employeeId: "absent", startsAt: date("08:00"), endsAt: date("16:00"), employee: { name: "Ausente" } }, { employeeId: "present", startsAt: date("08:00"), endsAt: date("16:00"), employee: { name: "Presente" } }];
  const context = {
    user: { id: "u", profileCode: "OPERADOR", allowedBudgetUnitIds: ["ug"] },
    prisma: {
      sstAccessGrant: { findUnique: async () => ({ isActive: true, canReadClinical: true }) },
      sstMedicalCertificate: { count: async () => 1, findMany: async () => records },
      sstPlannedShift: { count: async () => 2, findMany: async () => planned },
    },
  } as unknown as AppContext;
  const report = await certificateReport(context, { budgetUnitId: "ug", from: date("00:00"), until: date("23:59") });
  assert.equal(report.statistics.length, 2);
  assert.equal(report.statistics.reduce((sum, item) => sum + item.plannedMinutes, 0), 960);
  assert.equal(report.statistics.reduce((sum, item) => sum + item.absentMinutes, 0), 240);
  assert.equal(report.statistics.find((item) => item.employeeId === "present")?.certificateCount, 0);
});
