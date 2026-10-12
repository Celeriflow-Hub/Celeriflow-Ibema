-- CreateTable
CREATE TABLE "FleetFuelBalance" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "quantityContracted" DECIMAL(14,3) NOT NULL,
    "quantityConsumed" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "alertThreshold" DECIMAL(14,3) NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FleetFuelBalance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FleetFuelBalance" ADD CONSTRAINT "FleetFuelBalance_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable FleetFuelOrder
ALTER TABLE "FleetFuelOrder" ADD COLUMN "balanceId" TEXT;
ALTER TABLE "FleetFuelOrder" ADD CONSTRAINT "FleetFuelOrder_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "FleetFuelBalance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "FleetFuelBalance_contractId_fuelType_key" ON "FleetFuelBalance"("contractId", "fuelType");
