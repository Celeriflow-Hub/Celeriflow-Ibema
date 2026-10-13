import "server-only";
import type { PrismaClient } from "@prisma/client";
import { getTransparencyCollection, transparencyCatalog } from "./consultation-catalog";
import { getTransparencySettings, type TransparencySettings } from "./presentation-settings";
import { filterPublicDataset, type PublicDataset, type TransparencyQuery } from "./query-contract";
import { exampleTransparencyDataset } from "./example-provider";
import { loadIbemaTransparencyDataset } from "./ibema-provider";
import { nativeTransparencyDataset } from "./native-provider";
import { documentTransparencyDataset } from "./document-provider";

export function publishedTransparencyCatalog(settings: TransparencySettings) {
  return transparencyCatalog.filter(collection => settings.queries[collection.slug]?.enabled !== false).map(collection => ({ ...collection, title: settings.queries[collection.slug]?.title || collection.title, description: settings.queries[collection.slug]?.hint || collection.description })).sort((a, b) => (settings.queries[a.slug]?.order || 0) - (settings.queries[b.slug]?.order || 0) || transparencyCatalog.indexOf(transparencyCatalog.find(collection => collection.slug === a.slug)!) - transparencyCatalog.indexOf(transparencyCatalog.find(collection => collection.slug === b.slug)!));
}
export async function runTransparencyConsultation(db: PrismaClient, slug: string, query: TransparencyQuery, settings?: TransparencySettings) {
  const configuration = settings || await getTransparencySettings(db), collection = getTransparencyCollection(slug);
  if (!collection || configuration.queries[slug]?.enabled === false) throw new Error("Consulta não publicada.");
   if (!configuration.availableYears.includes(query.year)) throw new Error("Exercício não publicado na configuração.");
  if (query.entity !== "consolidado" && !configuration.entities.some(entity => entity.key === query.entity && entity.enabled)) throw new Error("Entidade não publicada.");
  let dataset: PublicDataset;
  if (query.source === "EXEMPLO") dataset = exampleTransparencyDataset(collection, query);
  else if (query.source === "API_IBEMA") dataset = await loadIbemaTransparencyDataset(collection, query, configuration);
  else if (query.source === "DOCUMENTOS") dataset = await documentTransparencyDataset(db, collection, query);
  else dataset = await nativeTransparencyDataset(db, collection, query, configuration);
   dataset.records = dataset.records.filter(record => configuration.entities.some(entity => entity.key === record.entity && entity.enabled));
   if (query.entity === "consolidado" && slug === "repasses") dataset.records = dataset.records.filter(record => record.values.internalTransfer !== true);
  return { collection, query, ...filterPublicDataset(collection, dataset, query) };
}
