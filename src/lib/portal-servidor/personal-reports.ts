import { Prisma } from "@prisma/client";
import { z } from "zod";
import { AccessError, type AppContext } from "@/lib/platform/tenant-context";
import { ownReleasedStatementIds } from "./payroll-publication";

export const personalReportKinds = ["FICHA_FINANCEIRA", "CONTRIBUICOES", "PONTO", "FERIAS", "BANCO_HORAS", "LICENCA_PREMIO", "AFASTAMENTOS", "CONSIGNACOES", "FICHA_REGISTRO", "ATOS", "PLANOS"] as const;
export const personalReportQuerySchema = z.object({ kind: z.enum(personalReportKinds), from: z.iso.date(), until: z.iso.date(), contractId: z.string().min(1).optional(), format: z.enum(["PDF", "CSV", "XLSX"]).default("PDF") }).strict().refine(value => value.until >= value.from, "Período fora de ordem.").refine(value => !value.contractId || !["PONTO", "AFASTAMENTOS", "ATOS", "PLANOS"].includes(value.kind), "Este relatório usa o cadastro pessoal, sem filtro por contrato.");
type PersonalReport = { title: string; headers: string[]; rows: string[][] };
const civil = (value: Date | null | undefined) => value?.toISOString().slice(0, 10) || "";
const jsonObject = (value: Prisma.JsonValue) => value && !Array.isArray(value) && typeof value === "object" ? value : {};

export async function buildOwnPersonalReport(context: AppContext, raw: unknown): Promise<PersonalReport> {
  const input = personalReportQuerySchema.parse(raw), employeeId = context.user.employeeId;
  if (!employeeId || !await context.prisma.employee.findFirst({ where: { id: employeeId, isActive: true }, select: { id: true } })) throw new AccessError("Acesso funcional indisponível.", 403);
  if (input.contractId && !await context.prisma.hrEmploymentContract.findFirst({ where: { id: input.contractId, employeeId } })) throw new AccessError("Contrato indisponível.", 404);
  const from = new Date(`${input.from}T00:00:00Z`), until = new Date(`${input.until}T23:59:59.999Z`);
  const contractWhere = { employeeId, ...(input.contractId ? { id: input.contractId } : {}) };
  if (input.kind === "FICHA_FINANCEIRA" || input.kind === "CONTRIBUICOES") {
    const ids = await ownReleasedStatementIds(context.prisma, employeeId);
    const all = await context.prisma.hrPayrollStatement.findMany({ where: { id: { in: ids }, contract: contractWhere, releaseAt: { lte: new Date() }, revokedAt: null }, include: { run: { include: { payroll: true } } }, orderBy: [{ run: { createdAt: "asc" } }, { id: "asc" }] });
    const rows = all.filter(statement => { const [month, year] = statement.run.payroll.competence.split("/").map(Number); const start = new Date(Date.UTC(year, month - 1, 1)), end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); return start <= until && end >= from; });
    const snapshotSchema = z.object({ contract: z.object({ registration: z.string() }), regime: z.object({ socialSecurityScheme: z.object({ code: z.string(), name: z.string(), regime: z.string() }).nullable() }), items: z.array(z.object({ code: z.string(), name: z.string(), type: z.string(), value: z.string() })), bases: z.record(z.string(), z.string()) });
    if (input.kind === "CONTRIBUICOES") {
      const reportRows = rows.map(statement => { const snapshot = snapshotSchema.parse(statement.snapshot), scheme = snapshot.regime.socialSecurityScheme; const employee = scheme ? snapshot.items.find(item => item.code === `PREVIDENCIA_${scheme.code}`)?.value || "0.00" : "0.00", fgts = snapshot.items.find(item => item.code === "FGTS")?.value || "0.00"; return [statement.run.payroll.competence, statement.run.payroll.type, snapshot.contract.registration, scheme?.name || "Não informado", scheme ? snapshot.bases[scheme.regime] || "0.00" : "", employee, statement.employer.sub(fgts).toFixed(2), statement.id]; });
      return { title: "Contribuições previdenciárias por vínculo e competência — demonstrativos publicados", headers: ["Competência", "Tipo de folha", "Matrícula", "Previdência", "Base BRL", "Segurado BRL", "Patronal BRL", "Versão"], rows: reportRows };
    }
    const reportRows: string[][] = [];
    for (const statement of rows) {
      const snapshot = snapshotSchema.parse(statement.snapshot);
      for (const item of snapshot.items) reportRows.push([statement.run.payroll.competence, statement.run.payroll.type, snapshot.contract.registration, item.code, item.name, item.type, new Prisma.Decimal(item.value).toFixed(2), statement.id]);
      reportRows.push([statement.run.payroll.competence, statement.run.payroll.type, snapshot.contract.registration, "LIQUIDO", "Total líquido do demonstrativo", "TOTAL", statement.net.toFixed(2), statement.id]);
    }
    reportRows.push(["PERIODO", "", "", "TOTAL_LIQUIDO", "Total líquido dos demonstrativos no filtro", "TOTAL", rows.reduce((sum, row) => sum.add(row.net), new Prisma.Decimal(0)).toFixed(2), ""]);
    return { title: "Ficha financeira pessoal — valores publicados por período", headers: ["Competência", "Tipo de folha", "Matrícula", "Código", "Rubrica", "Natureza", "Valor BRL", "Versão"], rows: reportRows };
  }
  if (input.kind === "PONTO") {
    const rows = await context.prisma.attendanceRecord.findMany({ where: { employeeId, date: { gte: from, lte: until } }, orderBy: [{ date: "asc" }, { id: "asc" }] });
    const totals = rows.reduce((sum, row) => ({ hours: sum.hours.add(String(row.hoursWorked)), extra: sum.extra.add(String(row.extraHours)), bank: sum.bank.add(String(row.bankHours)) }), { hours: new Prisma.Decimal(0), extra: new Prisma.Decimal(0), bank: new Prisma.Decimal(0) });
    return { title: "Espelho de ponto pessoal — relatório integral do período", headers: ["Data", "Entrada", "Saída", "Horas trabalhadas", "Horas extras", "Banco de horas", "Situação", "Registro"], rows: [...rows.map(row => [civil(row.date), row.entryTime?.toISOString() || "", row.exitTime?.toISOString() || "", String(row.hoursWorked), String(row.extraHours), String(row.bankHours), row.status, row.id]), ["TOTAL", "", "", totals.hours.toFixed(4), totals.extra.toFixed(4), totals.bank.toFixed(4), "", ""]] };
  }
  if (["FERIAS", "BANCO_HORAS", "LICENCA_PREMIO"].includes(input.kind)) {
    const rows = await context.prisma.hrRightEntry.findMany({ where: { kind: input.kind, contract: contractWhere, periodStart: { lte: until }, periodEnd: { gte: from } }, include: { contract: { select: { registration: true } } }, orderBy: [{ periodStart: "asc" }, { createdAt: "asc" }, { id: "asc" }] });
    const reportRows = rows.map(row => { const details = jsonObject(row.details); return [row.contract.registration, civil(row.periodStart), civil(row.periodEnd), row.quantity.toString(), row.amount.toFixed(2), String(details.kind || details.reason || "Registro de origem"), String(details.scope || ""), row.id]; });
    const balances = new Map<string, { labels: string[]; quantity: Prisma.Decimal }>();
    for (const row of rows) { const labels = [row.contract.registration, civil(row.periodStart), civil(row.periodEnd), String(jsonObject(row.details).scope || "")]; const key = JSON.stringify([row.contractId, ...labels.slice(1)]); const balance = balances.get(key) || { labels, quantity: new Prisma.Decimal(0) }; balance.quantity = balance.quantity.add(row.quantity); balances.set(key, balance); }
    for (const { labels: [registration, start, end, scope], quantity } of balances.values()) reportRows.push([registration, start, end, quantity.toString(), "", "Saldo do aquisitivo/recorte", scope, ""]);
    return { title: `${input.kind === "FERIAS" ? "Direitos e saldos de férias" : input.kind === "BANCO_HORAS" ? "Compensação e banco de horas" : "Licença-prêmio: aquisitivos e operações"} — livro de origem`, headers: ["Matrícula", "Início", "Fim", "Quantidade", "Valor BRL", "Operação / fundamento", "Escopo de origem", "Registro"], rows: reportRows };
  }
  if (input.kind === "AFASTAMENTOS") {
    const leaves = await context.prisma.leave.findMany({ where: { employeeId, startDate: { lte: until }, endDate: { gte: from } }, orderBy: [{ startDate: "asc" }, { id: "asc" }] });
    const absences = await context.prisma.attendanceRecord.findMany({ where: { employeeId, status: "Falta", date: { gte: from, lte: until } }, orderBy: [{ date: "asc" }, { id: "asc" }] });
    return { title: "Afastamentos e faltas pessoais", headers: ["Categoria", "Início", "Fim", "Motivo / situação", "Registro"], rows: [...leaves.map(row => ["AFASTAMENTO", civil(row.startDate), civil(row.endDate), `${row.type} · ${row.status}`, row.id]), ...absences.map(row => ["FALTA", civil(row.date), civil(row.date), row.status, row.id])] };
  }
  if (input.kind === "CONSIGNACOES") {
    const rows = await context.prisma.hrConsignmentInstallment.findMany({ where: { agreement: { contract: contractWhere }, competenceAt: { gte: from, lte: until } }, include: { agreement: { include: { contract: { select: { registration: true } } } }, entries: true }, orderBy: [{ competenceAt: "asc" }, { id: "asc" }] });
    return { title: "Empréstimos e consignações pessoais — parcelas e operações de origem", headers: ["Matrícula", "Contrato", "Consignatária ID", "Competência", "Parcela", "Valor BRL", "Operações registradas", "Referência"], rows: rows.map(row => [row.agreement.contract.registration, row.agreement.number, row.agreement.supplierId, civil(row.competenceAt), String(row.sequence), row.amount.toFixed(2), row.entries.map(entry => entry.kind).join(" · "), row.id]) };
  }
  if (input.kind === "PLANOS") {
    const rows = await context.prisma.sstBenefitEntry.findMany({ where: { beneficiary: { payrollBenefit: { employeeId } } }, include: { beneficiary: { include: { dependent: { select: { name: true } }, plan: { include: { benefitConfig: { select: { name: true } } } } } } }, orderBy: [{ competence: "asc" }, { id: "asc" }] });
    const filtered = rows.filter(row => { const [month, year] = row.competence.split("/").map(Number); const date = new Date(Date.UTC(year, month - 1, 1)); return date <= until && new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)) >= from; });
    return { title: "Mensalidades, despesas e devoluções dos planos de saúde próprios", headers: ["Plano", "Beneficiário", "Competência", "Natureza", "Valor BRL", "Registro"], rows: filtered.map(row => [row.beneficiary.plan.benefitConfig.name, row.beneficiary.dependent?.name || "Titular", row.competence, row.kind, row.amount.toFixed(2), row.id]) };
  }
  if (input.kind === "ATOS") {
    const rows = await context.prisma.personnelAct.findMany({ where: { employeeId, date: { gte: from, lte: until } }, orderBy: [{ date: "asc" }, { id: "asc" }] });
    return { title: "Atos legais do servidor", headers: ["Data", "Tipo", "Número", "Registro"], rows: rows.map(row => [civil(row.date), row.type, row.actNumber || "", row.id]) };
  }
  const employee = await context.prisma.employee.findUniqueOrThrow({ where: { id: employeeId }, include: { person: { include: { addresses: true } }, role: true, department: true, secretariat: true, dependents: true } });
  const contracts = await context.prisma.hrEmploymentContract.findMany({ where: contractWhere, include: { revisions: true }, orderBy: { registration: "asc" } });
  const rows: string[][] = [["IDENTIFICACAO", "", "Nome", employee.name], ["IDENTIFICACAO", "", "Matrícula", employee.registration || ""], ["VINCULO_ATUAL", "", "Cargo", employee.role?.name || ""], ["VINCULO_ATUAL", "", "Lotação", employee.department?.name || employee.secretariat?.name || ""]];
  if (employee.person) for (const [field, label] of [["cpf", "CPF"], ["rg", "RG"], ["motherName", "Filiação materna"], ["fatherName", "Filiação paterna"], ["educationLevel", "Grau de instrução"], ["maritalStatus", "Estado civil"], ["email", "E-mail cadastral"], ["phonePrimary", "Telefone"]] as const) rows.push(["CADASTRO_UNICO", "", label, employee.person[field] || ""]);
  for (const dependent of employee.dependents) rows.push(["DEPENDENTE", dependent.id, dependent.relationship, `${dependent.name} · nascimento ${civil(dependent.birthDate)}`]);
  for (const contract of contracts) { rows.push(["CONTRATO", contract.id, "Matrícula / vigência / situação", `${contract.registration} · ${civil(contract.admittedAt)} a ${civil(contract.endsAt)} · ${contract.status}`]); rows.push(["CONTRATO", contract.id, "Jornada / local", `${contract.monthlyHours} horas mensais · ${contract.workLocation}`]); for (const revision of contract.revisions.filter(revision => revision.effectiveFrom <= until)) rows.push(["REVISAO", contract.id, `Versão ${revision.version}`, `${civil(revision.effectiveFrom)} · ${revision.reason}`]); }
  return { title: "Ficha de registro funcional pessoal — cadastro e revisões de origem", headers: ["Grupo", "Referência", "Campo", "Valor"], rows };
}
