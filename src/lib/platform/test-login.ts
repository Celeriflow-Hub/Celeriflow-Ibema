import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { SessionPrincipal } from "@/lib/platform/session";

// Login de testes sem Firebase: habilitado apenas quando ADM_USER_EMAIL e ADM_USER_PASSKEY existem.
export const TEST_SESSION_PREFIX = "test.";
export const TEST_ADMIN_UID_PREFIX = "test-admin:";

function config() {
  const email = process.env.ADM_USER_EMAIL?.trim().toLowerCase();
  const passkey = process.env.ADM_USER_PASSKEY;
  return email && passkey ? { email, passkey } : null;
}

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function testLoginMatches(email: string, password: string): boolean {
  const cfg = config();
  if (!cfg) return false;
  const emailOk = timingSafeEqual(digest(email.trim().toLowerCase()), digest(cfg.email));
  const passOk = timingSafeEqual(digest(password), digest(cfg.passkey));
  return emailOk && passOk;
}

function sign(payload: string, passkey: string) {
  return createHmac("sha256", `celeriflow-test-session:${passkey}`).update(payload).digest("base64url");
}

export function createTestSessionCookie(durationMs: number): string {
  const cfg = config();
  if (!cfg) throw new Error("Login de testes desabilitado.");
  const payload = Buffer.from(JSON.stringify({ email: cfg.email, iat: Date.now(), exp: Date.now() + durationMs })).toString("base64url");
  return `${TEST_SESSION_PREFIX}${payload}.${sign(payload, cfg.passkey)}`;
}

export function verifyTestSessionCookie(cookie: string): SessionPrincipal | null {
  const cfg = config();
  if (!cfg || !cookie.startsWith(TEST_SESSION_PREFIX)) return null;
  const [payload, signature] = cookie.slice(TEST_SESSION_PREFIX.length).split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, cfg.passkey));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email: string; iat: number; exp: number };
    if (data.email !== cfg.email || Date.now() > data.exp) return null;
    return { firebaseUid: `${TEST_ADMIN_UID_PREFIX}${cfg.email}`, email: cfg.email, name: "Administrador (teste)", authTime: Math.floor(data.iat / 1000) };
  } catch {
    return null;
  }
}
