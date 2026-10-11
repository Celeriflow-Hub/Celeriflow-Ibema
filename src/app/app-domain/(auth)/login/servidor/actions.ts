"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/server";
import { checkRateLimit } from "@/lib/platform/rate-limit";
import { municipality } from "@/lib/platform/municipality";
import { employeeLoginEmail } from "@/lib/portal-servidor/login-id";

const schema = z.object({
  cpf: z.string().transform((v) => v.replace(/\D/g, "")).refine((v) => v.length === 11, "CPF inválido."),
  registration: z.string().trim().min(1, "Informe a matrícula.").max(30),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de admissão."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(128),
});

const GENERIC = "Não foi possível confirmar seus dados. Confira CPF, matrícula e data de admissão ou procure o RH.";

/**
 * Primeiro acesso / redefinição de senha do Portal do Servidor. A identidade é
 * confirmada por CPF + matrícula + data de admissão; a mensagem de erro é
 * sempre genérica para não revelar quais CPFs existem.
 */
export async function firstAccess(input: Record<string, string>): Promise<{ error?: string; loginId?: string }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const limit = checkRateLimit(`servidor-primeiro-acesso:${ip}`);
  if (!limit.allowed) return { error: `Muitas tentativas. Tente novamente em ${limit.retryAfterSeconds} segundos.` };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? GENERIC };
  const { cpf, registration, admissionDate, password } = parsed.data;

  try {
    const candidates = await prisma.employee.findMany({ where: { isActive: true, registration }, select: { id: true, name: true, cpf: true, admissionDate: true, usuario: { select: { id: true, email: true, firebaseUid: true } } } });
    const employee = candidates.find((e) => (e.cpf ?? "").replace(/\D/g, "") === cpf && e.admissionDate?.toISOString().slice(0, 10) === admissionDate);
    if (!employee) return { error: GENERIC };

    const email = employeeLoginEmail(cpf, municipality.systemDomain);
    if (employee.usuario && employee.usuario.email !== email) {
      return { error: "Você já possui acesso com e-mail institucional. Entre com esse e-mail ou use \"Esqueci minha senha\"." };
    }

    let uid = employee.usuario?.firebaseUid ?? null;
    if (uid) await adminAuth.updateUser(uid, { password, disabled: false, displayName: employee.name });
    else {
      try { uid = (await adminAuth.getUserByEmail(email)).uid; await adminAuth.updateUser(uid, { password, disabled: false }); }
      catch { uid = (await adminAuth.createUser({ email, password, displayName: employee.name })).uid; }
    }

    const perfil = await prisma.configuracaoPerfil.upsert({
      where: { codigo: "SERVIDOR_PORTAL" },
      create: { codigo: "SERVIDOR_PORTAL", nome: "Servidor — Portal", descricao: "Acesso exclusivo ao Portal do Servidor (autosserviço).", permissoes: JSON.stringify({ modules: {} }) },
      update: {},
    });
    if (employee.usuario) await prisma.usuario.update({ where: { id: employee.usuario.id }, data: { firebaseUid: uid, ativo: true } });
    else await prisma.usuario.create({ data: { nome: employee.name, email, firebaseUid: uid, perfilId: perfil.id, employeeId: employee.id, ativo: true } });

    return { loginId: cpf };
  } catch (error) {
    console.error("firstAccess", error);
    return { error: "Serviço de acesso indisponível no momento. Tente novamente mais tarde." };
  }
}
