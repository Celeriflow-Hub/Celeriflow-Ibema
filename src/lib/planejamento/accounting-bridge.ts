import "server-only";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { postAccountingEventInTransaction } from "@/lib/financeiro";
import { AccessError, canPerformModuleOperation, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { assertPlanningLegalAuthority, planningInstrumentWhere, type PlanningContext } from "./access";

type Tx = Prisma.TransactionClient;
const object = (value: Prisma.JsonValue | null): Prisma.JsonObject => value && typeof value === "object" && !Array.isArray(value) ? value : {};
export const planningAccountingEvents = ["PLANNING_BUDGET_OPENING_REVENUE", "PLANNING_BUDGET_OPENING_EXPENSE", "PLANNING_REVENUE_INCREASE", "PLANNING_REVENUE_DECREASE", "PLANNING_EXPENSE_INCREASE", "PLANNING_EXPENSE_DECREASE"] as const;

async function lockAuthorizedPiece(tx: Tx, context: PlanningContext, instrumentId: string, requireWholeScope = true) {
  await tx.planningInstrument.findFirstOrThrow({ where: { id: instrumentId, ...planningInstrumentWhere(context) }, select: { id: true } });
  await tx.$queryRaw`SELECT id FROM "PlanningInstrument" WHERE id = ${instrumentId} FOR UPDATE`;
  if (requireWholeScope && !isSystemAdministrator(context.user) && await tx.planningBudgetLine.count({ where: { instrumentId, budgetUnitId: { notIn: context.user.allowedBudgetUnitIds } } })) throw new AccessError("A conexão exige acesso a todas as unidades da peça.", 403);
}

export async function configurePlanningInternalAccounting(context: PlanningContext, raw: unknown) {
  assertPlanningLegalAuthority(context);
  if (!isSystemAdministrator(context.user) && !canPerformModuleOperation(context.user, "FINANCEIRO", "update")) throw new AccessError("A configuração contábil exige autorização financeira.", 403);
  const input = z.object({ instrumentId: z.string().min(1), enabled: z.enum(["true", "false"]), reason: z.string().trim().min(3) }).parse(raw);
  return context.prisma.$transaction(async (tx) => {
    await lockAuthorizedPiece(tx, context, input.instrumentId);
    const piece = await tx.planningInstrument.findFirstOrThrow({ where: { id: input.instrumentId, ...planningInstrumentWhere(context) }, include: { annualBudgetLaw: true } });
    if (!piece.annualBudgetLaw) throw new Error("A integração contábil exige LOA.");
    if (input.enabled === "false" && object(piece.annualBudgetLaw.metadata).planningInternalExecution === true) throw new Error("A execução conectada exige contabilização ativa.");
    if (input.enabled === "true") {
      const events = await tx.accountingEventCatalog.findMany({ where: { code: { in: [...planningAccountingEvents] }, isActive: true }, include: { rules: { where: { isActive: true } } } });
      if (events.length !== planningAccountingEvents.length || events.some((event) => event.rules.length !== 1 || event.rules[0].isReference && process.env.CELERIFLOW_ACCOUNTING_MODE !== "POC")) throw new Error("Configure uma regra contábil ativa e homologada para cada evento de Planejamento antes de conectar.");
      if (!context.user.employeeId) throw new Error("Vincule o responsável contábil ao cadastro de servidor.");
    }
    await tx.annualBudgetLaw.update({ where: { id: piece.annualBudgetLaw.id }, data: { metadata: { ...object(piece.annualBudgetLaw.metadata), planningInternalAccounting: input.enabled === "true" } } });
    await tx.financialAuditLog.create({ data: { authorUsuarioId: context.user.id, authorEmployeeId: context.user.employeeId, entityType: "PLANNING_INSTRUMENT", entityId: piece.id, action: "PLANNING_ACCOUNTING_CONFIGURATION", payload: input } });
    return piece.id;
  });
}

/** Runs in the legal-effect transaction; missing posting rules roll back all budget effects. */
export async function deliverPlanningAccountingCommand(tx: Tx, context: PlanningContext, commandId: string) {
  const candidate = await tx.planningIntegrationCommand.findUniqueOrThrow({ where: { id: commandId } });
  const payload = z.object({ instrumentId: z.string(), governmentEntityId: z.string() }).passthrough().parse(candidate.payload);
  await lockAuthorizedPiece(tx, context, payload.instrumentId, false);
  await tx.$queryRaw`SELECT id FROM "PlanningIntegrationCommand" WHERE id = ${commandId} FOR UPDATE`;
  const command = await tx.planningIntegrationCommand.findUniqueOrThrow({ where: { id: commandId } });
  const piece = await tx.planningInstrument.findFirstOrThrow({ where: { id: payload.instrumentId, governmentEntityId: payload.governmentEntityId, ...planningInstrumentWhere(context) }, include: { annualBudgetLaw: { include: { financialYear: true } } } });
  if (!piece.annualBudgetLaw) return command.id;
  if (object(piece.annualBudgetLaw.metadata).planningInternalAccounting !== true) return command.id;
  if (!isSystemAdministrator(context.user) && !canPerformModuleOperation(context.user, "FINANCEIRO", "create")) throw new AccessError("A efetivação integrada exige autorização de postagem financeira.", 403);
  if (!context.user.employeeId) throw new Error("A contabilização exige servidor responsável.");
  if (command.status === "DELIVERED") return command.id;
  const year = piece.annualBudgetLaw.financialYear;
  const actor = { usuarioId: context.user.id, employeeId: context.user.employeeId };
  const post = async (eventCode: string, value: Prisma.Decimal, sourceId: string, date: Date, key: string) => {
    if (value.isZero()) return;
    if (date < year.startDate) date = year.startDate;
    await postAccountingEventInTransaction(tx, actor, { financialYearId: year.id, date, eventCode, value: value.abs(), history: `${piece.title} · ${eventCode} · ${sourceId}`, sourceModule: "PLANEJAMENTO", sourceType: "PLANNING_BUDGET", sourceId, idempotencyKey: key });
  };
  if (command.type === "ACCOUNTING_BUDGET_CHANGE") {
    const movement = await tx.planningLineMovement.findUniqueOrThrow({ where: { id: command.sourceId }, include: { line: true } });
    if (movement.line.instrumentId !== piece.id) throw new Error("Origem contábil fora da peça.");
    if (!isSystemAdministrator(context.user) && !context.user.allowedBudgetUnitIds.includes(movement.line.budgetUnitId)) throw new AccessError("Origem contábil fora das unidades autorizadas.", 403);
    if (movement.line.kind !== "TRANSFER") await post(`PLANNING_${movement.line.kind}_${movement.value.greaterThan(0) ? "INCREASE" : "DECREASE"}`, movement.value, movement.id, movement.effectiveAt, command.idempotencyKey);
  } else if (command.type === "BUDGET_OPENING") {
    const lines = await tx.planningBudgetLine.findMany({ where: { instrumentId: piece.id, kind: { in: ["REVENUE", "EXPENSE"] } }, orderBy: [{ year: "asc" }, { code: "asc" }, { id: "asc" }] });
    const reconciled = z.array(z.string()).parse(payload.reconciledAppropriationIds ?? []);
    for (const line of lines) {
      if (!isSystemAdministrator(context.user) && !context.user.allowedBudgetUnitIds.includes(line.budgetUnitId)) throw new AccessError("A abertura exige acesso a todas as unidades da peça.", 403);
      const key = `${command.idempotencyKey}:${line.id}`;
      if (line.appropriationId && reconciled.includes(line.appropriationId)) {
        const prior = await tx.accountingTransaction.findFirst({ where: { financialYearId: year.id, sourceId: line.appropriationId, sourceType: "BUDGET_APPROPRIATION_OPENING", status: "POSTADO" }, include: { entries: true } });
        const debit = prior?.entries.filter((entry) => entry.type === "Débito").reduce((sum, entry) => sum.plus(entry.valueDecimal ?? 0), new Prisma.Decimal(0));
        if (!prior || !debit?.equals(line.originalValue)) throw new Error(`Reconcilie a abertura contábil original da dotação ${line.code}; os valores não serão lançados novamente.`);
      } else await post(`PLANNING_BUDGET_OPENING_${line.kind}`, line.originalValue, line.id, year.startDate, key);
    }
  } else throw new Error("Comando contábil não reconhecido.");
  await tx.planningIntegrationCommand.update({ where: { id: command.id }, data: { status: "DELIVERED" } });
  await tx.financialAuditLog.create({ data: { authorUsuarioId: context.user.id, authorEmployeeId: context.user.employeeId, financialYearId: year.id, entityType: "PLANNING_INTEGRATION", entityId: command.id, action: "PLANNING_ACCOUNTING_DELIVERED", payload: { instrumentId: piece.id, commandType: command.type } } });
  return command.id;
}

export async function synchronizePlanningAccounting(context: PlanningContext, raw: unknown) {
  assertPlanningLegalAuthority(context);
  const input = z.object({ instrumentId: z.string().min(1) }).parse(raw);
  return context.prisma.$transaction(async (tx) => {
    await lockAuthorizedPiece(tx, context, input.instrumentId);
    const piece = await tx.planningInstrument.findFirstOrThrow({ where: { id: input.instrumentId, ...planningInstrumentWhere(context) }, include: { annualBudgetLaw: true } });
    if (!piece.annualBudgetLaw || object(piece.annualBudgetLaw.metadata).planningInternalAccounting !== true) throw new Error("Conecte e configure a contabilização desta LOA antes de sincronizar.");
    const commands = await tx.planningIntegrationCommand.findMany({ where: { status: "PENDING", payload: { path: ["instrumentId"], equals: piece.id } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
    for (const command of [...commands].sort((a, b) => Number(b.type === "BUDGET_OPENING") - Number(a.type === "BUDGET_OPENING"))) await deliverPlanningAccountingCommand(tx, context, command.id);
    return piece.id;
  }, { timeout: 60000 });
}

export async function configurePlanningInternalExecution(context: PlanningContext, raw: unknown) {
  assertPlanningLegalAuthority(context);
  if (!isSystemAdministrator(context.user) && !canPerformModuleOperation(context.user, "FINANCEIRO", "update")) throw new AccessError("A conexão de execução exige autorização financeira.", 403);
  const input = z.object({ instrumentId: z.string().min(1), enabled: z.enum(["true", "false"]), reason: z.string().trim().min(3) }).parse(raw);
  return context.prisma.$transaction(async (tx) => {
    await lockAuthorizedPiece(tx, context, input.instrumentId);
    const piece = await tx.planningInstrument.findFirstOrThrow({ where: { id: input.instrumentId, ...planningInstrumentWhere(context) }, include: { annualBudgetLaw: true, lines: { where: { kind: "EXPENSE" }, include: { quotas: true, appropriation: true } } } });
    if (!piece.annualBudgetLaw || !piece.implantedAt) throw new Error("A conexão de execução exige LOA implantada.");
    if (input.enabled === "true") {
      if (object(piece.annualBudgetLaw.metadata).planningInternalAccounting !== true || await tx.planningIntegrationCommand.count({ where: { status: "PENDING", payload: { path: ["instrumentId"], equals: piece.id } } })) throw new Error("Conclua a contabilização da implantação e alterações antes de conectar a execução.");
      if (piece.lines.some((line) => line.quotas.length !== 12 || !line.appropriationId)) throw new Error("Todas as dotações devem possuir vínculo implantado e doze meses de programação.");
      if (object(piece.annualBudgetLaw.metadata).planningInternalExecution !== true && piece.lines.some((line) => (line.appropriation?.committedValueDecimal ?? new Prisma.Decimal(0)).greaterThan(0) || line.quotas.some((quota) => quota.consumed.greaterThan(0) || quota.disbursementPaid.greaterThan(0)))) throw new Error("Reconcilie a execução anterior antes de conectar; realizados manuais não serão somados novamente.");
    } else if (object(piece.annualBudgetLaw.metadata).planningInternalExecution === true && await tx.planningQuotaEvent.count({ where: { quota: { line: { instrumentId: piece.id } }, submissionKey: { startsWith: "finance:" } } })) throw new Error("A execução conectada possui histórico financeiro; não é permitido desativar seu controle.");
    await tx.annualBudgetLaw.update({ where: { id: piece.annualBudgetLaw.id }, data: { metadata: { ...object(piece.annualBudgetLaw.metadata), planningInternalExecution: input.enabled === "true" } } });
    await tx.financialAuditLog.create({ data: { authorUsuarioId: context.user.id, entityType: "PLANNING_INSTRUMENT", entityId: piece.id, action: "PLANNING_EXECUTION_CONFIGURATION", payload: input } });
    return piece.id;
  });
}
