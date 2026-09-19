import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { dispatchSiaficEvent, testSiaficDemoConnection } from "../src/lib/siafic/dispatcher";
import { siaficDemoEnvelopeSchema } from "../src/lib/siafic/contract";
import { createSupplierWithSiaficEvent, saveContractWithSiaficEvent } from "../src/lib/siafic/source";
import { configureSiaficDemoEnvironment, createSiaficTestDatabase, seedSiaficSourceFixture } from "./helpers/siafic-test-environment";

type FaultScenario = "FAIL_BEFORE_COMMIT_ONCE" | "FAIL_AFTER_COMMIT_ONCE" | null;

function sha256(value: string) {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

async function startReceiver(fault: FaultScenario) {
  const token = "siafic-e2e-token";
  const databasePath = await mkdtemp(join(tmpdir(), "celeriflow-siafic-receiver-"));
  const receiverRoot = resolve("tools/siafic-demo-receiver");
  const child = spawn(process.execPath, ["--import", "tsx", "src/server.ts"], {
    cwd: receiverRoot,
    env: {
      ...process.env,
      APP_ENV: "DEMO",
      PORT: "0",
      SIAFIC_RECEIVER_ID: "ROBONUVEM-SIAFIC-RECEIVER-E2E",
      SIAFIC_ALLOWED_SOURCE_INSTANCE: "CELERIFLOW-DEMO-01",
      SIAFIC_ALLOWED_DATASET: "SIAFIC-POC-2026-TEST",
      SIAFIC_CLIENT_TOKEN_HASH: sha256(token),
      SIAFIC_RECEIVER_DATABASE_PATH: databasePath,
      SIAFIC_FAULT_INJECTION_ENABLED: fault ? "true" : "false",
      SIAFIC_FAULT_SCENARIO: fault ?? "",
      SIAFIC_FAULT_DATASET_ID: "SIAFIC-POC-2026-TEST",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let diagnostics = "";
  const baseUrl = await new Promise<string>((resolvePromise, reject) => {
    const timeout = setTimeout(() => reject(new Error(`O receptor SIAFIC nao iniciou. ${diagnostics}`)), 20_000);
    const resolveReady = (chunk: Buffer) => {
      diagnostics += chunk.toString("utf8");
      const match = diagnostics.match(/RECEIVER_READY\s+(http:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolvePromise(match[1]);
      }
    };
    child.stdout?.on("data", resolveReady);
    child.stderr?.on("data", (chunk: Buffer) => { diagnostics += chunk.toString("utf8"); });
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`O receptor SIAFIC terminou antes de iniciar (${code}). ${diagnostics}`));
    });
  });
  return {
    baseUrl,
    token,
    close: async () => {
      if (child.exitCode === null) {
        child.kill();
        await once(child, "exit");
      }
      await rm(databasePath, { recursive: true, force: true });
    },
  };
}

async function retryNow(prisma: Awaited<ReturnType<typeof createSiaficTestDatabase>>["prisma"], eventId: string) {
  await prisma.siaficDelivery.update({ where: { eventId }, data: { nextAttemptAt: new Date(0) } });
}

test("SIAFIC DEMO · ERP e receptor independente", { timeout: 180000 }, async (t) => {
  await t.test("T01/T14/T30 · entrega autenticada, contrato dependente e idempotencia", async () => {
    const receiver = await startReceiver(null);
    const cleanupEnvironment = configureSiaficDemoEnvironment(receiver.baseUrl, receiver.token);
    const database = await createSiaficTestDatabase();
    try {
      const fixture = await seedSiaficSourceFixture(database.prisma, receiver.baseUrl);
      const connection = await database.prisma.integrationConnection.findUniqueOrThrow({ where: { code: "SIAFIC_DEMO" } });
      assert.deepEqual(await testSiaficDemoConnection(connection), {
        status: "SUCESSO",
        message: "Receptor SIAFIC DEMO autenticado e compativel com o contrato 1.0.",
      });

      const supplierResult = await createSupplierWithSiaficEvent(database.prisma, { usuarioId: fixture.actor.id }, { companyId: fixture.company.id });
      const supplierEventId = supplierResult.eventIds[0];
      assert.equal((await dispatchSiaficEvent(database.prisma, supplierEventId)).processed, true);

      const contractResult = await saveContractWithSiaficEvent(database.prisma, { usuarioId: fixture.actor.id }, {
        number: "CT-E2E/2026",
        object: "Contrato E2E SIAFIC DEMO",
        initialValue: 2260,
        updatedValue: 2260,
        startDate: new Date("2026-09-01T12:00:00.000Z"),
        endDate: new Date("2026-09-30T12:00:00.000Z"),
        status: "Vigente",
        processId: fixture.process.id,
        supplierId: supplierResult.supplier.id,
        secretariatId: fixture.secretariat.id,
        sourceBudgetUnitId: fixture.budgetUnit.id,
      });
      const contractEventId = contractResult.eventIds.at(-1)!;
      assert.equal((await dispatchSiaficEvent(database.prisma, contractEventId)).processed, true);

      const supplierEvent = await database.prisma.siaficOutboxEvent.findUniqueOrThrow({ where: { id: supplierEventId } });
      const duplicate = await fetch(`${receiver.baseUrl}/api/demo/v1/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${receiver.token}`, "Content-Type": "application/json", "Idempotency-Key": supplierEvent.idempotencyKey },
        body: JSON.stringify(siaficDemoEnvelopeSchema.parse(supplierEvent.payload)),
      });
      assert.equal(duplicate.status, 200);

      const instruments = await fetch(`${receiver.baseUrl}/api/demo/v1/instruments`, { headers: { Authorization: `Bearer ${receiver.token}` } });
      assert.equal(instruments.status, 200);
      assert.equal((await instruments.json() as { total: number }).total, 1);
      const loginPage = await fetch(`${receiver.baseUrl}/dashboard`);
      assert.equal(loginPage.status, 200);
      assert.match(await loginPage.text(), /Abrir painel/);
      const login = await fetch(`${receiver.baseUrl}/dashboard/session`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: receiver.token }).toString(),
        redirect: "manual",
      });
      assert.equal(login.status, 303);
      const cookie = login.headers.get("set-cookie");
      assert.ok(cookie);
      assert.match(cookie, /HttpOnly/);
      const dashboard = await fetch(`${receiver.baseUrl}/dashboard`, { headers: { Cookie: cookie.split(";", 1)[0] } });
      assert.equal(dashboard.status, 200);
      assert.match(await dashboard.text(), /Fornecedores \/ partes \(1\)/);
      const forbidden = await fetch(`${receiver.baseUrl}/api/demo/v1/persons`, { headers: { Authorization: "Bearer token-invalido" } });
      assert.equal(forbidden.status, 401);
      assert.equal((await database.prisma.siaficExternalLink.count()), 2);
    } finally {
      cleanupEnvironment();
      await database.close();
      await receiver.close();
    }
  });

  for (const scenario of ["FAIL_BEFORE_COMMIT_ONCE", "FAIL_AFTER_COMMIT_ONCE"] as const) {
    await t.test(`T17/T18 · ${scenario} confirma sem duplicar`, async () => {
      const receiver = await startReceiver(scenario);
      const cleanupEnvironment = configureSiaficDemoEnvironment(receiver.baseUrl, receiver.token);
      const database = await createSiaficTestDatabase();
      try {
        const fixture = await seedSiaficSourceFixture(database.prisma, receiver.baseUrl);
        const result = await createSupplierWithSiaficEvent(database.prisma, { usuarioId: fixture.actor.id }, { companyId: fixture.company.id });
        const eventId = result.eventIds[0];
        assert.equal((await dispatchSiaficEvent(database.prisma, eventId)).processed, false);
        assert.equal((await database.prisma.siaficDelivery.findUniqueOrThrow({ where: { eventId } })).status, "RETRY_SCHEDULED");
        await retryNow(database.prisma, eventId);
        assert.equal((await dispatchSiaficEvent(database.prisma, eventId)).processed, true);

        const persons = await fetch(`${receiver.baseUrl}/api/demo/v1/persons`, { headers: { Authorization: `Bearer ${receiver.token}` } });
        assert.equal((await persons.json() as { total: number }).total, 1);
        const delivery = await database.prisma.siaficDelivery.findUniqueOrThrow({ where: { eventId } });
        assert.equal(delivery.status, "PROCESSED");
        assert.equal(delivery.attemptCount, 2);
      } finally {
        cleanupEnvironment();
        await database.close();
        await receiver.close();
      }
    });
  }
});
