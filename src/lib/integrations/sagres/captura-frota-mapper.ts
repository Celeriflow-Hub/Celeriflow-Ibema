import { parseCompetence } from "./engine";

/**
 * Preliminary mapper for the TCE-PB's documented ABASTECIMENTO entity.
 * Source: https://docs.tcepb.tc.br/books/entidades-frota/page/abastecimento-2025
 *
 * A caller must supply the vehicles/machines actually reportable for the
 * historical competence. Current active status must NEVER be substituted for
 * past-month situation history. SITUACAO_FROTA is a separate required entity.
 * This module performs no network calls and never submits data to the TCE.
 */
export type CapturaReportableFleetUnit = {
  id: string;
  code: string;
  plate: string | null;
  category: string;
  fuelType: string | null;
};
export type CapturaFleetFuelConsumption = {
  unitId: string;
  material: string;
  measurementUnit: string;
  quantity: number;
  occurredAt: Date;
};
export type CapturaAbastecimentoItem = {
  tipoCombustivel: string;
  tipoCategoriaFrota: "1" | "2";
  codigo: string;
  quantidade: number;
  action: "CREATE";
};
export type CapturaAbastecimentoIssue = { unitId: string; message: string };

export function capturaFuelCode(input: string | null | undefined): string | null {
  const value = (input ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  if (/\bARLA\b/.test(value)) return "5";
  if (/\bDIESEL\b/.test(value)) return "2";
  if (/\b(GASOLINA)\b/.test(value)) return "1";
  if (/\b(ETANOL|ALCOOL)\b/.test(value)) return "3";
  if (/\b(GNV|GAS NATURAL)\b/.test(value)) return "4";
  if (/\b(ELETRICIDADE|ELETRICO|ELETRICA)\b/.test(value)) return "6";
  return null;
}

export function mapCapturaAbastecimentos(
  competence: string,
  units: CapturaReportableFleetUnit[],
  records: CapturaFleetFuelConsumption[],
  timestamp = new Date(),
): { payload: { timestamp: string; elementos: CapturaAbastecimentoItem[] } | null; issues: CapturaAbastecimentoIssue[] } {
  const period = parseCompetence(competence);
  if (!period) return { payload: null, issues: [{ unitId: "", message: "Competência inválida." }] };
  const issues: CapturaAbastecimentoIssue[] = [];
  const groups = new Map<string, CapturaAbastecimentoItem>();
  const unitById = new Map(units.map(u => [u.id, u]));

  for (const unit of units) {
    const category = unit.category === "VEICULO" ? "1" : unit.category === "MAQUINA" ? "2" : null;
    const code = (category === "1" ? unit.plate : unit.code)?.toUpperCase().replace(/[^A-Z0-9]/g, "") ?? "";
    const fuelType = capturaFuelCode(unit.fuelType);
    if (!category) issues.push({ unitId: unit.id, message: "Categoria não suportada pela entidade SAGRES (veículo ou máquina)." });
    else if (!/^[A-Z0-9]{7}$/.test(code)) issues.push({ unitId: unit.id, message: "Placa/código SAGRES deve conter exatamente sete caracteres alfanuméricos." });
    if (fuelType && category && /^[A-Z0-9]{7}$/.test(code)) {
      // The TCE requires a zero declaration even without fuel consumption.
      const key = [category, code, fuelType].join(":");
      groups.set(key, { tipoCombustivel: fuelType, tipoCategoriaFrota: category, codigo: code, quantidade: 0, action: "CREATE" });
    } else if (!fuelType) issues.push({ unitId: unit.id, message: "Configure o tipo de combustível para permitir a declaração mensal sem consumo." });
  }
  for (const record of records) {
    if (record.occurredAt < period.start || record.occurredAt >= period.end) continue;
    const unit = unitById.get(record.unitId);
    if (!unit) { issues.push({ unitId: record.unitId, message: "Consumo sem veículo/máquina reportável na competência." }); continue; }
    const category = unit.category === "VEICULO" ? "1" : unit.category === "MAQUINA" ? "2" : null;
    const code = (category === "1" ? unit.plate : unit.code)?.toUpperCase().replace(/[^A-Z0-9]/g, "") ?? "";
    const fuelType = capturaFuelCode(record.material) ?? capturaFuelCode(unit.fuelType);
    if (!category || !/^[A-Z0-9]{7}$/.test(code) || !fuelType) continue; // Issues already added above.
    const expectedUnit = fuelType === "4" ? "M3" : fuelType === "6" ? "KWH" : "L";
    const inputUnit = record.measurementUnit.toUpperCase().replace("³", "3");
    if (inputUnit !== expectedUnit) {
      issues.push({ unitId: unit.id, message: `Combustível ${fuelType}: unidade recebida ${inputUnit}, esperada ${expectedUnit}; não converter automaticamente.` });
      continue;
    }
    if (!Number.isFinite(record.quantity) || record.quantity < 0 || Math.abs(record.quantity * 100 - Math.round(record.quantity * 100)) > 1e-7) {
      issues.push({ unitId: unit.id, message: "Quantidade exige valor não negativo com no máximo duas casas decimais." });
      continue;
    }
    const key = [category, code, fuelType].join(":");
    const group: CapturaAbastecimentoItem = groups.get(key) ?? { tipoCombustivel: fuelType, tipoCategoriaFrota: category, codigo: code, quantidade: 0, action: "CREATE" };
    group.quantidade = Math.round((group.quantidade + record.quantity) * 100) / 100;
    groups.set(key, group);
  }
  if (issues.length) return { payload: null, issues };
  return {
    payload: { timestamp: timestamp.toISOString().slice(0, 23), elementos: [...groups.values()].sort((a,b) => a.codigo.localeCompare(b.codigo) || a.tipoCombustivel.localeCompare(b.tipoCombustivel)) },
    issues: [],
  };
}
