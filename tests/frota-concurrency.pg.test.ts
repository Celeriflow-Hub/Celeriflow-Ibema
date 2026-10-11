import "./helpers/fleet-test-environment";
import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { confirmFuelOrderOnce } from "../src/lib/frotas/fuel-order";
import { submitWorkshopReport } from "../src/lib/frotas/workshop-report";

/**
 * Distinct connections to a real, EPHEMERAL PostgreSQL service. No production
 * credentials are accepted. GH Actions sets the literal localhost URL below.
 */
const url = process.env.TEST_POSTGRES_URL;
if (!url) {
  test.skip("PostgreSQL concurrency tests require the isolated TEST_POSTGRES_URL", () => {});
} else {
  const parsed = new URL(url);
  if (!["localhost", "127.0.0.1"].includes(parsed.hostname) ||
      parsed.pathname !== "/vette_frota_ci" || parsed.username !== "postgres") {
    throw new Error("Only the isolated localhost vette_frota_ci database is allowed.");
  }

  test("V2 · independent PostgreSQL connections serialize fuel and workshop actions",
    { timeout: 180_000 }, async () => {
      const schema = spawnSync(process.execPath, [
        "node_modules/prisma/build/index.js", "migrate", "diff",
        "--from-empty", "--to-schema", "prisma/", "--script",
      ], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
      assert.equal(schema.status, 0, schema.stderr);
      const setup = new pg.Client({ connectionString: url });
      await setup.connect();
      try {
        await setup.query(schema.stdout);
      } finally {
        await setup.end();
      }

      const a = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 2 }) });
      const b = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 2 }) });
      try {
        const secretaria = await a.secretariat.create({ data: { name: "CI - frota isolada" } });
        const department = await a.department.create({
          data: { name: "Departamento CI", secretariatId: secretaria.id },
        });
        const profile = await a.configuracaoPerfil.create({
          data: { codigo: "CI_FROTA", nome: "Frota CI", permissoes: "{}", ativo: true },
        });
        const actor = await a.usuario.create({
          data: {
            nome: "Operador CI", email: "ci-frota@example.invalid",
            senha: "no-auth-fixture", perfilId: profile.id,
          },
        });
        const unit = await a.fleetUnit.create({
          data: {
            code: "CI-001", name: "Veículo CI", category: "VEICULO",
            departmentId: department.id, currentReading: 1000,
            createdById: actor.id,
          },
        });
        const station = await a.fleetFuelStation.create({
          data: { name: "Posto teste CI", cnpj: "11222333000181", pricePerLiter: 6 },
        });
        const order = await a.fleetFuelOrder.create({
          data: {
            code: "OA-CI-2026", unitId: unit.id, stationId: station.id,
            fuelType: "DIESEL", litersAuthorized: 20, portalToken: "TEST0001",
            createdById: actor.id,
          },
        });
        const fuelRequest = {
          orderId: order.id, liters: 10, reading: 1020, pricePerLiter: null,
          confirmedVia: "PORTAL_POSTO" as const,
          stationCredentials: { cnpj: station.cnpj, token: "TEST0001" },
        };
        const results = await Promise.allSettled([
          confirmFuelOrderOnce(a, fuelRequest),
          confirmFuelOrderOnce(b, fuelRequest),
        ]);
        assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
        assert.equal(results.filter(result => result.status === "rejected").length, 1);
        const consumption = await a.fleetConsumption.findFirstOrThrow({ where: { reference: order.code } });
        assert.equal(await a.fleetConsumption.count({ where: { reference: order.code } }), 1);
        assert.equal(await a.fleetExpense.count({
          where: { sourceType: "CONSUMO", sourceId: consumption.id },
        }), 1);
        assert.equal((await a.fleetFuelOrder.findUniqueOrThrow({
          where: { id: order.id },
        })).status, "ABASTECIDA");

        const plan = await a.fleetPlan.create({
          data: {
            unitId: unit.id, title: "Revisão concorrência", type: "PREVENTIVA",
            services: "Revisão", firstDueAt: new Date("2026-09-01T00:00:00Z"),
            nextDueAt: new Date("2026-09-01T00:00:00Z"),
            intervalDays: 30, createdById: actor.id,
          },
        });
        const work = await a.fleetWorkOrder.create({
          data: {
            unitId: unit.id, planId: plan.id, title: "OS concorrência",
            type: "PREVENTIVA", services: "Revisão",
            scheduledAt: new Date("2026-09-15T00:00:00Z"),
            intervalDays: 30, createdById: actor.id,
            workshopCnpj: station.cnpj, workshopName: "Oficina CI", portalToken: "WRK0001",
          },
        });
        const workshopRequest = {
          orderCode: work.id.slice(-8),
          cnpj: station.cnpj,
          token: "WRK0001",
          performed: "Revisão executada",
          amount: 90,
        };
        const reports = await Promise.allSettled([
          submitWorkshopReport(a, workshopRequest),
          submitWorkshopReport(b, workshopRequest),
        ]);
        assert.equal(reports.filter(result => result.status === "fulfilled").length, 1);
        assert.equal(reports.filter(result => result.status === "rejected").length, 1);
        assert.equal(await a.fleetWorkshopReport.count({ where: { workOrderId: work.id } }), 1);
        assert.equal((await a.fleetWorkOrder.findUniqueOrThrow({
          where: { id: work.id },
        })).portalToken, null);
      } finally {
        await Promise.all([a.$disconnect(), b.$disconnect()]);
      }
    });
}
