// Regras puras da Farmácia Pública (Sprint 8): validade, estoque mínimo,
// Portaria SVS/MS 344/98, consumo e arquivos (CSV/BNAFAR).

export const PORTARIA_344_LISTS = ["A1", "A2", "A3", "B1", "B2", "C1", "C2", "C3", "C4", "C5"] as const;
export type Portaria344List = (typeof PORTARIA_344_LISTS)[number];
export const PORTARIA_344_LABEL: Record<Portaria344List, string> = {
  A1: "Entorpecentes", A2: "Entorpecentes (uso permitido em concentrações especiais)", A3: "Psicotrópicos",
  B1: "Psicotrópicos", B2: "Psicotrópicos anorexígenos", C1: "Outras substâncias sujeitas a controle especial",
  C2: "Retinoides (uso sistêmico)", C3: "Imunossupressores", C4: "Antirretrovirais", C5: "Anabolizantes",
};
/** Tipo de receituário exigido por lista (simplificado da Portaria 344/98). */
export function prescriptionTypeFor(list: string | null | undefined) {
  if (!list) return "Receita simples";
  if (["A1", "A2", "A3"].includes(list)) return "Notificação de Receita A (amarela)";
  if (["B1", "B2"].includes(list)) return "Notificação de Receita B (azul)";
  if (list === "C2") return "Notificação de Receita especial de retinoides";
  if (list === "C3") return "Notificação de Receita especial de talidomida";
  return "Receita de controle especial em 2 vias";
}
export function isValidPortaria344(list: string) { return (PORTARIA_344_LISTS as readonly string[]).includes(list.toUpperCase()); }

/** CATMAT/BR: código numérico de material do Governo Federal (até 6 dígitos no SIASG; aceitamos BR + dígitos). */
export function normalizeCatmat(value: string) {
  const v = value.trim().toUpperCase().replace(/\s/g, "");
  if (!v) return null;
  if (!/^(BR)?\d{4,10}$/.test(v)) throw new Error("Código CATMAT inválido. Use apenas números (ex.: BR0267500 ou 267500).");
  return v.startsWith("BR") ? v : `BR${v.padStart(7, "0")}`;
}

export type ExpiryStatus = "VENCIDO" | "VENCE_30" | "VENCE_60" | "VENCE_90" | "REGULAR" | "SEM_VALIDADE";
export function expiryStatus(expiration: Date | null, today = new Date()): { status: ExpiryStatus; days: number | null } {
  if (!expiration) return { status: "SEM_VALIDADE", days: null };
  const days = Math.floor((utc(expiration) - utc(today)) / 86_400_000);
  if (days < 0) return { status: "VENCIDO", days };
  if (days <= 30) return { status: "VENCE_30", days };
  if (days <= 60) return { status: "VENCE_60", days };
  if (days <= 90) return { status: "VENCE_90", days };
  return { status: "REGULAR", days };
}
export const EXPIRY_LABEL: Record<ExpiryStatus, string> = { VENCIDO: "Vencido", VENCE_30: "Vence em até 30 dias", VENCE_60: "Vence em até 60 dias", VENCE_90: "Vence em até 90 dias", REGULAR: "Regular", SEM_VALIDADE: "Sem validade" };

export function stockLevel(quantity: number, min: number, max: number) {
  if (quantity <= 0) return "ZERADO" as const;
  if (min > 0 && quantity < min) return "ABAIXO_MINIMO" as const;
  if (max > 0 && quantity > max) return "ACIMA_MAXIMO" as const;
  return "ADEQUADO" as const;
}

/** Cobertura em dias com base no consumo médio diário do período. */
export function coverageDays(quantity: number, consumedInPeriod: number, periodDays: number) {
  if (consumedInPeriod <= 0 || periodDays <= 0) return null;
  return Math.floor(quantity / (consumedInPeriod / periodDays));
}

export function lossReason(reason: string | null | undefined) {
  const r = (reason ?? "").replace(/^BAIXA_ASSISTENCIAL:/, "").trim();
  const low = r.toLowerCase();
  if (low.includes("venc")) return "Vencimento";
  if (low.includes("avari") || low.includes("quebr")) return "Avaria";
  if (low.includes("furt") || low.includes("roub") || low.includes("extrav")) return "Extravio";
  if (low.includes("temperat") || low.includes("refriger")) return "Temperatura";
  return r || "Outros";
}

export function csv(rows: (string | number | null | undefined)[][]) {
  return "\uFEFF" + rows.map((r) => r.map((c) => { const v = c == null ? "" : String(c); return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }).join(";")).join("\r\n") + "\r\n";
}

export function competenceRange(competence: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(competence)) throw new Error("Competência inválida (use AAAA-MM).");
  const [y, m] = competence.split("-").map(Number);
  return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)), days: new Date(Date.UTC(y, m, 0)).getUTCDate() };
}

function utc(d: Date) { return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
