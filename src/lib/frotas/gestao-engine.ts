// Regras puras da Gestão de Frota (Sprint 6): consumo médio, desvio, cota,
// CNH, pneus e custos. Sem acesso a banco para permitir testes unitários.

import { randomBytes } from "node:crypto";

export type MeterType = "HODOMETRO" | "HORIMETRO";
export const METER_UNIT: Record<MeterType, string> = { HODOMETRO: "km", HORIMETRO: "h" };
export const CONSUMPTION_UNIT: Record<MeterType, string> = { HODOMETRO: "km/L", HORIMETRO: "L/h" };

export type Fill = { reading: number; liters: number };

/** Consumo médio: km/L para hodômetro; L/h para horímetro (máquinas). */
export function averageConsumption(meter: MeterType, fills: Fill[]): number | null {
  const sorted = [...fills].filter((f) => f.reading > 0 && f.liters > 0).sort((a, b) => a.reading - b.reading);
  if (sorted.length < 2) return null;
  const distance = sorted.at(-1)!.reading - sorted[0].reading;
  const liters = sorted.slice(1).reduce((s, f) => s + f.liters, 0);
  if (distance <= 0 || liters <= 0) return null;
  return round(meter === "HODOMETRO" ? distance / liters : liters / distance, 3);
}

/** Desvio percentual; para horímetro, consumir MAIS é pior; para hodômetro, render MENOS é pior. */
export function consumptionDeviation(meter: MeterType, actual: number | null, expected: number | null, tolerancePct = 15) {
  if (actual == null || !expected) return { deviationPct: null, alert: false };
  const deviationPct = round(((actual - expected) / expected) * 100, 1);
  const worse = meter === "HODOMETRO" ? -deviationPct : deviationPct;
  return { deviationPct, alert: worse > tolerancePct };
}

export function validateReading(previous: number | null, next: number, meter: MeterType) {
  if (!Number.isFinite(next) || next < 0) return "Leitura inválida.";
  if (previous != null && next < previous) return `A leitura (${next} ${METER_UNIT[meter]}) não pode ser menor que a última registrada (${previous} ${METER_UNIT[meter]}).`;
  const maxJump = meter === "HODOMETRO" ? 5000 : 500;
  if (previous != null && next - previous > maxJump) return `Salto de leitura acima de ${maxJump} ${METER_UNIT[meter]} desde o último registro. Confira o valor.`;
  return null;
}

export function quotaCheck(limit: number | null, usedLiters: number, requested: number) {
  if (limit == null) return { allowed: true, remaining: null as number | null };
  const remaining = round(limit - usedLiters, 3);
  return { allowed: requested <= remaining, remaining };
}

export function cnhStatus(expiresAt: Date, today = new Date(), warnDays = 30) {
  const days = Math.floor((startOfDay(expiresAt).getTime() - startOfDay(today).getTime()) / 86_400_000);
  if (days < 0) return { status: "VENCIDA" as const, days };
  if (days <= warnDays) return { status: "A_VENCER" as const, days };
  return { status: "REGULAR" as const, days };
}

/** CNH exigida por categoria de veículo (CTB art. 143, simplificado). */
export function cnhAllows(cnhCategory: string, vehicleCategory: string) {
  const need: Record<string, string[]> = { MOTO: ["A"], CARRO: ["B", "C", "D", "E"], CAMINHAO: ["C", "D", "E"], ONIBUS: ["D", "E"], CARRETA: ["E"], MAQUINA: ["B", "C", "D", "E"] };
  const allowed = need[vehicleCategory] ?? ["B", "C", "D", "E"];
  return cnhCategory.toUpperCase().split("").some((c) => allowed.includes(c));
}

export function tireWear(lifeKm: number, installReading: number | null, currentReading: number | null) {
  if (installReading == null || currentReading == null || lifeKm <= 0) return null;
  return Math.min(100, round(((currentReading - installReading) / lifeKm) * 100, 1));
}

export function fuelOrderCode(seq: number, date = new Date()) {
  return `OA-${date.getFullYear()}-${String(seq).padStart(6, "0")}`;
}

/** Gera código legível e imprevisível sem consultar o total de ordens do banco. */
export function newFuelOrderCode(date = new Date()) {
  return `OA-${date.getUTCFullYear()}-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export type CostEntry = { unitLabel: string; department: string; costCenter: string; nature: string; amount: number };
export function groupCosts(entries: CostEntry[], key: "unitLabel" | "department" | "costCenter" | "nature") {
  const map = new Map<string, number>();
  for (const e of entries) map.set(e[key] || "Não informado", round((map.get(e[key] || "Não informado") ?? 0) + e.amount, 2));
  return [...map.entries()].map(([label, total]) => ({ label, total })).sort((a, b) => b.total - a.total);
}

function round(v: number, d: number) { const f = 10 ** d; return Math.round(v * f) / f; }
function startOfDay(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }
