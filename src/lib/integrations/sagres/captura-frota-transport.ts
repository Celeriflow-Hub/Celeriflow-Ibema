import type { CapturaAbastecimentoItem } from "./captura-frota-mapper";
import type { CapturaSituationItem } from "./captura-frota-situation";

/**
 * Explicit sandbox-only TCE-PB transport. No token storage, scheduled network
 * calls, production URL, automatic retries or municipal data access.
 *
 * Refer to the official flow before enabling real homologation:
 * https://docs.tcepb.tc.br/books/wiki/page/fluxos-fluxo-envio-das-informacoes
 * The SITUACAO_FROTA wiki schema is still provisional: its upload requires
 * an explicit acknowledgement at the call site.
 */
const HML = "https://api-sagrescaptura-hml.tce.pb.gov.br";
const LIMIT_BYTES = 1_900_000; // remain below documented 2 MB per request
const PROTOCOL = /^\d{3,9}\.24\.\d{1,9}-\d{4}$/;
const VALIDATION_KEY = /^[a-zA-Z0-9]{6,80}$/;
const TIMESTAMP = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3,6}$/;

export class FleetSandboxTransportError extends Error {
  constructor(message: string, readonly status?: number) { super(message); }
}
export type FleetSandboxEntity = "SITUACAO_FROTA" | "ABASTECIMENTO";
export type FleetSandboxEntityRequest =
  | { entity: "SITUACAO_FROTA"; payload: { timestamp: string; elementos: CapturaSituationItem[] }; provisionalSituationApproved: true }
  | { entity: "ABASTECIMENTO"; payload: { timestamp: string; elementos: CapturaAbastecimentoItem[] }; provisionalSituationApproved?: never };
export type FleetSandboxValidation = {
  statusValidacao: "AGUARDANDO_VALIDACAO" | "EM_VALIDACAO" | "SUCESSO" | "COM_PENDENCIAS" | "FALHA_PROCESSAMENTO";
  protocoloEnvio: string;
  chaveValidacao: string;
  detalhes?: { sumario?: Record<string, unknown>; errosPorEntidade?: unknown[] };
};
const inSandbox = (protocol: string) => {
  if (!PROTOCOL.test(protocol)) throw new FleetSandboxTransportError("Protocolo BALANCETE_FROTA inválido.");
  return encodeURIComponent(protocol);
};
const validationKey = (key: string) => {
  if (!VALIDATION_KEY.test(key)) throw new FleetSandboxTransportError("Chave de validação inválida.");
  return encodeURIComponent(key);
};
function exactFields(value: unknown, keys: string[]) {
  return !!value && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).sort().join(",") === [...keys].sort().join(",");
}
function validatePayload(request: FleetSandboxEntityRequest): string {
  const { entity, payload } = request;
  if (!payload || !TIMESTAMP.test(payload.timestamp) || !Array.isArray(payload.elementos) || !payload.elementos.length) {
    throw new FleetSandboxTransportError("Payload vazio ou timestamp inválido.");
  }
  if (entity === "SITUACAO_FROTA" && request.provisionalSituationApproved !== true) {
    throw new FleetSandboxTransportError("Schema SITUACAO_FROTA provisório sem aprovação explícita.");
  }
  const keys = entity === "SITUACAO_FROTA"
    ? ["action", "codigo", "dataSituacao", "tipoCategoriaFrota", "tipoSituacao"]
    : ["action", "codigo", "quantidade", "tipoCategoriaFrota", "tipoCombustivel"];
  for (const item of payload.elementos) {
    if (!exactFields(item, keys) || item.action !== "CREATE" ||
        !/^[A-Z0-9]{7}$/.test(item.codigo) || !["1", "2"].includes(item.tipoCategoriaFrota)) {
      throw new FleetSandboxTransportError("Entidade " + entity + " possui campos ou identificadores inválidos.");
    }
    if (entity === "ABASTECIMENTO") {
      const fuel = item as CapturaAbastecimentoItem;
      if (!/^\d$/.test(fuel.tipoCombustivel) || !Number.isFinite(fuel.quantidade) ||
          fuel.quantidade < 0 || Math.abs(fuel.quantidade * 100 - Math.round(fuel.quantidade * 100)) > 1e-7) {
        throw new FleetSandboxTransportError("Quantidade ou combustível inválido.");
      }
    } else {
      const situation = item as CapturaSituationItem;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(situation.dataSituacao) || !/^[1-4]$/.test(situation.tipoSituacao)) {
        throw new FleetSandboxTransportError("Situação histórica inválida.");
      }
    }
  }
  const body = JSON.stringify(payload);
  if (Buffer.byteLength(body, "utf8") > LIMIT_BYTES) {
    throw new FleetSandboxTransportError("Payload superior ao limite seguro; divida a entidade em lotes.");
  }
  return body;
}
async function request(
  route: string, token: string, method: "POST" | "GET", fetcher: typeof fetch,
  body?: string,
) {
  if (!token.trim()) throw new FleetSandboxTransportError("Token exclusivo de homologação obrigatório.");
  const result = await fetcher(HML + route, {
    method,
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body }),
    cache: "no-store",
  });
  if (!result.ok) {
    const message = result.status === 429
      ? "Limite de requisições do sandbox atingido; respeite Retry-After e não repita POST automaticamente."
      : "Sandbox SAGRES recusou a requisição; confira o protocolo ou consulte os detalhes no TCE.";
    throw new FleetSandboxTransportError(message, result.status);
  }
  const response: unknown = await result.json();
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw new FleetSandboxTransportError("Resposta inválida do sandbox.");
  }
  return response as Record<string, unknown>;
}

/** POST returns HTTP 202; callers must explicitly control idempotency. */
export async function uploadFleetEntitySandbox(
  protocol: string, token: string, input: FleetSandboxEntityRequest,
  fetcher: typeof fetch = fetch,
) {
  const safe = inSandbox(protocol);
  const body = validatePayload(input);
  return request("/envios/" + safe + "/entidades/" + input.entity, token, "POST", fetcher, body);
}
export async function consolidateFleetSandbox(
  protocol: string, token: string, fetcher: typeof fetch = fetch,
) {
  const safe = inSandbox(protocol);
  const response = await request("/envios/" + safe + "/consolidacoes", token, "POST", fetcher);
  if (response.protocoloEnvio !== protocol || typeof response.chaveValidacao !== "string") {
    throw new FleetSandboxTransportError("Protocolo ou chave de consolidação incompatível.");
  }
  validationKey(response.chaveValidacao);
  return { protocol, validationKey: response.chaveValidacao };
}
export async function readFleetSandboxValidation(
  protocol: string, token: string, key?: string, fetcher: typeof fetch = fetch,
): Promise<FleetSandboxValidation> {
  const safe = inSandbox(protocol);
  const query = key ? "?chaveValidacao=" + validationKey(key) : "";
  const result = await request("/envios/" + safe + "/validacoes" + query, token, "GET", fetcher);
  const allowed = ["AGUARDANDO_VALIDACAO", "EM_VALIDACAO", "SUCESSO", "COM_PENDENCIAS", "FALHA_PROCESSAMENTO"];
  if (result.protocoloEnvio !== protocol || typeof result.chaveValidacao !== "string" ||
      !VALIDATION_KEY.test(result.chaveValidacao) || !allowed.includes(String(result.statusValidacao))) {
    throw new FleetSandboxTransportError("Resultado de validação inválido.");
  }
  return result as FleetSandboxValidation;
}
export async function readFleetSandboxAggregates(
  protocol: string, token: string, key?: string, fetcher: typeof fetch = fetch,
) {
  const safe = inSandbox(protocol);
  const query = key ? "?chaveValidacao=" + validationKey(key) : "";
  return request("/envios/" + safe + "/validacoes/agregados" + query, token, "GET", fetcher);
}
