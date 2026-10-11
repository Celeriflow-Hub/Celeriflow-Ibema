import { randomInt, timingSafeEqual } from "node:crypto";

// Código de conferência entregue ao motorista junto com a ordem. O posto ou a
// oficina só conseguem registrar algo informando o código da ordem, o CNPJ e
// este token — nenhum dado da frota é exposto sem os três.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generatePortalToken(length = 8) {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

export function tokenMatches(expected: string | null | undefined, given: string) {
  if (!expected) return false;
  const a = Buffer.from(expected.toUpperCase()), b = Buffer.from(given.trim().toUpperCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export const TRIP_CHECKLIST = [
  ["pneus", "Pneus calibrados e sem danos"],
  ["luzes", "Faróis, setas e luz de freio"],
  ["oleo", "Nível de óleo e água"],
  ["freios", "Freios funcionando"],
  ["documentos", "Documento do veículo a bordo"],
  ["extintor", "Extintor e triângulo"],
  ["limpeza", "Veículo limpo"],
] as const;

export type ChecklistResult = { item: string; ok: boolean }[];

export function parseChecklist(form: FormData): { items: ChecklistResult; failures: string[] } {
  const items = TRIP_CHECKLIST.map(([key, label]) => ({ item: label, ok: form.get(`check_${key}`) === "on" }));
  return { items, failures: items.filter((i) => !i.ok).map((i) => i.item) };
}
