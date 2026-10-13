import { Prisma, type AccountingTransaction } from "@prisma/client";
import { recordMunicipalCostSource, cancelMunicipalCostSource } from "./cost-ledger";
import type { CostActor } from "./cost-types";

export async function recordAccountingMunicipalCosts(tx: Prisma.TransactionClient, actor: CostActor, transaction: AccountingTransaction, lines: Array<{ accountId: string; type: string; value: Prisma.Decimal | string | number }>, accounts: Array<{ id: string; code: string }>) {
  if (transaction.reversalOfId) {
    for (const type of ["MANUAL_VPD", "ADVANCE_ACCOUNTABILITY", "PAYROLL"] as const) await cancelMunicipalCostSource(tx, actor, type, transaction.reversalOfId);
    return;
  }
  const sourceType = transaction.sourceModule === "MANUAL" ? "MANUAL_VPD" : transaction.sourceModule === "RH" && transaction.sourceType === "ADVANCE_CONTROL" && transaction.eventType === "ADVANCE_APPROVED" ? "ADVANCE_ACCOUNTABILITY" : transaction.sourceModule === "RH" && transaction.sourceType === "HR_PROVISION" ? "PAYROLL" : null;
  if (!sourceType || !transaction.budgetUnitId || !transaction.governmentEntityId) return;
  const vpd = lines.filter(line => accounts.some(account => account.id === line.accountId && /^3(?:\.|\d)/.test(account.code)));
  const amount = vpd.reduce((sum, line) => sum.plus(new Prisma.Decimal(line.value).mul(line.type === "Débito" ? 1 : -1)), new Prisma.Decimal(0)).toDecimalPlaces(2);
  if (amount.lte(0)) return;
  const provision = sourceType === "PAYROLL" && transaction.sourceId ? await tx.hrRightEntry.findUniqueOrThrow({ where: { id: transaction.sourceId }, include: { contract: true } }) : null;
  const dimensions: Record<string, string> = provision ? { contractId: provision.contractId, employeeId: provision.contract.employeeId, ...(provision.contract.costCenterId ? { costCenterId: provision.contract.costCenterId } : {}) } : {};
  await recordMunicipalCostSource(tx, actor, { financialYearId: transaction.financialYearId, budgetUnitId: transaction.budgetUnitId, sourceType, sourceId: transaction.id, expenseDate: transaction.date, amount, dimensions, evidence: { transactionId: transaction.id, originType: transaction.sourceType, originId: transaction.sourceId, vpdLines: vpd.map(line => ({ accountId: line.accountId, type: line.type, value: new Prisma.Decimal(line.value).toFixed(2) })) } });
}
