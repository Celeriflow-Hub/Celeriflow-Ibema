// Regras puras do Termo de Referência de Ibema — Gestão de Frota (itens 1.568–1.617).
// Sem acesso a banco: usadas pelas ações do servidor e pelos testes.

/** 1.578 — extensões de anexo exigidas pelo edital. */
export const FLEET_ATTACHMENT_EXTENSIONS = ["png", "bmp", "jpg", "gif", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf", "odt", "ods", "dwg"] as const;
export function isAllowedAttachment(fileName: string) {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  return (FLEET_ATTACHMENT_EXTENSIONS as readonly string[]).includes(ext) || ext === "jpeg";
}

/** 1.599 — pontuação que suspende a CNH. */
export const CNH_SUSPENSION_POINTS = 20;

export type DriverForEligibility = { cnhNumber: string | null; cnhExpiresAt: Date | null; points: number; active: boolean };
/** 1.597/1.599 — motorista sem CNH, com CNH vencida ou com 20 pontos não pode ser usado. */
export function driverEligibility(d: DriverForEligibility, on = new Date()): string | null {
  if (!d.active) return "Motorista inativo.";
  if (!d.cnhNumber || !d.cnhExpiresAt) return "Motorista sem CNH registrada no cadastro.";
  const day = (x: Date) => Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
  if (day(d.cnhExpiresAt) < day(on)) return "CNH vencida: o motorista não pode ser utilizado.";
  if (d.points >= CNH_SUSPENSION_POINTS) return `Motorista atingiu ${d.points} pontos (limite ${CNH_SUSPENSION_POINTS}): CNH sujeita a suspensão.`;
  return null;
}

export type Booking = { id?: string; unitId: string; driverId: string | null; startsAt: Date; endsAt: Date; status: string };
/** 1.574/1.592/1.605 — agendamentos não podem sobrepor veículo nem motorista. */
export function scheduleConflict(candidate: Booking, existing: Booking[]): string | null {
  if (!(candidate.endsAt > candidate.startsAt)) return "O término deve ser posterior ao início.";
  for (const b of existing) {
    if (b.id && b.id === candidate.id) continue;
    if (b.status === "CANCELADO" || b.status === "CONCLUIDO") continue;
    const overlap = candidate.startsAt < b.endsAt && b.startsAt < candidate.endsAt;
    if (!overlap) continue;
    if (b.unitId === candidate.unitId) return "Veículo já agendado nesse período.";
    if (candidate.driverId && b.driverId === candidate.driverId) return "Motorista já agendado nesse período.";
  }
  return null;
}

export type GateEvent = { kind: "SAIDA" | "ENTRADA"; reading: number | null };
/** 1.575/1.595 — guarita: não há duas saídas em aberto, nem entrada sem saída, nem leitura regressiva. */
export function gateTransition(last: GateEvent | null, next: GateEvent, meterType: "HODOMETRO" | "HORIMETRO" | "SEM_MARCADOR"): string | null {
  if (next.kind === "SAIDA" && last?.kind === "SAIDA") return "O veículo já está fora do pátio. Registre a entrada antes de nova saída.";
  if (next.kind === "ENTRADA" && last?.kind !== "SAIDA") return "Não há saída em aberto para este veículo.";
  if (meterType !== "SEM_MARCADOR") {
    if (next.reading == null || !Number.isFinite(next.reading) || next.reading < 0) return "Informe a leitura do marcador.";
    if (last?.reading != null && next.reading < last.reading) return "A leitura não pode ser menor que a registrada na saída.";
  }
  return null;
}

/** 1.611 — classificação do consumo: alto, normal ou baixo em relação ao esperado. */
export function consumptionStatus(meter: "HODOMETRO" | "HORIMETRO", actual: number | null, expected: number | null, tolerancePct = 10): "ALTO" | "NORMAL" | "BAIXO" | null {
  if (actual == null || !expected) return null;
  const diff = ((actual - expected) / expected) * 100;
  // Hodômetro mede rendimento (km/L): render menos = consumir mais.
  const consumptionDiff = meter === "HODOMETRO" ? -diff : diff;
  if (consumptionDiff > tolerancePct) return "ALTO";
  if (consumptionDiff < -tolerancePct) return "BAIXO";
  return "NORMAL";
}

/** 1.615 — apólice vigente na data do sinistro. */
export type Policy = { insurer: string; policyNumber: string; startsAt: Date; endsAt: Date; kind: string };
export function policyOn(policies: Policy[], on: Date): Policy | null {
  const valid = policies.filter((p) => p.kind === "FACULTATIVO" && p.startsAt <= on && on <= p.endsAt);
  return valid.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())[0] ?? null;
}

/** 1.590 — situação da multa após pagamento. */
export function fineStatusAfterPayment(amount: number, paid: number) {
  if (!(paid > 0)) throw new Error("Valor pago inválido.");
  return paid + 0.005 >= amount ? "PAGA" : "PAGA_PARCIAL";
}

/** Numeração de autorizações (1.572/1.580). */
export function authorizationCode(kind: "SERVICO" | "ABASTECIMENTO", seq: number, year: number) {
  return `${kind === "SERVICO" ? "AS" : "AA"}-${year}-${String(seq).padStart(6, "0")}`;
}
