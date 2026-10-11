"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import { isValidPortaria344, normalizeCatmat } from "@/lib/saude/pharmacy-engine";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function run(back: string, fn: () => Promise<void>) {
  let q = "ok=1";
  try { await fn(); } catch (e) { q = `erro=${encodeURIComponent(e instanceof Error ? e.message : "Não foi possível salvar.")}`; }
  revalidatePath("/saude/farmacia/gestao");
  redirect(`/saude/farmacia/gestao?${back}&${q}`);
}

export async function saveProductRegulatory(f: FormData) {
  await run(`aba=produtos`, async () => {
    const ctx = await getTenantContextForModuleOperation("SAUDE", "update");
    const materialId = str(f, "materialId");
    const list = str(f, "portaria344List").toUpperCase();
    if (list && !isValidPortaria344(list)) throw new Error("Lista da Portaria 344 inválida.");
    const catmatCode = normalizeCatmat(str(f, "catmatCode"));
    const profile = await ctx.prisma.healthMaterialProfile.update({ where: { materialId }, data: { catmatCode, portaria344List: list || null, ...(list ? { productKind: "CONTROLLED" } : {}) } });
    if (list) await ctx.prisma.medicine.updateMany({ where: { materialId }, data: { isControlled: true } });
    await writeAuditEvent(ctx.prisma, { actorUsuarioId: ctx.user.id, eventType: auditEventTypes.formSubmit, targetType: "HEALTH_MATERIAL_PROFILE", targetId: profile.id });
  });
}

export async function saveMinMax(f: FormData) {
  await run(`aba=posicao`, async () => {
    const ctx = await getTenantContextForModuleOperation("SAUDE", "update");
    const warehouseId = str(f, "warehouseId"), materialId = str(f, "materialId");
    const min = Number(str(f, "min").replace(",", ".")), max = Number(str(f, "max").replace(",", ".") || 0);
    if (!Number.isFinite(min) || min < 0 || !Number.isFinite(max) || max < 0 || (max > 0 && max < min)) throw new Error("Informe mínimo e máximo válidos (máximo maior que o mínimo).");
    const p = await ctx.prisma.healthStockPolicy.upsert({ where: { warehouseId_materialId: { warehouseId, materialId } }, create: { warehouseId, materialId, minQuantity: min, maxQuantity: max }, update: { minQuantity: min, maxQuantity: max, isActive: true } });
    await writeAuditEvent(ctx.prisma, { actorUsuarioId: ctx.user.id, eventType: auditEventTypes.formSubmit, targetType: "HEALTH_STOCK_POLICY", targetId: p.id });
  });
}
