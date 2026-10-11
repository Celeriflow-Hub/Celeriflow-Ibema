"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkFleetPortalThrottle, fleetPortalSource, FleetPortalThrottled } from "@/lib/frotas/public-rate-limit";
import { prisma } from "@/lib/prisma";
import { onlyDigits, tokenMatches } from "@/lib/frotas/portal";
import { confirmFuelOrderOnce, FuelOrderError } from "@/lib/frotas/fuel-order";
import { submitWorkshopReport, WorkshopReportError } from "@/lib/frotas/workshop-report";

class UserError extends Error {}
const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const num = (f: FormData, k: string) => { const v = str(f, k).replace(",", "."); return v === "" ? null : Number(v); };
const GENERIC = "Dados não conferem. Verifique o código da ordem, o CNPJ e o código de conferência.";

async function run(path: string, fn: () => Promise<string>) {
  let q: string;
  try { q = `ok=${encodeURIComponent(await fn())}`; } catch (e) { q = `erro=${encodeURIComponent(e instanceof UserError || e instanceof FleetPortalThrottled ? e.message : "Não foi possível registrar agora. Tente novamente.")}`; }
  redirect(`${path}?${q}`);
}

/** Posto credenciado confirma via o mesmo serviço transacional da gestão interna. */
export async function stationConfirm(f: FormData) {
  await run("/portal/frota/posto", async () => {
    const code = str(f, "code", 40).toUpperCase();
    const source = fleetPortalSource(await headers());
    if (source !== "unresolved") await checkFleetPortalThrottle(prisma, "station", "source", source);
    await checkFleetPortalThrottle(prisma, "station", "code", code);
    const cnpj = onlyDigits(str(f, "cnpj", 20));
    const token = str(f, "token", 20);
    const order = await prisma.fleetFuelOrder.findUnique({ where: { code }, select: { id: true, station: { select: { cnpj: true, active: true } }, portalToken: true } });
    // Do not disclose whether the code, CNPJ, or token is incorrect.
    if (!order || !order.station.active || order.station.cnpj !== cnpj || !tokenMatches(order.portalToken, token)) throw new UserError(GENERIC);
    const liters = num(f, "liters"), reading = num(f, "reading");
    if (liters == null || reading == null) throw new UserError("Informe os litros e a leitura do medidor.");
    try {
      const receipt = await confirmFuelOrderOnce(prisma, {
        orderId: order.id,
        liters,
        reading,
        pricePerLiter: num(f, "price"),
        confirmedVia: "PORTAL_POSTO",
        stationCredentials: { cnpj, token },
      });
      return `Abastecimento da ordem ${receipt.code} confirmado: ${liters} L.`;
    } catch (error) {
      if (error instanceof FuelOrderError) throw new UserError(error.message);
      throw error;
    }
  });
}

/** Oficina registra o serviço executado; o setor de frota confere e conclui a OS internamente. */
export async function workshopReport(f: FormData) {
  await run("/portal/frota/oficina", async () => {
    const source = fleetPortalSource(await headers());
    if (source !== "unresolved") await checkFleetPortalThrottle(prisma, "workshop", "source", source);
    await checkFleetPortalThrottle(prisma, "workshop", "code", str(f, "code", 40).toLowerCase());
    try {
      await submitWorkshopReport(prisma, {
        orderCode: str(f, "code", 40),
        cnpj: str(f, "cnpj", 20),
        token: str(f, "token", 20),
        performed: str(f, "performed", 2000),
        parts: str(f, "parts", 2000),
        amount: num(f, "amount"),
        reading: num(f, "reading"),
      });
    } catch (error) {
      if (error instanceof WorkshopReportError) throw new UserError(error.message);
      throw error;
    }
    return "Serviço registrado. O setor de frota vai conferir a execução.";
  });
}
