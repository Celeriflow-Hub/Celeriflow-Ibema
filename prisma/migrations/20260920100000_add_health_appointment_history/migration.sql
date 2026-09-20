-- Preserve the operational reason and instant of a cancellation without changing legacy appointments.
ALTER TABLE "HealthAppointment"
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancellationReason" TEXT;

CREATE INDEX "HealthAppointment_unitId_date_idx" ON "HealthAppointment"("unitId", "date");
CREATE INDEX "HealthAppointment_professionalId_date_idx" ON "HealthAppointment"("professionalId", "date");
CREATE INDEX "HealthAppointment_patientId_date_idx" ON "HealthAppointment"("patientId", "date");
