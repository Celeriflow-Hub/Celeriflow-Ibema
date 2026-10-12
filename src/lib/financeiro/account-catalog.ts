import { Prisma } from "@prisma/client";

/** Explicit catalogue attributes take precedence over the legacy code-prefix heuristic. */
export async function assertPublishedAccountClassification(tx: Prisma.TransactionClient, accounts: { id: string }[], date: Date) {
  const bindings = await tx.planningCatalogEntry.findMany({ where: { kind: "ACCOUNT", canonicalId: { in: accounts.map((account) => account.id) }, version: { status: "PUBLISHED" } }, include: { version: { select: { year: true } } } });
  for (const account of accounts) {
    const versions = bindings.filter((entry) => entry.canonicalId === account.id);
    if (!versions.length) continue;
    const current = versions.filter((entry) => entry.version.year === date.getUTCFullYear());
    // A municipal adoption supersedes its explicitly linked reference, preserving both immutable editions.
    const replaced = new Set(current.flatMap((entry) => {
      const attributes = entry.attributes as Prisma.JsonObject;
      return attributes.operational === true && attributes.pocOnly === false && typeof attributes.predecessorEntryId === "string" ? [attributes.predecessorEntryId] : [];
    }));
    const candidates = current.filter((entry) => !replaced.has(entry.id));
    if (candidates.length !== 1) throw new Error("Conta contábil sem versão vigente única; concilie o catálogo antes da postagem.");
    const attributes = candidates[0].attributes as Prisma.JsonObject;
    if (attributes.pocOnly === true && process.env.CELERIFLOW_ACCOUNTING_MODE !== "POC") throw new Error("Classificação de ensaio disponível somente no modo POC; homologação municipal pendente.");
    if (attributes.postingAllowed !== true) throw new Error("Conta sintética ou sem autorização de escrituração na versão vigente.");
    if (!attributes.effectiveFrom || !attributes.effectiveUntil || date.toISOString().slice(0, 10) < String(attributes.effectiveFrom) || date.toISOString().slice(0, 10) > String(attributes.effectiveUntil)) throw new Error("Conta contábil fora da vigência da classificação.");
    if (!["D", "C", "X", "DC", "D/C"].includes(String(attributes.balanceNature))) throw new Error("Natureza D/C da conta não está conciliada.");
  }
}
