import { Prisma, type HrPortalRequest } from "@prisma/client";
import { z } from "zod";
import { canPerformModuleOperation, isSystemAdministrator, type AppContext } from "@/lib/platform/tenant-context";
import { postAccountingEventInTransaction, postAccountingTransactionInTransaction, type FinanceActor } from "@/lib/financeiro";
import { assertTravelAllowanceAccess } from "./travel-allowance";
import { resolveContractRevision } from "./contract-timeline";
import { enqueueHrIntegration } from "./workforce-service";

const money = z.string().regex(/^\d{1,12}(?:\.\d{1,2})?$/);
const inputSchema = z.object({ requestKey: z.string().trim().min(1).max(120), contractId: z.string().min(1), budgetUnitId: z.string().min(1), amount: money, date: z.iso.date(), reportDueDate: z.iso.date(), purpose: z.string().trim().min(10).max(3000) }).strict();
const memorySchema = z.object({ scope: z.literal("PRODUCAO"), input: inputSchema, assessment: z.object({ amountBRL: money }), contract: z.object({ employee: z.object({ personId: z.string() }) }) });
const actorFor = (context: AppContext) => ({ usuarioId: context.user.id, employeeId: context.user.employeeId, allowedBudgetUnitIds: isSystemAdministrator(context.user) ? undefined : context.user.allowedBudgetUnitIds });

const cycleSchema = z.object({ cycle: z.number().int().nonnegative(), reopenedDate: z.iso.date().optional() });
async function advanceCycle(tx: Prisma.TransactionClient, requestId: string): Promise<z.infer<typeof cycleSchema>> {
  const event = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey: `ADIANTAMENTO:CICLO:${requestId}` } });
  return event ? cycleSchema.parse(event.result) : { cycle: 0 };
}
const cycleKey = (base: string, cycle: number) => cycle ? `${base}:CICLO:${cycle}` : base;

async function controlPosting(tx: Prisma.TransactionClient, context: AppContext, request: HrPortalRequest, eventCode: string, date: Date, reason: string, cycle = 0) {
  assertTravelAllowanceAccess(request.payload, context);
  if (!canPerformModuleOperation(context.user, "FINANCEIRO", "create")) throw new Error("Controle do adiantamento exige criação no Financeiro.");
  const memory = memorySchema.parse(request.payload);
  const binding = await tx.planningEntityUnit.findUniqueOrThrow({ where: { budgetUnitId: memory.input.budgetUnitId } });
  const year = await tx.financialYear.findFirstOrThrow({ where: { governmentEntityId: binding.governmentEntityId, year: date.getUTCFullYear() } });
  const event = await tx.accountingEventCatalog.findUniqueOrThrow({ where: { code: eventCode }, include: { rules: { where: { isActive: true }, include: { debitAccount: true, creditAccount: true } } } });
  if (!event.isActive || event.rules.length !== 1 || event.rules[0].isReference || ![event.rules[0].debitAccount.code, event.rules[0].creditAccount.code].every(code => /^[78]\./.test(code))) throw new Error("Adiantamento exige matriz operacional de contas de controle classes 7/8.");
  return postAccountingEventInTransaction(tx, actorFor(context), { financialYearId: year.id, governmentEntityId: binding.governmentEntityId, budgetUnitId: memory.input.budgetUnitId, date, eventCode, value: memory.assessment.amountBRL, history: reason, sourceModule: "RH", sourceType: "ADVANCE_CONTROL", sourceId: request.id, idempotencyKey: cycleKey(`RH:ADVANCE:${request.id}:${eventCode}`, cycle) });
}

export async function requestMunicipalAdvance(context: AppContext, raw: unknown) {
  if (!canPerformModuleOperation(context.user, "RH", "update")) throw new Error("Solicitação de adiantamento exige autorização RH.");
  const input = inputSchema.parse(raw);
  input.amount = new Prisma.Decimal(input.amount).toFixed(2);
  if (new Prisma.Decimal(input.amount).lte(0) || input.reportDueDate < input.date) throw new Error("Adiantamento exige valor positivo e prazo posterior ou igual à concessão.");
  return context.prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`RH:ADVANCE:REQUEST:${input.requestKey}`}))`;
    assertTravelAllowanceAccess({ scope: "PRODUCAO", input }, context);
    const previous = await tx.hrPortalRequest.findUnique({ where: { requestKey: `ADIANTAMENTO:${input.requestKey}` } });
    if (previous) {
      assertTravelAllowanceAccess(previous.payload, context);
      if (JSON.stringify(memorySchema.parse(previous.payload).input) !== JSON.stringify(input)) throw new Error("Adiantamento já solicitado com outros dados.");
      return previous;
    }
    const date = new Date(`${input.date}T00:00:00Z`);
    const stored = await tx.hrEmploymentContract.findUniqueOrThrow({ where: { id: input.contractId }, include: { revisions: true, employee: true } });
    const contract = resolveContractRevision(stored, stored.revisions, { start: date, end: date }).contract;
    const regime = await tx.hrEmploymentRegime.findUniqueOrThrow({ where: { id: contract.regimeId }, include: { ruleSet: true } });
    const binding = await tx.planningEntityUnit.findUniqueOrThrow({ where: { budgetUnitId: input.budgetUnitId } });
    const center = contract.costCenterId ? await tx.costCenter.findUniqueOrThrow({ where: { id: contract.costCenterId } }) : null;
    if (!contract.employee.personId || !contract.employee.isActive || contract.status !== "ATIVO" || date < contract.admittedAt || (contract.endsAt && date > contract.endsAt) || !regime.isActive || regime.ruleSet.isDemo || regime.ruleSet.scope !== "PRODUCAO" || regime.ruleSet.status !== "ATIVA" || regime.ruleSet.effectiveFrom > date || (regime.ruleSet.effectiveUntil && regime.ruleSet.effectiveUntil < date) || !center?.isActive || center.governmentEntityId !== binding.governmentEntityId) throw new Error("Adiantamento exige vínculo municipal vigente e centro do mesmo ente da UG.");
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`RH:ADVANCE:HOLDER:${binding.governmentEntityId}:${contract.employee.personId}`}))`;
    const units = await tx.planningEntityUnit.findMany({ where: { governmentEntityId: binding.governmentEntityId }, select: { budgetUnitId: true } });
    const pending = await tx.hrPortalRequest.findMany({ where: { kind: "ADIANTAMENTO", status: { notIn: ["INDEFERIDA", "PRESTACAO_APROVADA", "CANCELADA"] }, payload: { path: ["contract", "employee", "personId"], equals: contract.employee.personId } } });
    if (pending.some(row => units.some(unit => unit.budgetUnitId === memorySchema.parse(row.payload).input.budgetUnitId))) throw new Error("Titular possui adiantamento pendente de prestação/aprovação neste ente; nova concessão bloqueada.");
    const payload = JSON.parse(JSON.stringify({ scope: "PRODUCAO", input, assessment: { amountBRL: input.amount }, contract, parameterOrigin: "OWNER_ESTIMATE", policy: { legalReference: "Aurora das Veredas — procedimento inicial estimado: roteiro publicado, concessão em contas de controle e prestação sujeita à revisão independente." } })) as Prisma.InputJsonValue;
    const request = await tx.hrPortalRequest.create({ data: { requestKey: `ADIANTAMENTO:${input.requestKey}`, kind: "ADIANTAMENTO", employeeId: contract.employeeId, actorId: context.user.id, payload } });
    await enqueueHrIntegration(tx, { sourceKey: `ADIANTAMENTO:SOLICITACAO:${request.id}`, domain: "AUDITORIA", environment: "PRODUCAO", eventType: "ADIANTAMENTO_SOLICITADO", payload: { requestId: request.id, input, actorId: context.user.id } });
    return request;
  }, { timeout: 60000 });
}

export async function recordAdvanceConcession(tx: Prisma.TransactionClient, context: AppContext, request: HrPortalRequest, commitmentId: string, date: Date) {
  if (request.kind !== "ADIANTAMENTO") return;
  const transaction = await controlPosting(tx, context, request, "ADVANCE_GRANTED", date, `Concessão do adiantamento ${request.id}, empenho ${commitmentId}`);
  const event = await enqueueHrIntegration(tx, { sourceKey: `ADIANTAMENTO:CONCESSAO:${request.id}`, domain: "FINANCEIRO", environment: "PRODUCAO", eventType: "ADIANTAMENTO_CONCEDIDO", payload: { requestId: request.id, commitmentId, transactionId: transaction.id } });
  await tx.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "CONCLUIDA" } });
}

export async function submitAdvanceReport(context: AppContext, raw: unknown) {
  const schema = z.object({ requestId: z.string().min(1), date: z.iso.date(), documentId: z.string().min(1), activities: z.string().trim().min(10).max(4000), spentAmount: money }).strict();
  const input = schema.parse(raw);
  input.spentAmount = new Prisma.Decimal(input.spentAmount).toFixed(2);
  return context.prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "HrPortalRequest" WHERE id=${input.requestId} FOR UPDATE`;
    const request = await tx.hrPortalRequest.findUniqueOrThrow({ where: { id: input.requestId } });
    assertTravelAllowanceAccess(request.payload, context);
    const memory = memorySchema.parse(request.payload);
    const currentCycle = await advanceCycle(tx, request.id);
    if (currentCycle.reopenedDate && input.date < currentCycle.reopenedDate) throw new Error("Reapresentação não pode anteceder a data de reabertura da prestação.");
    if (request.kind !== "ADIANTAMENTO" || !["DEFERIDA", "PRESTACAO_EM_ANALISE", "PRESTACAO_APROVADA", "PRESTACAO_IMPUGNADA"].includes(request.status) || input.date < memory.input.date || !new Prisma.Decimal(input.spentAmount).eq(memory.assessment.amountBRL)) throw new Error("Prestação exige adiantamento concedido e despesas conciliadas ao valor integral; restituições precisam ser regularizadas pela origem financeira.");
    const document = await tx.document.findUniqueOrThrow({ where: { id: input.documentId } });
    if (document.status !== "Válido") throw new Error("Prestação exige comprovantes GED válidos.");
    const payments = await tx.payment.findMany({ where: { status: "Paga", commitment: { reservation: { expense: { sourceModule: "RH", sourceType: "ADVANCE_ALLOWANCE", sourceId: request.id } } } }, include: { commitment: { include: { appropriation: true } } }, orderBy: { id: "asc" } });
    for (const payment of payments) {
      await tx.$queryRaw`SELECT id FROM "Payment" WHERE id=${payment.id} FOR UPDATE`;
      const current = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
      if (current.status !== "Paga" || payment.commitment.appropriation.budgetUnitId !== memory.input.budgetUnitId || payment.date.toISOString().slice(0, 10) > input.date) throw new Error("Pagamento do adiantamento não conciliado com UG/data da prestação.");
    }
    if (!payments.length || !payments.reduce((sum, payment) => sum.plus(payment.valueDecimal ?? 0), new Prisma.Decimal(0)).eq(memory.assessment.amountBRL)) throw new Error("Prestação exige pagamento integral pela execução financeira nativa.");
    const key = cycleKey(`ADIANTAMENTO:PRESTACAO:${request.id}`, currentCycle.cycle);
    const previous = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey: key } });
    if (previous) {
      if (JSON.stringify(schema.parse((previous.payload as { input: unknown }).input)) !== JSON.stringify(input)) throw new Error("Prestação já registrada com outros documentos ou valores.");
      return previous;
    }
    const transaction = await controlPosting(tx, context, request, "ADVANCE_REPORTED", new Date(`${input.date}T00:00:00Z`), `Prestação do adiantamento ${request.id}`, currentCycle.cycle);
    await tx.hrPortalRequest.update({ where: { id: request.id }, data: { status: "PRESTACAO_EM_ANALISE" } });
    const event = await enqueueHrIntegration(tx, { sourceKey: key, domain: "FINANCEIRO", environment: "PRODUCAO", eventType: "ADIANTAMENTO_PRESTACAO_APRESENTADA", payload: { input, actorId: context.user.id, paymentIds: payments.map(payment => payment.id), transactionId: transaction.id } });
    await tx.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "CONCLUIDA" } });
    return event;
  }, { timeout: 60000 });
}

export async function reviewAdvanceReport(context: AppContext, raw: unknown) {
  const schema = z.object({ requestId: z.string().min(1), date: z.iso.date(), decision: z.enum(["APROVAR", "IMPUGNAR"]), reason: z.string().trim().min(10).max(3000), documentId: z.string().min(1) }).strict();
  const input = schema.parse(raw);
  return context.prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "HrPortalRequest" WHERE id=${input.requestId} FOR UPDATE`;
    const request = await tx.hrPortalRequest.findUniqueOrThrow({ where: { id: input.requestId } });
    assertTravelAllowanceAccess(request.payload, context);
    const currentCycle = await advanceCycle(tx, request.id);
    const report = await tx.hrIntegrationEvent.findUniqueOrThrow({ where: { sourceKey: cycleKey(`ADIANTAMENTO:PRESTACAO:${request.id}`, currentCycle.cycle) } });
    const memory = z.object({ actorId: z.string(), input: z.object({ date: z.string() }), paymentIds: z.array(z.string()).min(1) }).parse(report.payload);
    if (memory.actorId === context.user.id || request.actorId === context.user.id || input.date < memory.input.date) throw new Error("Prestação exige revisão independente do solicitante/apresentante e data compatível.");
    if (!canPerformModuleOperation(context.user, "FINANCEIRO", "update")) throw new Error("Revisão exige alteração no Financeiro.");
    const requestMemory = memorySchema.parse(request.payload);
    let paid = new Prisma.Decimal(0);
    for (const id of [...memory.paymentIds].sort()) {
      await tx.$queryRaw`SELECT id FROM "Payment" WHERE id=${id} FOR UPDATE`;
      const payment = await tx.payment.findUniqueOrThrow({ where: { id }, include: { commitment: { include: { appropriation: true, reservation: { include: { expense: true } } } } } });
      const expense = payment.commitment.reservation?.expense;
      if (payment.status !== "Paga" || payment.commitment.appropriation.budgetUnitId !== requestMemory.input.budgetUnitId || expense?.sourceModule !== "RH" || expense.sourceType !== "ADVANCE_ALLOWANCE" || expense.sourceId !== request.id) throw new Error("Pagamento da prestação foi estornado ou diverge da origem; regularize antes da revisão.");
      paid = paid.plus(payment.valueDecimal ?? 0);
    }
    if (!paid.eq(requestMemory.assessment.amountBRL)) throw new Error("Pagamento da prestação não corresponde ao valor concedido.");
    const key = cycleKey(`ADIANTAMENTO:REVISAO:${request.id}`, currentCycle.cycle);
    const previous = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey: key } });
    if (previous) {
      if (JSON.stringify(schema.parse((previous.payload as { input: unknown }).input)) !== JSON.stringify(input)) throw new Error("Prestação já revisada com outra decisão ou documento.");
      return previous;
    }
    if (request.kind !== "ADIANTAMENTO" || request.status !== "PRESTACAO_EM_ANALISE") throw new Error("Selecione uma prestação em análise.");
    const document = await tx.document.findUniqueOrThrow({ where: { id: input.documentId } });
    if (document.status !== "Válido") throw new Error("Parecer da revisão exige GED válido.");
    const transaction = await controlPosting(tx, context, request, input.decision === "APROVAR" ? "ADVANCE_APPROVED" : "ADVANCE_DISALLOWED", new Date(`${input.date}T00:00:00Z`), input.reason, currentCycle.cycle);
    await tx.hrPortalRequest.update({ where: { id: request.id }, data: { status: input.decision === "APROVAR" ? "PRESTACAO_APROVADA" : "PRESTACAO_IMPUGNADA" } });
    const event = await enqueueHrIntegration(tx, { sourceKey: key, domain: "FINANCEIRO", environment: "PRODUCAO", eventType: "ADIANTAMENTO_PRESTACAO_REVISADA", payload: { input, actorId: context.user.id, transactionId: transaction.id, reportEventId: report.id } });
    await tx.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "CONCLUIDA" } });
    return event;
  }, { timeout: 60000 });
}

/** Payment reversal invalidates report control stages atomically without deleting evidence. */
export async function reverseAdvancePaymentControl(tx: Prisma.TransactionClient, actor: FinanceActor, paymentId: string, reason: string) {
  const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { commitment: { include: { reservation: { include: { expense: true } } } } } });
  const expense = payment.commitment.reservation?.expense;
  if (expense?.sourceModule !== "RH" || expense.sourceType !== "ADVANCE_ALLOWANCE" || !expense.sourceId) return;
  await tx.$queryRaw`SELECT id FROM "HrPortalRequest" WHERE id=${expense.sourceId} FOR UPDATE`;
  const request = await tx.hrPortalRequest.findUniqueOrThrow({ where: { id: expense.sourceId } });
  const memory = memorySchema.parse(request.payload);
  if (actor.allowedBudgetUnitIds && !actor.allowedBudgetUnitIds.includes(memory.input.budgetUnitId)) throw new Error("Estorno do adiantamento exige UG autorizada.");
  const date = new Date();
  const binding = await tx.planningEntityUnit.findUniqueOrThrow({ where: { budgetUnitId: memory.input.budgetUnitId } });
  const year = await tx.financialYear.findFirstOrThrow({ where: { governmentEntityId: binding.governmentEntityId, year: date.getUTCFullYear() } });
  const currentCycle = await advanceCycle(tx, request.id);
  for (const sourceKey of [cycleKey(`ADIANTAMENTO:REVISAO:${request.id}`, currentCycle.cycle), cycleKey(`ADIANTAMENTO:PRESTACAO:${request.id}`, currentCycle.cycle)]) {
    const event = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey } });
    if (!event || event.status === "ESTORNADA") continue;
    const id = z.object({ transactionId: z.string() }).parse(event.payload).transactionId;
    const original = await tx.accountingTransaction.findUniqueOrThrow({ where: { id }, include: { entries: true } });
    await postAccountingTransactionInTransaction(tx, actor, { financialYearId: year.id, governmentEntityId: binding.governmentEntityId, budgetUnitId: memory.input.budgetUnitId, date, history: `Estorno da prestação do adiantamento: ${reason}`, sourceModule: "RH", sourceType: "ADVANCE_CONTROL_REVERSAL", sourceId: request.id, eventType: "ADVANCE_PAYMENT_REVERSED", idempotencyKey: `${sourceKey}:PAYMENT_REVERSAL:${payment.id}`, reversalOfId: original.id, lines: original.entries.map(entry => ({ accountId: entry.accountId, type: entry.type === "Débito" ? "Crédito" : "Débito", value: entry.valueDecimal! })) });
    await tx.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "ESTORNADA" } });
  }
  await tx.hrPortalRequest.update({ where: { id: request.id }, data: { status: "REGULARIZACAO_PENDENTE" } });
  await enqueueHrIntegration(tx, { sourceKey: `ADIANTAMENTO:ESTORNO_PAGAMENTO:${payment.id}`, domain: "FINANCEIRO", environment: "PRODUCAO", eventType: "ADIANTAMENTO_PAGAMENTO_ESTORNADO", payload: { requestId: request.id, paymentId, reason, actorId: actor.usuarioId } });
}

/** Native cancellation gates have already verified settlements and payments. */
export async function reverseAdvanceCommitmentControl(tx: Prisma.TransactionClient, actor: FinanceActor, commitmentId: string, date: Date, reason: string) {
  const commitment = await tx.commitment.findUniqueOrThrow({ where: { id: commitmentId }, include: { reservation: { include: { expense: true } } } });
  const expense = commitment.reservation?.expense;
  if (expense?.sourceModule !== "RH" || expense.sourceType !== "ADVANCE_ALLOWANCE" || !expense.sourceId) return;
  if (commitment.status !== "Anulado") throw new Error("Estorno da concessão exige empenho anulado.");
  await tx.$queryRaw`SELECT id FROM "HrPortalRequest" WHERE id=${expense.sourceId} FOR UPDATE`;
  const request = await tx.hrPortalRequest.findUniqueOrThrow({ where: { id: expense.sourceId } });
  const memory = memorySchema.parse(request.payload);
  const event = await tx.hrIntegrationEvent.findUniqueOrThrow({ where: { sourceKey: `ADIANTAMENTO:CONCESSAO:${request.id}` } });
  if (event.status === "ESTORNADA") return;
  const currentCycle = await advanceCycle(tx, request.id);
  if (await tx.hrIntegrationEvent.count({ where: { sourceKey: { in: [cycleKey(`ADIANTAMENTO:REVISAO:${request.id}`, currentCycle.cycle), cycleKey(`ADIANTAMENTO:PRESTACAO:${request.id}`, currentCycle.cycle)] }, status: "CONCLUIDA" } })) throw new Error("Prestação ativa exige regularização do pagamento antes de anular concessão.");
  const source = z.object({ transactionId: z.string(), commitmentId: z.literal(commitmentId) }).parse(event.payload);
  const original = await tx.accountingTransaction.findUniqueOrThrow({ where: { id: source.transactionId }, include: { entries: true } });
  const binding = await tx.planningEntityUnit.findUniqueOrThrow({ where: { budgetUnitId: memory.input.budgetUnitId } });
  const year = await tx.financialYear.findFirstOrThrow({ where: { governmentEntityId: binding.governmentEntityId, year: date.getUTCFullYear() } });
  await postAccountingTransactionInTransaction(tx, actor, { financialYearId: year.id, governmentEntityId: binding.governmentEntityId, budgetUnitId: memory.input.budgetUnitId, date, history: `Anulação da concessão de adiantamento: ${reason}`, sourceModule: "RH", sourceType: "ADVANCE_CONTROL_REVERSAL", sourceId: request.id, eventType: "ADVANCE_CONCESSION_REVERSED", idempotencyKey: `${event.sourceKey}:REVERSE`, reversalOfId: original.id, lines: original.entries.map(entry => ({ accountId: entry.accountId, type: entry.type === "Débito" ? "Crédito" : "Débito", value: entry.valueDecimal! })) });
  await tx.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "ESTORNADA" } });
  await tx.hrPortalRequest.update({ where: { id: request.id }, data: { status: "CANCELADA" } });
}

export async function reopenAdvanceReport(context: AppContext, raw: unknown) {
  const schema = z.object({ requestId: z.string().min(1), requestKey: z.string().trim().min(1).max(120), date: z.iso.date(), documentId: z.string().min(1), reason: z.string().trim().min(10).max(3000) }).strict();
  const input = schema.parse(raw);
  if (!canPerformModuleOperation(context.user, "FINANCEIRO", "create") || !canPerformModuleOperation(context.user, "FINANCEIRO", "update")) throw new Error("Reabertura exige criação e alteração no Financeiro.");
  return context.prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "HrPortalRequest" WHERE id=${input.requestId} FOR UPDATE`;
    const request = await tx.hrPortalRequest.findUniqueOrThrow({ where: { id: input.requestId } });
    assertTravelAllowanceAccess(request.payload, context);
    const key = `ADIANTAMENTO:REABERTURA:${request.id}:${input.requestKey}`;
    const previous = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey: key } });
    if (previous) {
      const stored = z.object({ input: schema, presenterId: z.string() }).parse(previous.payload);
      if (request.actorId === context.user.id || stored.presenterId === context.user.id) throw new Error("Reabertura exige responsável distinto do solicitante/apresentante.");
      if (JSON.stringify(stored.input) !== JSON.stringify(input)) throw new Error("Reabertura já registrada com outros dados.");
      return previous;
    }
    if (request.kind !== "ADIANTAMENTO" || request.status !== "PRESTACAO_IMPUGNADA") throw new Error("Reapresentação exige prestação impugnada.");
    const current = await advanceCycle(tx, request.id);
    const reviewKey = cycleKey(`ADIANTAMENTO:REVISAO:${request.id}`, current.cycle);
    const reportKey = cycleKey(`ADIANTAMENTO:PRESTACAO:${request.id}`, current.cycle);
    const report = await tx.hrIntegrationEvent.findUniqueOrThrow({ where: { sourceKey: reportKey } });
    const review = await tx.hrIntegrationEvent.findUniqueOrThrow({ where: { sourceKey: reviewKey } });
    const presenterId = z.object({ actorId: z.string() }).parse(report.payload).actorId;
    const decision = z.object({ input: z.object({ date: z.iso.date(), decision: z.literal("IMPUGNAR") }) }).parse(review.payload);
    if (request.actorId === context.user.id || presenterId === context.user.id || input.date < decision.input.date || report.status !== "CONCLUIDA" || review.status !== "CONCLUIDA") throw new Error("Reabertura exige revisão independente e competência posterior ou igual à impugnação.");
    const document = await tx.document.findUniqueOrThrow({ where: { id: input.documentId } });
    if (document.status !== "Válido") throw new Error("Reabertura exige parecer GED válido.");
    const memory = memorySchema.parse(request.payload);
    const binding = await tx.planningEntityUnit.findUniqueOrThrow({ where: { budgetUnitId: memory.input.budgetUnitId } });
    const date = new Date(`${input.date}T00:00:00Z`);
    const year = await tx.financialYear.findFirstOrThrow({ where: { governmentEntityId: binding.governmentEntityId, year: date.getUTCFullYear() } });
    for (const event of [review, report]) {
      const id = z.object({ transactionId: z.string() }).parse(event.payload).transactionId;
      const original = await tx.accountingTransaction.findUniqueOrThrow({ where: { id }, include: { entries: true } });
      await postAccountingTransactionInTransaction(tx, actorFor(context), { financialYearId: year.id, governmentEntityId: binding.governmentEntityId, budgetUnitId: memory.input.budgetUnitId, date, history: `Reabertura de prestação: ${input.reason}`, sourceModule: "RH", sourceType: "ADVANCE_CONTROL_REVERSAL", sourceId: request.id, eventType: "ADVANCE_REPORT_REOPENED", idempotencyKey: `${key}:${event.id}`, reversalOfId: original.id, lines: original.entries.map(entry => ({ accountId: entry.accountId, type: entry.type === "Débito" ? "Crédito" : "Débito", value: entry.valueDecimal! })) });
      await tx.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "ESTORNADA" } });
    }
    const result = { cycle: current.cycle + 1, reopenedDate: input.date };
    const event = await enqueueHrIntegration(tx, { sourceKey: key, domain: "FINANCEIRO", environment: "PRODUCAO", eventType: "ADIANTAMENTO_PRESTACAO_REABERTA", payload: { input, presenterId, actorId: context.user.id, previousReportId: report.id, previousReviewId: review.id, previousCycle: current.cycle } });
    await tx.hrIntegrationEvent.update({ where: { id: event.id }, data: { status: "CONCLUIDA", result } });
    const cycleSourceKey = `ADIANTAMENTO:CICLO:${request.id}`;
    await enqueueHrIntegration(tx, { sourceKey: cycleSourceKey, domain: "FINANCEIRO", environment: "PRODUCAO", eventType: "ADIANTAMENTO_CICLO_ATUAL", payload: { requestId: request.id } });
    await tx.hrIntegrationEvent.update({ where: { sourceKey: cycleSourceKey }, data: { status: "CONCLUIDA", result } });
    await tx.hrPortalRequest.update({ where: { id: request.id }, data: { status: "DEFERIDA" } });
    return event;
  }, { timeout: 60000 });
}
