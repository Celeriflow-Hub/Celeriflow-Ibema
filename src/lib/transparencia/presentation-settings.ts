import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import { MUNICIPALITY_NAME, MUNICIPALITY_INSTITUTION_NAME } from "@/lib/municipality-identity";
import { transparencySources } from "./query-contract";
export const transparencySettingsSchema = z.object({
  initialYear: z.number().int().min(1900).max(2200), availableYears: z.array(z.number().int().min(1900).max(2200)).min(1).max(100), defaultSource: z.enum(transparencySources),
  countAccess: z.boolean(), nativePersonnelPublication: z.boolean().default(false), openingHours: z.string().max(500), radarUrl: z.string().url(),
  entities: z.array(z.object({ key: z.enum(["prefeitura", "camara"]), name: z.string().min(3).max(250), enabled: z.boolean(), nativeIds: z.array(z.string().min(1)), externalCode: z.number().int().positive().nullable() }).strict()).length(2),
  queries: z.record(z.string(), z.object({ enabled: z.boolean(), title: z.string().max(200).optional(), hint: z.string().max(4000).optional(), order: z.number().int().min(0).max(1000).optional() }).strict()),
  popup: z.object({ title: z.string().max(200), text: z.string().max(4000), imageUrl: z.string().url().nullable(), startsAt: z.iso.datetime().nullable(), endsAt: z.iso.datetime().nullable(), enabled: z.boolean() }).strict(),
}).strict().refine(value => new Set(value.entities.map(entity => entity.key)).size === 2 && value.availableYears.every(year => year >= value.initialYear), "Entidades ou anos disponíveis inconsistentes.");
export type TransparencySettings = z.infer<typeof transparencySettingsSchema>;
export const transparencySettingsKey = "TRANSPARENCY_PUBLIC_PRESENTATION";
export function defaultTransparencySettings(): TransparencySettings {
  return { initialYear: 2025, availableYears: [2026, 2025], defaultSource: "API_IBEMA", countAccess: false, nativePersonnelPublication: false, openingHours: "", radarUrl: "https://pntp.atricon.org.br/consultar/", entities: [{ key: "prefeitura", name: MUNICIPALITY_INSTITUTION_NAME, enabled: true, nativeIds: [], externalCode: 1 }, { key: "camara", name: `Câmara Municipal de ${MUNICIPALITY_NAME}`, enabled: true, nativeIds: [], externalCode: null }], queries: {}, popup: { title: "", text: "", imageUrl: null, startsAt: null, endsAt: null, enabled: false } };
}
export async function getTransparencySettings(db: Pick<PrismaClient, "configuracaoParametroInstancia">) {
  const parameter = await db.configuracaoParametroInstancia.findFirst({ where: { chave: transparencySettingsKey }, orderBy: { createdAt: "asc" }, select: { valor: true } });
  if (!parameter) return defaultTransparencySettings();
  return transparencySettingsSchema.parse(parameter.valor);
}
