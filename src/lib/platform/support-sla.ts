/**
 * Sprint 10 — prazos de atendimento do Termo de Referência (PE 00014/2026):
 * crítica = imediato (até 2h), alta = 12h, média = 24h, baixa = 5 dias úteis.
 */
export type SupportSeverity = "CRITICA" | "ALTA" | "MEDIA" | "BAIXA";

export const severityInfo: Record<SupportSeverity, { label: string; prazo: string }> = {
  CRITICA: { label: "Crítica (sistema parado)", prazo: "Imediato (até 2 horas)" },
  ALTA: { label: "Alta", prazo: "12 horas" },
  MEDIA: { label: "Média", prazo: "24 horas" },
  BAIXA: { label: "Baixa", prazo: "5 dias úteis" },
};

/** Feriados nacionais fixos (MM-DD). */
const NATIONAL_HOLIDAYS = ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"];
/**
 * Feriados municipais/estaduais (YYYY-MM-DD ou MM-DD). PENDENTE: confirmar lista oficial
 * de Cacimba de Dentro/PB (padroeira, emancipação) e feriados móveis do ano.
 */
export const LOCAL_HOLIDAYS: string[] = ["08-05"]; // 05/08 — Fundação do Estado da Paraíba

export function isHoliday(d: Date, extra: string[] = LOCAL_HOLIDAYS) {
  const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const ymd = `${d.getFullYear()}-${md}`;
  return [...NATIONAL_HOLIDAYS, ...extra].some((h) => h === md || h === ymd);
}

export function addBusinessDays(start: Date, days: number, extraHolidays: string[] = LOCAL_HOLIDAYS) {
  const d = new Date(start);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const w = d.getDay();
    if (w !== 0 && w !== 6 && !isHoliday(d, extraHolidays)) left--;
  }
  return d;
}

export function computeDueAt(severity: SupportSeverity, openedAt = new Date()) {
  const h = { CRITICA: 2, ALTA: 12, MEDIA: 24 } as const;
  if (severity === "BAIXA") return addBusinessDays(openedAt, 5);
  return new Date(openedAt.getTime() + h[severity] * 3_600_000);
}

/** Classificação automática sugerida a partir da categoria. */
export function suggestSeverity(category: string, blocksWork: boolean): SupportSeverity {
  if (category === "INDISPONIBILIDADE") return "CRITICA";
  if (category === "ERRO") return blocksWork ? "ALTA" : "MEDIA";
  return "BAIXA";
}

export function slaState(dueAt: Date, status: string, now = new Date()) {
  if (status === "RESOLVIDO" || status === "CANCELADO") return "ENCERRADO" as const;
  const left = dueAt.getTime() - now.getTime();
  if (left < 0) return "VENCIDO" as const;
  return left < 2 * 3_600_000 ? ("VENCENDO" as const) : ("NO_PRAZO" as const);
}
