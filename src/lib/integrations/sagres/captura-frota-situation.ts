import { parseCompetence } from "./engine";
import type { CapturaReportableFleetUnit } from "./captura-frota-mapper";

/**
 * SITUACAO_FROTA is mandatory for each reporting competence. We deliberately
 * require a certified monthly history; FleetUnit.status is only the CURRENT
 * value and cannot reliably reconstruct maintenance or write-offs in the past.
 * The published TCE page is tagged WIP and must be rechecked before homologation.
 */
export type CapturaSituationCode = "1" | "2" | "3" | "4";
export type CapturaSituationEvent = {
  unitId: string;
  date: string; // YYYY-MM-DD, UTC calendar date in the report month
  status: CapturaSituationCode; // Em uso, manutenção, baixada, baixa temporária
};
export type CapturaSituationItem = {
  dataSituacao: string;
  tipoSituacao: CapturaSituationCode;
  tipoCategoriaFrota: "1" | "2";
  codigo: string;
  action: "CREATE";
};
export type CapturaSituationIssue = { unitId: string; message: string };

function calendarDate(value: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return null;
  const date = new Date(value + "T00:00:00Z");
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function identity(unit: CapturaReportableFleetUnit) {
  const type = unit.category === "VEICULO" ? "1" : unit.category === "MAQUINA" ? "2" : null;
  const code = (type === "1" ? unit.plate : unit.code)?.toUpperCase().replace(/[^A-Z0-9]/g, "") ?? "";
  return type && /^[A-Z0-9]{7}$/.test(code) ? { type, code } as const : null;
}

/** Validates coverage, duplicate keys and status chronology without guessing
 * a historical status from current database fields.
 */
export function mapCapturaSituacoes(
  competence: string,
  units: CapturaReportableFleetUnit[],
  events: CapturaSituationEvent[],
  timestamp = new Date(),
): { payload: { timestamp: string; elementos: CapturaSituationItem[] } | null; issues: CapturaSituationIssue[] } {
  const period = parseCompetence(competence);
  if (!period) return { payload: null, issues: [{ unitId: "", message: "Competência inválida." }] };

  const firstDay = period.start.toISOString().slice(0, 10);
  const issues: CapturaSituationIssue[] = [];
  const entries: CapturaSituationItem[] = [];
  const unitsById = new Map(units.map(u => [u.id, u]));
  const seenKeys = new Set<string>();

  for (const event of events) {
    const date = calendarDate(event.date);
    if (!date || date < period.start || date >= period.end) {
      issues.push({ unitId: event.unitId, message: "Data da situação fora da competência ou inválida." });
    }
    if (!unitsById.has(event.unitId)) issues.push({ unitId: event.unitId, message: "Situação associada a veículo ou máquina ausente da relação certificada." });
  }

  for (const unit of units) {
    const key = identity(unit);
    if (!key) {
      issues.push({ unitId: unit.id, message: "Categoria ou placa/código SAGRES inválido (sete caracteres alfanuméricos)." });
      continue;
    }
    const registration = key.type + ":" + key.code;
    if (seenKeys.has(registration)) {
      issues.push({ unitId: unit.id, message: "Placa/código SAGRES duplicado na mesma categoria." });
      continue;
    }
    seenKeys.add(registration);

    const history = events.filter(e => e.unitId === unit.id).sort((a, b) => a.date.localeCompare(b.date));
    if (!history.length || history[0].date !== firstDay) {
      issues.push({ unitId: unit.id, message: "É necessária uma situação certificada no primeiro dia da competência." });
      continue;
    }
    const dates = new Set<string>();
    let writtenOff = false;
    let lastStatus: CapturaSituationCode | null = null;
    for (const event of history) {
      if (!["1", "2", "3", "4"].includes(event.status)) {
        issues.push({ unitId: unit.id, message: "Código de situação não reconhecido." });
        continue;
      }
      if (dates.has(event.date)) {
        issues.push({ unitId: unit.id, message: "Duas situações do mesmo veículo na mesma data; exija correção do histórico." });
        continue;
      }
      dates.add(event.date);
      if (writtenOff) {
        issues.push({ unitId: unit.id, message: "Uma frota definitivamente baixada não pode apresentar nova movimentação." });
        continue;
      }
      if (event.status === lastStatus) {
        issues.push({ unitId: unit.id, message: "Alteração repetida sem mudança de situação." });
        continue;
      }
      if (event.status === "3") writtenOff = true;
      lastStatus = event.status;
      entries.push({
        dataSituacao: event.date,
        tipoSituacao: event.status,
        tipoCategoriaFrota: key.type,
        codigo: key.code,
        action: "CREATE",
      });
    }
  }

  if (issues.length) return { payload: null, issues };
  entries.sort((a, b) => a.codigo.localeCompare(b.codigo) || a.dataSituacao.localeCompare(b.dataSituacao));
  return { payload: { timestamp: timestamp.toISOString().slice(0, 23), elementos: entries }, issues: [] };
}