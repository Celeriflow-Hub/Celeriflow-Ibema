import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("a migration de agenda preserva historico de cancelamento e indices de consulta", async () => {
  const migration = await readFile(
    new URL("../prisma/migrations/20260920100000_add_health_appointment_history/migration.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /ADD COLUMN "cancelledAt" TIMESTAMP\(3\)/);
  assert.match(migration, /ADD COLUMN "cancellationReason" TEXT/);
  assert.match(migration, /HealthAppointment_unitId_date_idx/);
  assert.match(migration, /HealthAppointment_professionalId_date_idx/);
  assert.match(migration, /HealthAppointment_patientId_date_idx/);
});
