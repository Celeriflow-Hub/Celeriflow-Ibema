"use server";

import { revalidatePath } from "next/cache";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { getTransparencySettings, transparencySettingsKey, transparencySettingsSchema } from "@/lib/transparencia/presentation-settings";
import { transparencyCatalog } from "@/lib/transparencia/consultation-catalog";
import { getFile } from "@/lib/platform/blob";
import { createHash } from "node:crypto";
import { verifiedPublicationBytes, publicTransparencyPath } from "@/lib/transparencia/publication-policy";

export async function saveTransparencySettings(form: FormData): Promise<void> {
  const { prisma } = await getTenantContextForModuleOperation("TRANSPARENCIA", "update");
  const current = await getTransparencySettings(prisma);
  const settings = transparencySettingsSchema.parse({ ...current,
    initialYear: Number(form.get("initialYear")), availableYears: String(form.get("availableYears")).split(",").map(value => Number(value.trim())),
    defaultSource: form.get("defaultSource"), openingHours: String(form.get("openingHours") || ""),
    entities: current.entities.map(entity => ({ ...entity, name: String(form.get(`${entity.key}.name`)), enabled: form.has(`${entity.key}.enabled`), nativeIds: String(form.get(`${entity.key}.nativeIds`) || "").split(",").map(value => value.trim()).filter(Boolean), externalCode: form.get(`${entity.key}.externalCode`) ? Number(form.get(`${entity.key}.externalCode`)) : null })),
    queries: Object.fromEntries(transparencyCatalog.map(collection => [collection.slug, { ...current.queries[collection.slug], enabled: form.has(`query.${collection.slug}`) }])),
  });
  const instance = await prisma.configuracaoInstancia.findFirstOrThrow({ orderBy: { createdAt: "asc" }, select: { id: true } });
  await prisma.configuracaoParametroInstancia.upsert({ where: { configuracaoInstanciaId_chave: { configuracaoInstanciaId: instance.id, chave: transparencySettingsKey } }, create: { configuracaoInstanciaId: instance.id, chave: transparencySettingsKey, valor: settings }, update: { valor: settings } });
  revalidatePath("/transparencia/publicacoes"); revalidatePath(publicTransparencyPath);
}

export async function changePublicationStatus(form: FormData): Promise<void> {
  const { prisma } = await getTenantContextForModuleOperation("TRANSPARENCIA", "update");
  const id = String(form.get("id") || ""), status = String(form.get("status"));
  if (!["PUBLISHED", "WITHDRAWN"].includes(status)) throw new Error("Estado de publicação inválido.");
  const entry = await prisma.transparencyPublication.findUniqueOrThrow({ where: { id } });
  if (status === "PUBLISHED") {
    if (entry.status !== "DRAFT") throw new Error("Só rascunhos podem ser publicados. Para nova versão, faça um novo upload.");
    if (!entry.fileUrl || !entry.sha256) throw new Error("Publicação sem arquivo confirmado.");
    const file = await getFile(entry.fileUrl);
    if (!file || file.blob.pathname !== entry.filePathname) throw new Error("Arquivo indisponível.");
    verifiedPublicationBytes(new Uint8Array(await new Response(file.stream).arrayBuffer()), entry.sha256, bytes => createHash("sha256").update(bytes).digest("hex"));
  } else if (entry.status !== "PUBLISHED") throw new Error("Só publicações disponíveis podem ser retiradas.");
  const changed = await prisma.transparencyPublication.updateMany({ where: { id, status: entry.status }, data: { status, ...(status === "PUBLISHED" ? { publishedAt: new Date() } : { withdrawnAt: new Date() }) } });
  if (changed.count !== 1) throw new Error("Publicação alterada por outro usuário. Atualize a página.");
  revalidatePath("/transparencia/publicacoes"); revalidatePath(publicTransparencyPath);
}
