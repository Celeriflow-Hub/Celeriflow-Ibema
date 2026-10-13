import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { resolveContractRevision } from "@/lib/rh/contract-timeline";
import { assertCostScope } from "@/lib/financeiro/cost-ledger";
import type { CostActor } from "@/lib/financeiro/cost-types";

export const workforceStatisticsInput = z.object({ financialYearId: z.string().min(1), referenceDate: z.iso.date(), roleId: z.string().optional(), employeeId: z.string().optional(), salaryLevel: z.string().max(200).optional(), roleStatus: z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL") });

export async function readControlWorkforceStatistics(db: PrismaClient, actor: CostActor, raw: z.input<typeof workforceStatisticsInput>) {
  const input = workforceStatisticsInput.parse(raw);
  const reference = new Date(`${input.referenceDate}T23:59:59.999Z`);
  return db.$transaction(async tx => {
    const year = await assertCostScope(tx, actor, input.financialYearId);
    if (reference.getUTCFullYear() !== year.year) throw new Error("A data de referência deve pertencer ao exercício da entidade.");
    const units = await tx.planningEntityUnit.findMany({ where: { governmentEntityId: year.governmentEntityId!, ...(actor.allowedBudgetUnitIds ? { budgetUnitId: { in: actor.allowedBudgetUnitIds } } : {}) }, select: { budgetUnit: { select: { secretariatId: true } } } });
    const centers = await tx.costCenter.findMany({ where: { governmentEntityId: year.governmentEntityId, secretariatId: { in: units.map(unit => unit.budgetUnit.secretariatId) } }, select: { id: true, name: true } });
    const centerNames = new Map(centers.map(center => [center.id, center.name]));
    // Include contracts historically assigned to authorized centers even if
    // their current center changed. Scope is checked again in the chosen revision.
    const contracts = await tx.hrEmploymentContract.findMany({ where: { ...(input.employeeId ? { employeeId: input.employeeId } : {}), OR: [{ costCenterId: { in: centers.map(center => center.id) } }, { revisions: { some: { effectiveFrom: { lte: reference }, OR: centers.map(center => ({ snapshot: { path: ["costCenterId"], equals: center.id } })) } } }] }, include: { employee: { select: { id: true, name: true } }, revisions: { where: { effectiveFrom: { lte: reference } }, orderBy: [{ effectiveFrom: "desc" }, { version: "desc" }] } }, orderBy: [{ registration: "asc" }, { id: "asc" }] });
    const positions = contracts.flatMap(contract => {
      if (!contract.revisions.length) return [];
      const { contract: historical, revisionId } = resolveContractRevision(contract, contract.revisions, { start: reference, end: reference });
      if (!historical.costCenterId || !centerNames.has(historical.costCenterId) || historical.admittedAt > reference || (historical.endsAt && historical.endsAt.toISOString().slice(0, 10) < input.referenceDate) || historical.status !== "ATIVO" || (input.roleId && historical.roleId !== input.roleId) || (input.salaryLevel && historical.salaryLevel !== input.salaryLevel)) return [];
      return [{ contractId: historical.id, employeeId: historical.employeeId, employeeName: contract.employee.name, registration: historical.registration, roleId: historical.roleId, salaryLevel: historical.salaryLevel ?? "", costCenterId: historical.costCenterId, costCenterName: centerNames.get(historical.costCenterId)!, workLocation: historical.workLocation, revisionId, version: historical.version }];
    });
    const roles = await tx.role.findMany({ where: { ...(input.roleId ? { id: input.roleId } : {}), ...(input.roleStatus === "ALL" ? {} : { isActive: input.roleStatus === "ACTIVE" }) }, select: { id: true, name: true, isActive: true }, orderBy: [{ name: "asc" }, { id: "asc" }] });
    const roleNames = new Map(roles.map(role => [role.id, role]));
    const rows = positions.filter(position => roleNames.has(position.roleId)).map(position => ({ ...position, roleName: roleNames.get(position.roleId)!.name, roleCurrentlyActive: roleNames.get(position.roleId)!.isActive }));
    const groups = roles.map(role => { const selected = rows.filter(row => row.roleId === role.id); return { id: role.id, name: role.name, currentlyActive: role.isActive, people: new Set(selected.map(row => row.employeeId)).size, contracts: selected.length }; });
    return { referenceDate: input.referenceDate, governmentEntityId: year.governmentEntityId!, groups, rows, totalPeople: new Set(rows.map(row => row.employeeId)).size, totalContracts: rows.length, missingRevisionCount: contracts.filter(contract => !contract.revisions.length).length, missingRoleCount: positions.filter(position => !roleNames.has(position.roleId) && input.roleStatus === "ALL").length, metadata: "Nomes e atividade dos cargos são cadastrais atuais; cargo/enquadramento/localização dos vínculos provêm da revisão vigente na data. Inatividade cadastral não comprova extinção legal histórica." };
  }, { isolationLevel: "RepeatableRead", timeout: 60000 });
}

export function controlWorkforceStatisticsReport(data: Awaited<ReturnType<typeof readControlWorkforceStatistics>>) {
  return { title: `Controle Interno — estatísticas funcionais em ${data.referenceDate}`, headers: ["Tipo", "Referência", "Cargo ID", "Cargo (nome atual)", "Atividade cadastral atual", "Servidor ID", "Servidor (nome atual)", "Matrícula", "Enquadramento histórico", "Centro ID", "Centro (nome atual)", "Localização histórica", "Revisão ID", "Versão", "Pessoas distintas", "Vínculos", "Memória/limites"], rows: [
    ...data.groups.map(group => ["CARGO", data.referenceDate, group.id, group.name, group.currentlyActive ? "ATIVO" : "INATIVO", "", "", "", "", "", "", "", "", "", String(group.people), String(group.contracts), "Pessoas por cargo não são aditivas"]),
    ...data.rows.map(row => ["VINCULO", data.referenceDate, row.roleId, row.roleName, row.roleCurrentlyActive ? "ATIVO" : "INATIVO", row.employeeId, row.employeeName, row.registration, row.salaryLevel, row.costCenterId, row.costCenterName, row.workLocation, row.revisionId, String(row.version), "", "1", "Posição contratual na referência"]),
    ["TOTAL", data.referenceDate, "", "", "", "", "", "", "", "", "", "", "", "", String(data.totalPeople), String(data.totalContracts), data.metadata],
    ["CONFERENCIA", data.referenceDate, "", "", "", "", "", "", "", "", "", "", "", "", "", "", `Candidatos sem revisão: ${data.missingRevisionCount}; vínculos sem cargo: ${data.missingRoleCount}`],
  ] };
}
