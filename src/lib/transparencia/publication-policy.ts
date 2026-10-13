import { z } from "zod";
import { getTransparencyCollection } from "./consultation-catalog";

export const publicationMetadataSchema = z.object({
  title: z.string().trim().min(3).max(250),
  collectionSlug: z.string().refine(value => Boolean(getTransparencyCollection(value)), "Consulta desconhecida."),
  entity: z.enum(["prefeitura", "camara"]),
  year: z.coerce.number().int().min(1900).max(2200),
  group: z.string().trim().min(2).max(200),
  referencePeriod: z.string().trim().min(1).max(200),
});

export function verifiedPublicationBytes(bytes: Uint8Array, expectedHash: string, hash: (bytes: Uint8Array) => string) {
  if (!/^[a-f0-9]{64}$/.test(expectedHash) || hash(bytes) !== expectedHash) throw new Error("Arquivo não corresponde ao conteúdo publicado.");
  return bytes;
}

export const publicTransparencyPath = "/portal/portaldatransparencia";
