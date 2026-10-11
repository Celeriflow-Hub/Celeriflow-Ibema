import { mapCapturaAbastecimentos, type CapturaFleetFuelConsumption, type CapturaReportableFleetUnit } from "./captura-frota-mapper";
import { mapCapturaSituacoes, type CapturaSituationEvent } from "./captura-frota-situation";

/**
 * Offline, read-only preparation. Only externally certified monthly membership
 * and situation events are accepted; a FleetUnit current status is insufficient.
 * The situation schema is still WIP at the TCE. No transmission is performed.
 */
export function prepareCapturaFleetMonth(
  competence: string,
  units: CapturaReportableFleetUnit[],
  situations: CapturaSituationEvent[],
  consumptions: CapturaFleetFuelConsumption[],
  timestamp = new Date(),
) {
  const issues: Array<{ unitId: string; message: string }> = [];
  const situation = mapCapturaSituacoes(competence, units, situations, timestamp);
  issues.push(...situation.issues);

  // First-day permanent write-offs are not expected to report monthly fuel;
  // all other membership decisions must be certified externally. Do not infer
  // a historical inventory by querying present-day active records.
  const permanentWriteOffIds = new Set(
    situations.filter(s => s.date === competence + "-01" && s.status === "3").map(s => s.unitId),
  );
  const reportableUnits = units.filter(u => !permanentWriteOffIds.has(u.id));
  const writeOffDates = new Map(situations.filter(s => s.status === "3").map(s => [s.unitId, s.date]));
  for (const consumption of consumptions) {
    const writtenOffAt = writeOffDates.get(consumption.unitId);
    if (consumption.occurredAt.toISOString().slice(0, 7) === competence &&
        writtenOffAt && consumption.occurredAt.toISOString().slice(0, 10) >= writtenOffAt) {
      issues.push({ unitId: consumption.unitId, message: "Consumo na data ou após baixa definitiva; exige revisão manual." });
    }
  }
  const fuel = mapCapturaAbastecimentos(competence, reportableUnits, consumptions, timestamp);
  issues.push(...fuel.issues);
  const situationKeys = new Set((situation.payload?.elementos ?? []).map(s => s.tipoCategoriaFrota + ":" + s.codigo));
  for (const element of fuel.payload?.elementos ?? []) {
    if (!situationKeys.has(element.tipoCategoriaFrota + ":" + element.codigo)) {
      issues.push({ unitId: element.codigo, message: "Abastecimento sem situação certificada para a competência." });
    }
  }
  // Never return a partial packet; resolving all issues is an explicit step.
  return issues.length || !fuel.payload || !situation.payload
    ? { ready: false as const, issues, payload: null }
    : { ready: true as const, issues: [], payload: { situation: situation.payload, fuel: fuel.payload } };
}
