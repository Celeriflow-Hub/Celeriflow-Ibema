"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTenantContextForModuleOperation, assertBudgetUnitAccess, canViewModule } from "@/lib/platform/tenant-context";
import { calculatePayrollRun, cancelPayrollRun, closePayrollRun, publishPayrollStatements, recordHrRightEntry, saveEmploymentContract, savePayrollMovement } from "@/lib/rh/workforce-service";
import { acquireVacationRights, cancelVacationReservation, reserveVacationRight } from "@/lib/rh/vacation-rights";
import { reserveMultipleVacationPeriods, cancelMultipleVacationPeriods } from "@/lib/rh/vacation-multiple-periods";
import { acquireServiceRights, reserveServiceRight, cancelServiceReservation } from "@/lib/rh/service-rights";
import { registerServiceTimeCredit, reverseServiceTimeCredit, postServiceTimeAllowance, reverseServiceTimeAllowance } from "@/lib/rh/service-time-allowance";
import { postPayrollProvisions, reversePayrollProvision } from "@/lib/rh/payroll-provisions";
import { expireTimeBankLots } from "@/lib/rh/time-bank-expiration";
import { consumeProvisionsAtCommitment, reverseProvisionCommitmentConsumption } from "@/lib/rh/provision-commitment";
import { importPayrollMovements } from "@/lib/rh/movement-import";
import { generateBenefitMovement } from "@/lib/rh/benefit-calculation";
import { decideEmployeeHrRequest } from "@/lib/rh/portal-requests";
import { adjustContractSalaries, changeContractsCollectively } from "@/lib/rh/workforce-service";
import { generateAttendanceOvertime } from "@/lib/rh/attendance-payroll";
import { decideRecertificationProposal } from "@/lib/rh/recertification";
import { dispatchPayrollExpenseRequests } from "@/lib/rh/finance-bridge";
import { simulateSpecialPayroll } from "@/lib/rh/special-simulation";
import { reserveConsignmentAgreement, postConsignmentInstallment, cancelConsignmentInstallment } from "@/lib/rh/consignment-service";
import { assertPayrollBudgetScope } from "@/lib/rh/payroll-access";
import { generateAttendanceTimeBank, reverseAttendanceTimeBank } from "@/lib/rh/time-bank";
import { registerFunctionalOccurrence, cancelFunctionalOccurrence } from "@/lib/rh/functional-occurrences";
import { transferTimeBank, reverseTimeBankTransfer } from "@/lib/rh/time-bank-transfer";
import { convertTimeBankToPayroll, reverseTimeBankPayment } from "@/lib/rh/time-bank-payment";
import { decideEmployeeCreditRequest } from "@/lib/rh/credit-requests";
import { installDocumentaryPocParameters, prepareDocumentaryPocDataset } from "@/lib/rh/poc-bootstrap";
import { requestTravelAllowance, decideTravelAllowance, accountForTravelAllowance } from "@/lib/rh/travel-allowance";
import { registerPocPayment } from "@/lib/rh/poc-payment";

export async function executeWorkforceOperation(command: string, values: Record<string, string>) {
  const allowed = ["contrato", "movimento", "direito", "calcular", "fechar", "cancelar", "publicar", "vincular", "aquisitivos", "reservar-ferias", "importar", "beneficio", "decidir-solicitacao", "reajustar", "cancelar-ferias", "ponto-horas-extras", "decidir-recadastramento", "financeiro", "simular-especial", "consignacao-reservar", "consignacao-lancar", "consignacao-cancelar", "contratos-coletivos", "ponto-banco-horas", "estornar-banco-horas"];
  if (![...allowed, "poc-pagamento", "diaria-solicitar", "diaria-decidir", "diaria-prestar", "poc-parametros", "poc-preparar", "calcular-poc", "ocorrencia", "cancelar-ocorrencia", "decidir-credito", "transferir-banco-horas", "estornar-transferencia-horas", "pagar-banco-horas", "estornar-pagamento-horas", "ferias-multiplos", "cancelar-ferias-multiplos", "licenca-adquirir", "licenca-reservar", "licenca-cancelar", "averbar-tempo", "estornar-averbacao", "apurar-ats", "estornar-ats", "provisionar", "estornar-provisao", "expirar-banco-horas", "baixar-provisao-empenho", "estornar-baixa-provisao"].includes(command)) return { error: "Operação inválida." };
  const context = await getTenantContextForModuleOperation("RH", ["contrato", "movimento", "direito", "aquisitivos", "reservar-ferias", "importar", "beneficio", "ponto-horas-extras", "ponto-banco-horas", "consignacao-reservar", "ocorrencia", "transferir-banco-horas", "pagar-banco-horas", "ferias-multiplos", "licenca-adquirir", "licenca-reservar", "averbar-tempo", "apurar-ats"].includes(command) && !values.id ? "create" : "update");
  try {
    let id = "";
    let message = "Operação registrada.";
    if (command === "poc-pagamento") {
      const run = await context.prisma.hrPayrollRun.findUniqueOrThrow({ where: { id: values.runId } });
      await assertPayrollBudgetScope(context, run.payrollId);
      id = (await registerPocPayment(context.prisma, context.user.id, values)).id;
      message = "Pagamento demonstrativo registrado por data, disponível no informe anual POC.";
    }
    if (command === "diaria-solicitar") id = (await requestTravelAllowance(context.prisma, context.user.id, values)).id;
    if (command === "diaria-decidir") id = (await decideTravelAllowance(context.prisma, context.user.id, values)).id;
    if (command === "diaria-prestar") id = (await accountForTravelAllowance(context.prisma, context.user.id, values)).id;
    if (command === "poc-parametros") {
      const result = await installDocumentaryPocParameters(context.prisma, context.user.id);
      id = result.ruleSetId; message = "Parâmetros documentais POC instalados. Valores e origens disponíveis em Parametrizações.";
    }
    if (command === "poc-preparar") {
      const result = await prepareDocumentaryPocDataset(context.prisma, context.user.id, values.competence);
      id = result.contractIds.join(", "); message = "Base preparada: três titulares fictícios, contratos temporais e nove tipos de folha. Repetição preserva cadastros e cálculos.";
    }
    if (command === "calcular-poc") {
      await assertPayrollBudgetScope(context, values.payrollId);
      const payroll = await context.prisma.payroll.findUniqueOrThrow({ where: { id: values.payrollId } });
      const result = await calculatePayrollRun(context.prisma, context.user.id, { payrollId: values.payrollId, requestKey: values.requestKey, mode: values.mode, scope: "DEMONSTRACAO", contractIds: values.contractIds.split(/[\s,;]+/).filter(Boolean), ...(payroll.type !== "Mensal" ? { specialParameters: JSON.parse(values.parameters || "{}") } : {}) });
      id = result.id; message = "Cálculo POC persistido com memória. Abra o cálculo para conferir, fechar e publicar os demonstrativos.";
    }
    if (command === "baixar-provisao-empenho") {
      id = (await consumeProvisionsAtCommitment(context, { ...values, allocations: JSON.parse(values.allocations || "[]") })).entryIds.join(", ");
      message = "Provisões baixadas e vinculadas ao empenho nativo com histórico preservado.";
    }
    if (command === "estornar-baixa-provisao") id = (await reverseProvisionCommitmentConsumption(context, values)).entryIds.join(", ");
    if (command === "expirar-banco-horas") {
      const result = await expireTimeBankLots(context.prisma, context.user.id, values);
      id = result.entryIds.join(", "); message = `${result.applied ? "Expiração aplicada" : "Prévia sem baixas"}: ${JSON.stringify(result.rows)}`;
      revalidatePath("/portal-servidor/banco-horas");
    }
    if (command === "provisionar" || command === "estornar-provisao") {
      const runId = command === "provisionar" ? values.runId : z.object({ runId: z.string() }).parse((await context.prisma.hrRightEntry.findUniqueOrThrow({ where: { id: values.entryId } })).details).runId;
      const run = await context.prisma.hrPayrollRun.findUniqueOrThrow({ where: { id: runId } });
      await assertPayrollBudgetScope(context, run.payrollId);
      id = command === "provisionar" ? (await postPayrollProvisions(context.prisma, context.user.id, values)).entryIds.join(", ") : (await reversePayrollProvision(context.prisma, context.user.id, values)).id;
      message = "Ledger de provisões atualizado com memória por rubrica. Consulte os saldos no relatório de direitos.";
    }
    if (command === "averbar-tempo") id = (await registerServiceTimeCredit(context.prisma, context.user.id, values)).id;
    if (command === "estornar-averbacao") id = (await reverseServiceTimeCredit(context.prisma, context.user.id, values)).id;
    if (command === "apurar-ats" || command === "estornar-ats") {
      const payrollId = command === "apurar-ats" ? values.payrollId : z.object({ input: z.object({ payrollId: z.string() }) }).parse((await context.prisma.hrIntegrationEvent.findUniqueOrThrow({ where: { sourceKey: values.originalSourceKey } })).payload).input.payrollId;
      await assertPayrollBudgetScope(context, payrollId);
      id = (command === "apurar-ats" ? await postServiceTimeAllowance(context.prisma, context.user.id, values) : await reverseServiceTimeAllowance(context.prisma, context.user.id, values)).movementId;
      message = "ATS registrado com memória temporal. Recalcule a folha para incorporar o movimento.";
    }
    if (command === "licenca-adquirir") {
      const result = await acquireServiceRights(context.prisma, context.user.id, values);
      id = result.ids.join(", "); message = `Aquisitivos conferidos: ${result.ids.length}; dias contados no período pendente: ${result.pending.countedDays}.`;
    }
    if (command === "licenca-reservar") id = (await reserveServiceRight(context.prisma, context.user.id, values)).id;
    if (command === "licenca-cancelar") id = (await cancelServiceReservation(context.prisma, context.user.id, values)).id;
    if (command.startsWith("licenca-")) revalidatePath("/rh/licencas");
    if (command === "ferias-multiplos") {
      const result = await reserveMultipleVacationPeriods(context.prisma, context.user.id, { ...values, allocations: JSON.parse(values.allocations || "[]") });
      id = result.sourceKey;
      message = `${result.entryIds.length} aquisitivos reservados integralmente no grupo ${result.sourceKey}.`;
    }
    if (command === "cancelar-ferias-multiplos") {
      id = (await cancelMultipleVacationPeriods(context.prisma, context.user.id, values)).entryIds.join(", ");
      message = "Grupo cancelado; todos os aquisitivos restaurados com histórico compensatório.";
    }
    if (command === "pagar-banco-horas" || command === "estornar-pagamento-horas") {
      const payrollId = command === "pagar-banco-horas" ? values.payrollId : z.object({ input: z.object({ payrollId: z.string() }) }).parse((await context.prisma.hrIntegrationEvent.findUniqueOrThrow({ where: { sourceKey: values.conversionSourceKey } })).payload).input.payrollId;
      await assertPayrollBudgetScope(context, payrollId);
      const result = command === "pagar-banco-horas" ? await convertTimeBankToPayroll(context.prisma, context.user.id, values) : await reverseTimeBankPayment(context.prisma, context.user.id, values);
      id = `${result.entryId}, ${result.movementId}`;
      message = "Banco de horas e movimento de folha conciliados na mesma transação. Recalcule a folha antes do fechamento.";
      revalidatePath("/portal-servidor/banco-horas");
    }
    if (command === "transferir-banco-horas") {
      const result = await transferTimeBank(context.prisma, context.user.id, values);
      id = `${result.sourceEntryId}, ${result.targetEntryId}`;
      message = "Transferência de horas registrada nos dois vínculos, sem pagamento financeiro.";
      revalidatePath("/portal-servidor/banco-horas");
    }
    if (command === "estornar-transferencia-horas") {
      id = (await reverseTimeBankTransfer(context.prisma, context.user.id, values)).entryIds.join(", ");
      message = "Transferência estornada com preservação do histórico dos dois vínculos.";
      revalidatePath("/portal-servidor/banco-horas");
    }
    if (command === "decidir-credito") {
      const request = await context.prisma.hrPortalRequest.findUniqueOrThrow({ where: { id: values.requestId } });
      const sourceRunId = z.object({ input: z.object({ sourceRunId: z.string() }) }).parse(request.payload).input.sourceRunId;
      const run = await context.prisma.hrPayrollRun.findUniqueOrThrow({ where: { id: sourceRunId } });
      await assertPayrollBudgetScope(context, run.payrollId);
      id = (await decideEmployeeCreditRequest(context.prisma, context.user.id, values)).id;
      revalidatePath("/rh/solicitacoes"); revalidatePath("/rh/consignacoes"); revalidatePath("/portal-servidor/solicitacoes-rh"); revalidatePath("/portal-servidor/consignacoes");
    }
    if (command === "ocorrencia") {
      const documentIds = (values.documentIds || "").split(/[\s,;]+/).filter(Boolean);
      if (documentIds.length && !canViewModule(context.user, "DOCUMENTOS")) throw new Error("Vinculação de anexos exige acesso ao GED.");
      id = (await registerFunctionalOccurrence(context.prisma, context.user.id, { ...values, documentIds, amount: values.amount || undefined })).id;
      revalidatePath("/rh/ocorrencias");
    }
    if (command === "cancelar-ocorrencia") {
      id = (await cancelFunctionalOccurrence(context.prisma, context.user.id, values)).id;
      revalidatePath("/rh/ocorrencias");
    }
    if (command.startsWith("consignacao-")) {
      const sourceRunId = command === "consignacao-reservar" ? values.sourceRunId : (await context.prisma.hrConsignmentInstallment.findUniqueOrThrow({ where: { id: values.installmentId }, include: { agreement: true } })).agreement.sourceRunId;
      const sourceRun = await context.prisma.hrPayrollRun.findUniqueOrThrow({ where: { id: sourceRunId } });
      await assertPayrollBudgetScope(context, sourceRun.payrollId);
      if (command === "consignacao-reservar") id = (await reserveConsignmentAgreement(context.prisma, context.user.id, values)).id;
      if (command === "consignacao-lancar") {
        await assertPayrollBudgetScope(context, values.payrollId);
        id = (await postConsignmentInstallment(context.prisma, context.user.id, values)).id;
      }
      if (command === "consignacao-cancelar") id = (await cancelConsignmentInstallment(context.prisma, context.user.id, values)).id;
      revalidatePath("/rh/consignacoes");
      revalidatePath("/portal-servidor/margem");
    }
    if (["calcular", "simular-especial", "fechar", "cancelar", "publicar"].includes(command)) {
      const payrollId = ["calcular", "simular-especial"].includes(command) ? values.payrollId : (await context.prisma.hrPayrollRun.findUniqueOrThrow({ where: { id: values.runId } })).payrollId;
      const scope = await context.prisma.sstBenefitPayrollScope.findUnique({ where: { payrollId } });
      if (scope) assertBudgetUnitAccess(context.user, scope.budgetUnitId);
    }
    if (command === "contrato") {
      const entries = Object.entries(values);
      const customFields = Object.fromEntries(entries.filter(([key]) => key.startsWith("custom:")).map(([key, value]) => [key.slice(7), value]));
      const standard = Object.fromEntries(entries.filter(([key]) => !key.startsWith("custom:")));
      id = (await saveEmploymentContract(context.prisma, context.user.id, { ...standard, id: values.id || undefined, version: values.version || undefined, details: JSON.parse(values.details || "{}"), ...(values.customFieldsPolicyHash || Object.keys(customFields).length ? { customFields } : {}) })).id;
    }
    if (command === "movimento") id = (await savePayrollMovement(context.prisma, context.user.id, values)).id;
    if (command === "direito") id = (await recordHrRightEntry(context.prisma, context.user.id, { ...values, details: JSON.parse(values.details || "{}") })).id;
    if (command === "aquisitivos") id = (await acquireVacationRights(context.prisma, context.user.id, values.contractId, values.asOf)).join(", ");
    if (command === "reservar-ferias") id = (await reserveVacationRight(context.prisma, context.user.id, values)).id;
    if (command === "cancelar-ferias") id = (await cancelVacationReservation(context.prisma, context.user.id, values)).id;
    if (command === "beneficio") id = (await generateBenefitMovement(context.prisma, context.user.id, values)).id;
    if (command === "ponto-horas-extras") {
      const result = await generateAttendanceOvertime(context.prisma, context.user.id, values);
      message = `${result.records} registros de ponto conciliados; ${result.movements.length} movimentos vinculados.`;
    }
    if (command === "ponto-banco-horas") {
      const result = await generateAttendanceTimeBank(context.prisma, context.user.id, values);
      id = result.ids.join(", "); message = `${result.records} registros de banco de horas conciliados no extrato de direitos.`;
    }
    if (command === "estornar-banco-horas") {
      id = (await reverseAttendanceTimeBank(context.prisma, context.user.id, values)).id;
      message = "Estorno compensatório registrado, com preservação do ponto e da entrada original.";
    }
    if (command === "decidir-solicitacao") id = (await decideEmployeeHrRequest(context.prisma, context.user.id, values)).id;
    if (command === "decidir-recadastramento") id = (await decideRecertificationProposal(context.prisma, context.user.id, values)).id;
    if (command === "financeiro") {
      const result = await dispatchPayrollExpenseRequests(context, values);
      message = `${result.applied ? "Solicitações de despesa geradas" : "Prévia sem geração financeira"}: ${JSON.stringify(result.lines)}`;
      id = result.expenseIds.join(", ");
      revalidatePath("/financeiro/orcamento");
    }
    if (command === "reajustar") {
      const result = await adjustContractSalaries(context.prisma, context.user.id, { ...values, contractIds: values.contractIds.split(/[\s,;]+/).filter(Boolean) });
      id = result.previewHash;
      message = `${result.applied ? "Lote aplicado" : "Prévia sem gravação; copie o hash para aplicar"}: ${JSON.stringify(result.rows)}`;
    }
    if (command === "contratos-coletivos") {
      const result = await changeContractsCollectively(context.prisma, context.user.id, { ...values, changes: JSON.parse(values.changes || "{}"), contractIds: values.contractIds.split(/[\s,;]+/).filter(Boolean) });
      id = result.previewHash;
      message = `${result.applied ? "Alterações aplicadas" : "Prévia sem gravação; copie o hash para aplicar"}: ${JSON.stringify(result.rows)}`;
    }
    if (command === "importar") {
      const result = await importPayrollMovements(context.prisma, context.user.id, values);
      message = `${result.mode === "PREVIA" ? "Prévia validada; nenhum movimento gravado" : "Lote aplicado"}: ${result.lines} linhas, ${result.created} novos e ${result.reused} já existentes.`;
      id = result.hash;
    }
    if (command === "calcular") id = (await calculatePayrollRun(context.prisma, context.user.id, { ...values, contractIds: values.contractIds.split(/[\s,;]+/).filter(Boolean) })).id;
    if (command === "simular-especial") {
      id = (await simulateSpecialPayroll(context.prisma, context.user.id, { ...values, contractIds: values.contractIds.split(/[\s,;]+/).filter(Boolean), parameters: JSON.parse(values.parameters || "{}") })).id;
      message = "Cenário especial persistido para conferência. Sem fechamento, desligamento, baixa de direitos ou geração financeira.";
    }
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
    revalidatePath("/rh/poc");
    revalidatePath("/rh/diarias");
    revalidatePath("/rh/parametrizacoes");
    revalidatePath("/rh/folha");
    revalidatePath("/portal-servidor/folha");
    revalidatePath("/rh/solicitacoes");
    revalidatePath("/portal-servidor/solicitacoes-rh");
    revalidatePath("/portal-servidor/recadastramento");
    revalidatePath("/cadastros/pessoas-fisicas");
    return { id, message };
  } catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível concluir a operação." }; }
}
