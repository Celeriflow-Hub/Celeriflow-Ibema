import { Prisma, type PrismaClient } from "@prisma/client";
import { validateReading, type MeterType } from "./gestao-engine";
import { onlyDigits, tokenMatches } from "./portal";

export class FuelOrderError extends Error {}

type StationCredentials = { cnpj: string; token: string };
export type ConfirmFuelOrderInput = {
  orderId: string;
  liters: number;
  reading: number;
  pricePerLiter: number | null;
  actorId?: string;
  confirmedVia: "ADMIN" | "PORTAL_POSTO";
  // Only used for administrative confirmation. A null scope means the operator
  // has system-wide Fleet permissions; a station has no departmental override.
  allowedDepartmentId?: string | null;
  stationCredentials?: StationCredentials;
};

/**
 * Shared finalization path for administrative confirmation and the station
 * portal. Both callers lock the same rows in the same order (order -> unit).
 * Failed status transitions roll the consumption insert back atomically.
 */
export async function confirmFuelOrderOnce(db: PrismaClient, input: ConfirmFuelOrderInput) {
  if (!Number.isFinite(input.liters) || input.liters <= 0 || new Prisma.Decimal(input.liters).decimalPlaces() > 3) {
    throw new FuelOrderError("Informe uma quantidade de litros positiva com até três casas decimais.");
  }
  if (!Number.isFinite(input.reading) || input.reading < 0 || new Prisma.Decimal(input.reading).decimalPlaces() > 3) {
    throw new FuelOrderError("Informe uma leitura válida com até três casas decimais.");
  }
  if (input.pricePerLiter != null && (!Number.isFinite(input.pricePerLiter) || input.pricePerLiter < 0 || new Prisma.Decimal(input.pricePerLiter).decimalPlaces() > 3)) {
    throw new FuelOrderError("Informe um preço válido com até três casas decimais.");
  }
  if (input.confirmedVia === "PORTAL_POSTO" && !input.stationCredentials) {
    throw new FuelOrderError("Dados de conferência obrigatórios.");
  }

  return db.$transaction(async (tx) => {
    const lockedOrder = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetFuelOrder" WHERE "id" = ${input.orderId} FOR UPDATE`;
    if (!lockedOrder.length) throw new FuelOrderError("Ordem não encontrada.");
    const order = await tx.fleetFuelOrder.findUniqueOrThrow({ where: { id: input.orderId }, include: { station: true } });
    if (input.stationCredentials && (
      !order.station.active ||
      order.station.cnpj !== onlyDigits(input.stationCredentials.cnpj) ||
      !tokenMatches(order.portalToken, input.stationCredentials.token)
    )) {
      throw new FuelOrderError("Dados de conferência inválidos.");
    }
    if (order.status !== "EMITIDA") throw new FuelOrderError("Esta ordem já foi utilizada ou cancelada.");
    const liters = new Prisma.Decimal(input.liters);
    if (liters.gt(order.litersAuthorized)) {
      throw new FuelOrderError(`O abastecimento não pode exceder ${order.litersAuthorized} L autorizados.`);
    }

    const lockedUnit = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetUnit" WHERE "id" = ${order.unitId} FOR UPDATE`;
    if (!lockedUnit.length) throw new FuelOrderError("Veículo não encontrado.");
    const unit = await tx.fleetUnit.findUniqueOrThrow({ where: { id: order.unitId } });
    if (input.confirmedVia === "ADMIN" && input.allowedDepartmentId !== null && unit.departmentId !== input.allowedDepartmentId) {
      throw new FuelOrderError("Veículo fora do seu setor.");
    }
    const problem = validateReading(unit.currentReading == null ? null : Number(unit.currentReading), input.reading, unit.meterType as MeterType);
    if (problem) throw new FuelOrderError(problem);
    const price = input.pricePerLiter == null
      ? (order.station.pricePerLiter == null ? null : new Prisma.Decimal(order.station.pricePerLiter))
      : new Prisma.Decimal(input.pricePerLiter);
    const consumption = await tx.fleetConsumption.create({
      data: {
        unitId: unit.id,
        type: "COMBUSTIVEL",
        origin: input.confirmedVia === "ADMIN" ? "ORDEM_ABASTECIMENTO" : "PORTAL_POSTO",
        occurredAt: new Date(),
        material: order.fuelType,
        quantity: liters,
        measurementUnit: "L",
        cost: price === null ? null : price.mul(liters).toDecimalPlaces(2),
        supplierName: order.station.name,
        reference: order.code,
        createdById: input.actorId ?? order.createdById,
      },
    });
    const updated = await tx.fleetFuelOrder.updateMany({
      where: { id: order.id, status: "EMITIDA" },
      data: {
        status: "ABASTECIDA",
        litersFilled: liters,
        reading: new Prisma.Decimal(input.reading),
        pricePerLiter: price,
        filledAt: new Date(),
        consumptionId: consumption.id,
        confirmedVia: input.confirmedVia,
      },
    });
    if (updated.count !== 1) throw new FuelOrderError("Esta ordem já foi utilizada.");
    // One financial appropriation per real consumption, also for the external
    // portal. This is the source read by the operational "Gastos" report.
    await tx.fleetExpense.create({
      data: {
        unitId: unit.id, nature: "COMBUSTIVEL", occurredAt: consumption.occurredAt,
        amount: consumption.cost, description: order.fuelType,
        sourceType: "CONSUMO", sourceId: consumption.id,
        sourceKey: "consumption:" + consumption.id, reference: order.code,
        createdById: input.actorId ?? order.createdById,
      },
    });
    await tx.fleetUnit.update({ where: { id: unit.id }, data: { currentReading: new Prisma.Decimal(input.reading) } });
    return { orderId: order.id, code: order.code, consumptionId: consumption.id };
  });
}
