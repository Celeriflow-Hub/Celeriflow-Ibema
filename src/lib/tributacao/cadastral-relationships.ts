import { Prisma, type PrismaClient } from "@prisma/client";
import type { TaxActor } from "./index";
import { assertPropertyCadastralAccess } from "./property-access";
import { taxScopeSnapshot } from "./scope";

export const cadastralRelationshipCategories = ["SITUACAO", "ATRIBUTO", "CARACTERISTICA", "OBSERVACAO", "PROPRIETARIO", "PARTICIPACAO", "BCI", "AREA", "VALORACAO", "CONDOMINIO", "UNIDADE", "HISTORICO", "RECADASTRAMENTO", "CAMPANHA_RECADASTRAMENTO", "PEDIDO_ALTERACAO", "SITUACAO_FISCAL", "TRIBUTO", "ITBI", "PROCESSO", "DOCUMENTO", "ENDERECO", "CONTATO", "CNAE", "REGIME", "ESTRUTURA", "RISCO_ATIVIDADE", "CREDENCIAMENTO_NFSE", "SOCIO", "COOPERADO", "IMOVEL", "MATRIZ_FILIAL", "SIMPLES", "FATURAMENTO", "NOTIFICACAO"];

/** Observed time and legal validity are distinct: a backdated entry never reconstructs an unobserved past. */
export async function readCadastralRelationships(db: PrismaClient, actor: TaxActor, input: { entityType: "REAL_ESTATE" | "ECONOMIC_REGISTRATION"; entityId: string; at: Date }) {
  if (!Number.isFinite(input.at.getTime())) throw new Error("Referência cadastral inválida.");
  return db.$transaction(async tx => {
    let origin: Prisma.JsonValue | undefined;
    if (input.entityType === "REAL_ESTATE") origin = (await assertPropertyCadastralAccess(tx, actor, input.entityId)).profile?.data;
    else {
      await tx.economicRegistration.findUniqueOrThrow({ where: { id: input.entityId } });
      origin = (await tx.taxRegistryEntry.findFirst({ where: { entityType: input.entityType, entityId: input.entityId, category: "ECONOMIC_PROFILE" }, orderBy: { version: "desc" } }))?.data;
    }
    const scope = taxScopeSnapshot(origin);
    if (actor.allowedBudgetUnitIds && (typeof scope.budgetUnitId !== "string" || !actor.allowedBudgetUnitIds.includes(scope.budgetUnitId))) throw new Error("Relacionamentos fora da origem autorizada ou sem perfil conciliado.");
    if (origin && !await tx.planningEntityUnit.findFirst({ where: { governmentEntityId: String(scope.governmentEntityId), budgetUnitId: String(scope.budgetUnitId) } })) throw new Error("Origem cadastral não conciliada.");
    const rows = await tx.taxRegistryEntry.findMany({ where: { entityType: input.entityType, entityId: input.entityId, category: { in: cadastralRelationshipCategories }, createdAt: { lte: input.at } }, orderBy: [{ version: "desc" }, { createdAt: "desc" }, { id: "asc" }] });
    const history = rows.filter(row => {
      const data = taxScopeSnapshot(row.data);
      if (data.governmentEntityId || data.budgetUnitId) return data.governmentEntityId === scope.governmentEntityId && data.budgetUnitId === scope.budgetUnitId;
      return !actor.allowedBudgetUnitIds;
    }).map(row => ({ ...row, referenceStatus: row.reviewedAt && row.reviewedAt > input.at ? "PENDENTE_VALIDACAO" : row.status, originKnown: typeof taxScopeSnapshot(row.data).budgetUnitId === "string" }));
    const latest = new Map<string, typeof history[number]>();
    for (const row of history) {
      if (["PENDENTE_VALIDACAO", "REJEITADO"].includes(row.referenceStatus) || row.effectiveFrom > input.at) continue;
      const data = taxScopeSnapshot(row.data);
      const relation = row.category === "DOCUMENTO" ? row.documentId ?? "" : row.category === "CONDOMINIO" ? String(data.childId ?? "") : "";
      const key = JSON.stringify([row.category, row.title, relation]);
      if (!latest.has(key)) latest.set(key, row);
    }
    const position = [...latest.values()].filter(row => row.referenceStatus === "ATIVO" && row.effectiveFrom <= input.at && (!row.effectiveUntil || row.effectiveUntil > input.at));
    return { position, history, at: input.at, originKnown: Boolean(origin) };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 60000 });
}
