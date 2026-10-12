"use server";

import { FinanceError, authorizeAccountingMonthClose, authorizeAccountingMonthReopen, configureAccountingPostingRule, finalizeAnnualAccountingClose, postAccountingTransaction, prepareAnnualAccountingClose, requestAccountingMonthClose, requestAccountingMonthReopen } from "@/lib/financeiro";
import { getTenantContextForModuleOperation, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };
const message = (error: unknown) => error instanceof FinanceError ? error.message : "Nao foi possivel concluir a operacao contabil.";

const financeActor = (context: Awaited<ReturnType<typeof getTenantContextForModuleOperation>>) => ({ usuarioId: context.user.id, employeeId: context.user.employeeId, allowedBudgetUnitIds: isSystemAdministrator(context.user) ? undefined : context.user.allowedBudgetUnitIds });

export async function postManualAccountingTransaction(data: { financialYearId: string; governmentEntityId: string; budgetUnitId: string; date: string; history: string; debitAccountId: string; creditAccountId: string; value: number }): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("FINANCEIRO", "create");
    await postAccountingTransaction(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId, allowedBudgetUnitIds: isSystemAdministrator(context.user) ? undefined : context.user.allowedBudgetUnitIds }, {
      financialYearId: data.financialYearId,
      governmentEntityId: data.governmentEntityId,
      budgetUnitId: data.budgetUnitId,
      date: new Date(data.date),
      history: data.history,
      lines: [{ accountId: data.debitAccountId, type: "Débito", value: data.value }, { accountId: data.creditAccountId, type: "Crédito", value: data.value }],
    });
    revalidatePath("/financeiro/contabilidade");
    return {};
  } catch (error) {
    return { error: message(error) };
  }
}

export async function requestMonthClose(data: { financialYearId: string; competence: string }): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("FINANCEIRO", "update");
    await requestAccountingMonthClose(context.prisma, financeActor(context), data.financialYearId, new Date(data.competence));
    revalidatePath("/financeiro/contabilidade");
    return {};
  } catch (error) {
    return { error: message(error) };
  }
}

export async function authorizeMonthClose(data: { financialYearId: string; competence: string }): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("FINANCEIRO", "update");
    await authorizeAccountingMonthClose(context.prisma, financeActor(context), data.financialYearId, new Date(data.competence));
    revalidatePath("/financeiro/contabilidade");
    return {};
  } catch (error) {
    return { error: message(error) };
  }
}

export async function requestMonthReopen(data: { financialYearId: string; competence: string; justification: string }): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("FINANCEIRO", "update");
    await requestAccountingMonthReopen(context.prisma, financeActor(context), data.financialYearId, new Date(data.competence), data.justification);
    revalidatePath("/financeiro/contabilidade");
    return {};
  } catch (error) {
    return { error: message(error) };
  }
}

export async function authorizeMonthReopen(data: { financialYearId: string; competence: string }): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("FINANCEIRO", "update");
    await authorizeAccountingMonthReopen(context.prisma, financeActor(context), data.financialYearId, new Date(data.competence));
    revalidatePath("/financeiro/contabilidade");
    return {};
  } catch (error) {
    return { error: message(error) };
  }
}

export async function prepareAnnualClose(financialYearId: string): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("FINANCEIRO", "update");
    await prepareAnnualAccountingClose(context.prisma, financeActor(context), financialYearId);
    revalidatePath("/financeiro/contabilidade");
    return {};
  } catch (error) {
    return { error: message(error) };
  }
}

export async function finalizeAnnualClose(financialYearId: string): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("FINANCEIRO", "update");
    await finalizeAnnualAccountingClose(context.prisma, financeActor(context), financialYearId);
    revalidatePath("/financeiro/contabilidade");
    revalidatePath("/financeiro/orcamento");
    return {};
  } catch (error) {
    return { error: message(error) };
  }
}

export async function savePostingRule(data: { eventCode: string; eventName: string; debitAccountId: string; creditAccountId: string }): Promise<ActionResult> {
  try {
    const context = await getTenantContextForModuleOperation("FINANCEIRO", "update");
    await configureAccountingPostingRule(context.prisma, { usuarioId: context.user.id, employeeId: context.user.employeeId }, data);
    revalidatePath("/financeiro/contabilidade");
    return {};
  } catch (error) {
    return { error: message(error) };
  }
}
