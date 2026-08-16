import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ATENÇÃO: O middleware roda no Edge Runtime — NÃO importar módulos Node.js aqui.
const SESSION_COOKIE_NAME = "celeriflow_session";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = (req.headers.get("host") || "").toLowerCase().split(":")[0];

  // Domínio que deve apontar direto para o sistema interno (dashboard)
  const systemDomain = "divinosaolourenco.celeriflow.com.br";

  const isSystemDomain = hostname === systemDomain || hostname === "app.localhost" || hostname.includes("vercel.app");

  // Se o usuário tentar acessar a pasta interna via URL, reescreve ou redireciona
  if (url.pathname.startsWith("/app-domain")) {
    const newUrl = url.pathname.replace("/app-domain", "") || "/";
    return NextResponse.redirect(new URL(newUrl, req.url));
  }

  // Se for o domínio do sistema ou Vercel app, faz o rewrite (redirecionamento invisível) para /app-domain
  if (isSystemDomain) {
    const internalPath = url.pathname === "/" ? "/login" : url.pathname;
    const newPath = `/app-domain${internalPath}`;

    // Redireciona para /login se não há sessão e não está já na página de login
    const hasSession = req.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSession && internalPath !== "/login" && !internalPath.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Reescrita invisível: domínio -> /app-domain/...
    return NextResponse.rewrite(new URL(newPath, req.url));
  }

  return NextResponse.next();
}
