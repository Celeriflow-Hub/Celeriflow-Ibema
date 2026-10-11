import { parseCompetence } from "./engine";

/** Only the TCE-PB's documented sandbox is supported here.
 * This module does not transmit real Frota records; their official entity
 * schemas must be mapped and validated separately before any submission.
 */
const BASE = "https://api-sagrescaptura-hml.tce.pb.gov.br";

export class CapturaFrotaSandboxError extends Error {
  constructor(message: string, readonly status?: number) { super(message); }
}

export type CapturaFrotaSubmission = {
  protocoloEnvio: string;
  tipoEnvio: "BALANCETE_FROTA";
  competencia: string;
  codigoUnidadeGestora: string;
  statusEnvio: string;
};

export function capturaFrotaMonthEnd(competence: string): string {
  const parsed = parseCompetence(competence);
  if (!parsed) throw new CapturaFrotaSandboxError("Competência inválida. Use AAAA-MM.");
  return new Date(Date.UTC(parsed.year, parsed.month, 0)).toISOString().slice(0, 10);
}

function protocolPath(protocolo: string): string {
  // The protocol is supplied by TCE-PB and never interpolated without validation.
  if (!/^\d{3,9}\.24\.\d{1,9}-\d{4}$/.test(protocolo)) {
    throw new CapturaFrotaSandboxError("Protocolo de Frota inválido.");
  }
  return encodeURIComponent(protocolo);
}

async function request(url: string, token: string, init: RequestInit, fetcher: typeof fetch) {
  if (!token.trim()) throw new CapturaFrotaSandboxError("Token do ambiente de homologação ausente.");
  const response = await fetcher(BASE + url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new CapturaFrotaSandboxError(
    response.status === 429 ? "Limite do SAGRES atingido. Tente novamente mais tarde." : "Operação recusada pelo SAGRES de homologação.",
    response.status,
  );
  const result: unknown = await response.json();
  if (!result || typeof result !== "object") throw new CapturaFrotaSandboxError("Resposta do SAGRES inválida.");
  return result as Record<string, unknown>;
}

function parseSubmission(data: Record<string, unknown>): CapturaFrotaSubmission {
  if (
    data.tipoEnvio !== "BALANCETE_FROTA" ||
    typeof data.protocoloEnvio !== "string" ||
    typeof data.competencia !== "string" ||
    typeof data.codigoUnidadeGestora !== "string" ||
    typeof data.statusEnvio !== "string"
  ) throw new CapturaFrotaSandboxError("Resposta do SAGRES não corresponde a uma remessa de Frota.");
  protocolPath(data.protocoloEnvio);
  return {
    protocoloEnvio: data.protocoloEnvio,
    tipoEnvio: "BALANCETE_FROTA",
    competencia: data.competencia,
    codigoUnidadeGestora: data.codigoUnidadeGestora,
    statusEnvio: data.statusEnvio,
  };
}

/** Opens an empty, sandbox-only BALANCETE_FROTA. Requires explicit token. */
export async function openCapturaFrotaSandbox(competence: string, token: string, fetcher: typeof fetch = fetch) {
  const date = capturaFrotaMonthEnd(competence);
  const data = await request("/envios", token, {
    method: "POST",
    body: JSON.stringify({ tipoEnvio: "BALANCETE_FROTA", competencia: date }),
  }, fetcher);
  return parseSubmission(data);
}

/** Consults an existing sandbox-only Frota submission without modifying it. */
export async function getCapturaFrotaSandbox(protocolo: string, token: string, fetcher: typeof fetch = fetch) {
  const data = await request(`/envios/${protocolPath(protocolo)}`, token, { method: "GET" }, fetcher);
  return parseSubmission(data);
}
