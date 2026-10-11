/**
 * Sprint 9 — regras puras do Portal do Contribuinte (sem banco):
 * Pix BR Code (padrão EMV do Banco Central), situação fiscal para certidão
 * e token assinado da sessão de autoatendimento.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function formatCpfCnpj(v: string) {
  const d = onlyDigits(v);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return d;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;
const ascii = (v: string, max: number) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().slice(0, max).trim();

/** Gera o "Pix copia e cola" (BR Code estático) com valor e identificador da guia. */
export function buildPixBrCode(input: { key: string; name: string; city: string; amount: number; txid: string }) {
  if (!input.key) throw new Error("Chave Pix do município não configurada.");
  if (!(input.amount > 0)) throw new Error("Valor do Pix deve ser maior que zero.");
  const txid = input.txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const body =
    tlv("00", "01") +
    tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", input.key)) +
    tlv("52", "0000") + tlv("53", "986") + tlv("54", input.amount.toFixed(2)) + tlv("58", "BR") +
    tlv("59", ascii(input.name, 25)) + tlv("60", ascii(input.city, 15)) +
    tlv("62", tlv("05", txid)) + "6304";
  return body + crc16(body);
}

export type FiscalSituation = "NEGATIVA" | "POSITIVA_EFEITO_NEGATIVA" | "POSITIVA";
export type DebtItem = { kind: "GUIA" | "DIVIDA_ATIVA"; status: string; dueDate?: Date | null; balance: number };

const SUSPENDED = ["parcelad", "suspens", "judicial garantid"];
const SETTLED = ["paga", "pago", "cancelad", "baixad", "extint", "quitad", "prescri"];

/** Decide o tipo de certidão (CTN arts. 205 e 206). */
export function evaluateFiscalSituation(items: DebtItem[], today = new Date()): { situation: FiscalSituation; open: DebtItem[]; suspended: DebtItem[] } {
  const live = items.filter((i) => i.balance > 0.004 && !SETTLED.some((s) => i.status.toLowerCase().includes(s)));
  const suspended = live.filter((i) => SUSPENDED.some((s) => i.status.toLowerCase().includes(s)));
  const open = live.filter((i) => !suspended.includes(i) && (i.kind === "DIVIDA_ATIVA" || (i.dueDate != null && i.dueDate < today)));
  return { situation: open.length ? "POSITIVA" : suspended.length ? "POSITIVA_EFEITO_NEGATIVA" : "NEGATIVA", open, suspended };
}

export const certificateLabel: Record<FiscalSituation, string> = {
  NEGATIVA: "Certidão Negativa de Débitos",
  POSITIVA_EFEITO_NEGATIVA: "Certidão Positiva com Efeito de Negativa",
  POSITIVA: "Certidão Positiva de Débitos",
};

/** Validade padrão da certidão (presumida; confirmar no Código Tributário Municipal). */
export const CERTIFICATE_VALIDITY_DAYS = 90;

export const newAuthCode = () => `CND-${randomBytes(6).toString("hex").toUpperCase()}`;

/** Sessão de autoatendimento: taxpayerId + expiração assinados com HMAC. */
export function signSession(taxpayerId: string, secret: string, ttlMinutes = 30, now = Date.now()) {
  const payload = `${taxpayerId}.${now + ttlMinutes * 60_000}`;
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

export function readSession(token: string | undefined, secret: string, now = Date.now()) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${id}.${exp}`).digest("hex");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return Number(exp) > now ? id : null;
}
