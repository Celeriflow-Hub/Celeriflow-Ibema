"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/platform/rate-limit";
import { CERTIFICATE_VALIDITY_DAYS, certificateLabel, newAuthCode, signSession } from "@/lib/tributacao/contribuinte-engine";
import { SESSION_COOKIE, currentTaxpayerId, findTaxpayer, loadStatement, portalSecret } from "@/lib/tributacao/contribuinte-portal";

const BASE = "/portal/contribuinte";

export async function enterPortal(f: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(`contribuinte:${ip}`).allowed) redirect(`${BASE}?erro=${encodeURIComponent("Muitas tentativas. Aguarde alguns minutos.")}`);
  const t = await findTaxpayer(String(f.get("document") ?? ""), String(f.get("inscription") ?? ""));
  if (!t) redirect(`${BASE}?erro=${encodeURIComponent("Dados não conferem. Verifique o CPF/CNPJ e a inscrição municipal ou imobiliária.")}`);
  (await cookies()).set(SESSION_COOKIE, signSession(t.id, portalSecret()), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: BASE, maxAge: 1800 });
  redirect(BASE);
}

export async function leavePortal() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: BASE });
  redirect(BASE);
}

export async function issueCertificate() {
  const id = await currentTaxpayerId();
  if (!id) redirect(BASE);
  const st = await loadStatement(id);
  if (!st) redirect(BASE);
  const { situation, open, suspended } = st.fiscal;
  const authCode = newAuthCode();
  const validUntil = new Date(Date.now() + CERTIFICATE_VALIDITY_DAYS * 86_400_000);
  await prisma.$transaction(async (tx) => {
    const cert = await tx.taxCertificate.create({ data: { certificateType: certificateLabel[situation], authCode, validUntil, status: "Emitida", taxpayerId: id } });
    await tx.taxCertificateEvaluation.create({ data: { taxpayerId: id, certificateId: cert.id, result: situation, pendingCount: open.length, details: { origin: "PORTAL_CONTRIBUINTE", open: open.length, suspended: suspended.length } } });
  });
  redirect(`${BASE}/certidao/${authCode}`);
}
