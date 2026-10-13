import { Prisma } from "@prisma/client";
import { cancelMunicipalCostSource, recordMunicipalCostSource } from "./cost-ledger";
import type { CostActor } from "./cost-types";

export async function recordSettlementMunicipalCosts(tx: Prisma.TransactionClient, actor: CostActor, settlementId: string) {
  const settlement = await tx.settlement.findUniqueOrThrow({ where: { id: settlementId }, include: { commitment: { include: { appropriation: { include: { expenseNature: true } }, reservation: { include: { expense: true } } } } } });
  const expense = settlement.commitment.reservation?.expense;
  // Adiantamento é direito a prestar contas; VPD e custo nascem na prestação.
  if (expense?.sourceModule === "RH" && expense.sourceType === "ADVANCE_ALLOWANCE") return;
  if (!settlement.valueDecimal) return;
  const appropriation = settlement.commitment.appropriation;
  // Recebimento de materiais permanece em estoque; investimentos são ativos,
  // não custo de serviço. Apropriação ocorre no consumo/depreciação canônicos.
  if (settlement.commitment.purchaseReceiptId || appropriation.expenseNature.code.replace(/\D/g, "").startsWith("4")) return;
  const release = expense?.sourceModule === "RH" ? await tx.hrIntegrationEvent.findUnique({ where: { sourceKey: `CONTABIL:PROVISAO:BAIXA:${settlement.id}` } }) : null;
  const releaseMemory = release?.status === "CONCLUIDA" && release.payload && typeof release.payload === "object" && !Array.isArray(release.payload) ? release.payload.rows : null;
  const released = Array.isArray(releaseMemory) ? releaseMemory.reduce<Prisma.Decimal>((sum, row) => {
    if (!row || typeof row !== "object" || Array.isArray(row) || typeof row.amount !== "string") throw new Error("Baixa de provisão sem memória Decimal conciliada.");
    return sum.plus(row.amount);
  }, new Prisma.Decimal(0)) : new Prisma.Decimal(0);
  const amount = settlement.valueDecimal.minus(released);
  if (amount.lt(0)) throw new Error("Provisões baixadas excedem a liquidação.");
  if (amount.isZero()) return;
  const sourceType = expense?.sourceType === "PAYROLL_RUN" ? "PAYROLL" : "SETTLEMENT";
  await recordMunicipalCostSource(tx, actor, { financialYearId: appropriation.financialYearId, budgetUnitId: appropriation.budgetUnitId, sourceType, sourceId: settlement.id, expenseDate: settlement.date, amount, dimensions: { appropriationId: appropriation.id, ...(settlement.commitment.contractId ? { contractId: settlement.commitment.contractId } : {}) }, evidence: { settlementId: settlement.id, commitmentId: settlement.commitmentId, documentId: settlement.documentId, expenseId: expense?.id ?? null, originType: expense?.sourceType ?? null, originId: expense?.sourceId ?? null, settledAmount: settlement.valueDecimal.toFixed(2), provisionReleaseAmount: released.toFixed(2), provisionReleaseEventId: release?.id ?? null } });
}

export async function cancelSettlementMunicipalCosts(tx: Prisma.TransactionClient, actor: CostActor, settlementId: string) {
  for (const type of ["SETTLEMENT", "PAYROLL"] as const) await cancelMunicipalCostSource(tx, actor, type, settlementId);
}
