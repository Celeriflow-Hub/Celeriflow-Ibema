import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import proxy from "../src/proxy";

test("navegação, prefetch e ações do portal não consomem o limite de validação pública", () => {
  const ip = "192.0.2.180";
  const routes = ["/portal", "/portal/historia", "/portal/contato", "/portal/minha-area", "/portal-protocolos", "/portal-transparencia"];
  for (let attempt = 0; attempt < 30; attempt++) {
    for (const route of routes) {
      const response = proxy(new NextRequest(`https://app.localhost${route}`, {
        headers: attempt % 2 === 0
          ? { "x-forwarded-for": ip }
          : { "x-forwarded-for": ip, "next-router-prefetch": "1" },
      }));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-middleware-next"), "1");
      assert.equal(response.headers.get("x-middleware-rewrite"), null);
    }
  }
  const action = proxy(new NextRequest("https://app.localhost/portal/construcao-civil", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  }));
  assert.equal(action.status, 200);

  for (let attempt = 0; attempt < 10; attempt++) {
    assert.equal(proxy(new NextRequest("https://app.localhost/validar-documento/documento", {
      headers: { "x-forwarded-for": ip },
    })).status, 200);
  }
  const blocked = proxy(new NextRequest("https://app.localhost/validar-documento/documento", {
    headers: { "x-forwarded-for": ip },
  }));
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get("Retry-After")) > 0);
  assert.equal(proxy(new NextRequest("https://app.localhost/portal", {
    headers: { "x-forwarded-for": ip },
  })).status, 200);
});

test("rotas internas continuam exigindo sessão e preservando o destino", () => {
  const response = proxy(new NextRequest("https://app.localhost/compras?pagina=2", {
    headers: { host: "app.localhost" },
  }));
  assert.equal(response.status, 307);
  const destination = new URL(response.headers.get("location")!);
  assert.equal(destination.pathname, "/login");
  assert.equal(destination.searchParams.get("returnTo"), "/compras?pagina=2");
});

test("entradas institucionais encaminham aos portais existentes e preservam filtros", () => {
  for (const hostname of ["www.ibema.celeriflow.com.br", "app.localhost", "celeriflow.vercel.app"]) {
    for (const [entry, target] of [
      ["/portal/portaldoservidor", "/portal-servidor"],
      ["/portal/portaldatransparencia", "/portal-transparencia"],
    ]) {
      const response = proxy(new NextRequest(`https://${hostname}${entry}?view=receitas&year=2026`, {
        headers: { host: hostname },
      }));
      assert.equal(response.status, 307);
      const destination = new URL(response.headers.get("location")!);
      assert.equal(destination.hostname, hostname);
      assert.equal(destination.pathname, target);
      assert.equal(destination.search, "?view=receitas&year=2026");
      if (target === "/portal-transparencia") {
        const publicResponse = proxy(new NextRequest(destination, { headers: { host: hostname } }));
        assert.equal(publicResponse.headers.get("x-middleware-next"), "1");
      }
    }
  }
});

test("portal do servidor oferece login em todos os hosts, sem ciclo de redirecionamento", () => {
  for (const hostname of ["www.ibema.celeriflow.com.br", "app.localhost", "celeriflow.vercel.app"]) {
    const response = proxy(new NextRequest(`https://${hostname}/portal-servidor`, {
      headers: { host: hostname },
    }));
    assert.equal(response.status, 307);
    const login = new URL(response.headers.get("location")!);
    assert.equal(login.pathname, "/portal-servidor/entrar");
    assert.equal(login.searchParams.get("returnTo"), "/portal-servidor");
    const loginResponse = proxy(new NextRequest(login, { headers: { host: hostname } }));
    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.headers.get("location"), null);
    assert.equal(new URL(loginResponse.headers.get("x-middleware-rewrite")!).pathname, "/app-domain/portal-servidor/entrar");
  }
});

test("portal do servidor encaminha páginas e ações autenticadas e conserva parâmetros", () => {
  for (const method of ["GET", "POST"]) {
    const response = proxy(new NextRequest("https://www.ibema.celeriflow.com.br/portal-servidor/demonstrativos?year=2026", {
      method,
      headers: { host: "www.ibema.celeriflow.com.br", cookie: "celeriflow_session=session" },
    }));
    assert.equal(response.status, 200);
    const destination = new URL(response.headers.get("x-middleware-rewrite")!);
    assert.equal(destination.pathname, "/app-domain/portal-servidor/demonstrativos");
    assert.equal(destination.search, "?year=2026");
  }
});

test("recuperação funcional é pública e o contexto de rota do Proxy sobrescreve cabeçalhos externos", () => {
  const recovery = proxy(new NextRequest("https://www.ibema.celeriflow.com.br/portal-servidor/recuperar-senha", {
    headers: { host: "www.ibema.celeriflow.com.br", "x-celeriflow-employee-path": "/rh" },
  }));
  assert.equal(recovery.status, 200);
  assert.equal(new URL(recovery.headers.get("x-middleware-rewrite")!).pathname, "/app-domain/portal-servidor/recuperar-senha");
  assert.equal(recovery.headers.get("x-middleware-request-x-celeriflow-employee-path"), "/portal-servidor/recuperar-senha");
  const privatePage = proxy(new NextRequest("https://www.ibema.celeriflow.com.br/portal-servidor/seguranca", {
    headers: { host: "www.ibema.celeriflow.com.br", "x-celeriflow-employee-path": "/portal-servidor/entrar" },
  }));
  assert.equal(privatePage.status, 307);
  assert.equal(new URL(privatePage.headers.get("location")!).pathname, "/portal-servidor/entrar");
});
