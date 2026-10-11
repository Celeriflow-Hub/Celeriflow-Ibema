import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import { enqueueHrIntegration } from "./workforce-service";
import { resolveContractRevision } from "./contract-timeline";

const decimal = z.string().regex(/^\d{1,12}(?:\.\d{1,6})?$/);
const json = (value: unknown): Prisma.InputJsonValue => JSON.parse(JSON.stringify(value));
export const travelAllowancePolicySchema = z.object({ origin: z.literal("DIARIAS_POC"), rates: z.object({ DF: decimal, CAPITAL: decimal, INTERIOR: decimal, INTERNACIONAL: decimal }).strict(), minimumDistanceKm: z.number().nonnegative(), rounding: z.enum(["DOWN", "HALF_UP"]), legalReference: z.string().min(3), estimated: z.literal(true) }).strict();
const inputSchema = z.object({ requestKey: z.string().min(1).max(120), contractId: z.string().min(1), ruleId: z.string().min(1), destination: z.string().trim().min(3).max(300), destinationType: z.enum(["DF", "CAPITAL", "INTERIOR", "INTERNACIONAL"]), departureAt: z.iso.datetime({ offset: true }), returnAt: z.iso.datetime({ offset: true }), distanceKm: decimal, overnight: z.enum(["SIM", "NAO"]), exchangeRate: decimal.default("1"), purpose: z.string().trim().min(10).max(3000), vehiclePlate: z.string().trim().max(20).default("") }).strict();

export function calculateTravelAllowance(rawPolicy: unknown, raw: unknown) {
  const policy = travelAllowancePolicySchema.parse(rawPolicy), input = inputSchema.parse(raw);
  const hours = new Prisma.Decimal(new Date(input.returnAt).getTime() - new Date(input.departureAt).getTime()).div(3600000);
  if (hours.lte(0) || hours.gt(24 * 365)) throw new Error("Período de viagem inválido ou superior a um ano.");
  const distanceEligible = new Prisma.Decimal(input.distanceKm).gt(policy.minimumDistanceKm);
  const full = hours.div(24).floor(), remainder = hours.sub(full.mul(24));
  const partial = remainder.gt(12) && input.overnight === "SIM" ? new Prisma.Decimal(1) : remainder.gt(8) ? new Prisma.Decimal("0.5") : new Prisma.Decimal(0);
  const quantity = distanceEligible ? full.add(partial) : new Prisma.Decimal(0);
  const unitValue = new Prisma.Decimal(policy.rates[input.destinationType]);
  const exchange = input.destinationType === "INTERNACIONAL" ? new Prisma.Decimal(input.exchangeRate) : new Prisma.Decimal(1);
  if (exchange.lte(0)) throw new Error("Câmbio deve ser positivo.");
  const mode = policy.rounding === "DOWN" ? Prisma.Decimal.ROUND_DOWN : Prisma.Decimal.ROUND_HALF_UP;
  return { hours: hours.toFixed(4), fullDays: full.toString(), remainderHours: remainder.toFixed(4), distanceEligible, quantity: quantity.toString(), unitValue: unitValue.toFixed(2), currency: input.destinationType === "INTERNACIONAL" ? "USD" : "BRL", exchangeRate: exchange.toString(), originalAmount: unitValue.mul(quantity).toDecimalPlaces(2, mode).toFixed(2), amountBRL: unitValue.mul(quantity).mul(exchange).toDecimalPlaces(2, mode).toFixed(2), rounding: policy.rounding, estimated: true };
}

export async function requestTravelAllowance(db: PrismaClient, actorId: string, raw: unknown) {
  const input = inputSchema.parse(raw);
  return db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`RH:DIARIA:${input.requestKey}`}))`;
    const previous = await tx.hrPortalRequest.findUnique({ where: { requestKey: `DIARIA_POC:${input.requestKey}` } });
    if (previous) {
      const stored = (previous.payload as { input: typeof input }).input;
      if (Object.entries(input).some(([key, value]) => stored[key as keyof typeof input] !== value)) throw new Error("Solicitação repetida com dados diferentes.");
      return previous;
    }
    const rule = await tx.hrPayrollRule.findUniqueOrThrow({ where: { id: input.ruleId }, include: { ruleSet: true } });
    const policy = travelAllowancePolicySchema.parse(rule.value);
    const start = new Date(input.departureAt), end = new Date(input.returnAt);
    const stored = await tx.hrEmploymentContract.findUniqueOrThrow({ where: { id: input.contractId }, include: { revisions: true, employee: { include: { person: true } } } });
    const contract = resolveContractRevision(stored, stored.revisions, { start, end: start }).contract;
    const regime = await tx.hrEmploymentRegime.findUniqueOrThrow({ where: { id: contract.regimeId } });
    if (!rule.isActive || !rule.ruleSet.isDemo || rule.ruleSet.scope !== "DEMONSTRACAO" || rule.ruleSet.status !== "ATIVA" || !regime.isActive || regime.ruleSetId !== rule.ruleSetId || rule.ruleSet.effectiveFrom > start || (rule.ruleSet.effectiveUntil && rule.ruleSet.effectiveUntil < end) || !stored.employee.isActive || !stored.employee.personId || contract.status !== "ATIVO" || start < contract.admittedAt || (contract.endsAt && end > contract.endsAt)) throw new Error("Diária POC exige contrato e política demonstrativa vigentes em toda a viagem.");
    const assessment = calculateTravelAllowance(policy, input);
    const request = await tx.hrPortalRequest.create({ data: { requestKey: `DIARIA_POC:${input.requestKey}`, employeeId: stored.employeeId, actorId, kind: "DIARIA_POC", payload: json({ input, policy, assessment, contract, scope: "DEMONSTRACAO" }) } });
    await enqueueHrIntegration(tx, { sourceKey: `DIARIA:SOLICITACAO:${request.id}`, domain: "AUDITORIA", environment: "DEMONSTRACAO", eventType: "DIARIA_SOLICITADA", payload: { requestId: request.id, actorId, assessment } });
    return request;
  }, { timeout: 60000 });
}

export async function decideTravelAllowance(db: PrismaClient, actorId: string, raw: unknown) {
  const input = z.object({ requestId: z.string().min(1), status: z.enum(["DEFERIDA", "INDEFERIDA"]), decision: z.string().trim().min(10).max(3000), authorizationNumber: z.string().trim().min(1).max(100) }).strict().parse(raw);
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "HrPortalRequest" WHERE id=${input.requestId} FOR UPDATE`;
    const request = await tx.hrPortalRequest.findUniqueOrThrow({ where: { id: input.requestId } });
    if (request.kind !== "DIARIA_POC") throw new Error("Selecione uma diária demonstrativa.");
    const key = `DIARIA:DECISAO:${request.id}`;
    const previous = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey: key } });
    if (previous) {
      const stored = (previous.payload as { input: typeof input }).input;
      if (Object.entries(input).some(([key, value]) => stored[key as keyof typeof input] !== value)) throw new Error("Diária já decidida com outra autorização/fundamento.");
      return request;
    }
    if (request.status !== "EM_ANALISE") throw new Error("Diária já decidida.");
    const updated = await tx.hrPortalRequest.update({ where: { id: request.id }, data: { status: input.status, decision: input.decision, decidedBy: actorId, decidedAt: new Date() } });
    await enqueueHrIntegration(tx, { sourceKey: key, domain: "AUDITORIA", environment: "DEMONSTRACAO", eventType: "DIARIA_DECIDIDA", payload: { input, actorId, requestPayload: request.payload } });
    return updated;
  });
}

export async function accountForTravelAllowance(db: PrismaClient, actorId: string, raw: unknown) {
  const input = z.object({ requestId: z.string().min(1), activities: z.string().trim().min(10).max(4000), returnedAmount: decimal, reportDate: z.iso.date() }).strict().parse(raw);
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "HrPortalRequest" WHERE id=${input.requestId} FOR UPDATE`;
    const request = await tx.hrPortalRequest.findUniqueOrThrow({ where: { id: input.requestId } });
    if (request.kind !== "DIARIA_POC" || request.status !== "DEFERIDA") throw new Error("Prestação exige diária POC autorizada.");
    const memory = request.payload as { input: z.infer<typeof inputSchema>; assessment: ReturnType<typeof calculateTravelAllowance> };
    if (input.reportDate < new Date(memory.input.returnAt).toISOString().slice(0, 10) || new Prisma.Decimal(input.returnedAmount).gt(memory.assessment.amountBRL)) throw new Error("Data/valor de restituição incompatíveis com a viagem.");
    const sourceKey = `DIARIA:PRESTACAO:${request.id}`;
    const previous = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey } });
    if (previous) {
      const stored = (previous.payload as { input: typeof input }).input;
      if (Object.entries(input).some(([key, value]) => stored[key as keyof typeof input] !== value)) throw new Error("Prestação já registrada com outros valores/atividades.");
      return previous;
    }
    return enqueueHrIntegration(tx, { sourceKey, domain: "AUDITORIA", environment: "DEMONSTRACAO", eventType: "DIARIA_PRESTACAO_REGISTRADA", payload: { input, actorId, spentAmount: new Prisma.Decimal(memory.assessment.amountBRL).sub(input.returnedAmount).toFixed(2), financialSettlement: false } });
  });
}

export async function buildTravelAllowanceDocument(db: PrismaClient, requestId: string, type: "SOLICITACAO" | "AUTORIZACAO" | "PRESTACAO") {
  const request = await db.hrPortalRequest.findUniqueOrThrow({ where: { id: requestId } });
  if (request.kind !== "DIARIA_POC") throw new Error("Documento disponível para diárias POC.");
  const payload = request.payload as { input: z.infer<typeof inputSchema>; policy: z.infer<typeof travelAllowancePolicySchema>; assessment: ReturnType<typeof calculateTravelAllowance>; contract: { registration: string; employee: { name: string; person: { cpf: string } }; workLocation: string } };
  const rows = [["Servidor", payload.contract.employee.name], ["Matrícula", payload.contract.registration], ["CPF", payload.contract.employee.person.cpf], ["Local", payload.contract.workLocation], ["Destino", payload.input.destination], ["Saída", payload.input.departureAt], ["Retorno", payload.input.returnAt], ["Finalidade", payload.input.purpose], ["Placa", payload.input.vehiclePlate], ["Quantidade", payload.assessment.quantity], ["Unitário / moeda", `${payload.assessment.unitValue} ${payload.assessment.currency}`], ["Total BRL", payload.assessment.amountBRL], ["Situação", request.status], ["Fundamento POC", payload.policy.legalReference]];
  if (type === "AUTORIZACAO") {
    if (request.status !== "DEFERIDA") throw new Error("Autorização exige deferimento da diária.");
    const event = await db.hrIntegrationEvent.findUniqueOrThrow({ where: { sourceKey: `DIARIA:DECISAO:${request.id}` } });
    const decision = (event.payload as { input: { authorizationNumber: string; decision: string } }).input;
    rows.push(["Autorização", decision.authorizationNumber], ["Decisão", decision.decision], ["Responsável ID", request.decidedBy || ""], ["Data da decisão", request.decidedAt?.toISOString() || ""]);
  }
  if (type === "PRESTACAO") {
    const event = await db.hrIntegrationEvent.findUniqueOrThrow({ where: { sourceKey: `DIARIA:PRESTACAO:${request.id}` } });
    const report = event.payload as { input: { activities: string; reportDate: string; returnedAmount: string }; spentAmount: string };
    rows.push(["Atividades", report.input.activities], ["Data da prestação", report.input.reportDate], ["Restituição BRL", report.input.returnedAmount], ["Valor utilizado BRL", report.spentAmount]);
  }
  return { title: `Diárias — ${type} — modelo POC Cartilha Ibema anexos I/II`, headers: ["Campo", "Valor"], rows };
}
