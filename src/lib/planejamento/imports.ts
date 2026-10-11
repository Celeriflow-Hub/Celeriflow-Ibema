import "server-only";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { AccessError } from "@/lib/platform/tenant-context";
import { assertPlanningOperation, planningInstrumentWhere, planningLineWhere, type PlanningContext } from "./access";
import { lockPlanningInstrument } from "./service";

const inputSchema = z.object({ sourceInstrumentId: z.string().min(1), targetInstrumentId: z.string().min(1), targetYear: z.coerce.number().int(), mode: z.enum(["STRUCTURE", "VALUES"]), lineCodes: z.string().trim().default(""), submissionKey: z.string().uuid() });

export async function importPlanningLines(context: PlanningContext, raw: unknown) {
  assertPlanningOperation(context, "create");
  const input = inputSchema.parse(raw);
  if (input.sourceInstrumentId === input.targetInstrumentId) throw new Error("Origem e destino devem ser diferentes.");
  const selectedCodes = [...new Set(input.lineCodes.split(",").map((code) => code.trim()).filter(Boolean))].sort();
  const fingerprint = createHash("sha256").update(JSON.stringify({ source: input.sourceInstrumentId, target: input.targetInstrumentId, year: input.targetYear, mode: input.mode, selectedCodes })).digest("hex");
  return context.prisma.$transaction(async (tx) => {
    const instruments = await tx.planningInstrument.findMany({ where: { id: { in: [input.sourceInstrumentId, input.targetInstrumentId] }, ...planningInstrumentWhere(context) } });
    if (instruments.length !== 2) throw new AccessError("Origem ou destino fora do escopo autorizado.", 403);
    if (instruments[0].governmentEntityId !== instruments[1].governmentEntityId) throw new Error("A importação exige a mesma entidade; use a consolidação para consulta entre entidades.");
    await tx.$queryRaw`SELECT id FROM "PlanningInstrument" WHERE id IN (${input.sourceInstrumentId}, ${input.targetInstrumentId}) ORDER BY id FOR UPDATE`;
    const existing = await tx.planningImportBatch.findUnique({ where: { submissionKey: input.submissionKey } });
    if (existing) {
      if (existing.fingerprint !== fingerprint || existing.createdById !== context.user.id) throw new Error("Chave de solicitação já utilizada com outros dados.");
      return existing.id;
    }
    const target = await lockPlanningInstrument(tx, context, input.targetInstrumentId);
    if (input.targetYear < target.startYear || input.targetYear > target.endYear) throw new Error("Exercício de destino fora da vigência.");
    const lines = await tx.planningBudgetLine.findMany({ where: { instrumentId: input.sourceInstrumentId, ...planningLineWhere(context), ...(selectedCodes.length ? { code: { in: selectedCodes } } : {}) }, orderBy: [{ code: "asc" }, { id: "asc" }] });
    if (!lines.length) throw new Error("Nenhuma previsão autorizada selecionada.");
    if (selectedCodes.length && lines.length !== selectedCodes.length) throw new Error("Um ou mais códigos não foram encontrados no escopo autorizado.");
    const targetPpaId = target.multiYearPlanId ?? target.parent?.multiYearPlanId ?? target.parent?.parent?.multiYearPlanId;
    const sourcePrograms = new Map<string, string>(), sourceActions = new Map<string, string>();
    for (const line of lines) {
      const value = input.mode === "VALUES" ? line.originalValue : new Prisma.Decimal(0);
      let programId: string | null = null, actionId: string | null = null;
      if (line.kind === "EXPENSE") {
        if (!targetPpaId || !line.programId || !line.actionId) throw new Error("Despesa sem programa/ação canônicos.");
        if (!sourcePrograms.has(line.programId)) {
          const source = await tx.programPPA.findUniqueOrThrow({ where: { id: line.programId }, include: { objectives: { include: { indicators: true } } } });
          let program = await tx.programPPA.findUnique({ where: { multiYearPlanId_code: { multiYearPlanId: targetPpaId, code: source.code } } });
          if (!program && target.kind !== "PPA") throw new Error("Importe o programa no PPA de destino antes de utilizar a LDO/LOA.");
          if (!program) program = await tx.programPPA.create({ data: { multiYearPlanId: targetPpaId, code: source.code, name: source.name, type: source.type, origin: source.origin, guidelines: source.guidelines, targetAudience: source.targetAudience, financing: source.financing, managerName: source.managerName, objectives: { create: source.objectives.map((o) => ({ code: o.code, description: o.description, indicators: { create: o.indicators.map((i) => ({ name: i.name, unit: i.unit, baselineValue: i.baselineValue, targetValue: i.targetValue })) } })) } } });
          sourcePrograms.set(source.id, program.id);
        }
        programId = sourcePrograms.get(line.programId)!;
        if (!sourceActions.has(line.actionId)) {
          const source = await tx.actionPPA.findUniqueOrThrow({ where: { id: line.actionId } });
          let action = await tx.actionPPA.findFirst({ where: { programId, code: source.code } });
          if (!action && target.kind !== "PPA") throw new Error("Importe a ação no PPA de destino antes de utilizar a LDO/LOA.");
          if (!action) action = await tx.actionPPA.create({ data: { programId, code: source.code, name: source.name, type: source.type } });
          sourceActions.set(source.id, action.id);
        }
        actionId = sourceActions.get(line.actionId)!;
      }
      const imported = await tx.planningBudgetLine.create({ data: { instrumentId: target.id, kind: line.kind, code: line.code, description: line.description, year: input.targetYear, budgetUnitId: line.budgetUnitId, resourceSourceId: line.resourceSourceId, destinationEntityId: line.destinationEntityId, transferDirection: line.transferDirection, revenueNatureId: line.revenueNatureId, expenseNatureId: line.expenseNatureId, programId, actionId, functionCode: line.functionCode, subfunctionCode: line.subfunctionCode, product: line.product, productUnit: line.productUnit, physicalTarget: input.mode === "VALUES" ? line.physicalTarget : 0, originalValue: value } });
      if (target.annualBudgetLawId) {
        if (imported.kind === "REVENUE") {
          await tx.annualBudgetRevenueForecast.create({ data: { annualBudgetLawId: target.annualBudgetLawId, code: imported.code, name: imported.description, estimatedValue: value } });
          await tx.annualBudgetLaw.update({ where: { id: target.annualBudgetLawId }, data: { totalRevenue: { increment: value } } });
        } else if (imported.kind === "EXPENSE") {
          await tx.annualBudgetExpenseFixation.create({ data: { annualBudgetLawId: target.annualBudgetLawId, code: imported.code, name: imported.description, fixedValue: value } });
          await tx.annualBudgetLaw.update({ where: { id: target.annualBudgetLawId }, data: { totalExpense: { increment: value } } });
        }
      }
    }
    const batch = await tx.planningImportBatch.create({ data: { sourceInstrumentId: input.sourceInstrumentId, targetInstrumentId: target.id, targetYear: input.targetYear, mode: input.mode, selectedLineIds: lines.map((line) => line.id), fingerprint, submissionKey: input.submissionKey, importedCount: lines.length, createdById: context.user.id } });
    await tx.financialAuditLog.create({ data: { authorUsuarioId: context.user.id, action: "PLANNING_IMPORT", entityType: "PLANNING_IMPORT_BATCH", entityId: batch.id, payload: { sourceInstrumentId: input.sourceInstrumentId, targetInstrumentId: target.id, mode: input.mode, count: lines.length } } });
    return batch.id;
  });
}
