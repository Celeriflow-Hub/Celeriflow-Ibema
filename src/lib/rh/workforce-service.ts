import { Prisma, type PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { z } from "zod";
import { allocatePayrollAmount, calculateContractRubrics, calculateContribution, payrollPeriod } from "./calculation-engine";
import { resolveContractRevision } from "./contract-timeline";

type Tx = Prisma.TransactionClient;
const json = (value: unknown): Prisma.InputJsonValue => JSON.parse(JSON.stringify(value));
function stableJson(value: unknown): string {
  const normalize = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, normalize(child)]));
    return item;
  };
  return JSON.stringify(normalize(json(value)));
}
const D = (value: Prisma.Decimal.Value) => new Prisma.Decimal(value);
const money = z.string().trim().regex(/^-?\d{1,16}(?:\.\d{1,2})?$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((value, ctx) => {
  const result = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(result.getTime()) || result.toISOString().slice(0, 10) !== value) {
    ctx.addIssue({ code: "custom", message: "Data civil inválida." }); return z.NEVER;
  }
  return result;
});
const optionalDate = z.union([date, z.literal("")]).transform(value => value === "" ? null : value);
export const hrContractInputSchema = z.object({
  id: z.string().optional(), version: z.coerce.number().int().positive().optional(),
  effectiveFrom: z.union([date, z.literal("")]).optional().transform(value => value || undefined),
  employeeId: z.string().min(1), registration: z.string().trim().min(1).max(64),
  regimeId: z.string().min(1), roleId: z.string().min(1), departmentId: z.string().optional(),
  costCenterId: z.string().optional(), workLocation: z.string().trim().min(1).max(200), salaryLevel: z.string().optional(),
  admittedAt: date, appointedAt: optionalDate, swornAt: optionalDate, endsAt: optionalDate,
  monthlyHours: z.coerce.number().int().min(1).max(744), salary: money.refine(v => D(v).gte(0)),
  details: z.record(z.string(), z.unknown()).default({}), reason: z.string().trim().min(3).max(2000),
}).strict();

async function lock(tx: Tx, key: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`RH:${key}`}))`;
}

export async function saveEmploymentContract(db: PrismaClient, actorId: string, raw: unknown) {
  const input = hrContractInputSchema.parse(raw);
  return db.$transaction(tx => saveEmploymentContractInTransaction(tx, actorId, input));
}

async function saveEmploymentContractInTransaction(tx: Tx, actorId: string, input: z.infer<typeof hrContractInputSchema>) {
  if (input.endsAt && input.endsAt < input.admittedAt) throw new Error("Término anterior à admissão.");
    await lock(tx, `employee:${input.employeeId}`);
    if (input.id) await lock(tx, `contract:${input.id}`);
    const employee = await tx.employee.findUniqueOrThrow({ where: { id: input.employeeId }, include: { person: true } });
    if (!employee.person || !employee.isActive || employee.person.status !== "Ativo") throw new Error("Servidor deve estar ativo e vinculado à pessoa física do Cadastro Único.");
    const regime = await tx.hrEmploymentRegime.findUniqueOrThrow({ where: { id: input.regimeId }, include: { ruleSet: true } });
    const role = await tx.role.findUniqueOrThrow({ where: { id: input.roleId } });
    if (!regime.isActive || !role.isActive) throw new Error("Regime/cargo inativo.");
    if (input.departmentId) await tx.department.findUniqueOrThrow({ where: { id: input.departmentId } });
    if (input.costCenterId) await tx.costCenter.findUniqueOrThrow({ where: { id: input.costCenterId } });
    const termRule = await tx.hrPayrollRule.findFirst({ where: { ruleSetId: regime.ruleSetId, code: `CONTRATO_LIMITE_DIAS_${regime.code}`, isActive: true } });
    if (termRule) {
      const days = input.endsAt ? Math.round((input.endsAt.getTime() - input.admittedAt.getTime()) / 86400000) + 1 : Infinity;
      if (days > Number(termRule.value)) throw new Error("Prazo do contrato excede o limite do regime.");
    }
    const previous = input.id ? await tx.hrEmploymentContract.findUniqueOrThrow({ where: { id: input.id } }) : null;
    if (previous && (previous.employeeId !== input.employeeId || previous.version !== input.version)) throw new Error("Contrato alterado por outro operador ou titular incompatível. Recarregue a ficha.");
    const effectiveFrom = input.effectiveFrom ?? input.admittedAt;
    if (effectiveFrom < input.admittedAt) throw new Error("Vigência anterior à admissão.");
    if (previous) {
      if (!input.effectiveFrom) throw new Error("Informe a vigência da alteração contratual.");
      if (previous.admittedAt.getTime() !== input.admittedAt.getTime()) throw new Error("Admissão original é preservada; correção exige saneamento próprio.");
      const latest = await tx.hrEmploymentRevision.findFirst({ where: { contractId: previous.id }, orderBy: [{ effectiveFrom: "desc" }, { version: "desc" }] });
      if (latest && effectiveFrom < latest.effectiveFrom) throw new Error("Alteração anterior à última vigência. Registre correção temporal sem sobrepor o histórico.");
      const closed = await tx.hrPayrollStatement.findMany({ where: { contractId: previous.id, run: { status: "FECHADA" } }, select: { run: { select: { payroll: { select: { competence: true } } } } } });
      if (closed.some(statement => effectiveFrom <= payrollPeriod(statement.run.payroll.competence).end)) throw new Error("Vigência alcança competência fechada. A alteração deve começar após o último fechamento.");
    }
    const { id, version: _version, effectiveFrom: _effectiveFrom, reason, ...fields } = input;
    void _version;
    void _effectiveFrom;
    const data = { ...fields, salary: D(input.salary), details: json(input.details), departmentId: input.departmentId || null, costCenterId: input.costCenterId || null, salaryLevel: input.salaryLevel || null };
    const contract = id ? await tx.hrEmploymentContract.update({ where: { id }, data: { ...data, version: { increment: 1 } } }) : await tx.hrEmploymentContract.create({ data });
    await tx.hrEmploymentRevision.create({ data: { contractId: contract.id, version: contract.version, effectiveFrom, snapshot: json(contract), actorId, reason } });
    if (!previous && !await tx.hrPortalRequest.findUnique({ where: { requestKey: `INVITE:${employee.id}` } })) await tx.hrPortalRequest.create({ data: { employeeId: employee.id, requestKey: `INVITE:${employee.id}`, kind: "ACESSO_PORTAL", payload: json({ personId: employee.personId, contractId: contract.id, email: employee.person.email }), actorId } });
    return contract;
}

export async function adjustContractSalaries(db: PrismaClient, actorId: string, raw: unknown) {
  const input = z.object({ batchKey: z.string().min(1).max(160), contractIds: z.array(z.string().min(1)).min(1), effectiveFrom: date, rate: z.string().regex(/^-?\d+(?:\.\d{1,6})?$/), reason: z.string().trim().min(3).max(2000), mode: z.enum(["PREVIA", "APLICAR"]), previewHash: z.string().default("") }).strict().parse(raw);
  const rate = D(input.rate);
  if (rate.lt(-100)) throw new Error("Reajuste não pode reduzir o salário abaixo de zero.");
  const ids = [...new Set(input.contractIds)].sort();
  const request = { batchKey: input.batchKey, contractIds: ids, effectiveFrom: input.effectiveFrom, rate: rate.toString(), reason: input.reason };
  const requestHash = createHash("sha256").update(stableJson(request)).digest("hex");
  return db.$transaction(async tx => {
    await lock(tx, `adjustment:${input.batchKey}`);
    const existing = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey: `REAJUSTE:${input.batchKey}` } });
    if (existing) {
      const payload = existing.payload as { requestHash: string; previewHash: string; rows: Prisma.JsonValue[] };
      if (payload.requestHash !== requestHash) throw new Error("Lote de reajuste reutilizado com parâmetros diferentes.");
      return { rows: payload.rows, previewHash: payload.previewHash, applied: true, reused: true };
    }
    const contracts = await tx.hrEmploymentContract.findMany({ where: { id: { in: ids } }, orderBy: { id: "asc" } });
    if (contracts.length !== ids.length) throw new Error("Seleção de contratos inválida.");
    for (const employeeId of [...new Set(contracts.map(contract => contract.employeeId))].sort()) await lock(tx, `employee:${employeeId}`);
    for (const id of ids) await lock(tx, `contract:${id}`);
    const current = await tx.hrEmploymentContract.findMany({ where: { id: { in: ids } }, orderBy: { id: "asc" } });
    const rows = current.map(contract => ({ id: contract.id, registration: contract.registration, version: contract.version, before: contract.salary.toFixed(2), after: contract.salary.mul(D(1).add(rate.div(100))).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP).toFixed(2) }));
    const previewHash = createHash("sha256").update(stableJson({ request, rows })).digest("hex");
    if (input.mode === "PREVIA") return { rows: json(rows), previewHash, applied: false, reused: false };
    if (input.previewHash !== previewHash) throw new Error("Confira uma prévia atualizada. Dados ou parâmetros mudaram desde a prévia.");
    for (const contract of current) {
      const row = rows.find(row => row.id === contract.id)!;
      const day = (value: Date | null) => value?.toISOString().slice(0, 10) || "";
      await saveEmploymentContractInTransaction(tx, actorId, hrContractInputSchema.parse({ id: contract.id, version: contract.version, employeeId: contract.employeeId, registration: contract.registration, regimeId: contract.regimeId, roleId: contract.roleId, departmentId: contract.departmentId || undefined, costCenterId: contract.costCenterId || undefined, workLocation: contract.workLocation, salaryLevel: contract.salaryLevel || undefined, admittedAt: day(contract.admittedAt), appointedAt: day(contract.appointedAt), swornAt: day(contract.swornAt), endsAt: day(contract.endsAt), monthlyHours: contract.monthlyHours, salary: row.after, details: contract.details, reason: input.reason, effectiveFrom: day(input.effectiveFrom) }));
    }
    await enqueueHrIntegration(tx, { sourceKey: `REAJUSTE:${input.batchKey}`, domain: "AUDITORIA", environment: "INTERNO", eventType: "REAJUSTE_CONTRATUAL", payload: { request, requestHash, previewHash, rows, actorId } });
    return { rows: json(rows), previewHash, applied: true, reused: false };
  }, { timeout: 60000 });
}

export async function savePayrollMovement(db: PrismaClient, actorId: string, raw: unknown) {
  const input = z.object({ contractId: z.string().min(1), sourceKey: z.string().min(1).max(160), rubricCode: z.string().min(1), startsAt: date, endsAt: optionalDate, amount: money, reference: z.string().max(200).optional(), notes: z.string().min(3).max(2000) }).strict().parse(raw);
  if (input.endsAt && input.endsAt < input.startsAt) throw new Error("Vigência inválida.");
  return db.$transaction(async tx => {
    await lock(tx, `contract:${input.contractId}`);
    const contract = await tx.hrEmploymentContract.findUniqueOrThrow({ where: { id: input.contractId } });
    if (contract.status !== "ATIVO") throw new Error("Contrato inativo.");
    const regime = await tx.hrEmploymentRegime.findUniqueOrThrow({ where: { id: contract.regimeId } });
    const rubric = await tx.hrPayrollRubric.findFirst({ where: { ruleSetId: regime.ruleSetId, code: input.rubricCode, isActive: true } });
    if (!rubric) throw new Error("Rubrica ativa não encontrada no conjunto de regras do vínculo.");
    const replay = await tx.hrMovement.findUnique({ where: { sourceKey: input.sourceKey } });
    if (replay) {
      if (replay.contractId !== input.contractId || replay.rubricCode !== input.rubricCode || !replay.amount.eq(input.amount) || replay.startsAt.getTime() !== input.startsAt.getTime() || replay.endsAt?.getTime() !== input.endsAt?.getTime() || replay.notes !== input.notes || (replay.reference ?? "") !== (input.reference ?? "")) throw new Error("Chave de movimento reutilizada com dados diferentes.");
      return replay;
    }
    return tx.hrMovement.create({ data: { ...input, amount: D(input.amount), actorId } });
  });
}

export async function enqueueHrIntegration(tx: Tx, input: { sourceKey: string; domain: string; environment: string; eventType: string; payload: unknown }) {
  const payload = json(input.payload);
  const payloadHash = createHash("sha256").update(stableJson(payload)).digest("hex");
  await lock(tx, `event:${input.sourceKey}`);
  const previous = await tx.hrIntegrationEvent.findUnique({ where: { sourceKey: input.sourceKey } });
  if (previous) {
    if (previous.payloadHash !== payloadHash || previous.domain !== input.domain || previous.environment !== input.environment || previous.eventType !== input.eventType) throw new Error("Origem da integração repetida com conteúdo diferente.");
    return previous;
  }
  return tx.hrIntegrationEvent.create({ data: { ...input, payload, payloadHash } });
}

export async function calculatePayrollRun(db: PrismaClient, actorId: string, raw: unknown) {
  const input = z.object({ payrollId: z.string().min(1), requestKey: z.string().min(1).max(160), mode: z.enum(["SIMULACAO", "OFICIAL"]), scope: z.enum(["DEMONSTRACAO", "HOMOLOGACAO", "PRODUCAO"]), contractIds: z.array(z.string().min(1)).min(1) }).strict().parse(raw);
  return db.$transaction(async tx => {
    await lock(tx, `payroll:${input.payrollId}`);
    await tx.$queryRaw`SELECT id FROM "Payroll" WHERE id=${input.payrollId} FOR UPDATE`;
    const payroll = await tx.payroll.findUniqueOrThrow({ where: { id: input.payrollId } });
    const replay = await tx.hrPayrollRun.findUnique({ where: { requestKey: input.requestKey }, include: { statements: true } });
    if (replay) {
      const selection = (replay.snapshot as { contractIds?: string[] }).contractIds ?? [];
      if (replay.payrollId !== input.payrollId || replay.mode !== input.mode || replay.scope !== input.scope || selection.slice().sort().join() !== input.contractIds.slice().sort().join()) throw new Error("Solicitação de cálculo repetida com seleção diferente.");
      return replay;
    }
    if (["Fechada", "Paga"].includes(payroll.status) && input.mode === "OFICIAL") throw new Error("Folha fechada/paga não pode ser recalculada.");
    if (payroll.type !== "Mensal") throw new Error("Este motor exige folha Mensal. Folhas especiais precisam de políticas e fluxos próprios.");
    const period = payrollPeriod(payroll.competence);
    const canonicalItems = await tx.payrollItem.findMany({ where: { payrollId: payroll.id }, include: { event: true, sstBenefitOrigin: true, sstLeaveOrigin: { select: { id: true, rubricId: true, functionalPeriodId: true } } }, orderBy: { id: "asc" } });
    const ids = [...new Set(input.contractIds)].sort();
    for (const id of ids) await lock(tx, `contract:${id}`);
    const storedContracts = await tx.hrEmploymentContract.findMany({ where: { id: { in: ids } }, include: { employee: { include: { person: true } }, revisions: true, movements: { where: { startsAt: { lte: period.end }, OR: [{ endsAt: null }, { endsAt: { gte: period.start } }] } } }, orderBy: { id: "asc" } });
    const contracts = storedContracts.map(contract => {
      const { revisions, ...record } = contract;
      const resolved = resolveContractRevision(record, revisions, period);
      return { ...resolved.contract, revisionId: resolved.revisionId };
    }).filter(contract => contract.status === "ATIVO" && contract.admittedAt <= period.end && (!contract.endsAt || contract.endsAt >= period.start));
    if (contracts.length !== ids.length) throw new Error("Seleção contém vínculo inválido ou fora da competência.");
    const regimes = await tx.hrEmploymentRegime.findMany({ where: { id: { in: contracts.map(c => c.regimeId) }, isActive: true }, include: { socialSecurityScheme: { include: { bands: { orderBy: { sequence: "asc" } } } } } });
    const sets = new Set(regimes.map(r => r.ruleSetId));
    if (sets.size !== 1) throw new Error("Selecione vínculos do mesmo conjunto de regras.");
    const ruleSet = await tx.hrPayrollRuleSet.findUniqueOrThrow({ where: { id: [...sets][0] }, include: { calculationPolicy: true, rubrics: { where: { isActive: true }, include: { incidences: true }, orderBy: [{ priority: "asc" }, { code: "asc" }] }, rules: { where: { isActive: true } } } });
    if (ruleSet.status !== "ATIVA" || ruleSet.scope !== input.scope || ruleSet.effectiveFrom > period.start || (ruleSet.effectiveUntil && ruleSet.effectiveUntil < period.end) || !ruleSet.calculationPolicy || !ruleSet.rubrics.length) throw new Error("Regras ativas e política devem cobrir toda a competência e o escopo selecionado.");
    if (input.scope === "PRODUCAO" && (ruleSet.isDemo || !ruleSet.approvedAt || ruleSet.approvedAt > new Date() || !ruleSet.legalReference)) throw new Error("Produção exige regras oficiais aprovadas, com fundamento legal.");
    if (ruleSet.calculationPolicy.roundingMode !== "HALF_UP" || ruleSet.calculationPolicy.roundingScale !== 2) throw new Error("Este motor requer arredondamento HALF_UP com duas casas; publique política compatível.");
    const calculated = contracts.map(contract => {
      if (!contract.employee.person || !contract.employee.isActive) throw new Error("Vínculo sem pessoa física/servidor ativo.");
      const regime = regimes.find(r => r.id === contract.regimeId);
      if (!regime) throw new Error("Regime inativo.");
      const start = new Date(Math.max(period.start.getTime(), contract.admittedAt.getTime()));
      const end = new Date(Math.min(period.end.getTime(), contract.endsAt?.getTime() ?? period.end.getTime()));
      const fullMonth = start.getTime() === period.start.getTime() && end.getTime() === period.end.getTime();
      const days = fullMonth ? 30 : Math.min(30, Math.max(0, end.getUTCDate() - start.getUTCDate() + 1));
      const movements: Record<string, Prisma.Decimal> = {};
      for (const movement of contract.movements) movements[movement.rubricCode] = (movements[movement.rubricCode] ?? D(0)).add(movement.amount);
      for (const item of canonicalItems.filter(i => i.employeeId === contract.employeeId)) {
        const origin = item.sstBenefitOrigin ?? item.sstLeaveOrigin;
        const details = contract.details as Record<string, unknown>;
        if (!origin || item.valueDecimal === null) throw new Error("Lançamento legado sem origem/Decimal exige conciliação antes do cálculo.");
        if (details.functionalPeriodId !== origin.functionalPeriodId) throw new Error("Informe o período funcional canônico do contrato para conciliar origens SST sem inferência de vínculo.");
        const rubric = ruleSet.rubrics.find(r => r.id === origin.rubricId);
        if (!rubric || rubric.calculationMethod !== "MANUAL") throw new Error("Origem SST exige rubrica MANUAL ativa do mesmo conjunto.");
        movements[rubric.code] = (movements[rubric.code] ?? D(0)).add(item.valueDecimal);
      }
      const result = calculateContractRubrics({ salary: contract.salary, monthlyHours: contract.monthlyHours, days, movements, rubrics: ruleSet.rubrics });
      return { contract, regime, result, days };
    });
    const samePersons = [...new Set(contracts.map(contract => contract.employee.personId).filter((id): id is string => Boolean(id)))];
    const otherContracts = await tx.hrEmploymentContract.findMany({ where: { id: { notIn: ids }, employee: { personId: { in: samePersons } } }, include: { revisions: true } });
    const omitted = otherContracts.some(contract => {
      if (!contract.revisions.some(revision => revision.effectiveFrom <= period.end)) return false;
      const resolved = resolveContractRevision(contract, contract.revisions, period).contract;
      return resolved.status === "ATIVO" && resolved.admittedAt <= period.end && (!resolved.endsAt || resolved.endsAt >= period.start);
    });
    if (omitted) throw new Error("Inclua os demais contratos da mesma pessoa física para calcular tetos e retenções sem duplicar benefícios fiscais.");
    // Apply the social security ceiling once per PF and scheme, then reconcile residual cents.
    const groups = new Map<string, typeof calculated>();
    for (const row of calculated) {
      const scheme = row.regime.socialSecurityScheme;
      if (!scheme || !scheme.isActive) throw new Error("Regime exige esquema previdenciário ativo.");
      const key = `${row.contract.employee.personId}:${scheme.id}`;
      groups.set(key, [...(groups.get(key) ?? []), row]);
    }
    for (const group of groups.values()) {
      const scheme = group[0].regime.socialSecurityScheme!;
      const bases = group.map(row => row.result.bases[scheme.regime] ?? D(0));
      const base = bases.reduce((a, b) => a.add(b), D(0));
      const contribution = calculateContribution(base, scheme.bands, scheme.employeeCalculationMethod, scheme.ceilingValue);
      const shares = allocatePayrollAmount(contribution, bases);
      const employerBasisRule = ruleSet.rules.find(rule => rule.code === `PREVIDENCIA_BASE_PATRONAL_${scheme.code}`);
      const employerRate = (scheme.employerContributionRate ?? D(0)).add(scheme.actuarialContributionRate ?? D(0));
      if (employerRate.lt(0) || employerRate.gt(100)) throw new Error("Alíquota patronal inválida.");
      if (employerRate.gt(0) && !employerBasisRule) throw new Error("Configure a base patronal separadamente do teto de contribuição do servidor.");
      const employerBasis = employerBasisRule ? z.enum(["SEM_TETO", "TETO_SERVIDOR"]).parse(employerBasisRule.value) : "SEM_TETO";
      const employerBase = employerBasis === "TETO_SERVIDOR" && scheme.ceilingValue !== null ? Prisma.Decimal.min(base, scheme.ceilingValue) : base;
      const employer = allocatePayrollAmount(employerBase.mul(employerRate).div(100).toDecimalPlaces(2), bases);
      group.forEach((row, index) => {
        row.result.deductions = row.result.deductions.add(shares[index]);
        row.result.employer = employer[index];
        row.result.items.push({ code: `PREVIDENCIA_${scheme.code}`, name: scheme.name, type: "DESCONTO", value: shares[index].toFixed(2), method: scheme.employeeCalculationMethod, formula: null, base: scheme.regime, rate: null, fixed: null, movement: "0.00" });
      });
    }
    // Do not silently omit IRRF. Municipal approval must supply the progressive table.
    const irrfRule = ruleSet.rules.find(r => r.code === "IRRF_FAIXAS");
    const irrfBases = calculated.map(row => row.result.bases.IRRF ?? D(0));
    if (irrfBases.some(base => base.gt(0))) {
      if (!irrfRule || !Array.isArray(irrfRule.value)) throw new Error("Configure IRRF_FAIXAS antes de calcular bases sujeitas ao IRRF.");
      const bands = z.array(z.object({ lowerLimit: z.string(), upperLimit: z.string().nullable(), employeeRate: z.string() }).strict()).parse(irrfRule.value);
      const persons = new Set(calculated.map(row => row.contract.employee.personId));
      for (const person of persons) {
        const rows = calculated.filter(row => row.contract.employee.personId === person);
        const originalBases = rows.map(row => Prisma.Decimal.max(D(0), row.result.bases.IRRF ?? D(0)));
        const originalBase = originalBases.reduce((a, b) => a.add(b), D(0));
        const dependentCount = await tx.dependent.count({ where: { employeeId: { in: [...new Set(rows.map(row => row.contract.employeeId))] }, irrfDependent: true } });
        const deductionRule = ruleSet.rules.find(rule => rule.code === "IRRF_DEDUCAO_DEPENDENTE");
        if (dependentCount && !deductionRule) throw new Error("Dependentes de IRRF exigem IRRF_DEDUCAO_DEPENDENTE configurada.");
        const dependentDeduction = deductionRule ? D(z.union([z.string(), z.number()]).parse(deductionRule.value)).mul(dependentCount) : D(0);
        const socialDeduction = rows.reduce((total, row) => total.add(row.result.items.filter(i => i.code.startsWith("PREVIDENCIA_")).reduce((a, b) => a.add(b.value), D(0))), D(0));
        const simplifiedRule = ruleSet.rules.find(rule => rule.code === "IRRF_DEDUCAO_SIMPLIFICADA");
        const simplified = simplifiedRule ? D(z.union([z.string(), z.number()]).parse(simplifiedRule.value)) : D(0);
        if (dependentDeduction.lt(0) || simplified.lt(0)) throw new Error("Deduções IRRF negativas na configuração.");
        const deduction = Prisma.Decimal.max(dependentDeduction.add(socialDeduction), simplified);
        const taxable = Prisma.Decimal.max(D(0), originalBase.sub(deduction));
        const bases = allocatePayrollAmount(taxable, originalBases);
        const tax = calculateContribution(bases.reduce((a, b) => a.add(b), D(0)), bands, "PROGRESSIVA", null);
        const shares = allocatePayrollAmount(tax, bases);
        rows.forEach((row, index) => {
          row.result.deductions = row.result.deductions.add(shares[index]);
          row.result.items.push({ code: "IRRF", name: "Imposto de Renda", type: "DESCONTO", value: shares[index].toFixed(2), method: "PROGRESSIVA", formula: null, base: "IRRF", rate: null, fixed: null, movement: "0.00" });
        });
      }
    }
    const fgtsRate = ruleSet.rules.find(rule => rule.code === "FGTS_ALIQUOTA");
    for (const row of calculated) {
      const fgtsBase = row.result.bases.FGTS ?? D(0);
      if (fgtsBase.gt(0)) {
        if (!fgtsRate) throw new Error("Base FGTS exige FGTS_ALIQUOTA configurada.");
        const rate = D(z.union([z.string(), z.number()]).parse(fgtsRate.value));
        if (rate.lt(0) || rate.gt(100)) throw new Error("Alíquota FGTS inválida.");
        const amount = fgtsBase.mul(rate).div(100).toDecimalPlaces(2);
        row.result.employer = row.result.employer.add(amount);
        row.result.items.push({ code: "FGTS", name: "FGTS", type: "INFORMATIVA", value: amount.toFixed(2), method: "PERCENTUAL", formula: null, base: "FGTS", rate: rate.toString(), fixed: null, movement: "0.00" });
      }
      row.result.net = row.result.gross.sub(row.result.deductions);
      if (row.result.net.lt(0) && ruleSet.calculationPolicy.negativeNetPayPolicy !== "PERMITIR") throw new Error(`Líquido negativo em ${row.contract.registration}.`);
    }
    const sum = (key: "gross" | "deductions" | "net" | "employer") => calculated.reduce((total, row) => total.add(row.result[key]), D(0));
    if (canonicalItems.some(item => !contracts.some(c => c.employeeId === item.employeeId))) throw new Error("Inclua todos os servidores com origens lançadas nesta folha.");
    if (new Set(contracts.map(c => c.employeeId)).size !== contracts.length && canonicalItems.length) throw new Error("Origens por servidor exigem alocação explícita entre vínculos antes deste cálculo.");
    return tx.hrPayrollRun.create({ data: { payrollId: input.payrollId, requestKey: input.requestKey, mode: input.mode, scope: input.scope, ruleSetId: ruleSet.id, actorId, snapshot: json({ payroll, ruleSet, contractIds: ids, canonicalItems, contractVersions: contracts.map(c => ({ id: c.id, version: c.version })) }), gross: sum("gross"), deductions: sum("deductions"), net: sum("net"), employer: sum("employer"), statements: { create: calculated.map(row => ({ contractId: row.contract.id, gross: row.result.gross, deductions: row.result.deductions, net: row.result.net, employer: row.result.employer, snapshot: json({ contract: row.contract, regime: row.regime, days: row.days, items: row.result.items, bases: row.result.bases }) })) } }, include: { statements: true } });
  }, { timeout: 60000 });
}

export async function closePayrollRun(db: PrismaClient, actorId: string, runId: string) {
  return db.$transaction(async tx => {
    const run = await tx.hrPayrollRun.findUniqueOrThrow({ where: { id: runId }, include: { payroll: true } });
    await lock(tx, `payroll:${run.payrollId}`);
    await tx.$queryRaw`SELECT id FROM "Payroll" WHERE id=${run.payrollId} FOR UPDATE`;
    const current = await tx.hrPayrollRun.findUniqueOrThrow({ where: { id: run.id } });
    if (current.status === "FECHADA") return current;
    if (current.mode !== "OFICIAL" || current.status !== "CALCULADA") throw new Error("Somente cálculo oficial pode ser fechado.");
    const payroll = await tx.payroll.findUniqueOrThrow({ where: { id: run.payrollId } });
    if (["Fechada", "Paga"].includes(payroll.status)) throw new Error("Folha já consolidada por outra execução.");
    const snapshot = current.snapshot as { canonicalItems?: unknown; contractVersions?: { id: string; version: number }[] };
    const canonicalItems = await tx.payrollItem.findMany({ where: { payrollId: payroll.id }, include: { event: true, sstBenefitOrigin: true, sstLeaveOrigin: { select: { id: true, rubricId: true, functionalPeriodId: true } } }, orderBy: { id: "asc" } });
    if (stableJson(canonicalItems) !== stableJson(snapshot.canonicalItems)) throw new Error("Origens contratuais mudaram após o cálculo. Recalcule antes de fechar.");
    for (const version of snapshot.contractVersions ?? []) {
      await lock(tx, `contract:${version.id}`);
      const storedContract = await tx.hrEmploymentContract.findUniqueOrThrow({ where: { id: version.id }, include: { employee: true, revisions: true } });
      const contract = resolveContractRevision(storedContract, storedContract.revisions, payrollPeriod(payroll.competence)).contract;
      await tx.$queryRaw`SELECT id FROM "Employee" WHERE id=${contract.employeeId} FOR SHARE`;
      const employee = await tx.employee.findUniqueOrThrow({ where: { id: contract.employeeId } });
      if (!employee.isActive || contract.status !== "ATIVO") throw new Error("Servidor/contrato inativado após o cálculo. Recalcule a seleção antes de fechar.");
      if (contract.version !== version.version) throw new Error("Contrato mudou após o cálculo. Recalcule antes de fechar.");
      const statement = await tx.hrPayrollStatement.findUniqueOrThrow({ where: { runId_contractId: { runId, contractId: version.id } } });
      const contractSnapshot = (statement.snapshot as { contract: { movements: unknown } }).contract;
      const period = payrollPeriod(payroll.competence);
      const movements = await tx.hrMovement.findMany({ where: { contractId: version.id, startsAt: { lte: period.end }, OR: [{ endsAt: null }, { endsAt: { gte: period.start } }] } });
      const normalize = (value: unknown) => stableJson((json(value) as unknown as { id: string }[]).sort((a, b) => a.id.localeCompare(b.id)));
      if (normalize(movements) !== normalize(contractSnapshot.movements)) throw new Error("Movimentos mudaram após o cálculo. Recalcule antes de fechar.");
    }
    const ruleSnapshot = (current.snapshot as { ruleSet: { rules: { code: string; value: unknown }[] } }).ruleSet;
    const mapping = z.record(z.string(), z.string().min(1)).parse(ruleSnapshot.rules.find(rule => rule.code === "FOLHA_EVENTOS")?.value);
    const statements = await tx.hrPayrollStatement.findMany({ where: { runId }, include: { contract: true }, orderBy: { id: "asc" } });
    for (const statement of statements) {
      const items = (statement.snapshot as { items: { code: string; name: string; type: string; value: string }[] }).items;
      for (const item of items) {
        if (D(item.value).isZero()) continue;
        const eventId = mapping[item.code];
        if (!eventId) throw new Error(`Configure FOLHA_EVENTOS para a rubrica ${item.code}.`);
        const event = await tx.payrollEvent.findUniqueOrThrow({ where: { id: eventId } });
        const expectedType = item.type === "PROVENTO" ? "Vencimento" : item.type === "DESCONTO" ? "Desconto" : "Base";
        if (!event.isActive || event.type !== expectedType || event.formula?.trim()) throw new Error("Evento de projeção deve ser ativo, sem fórmula concorrente e compatível com a rubrica.");
        const existing = canonicalItems.filter(existing => existing.employeeId === statement.contract.employeeId && existing.eventId === eventId).reduce((total, existing) => total.add(existing.valueDecimal ?? 0), D(0));
        const remaining = D(item.value).sub(existing);
        if (remaining.lt(0)) throw new Error("Origens já lançadas excedem a rubrica. Concilie antes de fechar.");
        if (remaining.isZero()) continue;
        const projection = remaining.toNumber();
        if (!D(projection.toString()).eq(remaining)) throw new Error("Valor excede precisão da projeção legada.");
        const projected = await tx.payrollItem.create({ data: { payrollId: run.payrollId, employeeId: statement.contract.employeeId, eventId, valueDecimal: remaining, value: projection, reference: `RH:${statement.id}:${item.code}` } });
        await tx.hrPayrollItemOrigin.create({ data: { payrollItemId: projected.id, runId, statementId: statement.id, rubricCode: item.code, snapshot: json(item) } });
      }
    }
    const projectedItems = await tx.payrollItem.findMany({ where: { payrollId: run.payrollId }, include: { event: true } });
    const projectedTotal = projectedItems.reduce((total, item) => total.add(item.event.type === "Vencimento" ? item.valueDecimal ?? item.value : item.event.type === "Desconto" ? D(item.valueDecimal ?? item.value).negated() : 0), D(0));
    if (!projectedTotal.eq(run.net) || !D(projectedTotal.toNumber().toString()).eq(projectedTotal)) throw new Error("Projeção da folha não reconciliou com o líquido do cálculo.");
    await tx.payroll.update({ where: { id: run.payrollId }, data: { status: "Fechada", totalValueDecimal: projectedTotal, totalValue: projectedTotal.toNumber() } });
    const updated = await tx.hrPayrollRun.update({ where: { id: run.id }, data: { status: "FECHADA", approvedAt: new Date() } });
    await enqueueHrIntegration(tx, { sourceKey: `FINANCEIRO:${run.id}`, domain: "FINANCEIRO", environment: run.scope, eventType: "FOLHA_FECHADA", payload: { runId, actorId, gross: run.gross, deductions: run.deductions, net: run.net, employer: run.employer } });
    await enqueueHrIntegration(tx, { sourceKey: `ESOCIAL:RESTRITA:${run.id}`, domain: "ESOCIAL", environment: "PRODUCAO_RESTRITA", eventType: "REMUNERACAO", payload: { runId, payrollId: run.payrollId, competence: payroll.competence, scope: run.scope } });
    return updated;
  });
}

export async function cancelPayrollRun(db: PrismaClient, actorId: string, runId: string, reason: string) {
  if (reason.trim().length < 3) throw new Error("Informe motivo do cancelamento.");
  return db.$transaction(async tx => {
    const run = await tx.hrPayrollRun.findUniqueOrThrow({ where: { id: runId } });
    await lock(tx, `payroll:${run.payrollId}`);
    const current = await tx.hrPayrollRun.findUniqueOrThrow({ where: { id: runId } });
    if (current.status === "CANCELADA") return current;
    if (current.status === "FECHADA") throw new Error("Cálculo fechado exige compensação contábil antes de cancelar.");
    await enqueueHrIntegration(tx, { sourceKey: `CANCELAMENTO:${run.id}`, domain: "AUDITORIA", environment: run.scope, eventType: "CANCELAMENTO_CALCULO", payload: { runId, actorId, reason } });
    return tx.hrPayrollRun.update({ where: { id: runId }, data: { status: "CANCELADA", cancelledAt: new Date() } });
  });
}

export async function publishPayrollStatements(db: PrismaClient, actorId: string, runId: string, releaseAt: Date) {
  if (!Number.isFinite(releaseAt.getTime())) throw new Error("Data de liberação inválida.");
  return db.$transaction(async tx => {
    const run = await tx.hrPayrollRun.findUniqueOrThrow({ where: { id: runId } });
    await lock(tx, `payroll:${run.payrollId}`);
    const current = await tx.hrPayrollRun.findUniqueOrThrow({ where: { id: runId } });
    if (current.mode !== "OFICIAL" || current.status !== "FECHADA") throw new Error("A liberação requer cálculo oficial fechado.");
    await tx.hrPayrollStatement.updateMany({ where: { runId, releaseAt: null }, data: { releaseAt } });
    return enqueueHrIntegration(tx, { sourceKey: `PUBLICACAO:${runId}`, domain: "PORTAL", environment: run.scope, eventType: "DEMONSTRATIVOS_LIBERADOS", payload: { runId, actorId, releaseAt } });
  });
}

export async function recordHrRightEntry(db: PrismaClient, actorId: string, raw: unknown) {
  const input = z.object({ contractId: z.string().min(1), sourceKey: z.string().min(1), kind: z.enum(["FERIAS", "LICENCA_PREMIO", "ATS", "BANCO_HORAS", "PROVISAO_FERIAS", "PROVISAO_13", "PROVISAO_LICENCA"]), periodStart: date, periodEnd: date, quantity: z.string().regex(/^-?\d+(?:\.\d{1,4})?$/), amount: money, details: z.record(z.string(), z.unknown()) }).strict().parse(raw);
  if (input.periodEnd < input.periodStart) throw new Error("Período de direito inválido.");
  return db.$transaction(async tx => {
    await lock(tx, `contract:${input.contractId}`);
    await tx.hrEmploymentContract.findUniqueOrThrow({ where: { id: input.contractId } });
    const previous = await tx.hrRightEntry.findUnique({ where: { sourceKey: input.sourceKey } });
    if (previous) {
      if (previous.contractId !== input.contractId || previous.kind !== input.kind || !previous.quantity.eq(input.quantity) || !previous.amount.eq(input.amount) || previous.periodStart.getTime() !== input.periodStart.getTime() || previous.periodEnd.getTime() !== input.periodEnd.getTime() || stableJson(previous.details) !== stableJson(input.details)) throw new Error("Origem do direito reutilizada com valores diferentes.");
      return previous;
    }
    const balance = await tx.hrRightEntry.aggregate({ where: { contractId: input.contractId, kind: input.kind, periodStart: input.periodStart, periodEnd: input.periodEnd }, _sum: { quantity: true, amount: true } });
    if (D(balance._sum.quantity ?? 0).add(input.quantity).lt(0) || D(balance._sum.amount ?? 0).add(input.amount).lt(0)) throw new Error("Baixa excede saldo do direito/provisão.");
    return tx.hrRightEntry.create({ data: { ...input, quantity: D(input.quantity), amount: D(input.amount), details: json(input.details), actorId } });
  });
}
