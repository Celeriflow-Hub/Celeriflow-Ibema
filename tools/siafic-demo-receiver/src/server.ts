import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { basename, resolve } from "node:path";
import { config } from "dotenv";
import { envelopeSchema, protocol, protocolVersion } from "./contract";
import { ReceiverError, ReceiverStore, type ReceiverConfig } from "./store";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const maxBodyDefault = 262_144;
type FaultScenario = "NORMAL" | "FAIL_BEFORE_COMMIT_ONCE" | "FAIL_AFTER_COMMIT_ONCE";
type FaultConfig = { scenario: FaultScenario; datasetId: string | null; eventId: string | null };

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value || /__CONFIGURAR|CHANGE_ME|EXAMPLE/i.test(value)) throw new Error(`${name} must be configured.`);
  return value;
}

function tokenHash(token: string) {
  return `sha256:${createHash("sha256").update(token, "utf8").digest("hex")}`;
}

function receiverConfigFromEnvironment(): ReceiverConfig {
  if (process.env.APP_ENV?.trim() !== "DEMO") throw new Error("The SIAFIC DEMO receiver requires APP_ENV=DEMO.");
  const configuredHash = required("SIAFIC_CLIENT_TOKEN_HASH");
  if (!/^sha256:[a-f0-9]{64}$/i.test(configuredHash)) throw new Error("SIAFIC_CLIENT_TOKEN_HASH must be a SHA-256 digest.");
  const databasePath = process.env.SIAFIC_RECEIVER_DATABASE_PATH?.trim() || resolve(process.cwd(), "data");
  return {
    receiverId: required("SIAFIC_RECEIVER_ID"),
    tokenHash: configuredHash.toLowerCase(),
    sourceInstanceId: required("SIAFIC_ALLOWED_SOURCE_INSTANCE"),
    datasetId: required("SIAFIC_ALLOWED_DATASET"),
    databasePath,
  };
}

function maxBodyBytes() {
  const parsed = Number(process.env.SIAFIC_MAX_BODY_BYTES || maxBodyDefault);
  return Number.isInteger(parsed) && parsed >= 1_024 && parsed <= 1_048_576 ? parsed : maxBodyDefault;
}

function configuredFault(config: ReceiverConfig): FaultConfig {
  if (process.env.SIAFIC_FAULT_INJECTION_ENABLED !== "true") return { scenario: "NORMAL", datasetId: null, eventId: null };
  const value = process.env.SIAFIC_FAULT_SCENARIO?.trim();
  if (value !== "FAIL_BEFORE_COMMIT_ONCE" && value !== "FAIL_AFTER_COMMIT_ONCE") {
    throw new Error("SIAFIC_FAULT_SCENARIO deve informar uma falha DEMO conhecida quando a injecao estiver habilitada.");
  }
  const datasetId = process.env.SIAFIC_FAULT_DATASET_ID?.trim() || null;
  const eventId = process.env.SIAFIC_FAULT_EVENT_ID?.trim() || null;
  if (!datasetId && !eventId) throw new Error("A injecao de falha exige SIAFIC_FAULT_DATASET_ID ou SIAFIC_FAULT_EVENT_ID.");
  if (datasetId && datasetId !== config.datasetId) throw new Error("SIAFIC_FAULT_DATASET_ID deve corresponder ao dataset autorizado pelo receptor.");
  if (eventId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)) {
    throw new Error("SIAFIC_FAULT_EVENT_ID deve ser um UUID valido.");
  }
  return { scenario: value, datasetId, eventId };
}

function faultApplies(fault: FaultConfig, event: { datasetId: string; eventId: string }) {
  return fault.scenario !== "NORMAL"
    && (!fault.datasetId || fault.datasetId === event.datasetId)
    && (!fault.eventId || fault.eventId === event.eventId);
}

function writeJson(response: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  response.end(JSON.stringify(body));
}

function writeError(response: ServerResponse, error: ReceiverError) {
  writeJson(response, error.status, { error: { code: error.code, message: error.message } });
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function isAuthorized(request: IncomingMessage, config: ReceiverConfig) {
  const value = request.headers.authorization;
  if (!value?.startsWith("Bearer ")) return false;
  return safeEqual(tokenHash(value.slice("Bearer ".length)), config.tokenHash);
}

function cookieValue(request: IncomingMessage, name: string) {
  const value = request.headers.cookie;
  if (!value) return null;
  for (const entry of value.split(";")) {
    const [key, ...parts] = entry.trim().split("=");
    if (key === name) return parts.join("=") || null;
  }
  return null;
}

function hasDashboardSession(request: IncomingMessage, sessions: Map<string, number>) {
  const id = cookieValue(request, "siafic_demo_dashboard_session");
  if (!id) return false;
  const expiresAt = sessions.get(id);
  if (!expiresAt || expiresAt <= Date.now()) {
    sessions.delete(id);
    return false;
  }
  return true;
}

function dashboardLoginHtml() {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Receptor SIAFIC - Acesso</title><style>body{font:14px system-ui;margin:32px;color:#172033;max-width:520px}.notice{background:#fef3c7;padding:12px;border-radius:6px}label,input,button{display:block;width:100%;box-sizing:border-box;margin-top:10px}input,button{padding:10px}button{background:#1d4ed8;border:0;border-radius:6px;color:#fff;font-weight:700}</style></head><body><h1>Receptor SIAFIC - Robonuvem DEMO</h1><p class="notice">Ambiente simulado. Dados ficticios e sem validade oficial.</p><p>Informe o token Bearer configurado para abrir o painel local. O token nao e persistido no navegador.</p><form method="post" action="/dashboard/session"><label for="token">Token de integracao</label><input id="token" name="token" type="password" autocomplete="current-password" required><button type="submit">Abrir painel</button></form></body></html>`;
}

async function readText(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += value.length;
    if (bytes > maxBodyBytes()) throw new ReceiverError(413, "PAYLOAD_TOO_LARGE", "The request body exceeds the demonstration limit.");
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readJson(request: IncomingMessage) {
  const text = await readText(request);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ReceiverError(400, "INVALID_JSON", "The request body is not valid JSON.");
  }
}

function pageParams(url: URL) {
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") || 0), 0);
  return { limit: Number.isInteger(limit) ? limit : 50, offset: Number.isInteger(offset) ? offset : 0 };
}

function html(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export async function startReceiver(options: { port?: number; host?: string; config?: ReceiverConfig } = {}) {
  const config = options.config ?? receiverConfigFromEnvironment();
  const fault = configuredFault(config);
  const store = await ReceiverStore.open(config);
  let faultUsed = false;
  const dashboardSessions = new Map<string, number>();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
    try {
      if (request.method === "GET" && url.pathname === "/api/demo/v1/health") {
        writeJson(response, 200, { receiver: "Receptor SIAFIC - Robonuvem DEMO", environment: "DEMO", simulation: true });
        return;
      }
      if (request.method === "POST" && url.pathname === "/dashboard/session") {
        const token = new URLSearchParams(await readText(request)).get("token")?.trim();
        if (!token || !safeEqual(tokenHash(token), config.tokenHash)) {
          response.writeHead(401, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
          response.end(dashboardLoginHtml());
          return;
        }
        const sessionId = randomUUID();
        dashboardSessions.set(sessionId, Date.now() + 8 * 60 * 60 * 1_000);
        response.writeHead(303, {
          Location: "/dashboard",
          "Cache-Control": "no-store",
          "Set-Cookie": `siafic_demo_dashboard_session=${sessionId}; HttpOnly; SameSite=Strict; Path=/dashboard; Max-Age=28800`,
        });
        response.end();
        return;
      }
      if (request.method === "POST" && url.pathname === "/dashboard/logout") {
        const sessionId = cookieValue(request, "siafic_demo_dashboard_session");
        if (sessionId) dashboardSessions.delete(sessionId);
        response.writeHead(303, { Location: "/dashboard", "Cache-Control": "no-store", "Set-Cookie": "siafic_demo_dashboard_session=; HttpOnly; SameSite=Strict; Path=/dashboard; Max-Age=0" });
        response.end();
        return;
      }
      if (request.method === "GET" && url.pathname === "/dashboard") {
        if (!isAuthorized(request, config) && !hasDashboardSession(request, dashboardSessions)) {
          response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
          response.end(dashboardLoginHtml());
          return;
        }
        const persons = await store.entities("PERSON", 50, 0);
        const instruments = await store.entities("INSTRUMENT", 50, 0);
        const instrumentRows = instruments.rows.map((row) => ({
          ...row,
          instrumentLabel: row.entityData.entityType === "INSTRUMENT" && row.entityData.payload.instrumentType === "AGREEMENT" ? "Convenio" : "Contrato",
        }));
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        response.end(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Receptor SIAFIC - Robonuvem DEMO</title><style>body{font:14px system-ui;margin:32px;color:#172033}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}.notice{background:#fef3c7;padding:12px;border-radius:6px}form{display:inline}button{padding:6px 10px}</style></head><body><h1>Receptor SIAFIC - Robonuvem DEMO</h1><p class="notice">Ambiente simulado para demonstracao de interoperabilidade. Nao conectado ao SIAFIC da Prefeitura. Dados ficticios. Protocolos sem validade oficial.</p><p>Dataset: ${html(config.datasetId)}</p><form method="post" action="/dashboard/logout"><button type="submit">Encerrar sessao</button></form><h2>Fornecedores / partes (${persons.total})</h2><table><tr><th>Origem</th><th>Versao</th><th>Atualizado</th></tr>${persons.rows.map((row) => `<tr><td>${html(row.sourceEntityId)}</td><td>${row.latestVersion}</td><td>${html(row.updatedAt)}</td></tr>`).join("")}</table><h2>Instrumentos (${instruments.total})</h2><table><tr><th>Tipo</th><th>Origem</th><th>Versao</th><th>Atualizado</th></tr>${instrumentRows.map((row) => `<tr><td>${row.instrumentLabel}</td><td>${html(row.sourceEntityId)}</td><td>${row.latestVersion}</td><td>${html(row.updatedAt)}</td></tr>`).join("")}</table></body></html>`);
        return;
      }
      if (!isAuthorized(request, config)) {
        writeError(response, new ReceiverError(401, "UNAUTHORIZED", "A valid integration credential is required."));
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/demo/v1/capabilities") {
        writeJson(response, 200, { protocol, protocolVersion, receiverId: config.receiverId, environment: "DEMO", capabilities: ["person.snapshot", "instrument.snapshot", "contract.snapshot", "agreement.snapshot", "receipts", "reconciliation"] });
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/demo/v1/events") {
        const body = await readJson(request);
        const parsed = envelopeSchema.safeParse(body);
        if (!parsed.success) throw new ReceiverError(422, "VALIDATION_ERROR", "The event does not match ROBONUVEM-SIAFIC-DEMO 1.0.");
        const event = parsed.data;
        if (event.sourceInstanceId !== config.sourceInstanceId || event.datasetId !== config.datasetId) {
          throw new ReceiverError(403, "FORBIDDEN_SCOPE", "The source instance or dataset does not match this receiver scope.");
        }
        const idempotencyKey = request.headers["idempotency-key"];
        if (typeof idempotencyKey !== "string" || !idempotencyKey.startsWith("siafic-demo:")) {
          throw new ReceiverError(422, "VALIDATION_ERROR", "A stable Idempotency-Key is required.");
        }
        if (!faultUsed && faultApplies(fault, event) && fault.scenario === "FAIL_BEFORE_COMMIT_ONCE") {
          faultUsed = true;
          throw new ReceiverError(503, "TEMPORARILY_UNAVAILABLE", "Controlled failure before commit.");
        }
        const result = await store.processEvent(event, idempotencyKey);
        if (!faultUsed && faultApplies(fault, event) && fault.scenario === "FAIL_AFTER_COMMIT_ONCE") {
          faultUsed = true;
          throw new ReceiverError(503, "TEMPORARILY_UNAVAILABLE", "Controlled failure after commit.");
        }
        writeJson(response, result.replayed ? 200 : 201, result.receipt);
        return;
      }
      if (request.method === "GET" && url.pathname.startsWith("/api/demo/v1/receipts/by-event/")) {
        const eventId = basename(url.pathname);
        const receipt = await store.receiptByEvent(eventId);
        if (!receipt) throw new ReceiverError(404, "RECEIPT_NOT_FOUND", "No receipt exists for this event in the authorized scope.");
        writeJson(response, 200, receipt);
        return;
      }
      if (request.method === "GET" && (url.pathname === "/api/demo/v1/persons" || url.pathname === "/api/demo/v1/instruments")) {
        const { limit, offset } = pageParams(url);
        const entityType = url.pathname.endsWith("persons") ? "PERSON" : "INSTRUMENT";
        writeJson(response, 200, await store.entities(entityType, limit, offset));
        return;
      }
      if (request.method === "GET" && url.pathname.startsWith("/api/demo/v1/entities/")) {
        const [, , , , , entityType, sourceEntityId] = url.pathname.split("/");
        if ((entityType !== "PERSON" && entityType !== "INSTRUMENT") || !sourceEntityId) {
          throw new ReceiverError(404, "NOT_FOUND", "Entity route not found.");
        }
        const entity = await store.entity(entityType, decodeURIComponent(sourceEntityId));
        if (!entity) throw new ReceiverError(404, "ENTITY_NOT_FOUND", "The entity is not available in the authorized scope.");
        writeJson(response, 200, entity);
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/demo/v1/reconciliation") {
        writeJson(response, 200, { datasetId: config.datasetId, entities: await store.reconciliation() });
        return;
      }
      throw new ReceiverError(404, "NOT_FOUND", "Route not found.");
    } catch (error) {
      if (error instanceof ReceiverError) {
        writeError(response, error);
        return;
      }
      writeError(response, new ReceiverError(500, "INTERNAL_ERROR", "The receiver could not process the request."));
    }
  });
  await new Promise<void>((resolvePromise) => server.listen(options.port ?? Number(process.env.PORT || 4010), options.host ?? "127.0.0.1", resolvePromise));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("The receiver did not expose a TCP address.");
  return {
    baseUrl: `http://${options.host ?? "127.0.0.1"}:${address.port}`,
    close: async () => {
      await new Promise<void>((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise()));
      await store.close();
    },
  };
}

if (require.main === module) {
  void startReceiver().then(({ baseUrl }) => {
    console.log(`RECEIVER_READY ${baseUrl}`);
  }).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Unable to start receiver.");
    process.exitCode = 1;
  });
}
