"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTenantContextForModuleOperation, assertBudgetUnitAccess } from "@/lib/platform/tenant-context";
import { calculatePayrollRun, cancelPayrollRun, closePayrollRun, publishPayrollStatements, recordHrRightEntry, saveEmploymentContract, savePayrollMovement } from "@/lib/rh/workforce-service";
import { acquireVacationRights, reserveVacationRight } from "@/lib/rh/vacation-rights";
import { importPayrollMovements } from "@/lib/rh/movement-import";
import { generateBenefitMovement } from "@/lib/rh/benefit-calculation";
import { decideEmployeeHrRequest } from "@/lib/rh/portal-requests";

export async function executeWorkforceOperation(command: string, values: Record<string, string>) {
  const allowed = ["contrato", "movimento", "direito", "calcular", "fechar", "cancelar", "publicar", "vincular", "aquisitivos", "reservar-ferias", "importar", "beneficio", "decidir-solicitacao"];
  if (!allowed.includes(command)) return { error: "Operação inválida." };
  const context = await getTenantContextForModuleOperation("RH", ["contrato", "movimento", "direito", "aquisitivos", "reservar-ferias", "importar", "beneficio"].includes(command) && !values.id ? "create" : "update");
  try {
    let id = "";
    let message = "Operação registrada.";
    if (["calcular", "fechar", "cancelar", "publicar"].includes(command)) {
      const payrollId = command === "calcular" ? values.payrollId : (await context.prisma.hrPayrollRun.findUniqueOrThrow({ where: { id: values.runId } })).payrollId;
      const scope = await context.prisma.sstBenefitPayrollScope.findUnique({ where: { payrollId } });
      if (scope) assertBudgetUnitAccess(context.user, scope.budgetUnitId);
    }
    if (command === "contrato") id = (await saveEmploymentContract(context.prisma, context.user.id, { ...values, id: values.id || undefined, version: values.version || undefined, details: JSON.parse(values.details || "{}") })).id;
    if (command === "movimento") id = (await savePayrollMovement(context.prisma, context.user.id, values)).id;
    if (command === "direito") id = (await recordHrRightEntry(context.prisma, context.user.id, { ...values, details: JSON.parse(values.details || "{}") })).id;
    if (command === "aquisitivos") id = (await acquireVacationRights(context.prisma, context.user.id, values.contractId, values.asOf)).join(", ");
    if (command === "reservar-ferias") id = (await reserveVacationRight(context.prisma, context.user.id, values)).id;
    if (command === "beneficio") id = (await generateBenefitMovement(context.prisma, context.user.id, values)).id;
    if (command === "decidir-solicitacao") id = (await decideEmployeeHrRequest(context.prisma, context.user.id, values)).id;
    if (command === "importar") {
      const result = await importPayrollMovements(context.prisma, context.user.id, values);
      message = `${result.mode === "PREVIA" ? "Prévia validada; nenhum movimento gravado" : "Lote aplicado"}: ${result.lines} linhas, ${result.created} novos e ${result.reused} já existentes.`;
      id = result.hash;
    }
    if (command === "calcular") id = (await calculatePayrollRun(context.prisma, context.user.id, { ...values, contractIds: values.contractIds.split(/[\s,;]+/).filter(Boolean) })).id;
    if (command === "fechar") id = (await closePayrollRun(context.prisma, context.user.id, values.runId)).id;
    if (command === "cancelar") id = (await cancelPayrollRun(context.prisma, context.user.id, values.runId, values.reason)).id;
    if (command === "publicar") id = (await publishPayrollStatements(context.prisma, context.user.id, values.runId, new Date(values.releaseAt))).id;
    if (command === "vincular") {
      const input = z.object({ employeeId: z.string().min(1), personId: z.string().min(1) }).strict().parse(values);
      await context.prisma.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`RH:employee:${input.employeeId}`}))`;
        const employee = await tx.employee.findUniqueOrThrow({ where: { id: input.employeeId } });
        const person = await tx.person.findUniqueOrThrow({ where: { id: input.personId } });
        if (employee.personId && employee.personId !== person.id) throw new Error("Servidor já vinculado a outra pessoa física.");
        if (employee.cpf && employee.cpf.replace(/\D/g, "") !== person.cpf.replace(/\D/g, "")) throw new Error("CPF do servidor difere do cadastro central. Faça o saneamento antes de vincular.");
        await tx.employee.update({ where: { id: employee.id }, data: { personId: person.id, name: person.fullName, cpf: person.cpf } });
      });
      id = input.employeeId;
    }
    revalidatePath("/rh/operacoes");
    revalidatePath("/rh/folha");
    revalidatePath("/portal-servidor/folha");
    revalidatePath("/rh/solicitacoes");
    revalidatePath("/portal-servidor/solicitacoes-rh");
    return { id, message };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível concluir a operação." }; }
}
