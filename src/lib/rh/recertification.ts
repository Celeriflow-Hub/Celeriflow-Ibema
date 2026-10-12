import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { enqueueHrIntegration } from "./workforce-service";

const fields = ["email", "emailSecondary", "phonePrimary", "phoneSecondary", "whatsapp", "maritalStatus", "profession", "educationLevel", "socialName", "rg", "rgIssuer", "motherName", "fatherName", "nationality", "birthPlace", "gender", "raceColor"] as const;
export const recertificationCampaignSchema = z.object({
  origin: z.literal("CAMPANHA_RECADASTRAMENTO"), startsAt: z.string().datetime(), endsAt: z.string().datetime(),
  employeeIds: z.array(z.string().min(1)).min(1), fields: z.array(z.enum(fields)).min(1), instructions: z.string().max(4000),
}).strict().refine(value => new Date(value.endsAt) >= new Date(value.startsAt), "Período de campanha inválido.");

const proposalSchema = z.partialRecord(z.enum(fields), z.string().trim().max(250));
type ContactValues = Partial<Record<typeof fields[number], string | null>>;

export async function listMyRecertificationCampaigns(db: PrismaClient, employeeId: string) {
  const now = new Date();
  const rules = await db.hrPayrollRule.findMany({ where: { category: "PORTAL", valueType: "JSON", isActive: true, ruleSet: { status: "ATIVA", effectiveFrom: { lte: now }, OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }] } }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  const campaigns = rules.flatMap(rule => {
    const parsed = recertificationCampaignSchema.safeParse(rule.value);
    if (!parsed.success || !parsed.data.employeeIds.includes(employeeId)) return [];
    return [{ id: rule.id, name: rule.name, ...parsed.data }];
  });
  const requests = await db.hrPortalRequest.findMany({ where: { employeeId, kind: "RECADASTRAMENTO" }, orderBy: { createdAt: "desc" } });
  return campaigns.map(campaign => ({ ...campaign, request: requests.find(request => (request.payload as { campaignRuleId?: string }).campaignRuleId === campaign.id) || null }));
}

export async function listRecertificationProgress(db: PrismaClient) {
  const rules = await db.hrPayrollRule.findMany({ where: { category: "PORTAL", valueType: "JSON" }, orderBy: [{ createdAt: "desc" }, { id: "asc" }] });
  const campaigns = rules.flatMap(rule => {
    const parsed = recertificationCampaignSchema.safeParse(rule.value);
    return parsed.success ? [{ id: rule.id, name: rule.name, active: rule.isActive, ...parsed.data }] : [];
  });
  const employeeIds = [...new Set(campaigns.flatMap(campaign => campaign.employeeIds))];
  const employees = await db.employee.findMany({ where: { id: { in: employeeIds } }, select: { id: true, name: true, isActive: true } });
  const requests = await db.hrPortalRequest.findMany({ where: { kind: "RECADASTRAMENTO", employeeId: { in: employeeIds } }, orderBy: { createdAt: "desc" } });
  return campaigns.map(campaign => ({ ...campaign, recipients: [...new Set(campaign.employeeIds)].map(employeeId => {
    const employee = employees.find(employee => employee.id === employeeId);
    const request = requests.find(request => request.employeeId === employeeId && (request.payload as { campaignRuleId?: string }).campaignRuleId === campaign.id);
    return { employeeId, name: employee?.name || "Cadastro não encontrado", employeeActive: employee?.isActive || false, status: request?.status || "PENDENTE", requestId: request?.id || null };
  }) }));
}

export async function submitRecertificationProposal(db: PrismaClient, actorId: string, employeeId: string, raw: unknown) {
  const input = z.object({ campaignRuleId: z.string().min(1), proposal: proposalSchema }).strict().parse(raw);
  return db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`RH:recertification:${input.campaignRuleId}:${employeeId}`}))`;
    const rule = await tx.hrPayrollRule.findUniqueOrThrow({ where: { id: input.campaignRuleId }, include: { ruleSet: true } });
    const campaign = recertificationCampaignSchema.parse(rule.value); const now = new Date();
    if (!rule.isActive || rule.category !== "PORTAL" || rule.ruleSet.status !== "ATIVA" || now < rule.ruleSet.effectiveFrom || rule.ruleSet.effectiveUntil && now > rule.ruleSet.effectiveUntil || !campaign.employeeIds.includes(employeeId) || now < new Date(campaign.startsAt) || now > new Date(campaign.endsAt)) throw new Error("Campanha fora da vigência ou do público autorizado.");
    for (const name of Object.keys(input.proposal)) if (!campaign.fields.includes(name as typeof fields[number])) throw new Error("Campo não habilitado para esta campanha.");
    if (Object.keys(input.proposal).length !== campaign.fields.length || campaign.fields.some(field => !(field in input.proposal))) throw new Error("Preencha todos os campos habilitados na campanha.");
    if (input.proposal.email && !z.email().safeParse(input.proposal.email).success) throw new Error("E-mail inválido.");
    if (input.proposal.emailSecondary && !z.email().safeParse(input.proposal.emailSecondary).success) throw new Error("E-mail secundário inválido.");
    const employee = await tx.employee.findUniqueOrThrow({ where: { id: employeeId }, include: { person: true } });
    if (!employee.isActive || !employee.person || employee.person.status !== "Ativo") throw new Error("Servidor sem pessoa física ativa.");
    const requestKey = `RECADASTRAMENTO:${rule.id}:${employeeId}`;
    const previous = await tx.hrPortalRequest.findUnique({ where: { requestKey } });
    if (previous) {
      const proposal = (previous.payload as { proposal: ContactValues }).proposal;
      if (campaign.fields.some(field => proposal[field] !== input.proposal[field])) throw new Error("Campanha já respondida; a proposta anterior foi preservada.");
      return previous;
    }
    const before: ContactValues = {};
    for (const field of campaign.fields) before[field] = employee.person[field];
    return tx.hrPortalRequest.create({ data: { employeeId, requestKey, kind: "RECADASTRAMENTO", actorId, payload: { description: `Recadastramento: ${rule.name}`, campaignRuleId: rule.id, campaign, personId: employee.person.id, before, proposal: input.proposal } } });
  });
}

export async function decideRecertificationProposal(db: PrismaClient, actorId: string, raw: unknown) {
  const input = z.object({ requestId: z.string().min(1), status: z.enum(["DEFERIDA", "INDEFERIDA"]), decision: z.string().trim().min(10).max(4000) }).strict().parse(raw);
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "HrPortalRequest" WHERE id=${input.requestId} FOR UPDATE`;
    const request = await tx.hrPortalRequest.findUniqueOrThrow({ where: { id: input.requestId } });
    if (request.kind !== "RECADASTRAMENTO") throw new Error("Solicitação não é de recadastramento.");
    if (request.status !== "EM_ANALISE") {
      if (request.status === input.status && request.decision === input.decision) return request;
      throw new Error("Solicitação já decidida; a decisão foi preservada.");
    }
    const payload = z.object({ personId: z.string(), before: z.record(z.string(), z.string().nullable()), proposal: proposalSchema, campaign: recertificationCampaignSchema }).parse(request.payload);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`RH:employee:${request.employeeId}`}))`;
    const employee = await tx.employee.findUniqueOrThrow({ where: { id: request.employeeId } });
    if (employee.personId !== payload.personId || !employee.isActive) throw new Error("Titularidade funcional mudou após o pedido. Revise a proposta.");
    await tx.$queryRaw`SELECT id FROM "Person" WHERE id=${payload.personId} FOR UPDATE`;
    const person = await tx.person.findUniqueOrThrow({ where: { id: payload.personId } });
    if (person.status !== "Ativo") throw new Error("Pessoa física inativa.");
    const updates: ContactValues = {};
    if (input.status === "DEFERIDA") {
      for (const field of payload.campaign.fields) {
        if (person[field] !== payload.before[field]) throw new Error("Cadastro central alterado após a proposta. Revise o conflito antes de deferir.");
        updates[field] = payload.proposal[field] || null;
      }
      const updated = await tx.person.update({ where: { id: person.id }, data: updates });
      await tx.employee.update({ where: { id: employee.id }, data: { email: updated.email, phone: updated.phonePrimary } });
    }
    const decidedAt = new Date();
    await enqueueHrIntegration(tx, { sourceKey: `RECADASTRAMENTO:DECISAO:${request.id}`, domain: "AUDITORIA", environment: "INTERNO", eventType: "RECADASTRAMENTO_DECIDIDO", payload: { requestId: request.id, personId: person.id, actorId, before: payload.before, after: input.status === "DEFERIDA" ? updates : payload.before, status: input.status, decision: input.decision, decidedAt } });
    return tx.hrPortalRequest.update({ where: { id: request.id }, data: { status: input.status, decision: input.decision, decidedBy: actorId, decidedAt } });
  });
}
