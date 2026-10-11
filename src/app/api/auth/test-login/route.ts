import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/platform/session";
import { checkRateLimit } from "@/lib/platform/rate-limit";
import { createTestSessionCookie, TEST_ADMIN_UID_PREFIX, testLoginMatches } from "@/lib/platform/test-login";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ email: z.string().min(3).max(200), password: z.string().min(1).max(500) });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const rateLimit = checkRateLimit(`test-login:${ip}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: `Muitas tentativas. Tente novamente em ${rateLimit.retryAfterSeconds} segundos.` }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !testLoginMatches(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ error: "not_test_user" }, { status: 401 });
  }

  try {
    const email = parsed.data.email.trim().toLowerCase();
    const profile = await prisma.configuracaoPerfil.upsert({
      where: { codigo: "SYSTEM_ADMINISTRATOR" },
      create: { id: "system-administrator", codigo: "SYSTEM_ADMINISTRATOR", nome: "Administrador", descricao: "Acesso administrativo inicial do sistema.", permissoes: JSON.stringify({ acesso: "total" }), ativo: true },
      update: {},
    });
    const firebaseUid = `${TEST_ADMIN_UID_PREFIX}${email}`;
    await prisma.usuario.upsert({
      where: { email },
      create: { nome: "Administrador (teste)", email, senha: "test-login", firebaseUid, ativo: true, perfilId: profile.id },
      update: { firebaseUid, ativo: true, perfilId: profile.id },
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, createTestSessionCookie(SESSION_DURATION_MS), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Falha no login de testes", error);
    return NextResponse.json({ error: "Nao foi possivel iniciar a sessao de testes." }, { status: 500 });
  }
}
