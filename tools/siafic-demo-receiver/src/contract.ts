import { createHash } from "node:crypto";
import { z } from "zod";

export const protocol = "ROBONUVEM-SIAFIC-DEMO" as const;
export const protocolVersion = "1.0" as const;
export const simulationNotice = "SIMULADO - SEM VALIDADE OFICIAL" as const;

const positiveInteger = z.number().int().positive();
const decimalString = z.string().regex(/^\d+(?:\.\d{1,4})?$/);
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoInstant = z.string().datetime({ offset: true });

const personPayload = z.object({
  personKind: z.enum(["PF", "PJ"]),
  identity: z.object({ type: z.literal("SYNTHETIC"), value: z.string().min(1).max(160) }),
  legalName: z.string().min(1).max(500),
  tradeName: z.string().max(500).nullable().optional(),
  roles: z.array(z.literal("SUPPLIER")).min(1),
  registrationStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  businessActivity: z.string().max(500).nullable().optional(),
  companyType: z.string().max(100).nullable().optional(),
  cnaes: z.array(z.string().max(50)).default([]),
  email: z.string().email().nullable().optional(),
  sourceUnitCode: z.string().min(1).max(50),
  targetUnitCode: z.string().min(1).max(50),
}).strict();

const instrumentPayload = z.object({
  instrumentType: z.literal("CONTRACT"),
  number: z.string().min(1).max(120),
  year: z.number().int().min(2000).max(2200),
  sourceUnitCode: z.string().min(1).max(50),
  targetUnitCode: z.string().min(1).max(50),
  processReference: z.string().min(1).max(160),
  object: z.string().min(1).max(5_000),
  parties: z.array(z.object({ sourcePersonId: z.string().min(1), role: z.literal("SUPPLIER") }).strict()).min(1),
  signedOn: dateOnly,
  validFrom: dateOnly,
  validUntil: dateOnly,
  status: z.string().min(1).max(100),
  currency: z.literal("BRL"),
  initialAmount: decimalString,
  currentAmount: decimalString,
  items: z.array(z.object({
    sourceItemId: z.string().min(1),
    description: z.string().min(1).max(2_000),
    unit: z.string().min(1).max(50),
    quantity: decimalString,
    unitPrice: decimalString.nullable(),
    totalAmount: decimalString.nullable(),
  }).strict()),
  changes: z.array(z.unknown()).default([]),
  documentReferences: z.array(z.unknown()).default([]),
}).strict();

const common = {
  protocol: z.literal(protocol),
  protocolVersion: z.literal(protocolVersion),
  environment: z.literal("DEMO"),
  eventId: z.string().uuid(),
  sourceInstanceId: z.string().min(3).max(100),
  datasetId: z.string().min(3).max(120),
  entityId: z.string().min(1).max(200),
  entityVersion: positiveInteger,
  deliveryRevision: positiveInteger,
  operation: z.enum(["CREATE", "UPDATE", "BASELINE"]),
  occurredAt: isoInstant,
  dataClassification: z.literal("SYNTHETIC_DEMO"),
  replacesEventId: z.string().uuid().nullable(),
};

export const envelopeSchema = z.discriminatedUnion("eventType", [
  z.object({ ...common, entityType: z.literal("PERSON"), eventType: z.literal("person.snapshot"), payload: personPayload }).strict(),
  z.object({ ...common, entityType: z.literal("INSTRUMENT"), eventType: z.literal("instrument.snapshot"), payload: instrumentPayload }).strict(),
]);

export type DemoEnvelope = z.infer<typeof envelopeSchema>;

export type DemoReceipt = {
  protocol: typeof protocol;
  protocolVersion: typeof protocolVersion;
  receiverId: string;
  receiverEnvironment: "DEMO";
  eventId: string;
  sourceInstanceId: string;
  datasetId: string;
  entityType: "PERSON" | "INSTRUMENT";
  entityId: string;
  entityVersion: number;
  remoteEntityId: string;
  receiptId: string;
  processingStatus: "PROCESSED" | "REJECTED" | "RECEIVED_PENDING";
  processedAt: string;
  requestHash: string;
  simulation: true;
  notice: typeof simulationNotice;
};

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (!value || typeof value !== "object") return JSON.stringify(value) ?? "null";
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableJson(nestedValue)}`)
    .join(",")}}`;
}

export function requestHash(envelope: DemoEnvelope) {
  return `sha256:${createHash("sha256").update(stableJson(envelope), "utf8").digest("hex")}`;
}
