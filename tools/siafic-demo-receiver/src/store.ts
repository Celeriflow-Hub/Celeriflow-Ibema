import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { protocol, protocolVersion, requestHash, simulationNotice, type DemoEnvelope, type DemoReceipt } from "./contract";

export class ReceiverError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

export type ReceiverConfig = {
  receiverId: string;
  tokenHash: string;
  sourceInstanceId: string;
  datasetId: string;
  databasePath: string;
};

type ReceiptRow = { requestHash: string; receiptJson: string };
type EntityRow = { remoteEntityId: string; latestVersion: number; payloadHash: string; entityData: string; updatedAt: string };

export class ReceiverStore {
  private constructor(private readonly database: PGlite, private readonly config: ReceiverConfig) {}

  static async open(config: ReceiverConfig) {
    const database = new PGlite(config.databasePath);
    const store = new ReceiverStore(database, config);
    await store.initialize();
    return store;
  }

  async close() {
    await this.database.close();
  }

  private async initialize() {
    await this.database.exec(`
      CREATE TABLE IF NOT EXISTS "ReceiverInboxReceipt" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sourceInstanceId" TEXT NOT NULL,
        "datasetId" TEXT NOT NULL,
        "eventId" TEXT NOT NULL,
        "idempotencyKey" TEXT NOT NULL,
        "requestHash" TEXT NOT NULL,
        "processingStatus" TEXT NOT NULL,
        "receiptJson" TEXT NOT NULL,
        "createdAt" TEXT NOT NULL,
        UNIQUE ("sourceInstanceId", "datasetId", "eventId"),
        UNIQUE ("sourceInstanceId", "datasetId", "idempotencyKey")
      );
      CREATE TABLE IF NOT EXISTS "ReceiverEntity" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sourceInstanceId" TEXT NOT NULL,
        "datasetId" TEXT NOT NULL,
        "entityType" TEXT NOT NULL,
        "sourceEntityId" TEXT NOT NULL,
        "remoteEntityId" TEXT NOT NULL,
        "latestVersion" INTEGER NOT NULL,
        "payloadHash" TEXT NOT NULL,
        "entityData" TEXT NOT NULL,
        "createdAt" TEXT NOT NULL,
        "updatedAt" TEXT NOT NULL,
        UNIQUE ("sourceInstanceId", "datasetId", "entityType", "sourceEntityId"),
        UNIQUE ("sourceInstanceId", "datasetId", "remoteEntityId")
      );
      CREATE TABLE IF NOT EXISTS "ReceiverEntityVersion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sourceInstanceId" TEXT NOT NULL,
        "datasetId" TEXT NOT NULL,
        "entityType" TEXT NOT NULL,
        "sourceEntityId" TEXT NOT NULL,
        "entityVersion" INTEGER NOT NULL,
        "eventId" TEXT NOT NULL,
        "payloadHash" TEXT NOT NULL,
        "entityData" TEXT NOT NULL,
        "createdAt" TEXT NOT NULL,
        UNIQUE ("sourceInstanceId", "datasetId", "entityType", "sourceEntityId", "entityVersion")
      );
    `);
  }

  async processEvent(envelope: DemoEnvelope, idempotencyKey: string) {
    const hash = requestHash(envelope);
    return this.database.transaction(async (tx) => {
      const duplicate = await tx.query<ReceiptRow>(
        `SELECT "requestHash", "receiptJson" FROM "ReceiverInboxReceipt"
         WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 AND "idempotencyKey" = $3`,
        [envelope.sourceInstanceId, envelope.datasetId, idempotencyKey],
      );
      if (duplicate.rows.length) {
        if (duplicate.rows[0].requestHash !== hash) {
          throw new ReceiverError(409, "IDEMPOTENCY_CONFLICT", "A mesma chave foi recebida com corpo diferente.");
        }
        return { receipt: JSON.parse(duplicate.rows[0].receiptJson) as DemoReceipt, replayed: true };
      }

      const eventDuplicate = await tx.query<ReceiptRow>(
        `SELECT "requestHash", "receiptJson" FROM "ReceiverInboxReceipt"
         WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 AND "eventId" = $3`,
        [envelope.sourceInstanceId, envelope.datasetId, envelope.eventId],
      );
      if (eventDuplicate.rows.length) {
        if (eventDuplicate.rows[0].requestHash !== hash) {
          throw new ReceiverError(409, "IDEMPOTENCY_CONFLICT", "O eventId ja existe com outro corpo.");
        }
        return { receipt: JSON.parse(eventDuplicate.rows[0].receiptJson) as DemoReceipt, replayed: true };
      }

      if (envelope.entityType === "INSTRUMENT") {
        for (const party of envelope.payload.parties) {
          const dependency = await tx.query<{ id: string }>(
            `SELECT "id" FROM "ReceiverEntity" WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 AND "entityType" = 'PERSON' AND "sourceEntityId" = $3`,
            [envelope.sourceInstanceId, envelope.datasetId, party.sourcePersonId],
          );
          if (!dependency.rows.length) {
            throw new ReceiverError(409, "DEPENDENCY_MISSING", `A parte ${party.sourcePersonId} ainda nao foi recebida.`);
          }
        }
      }

      const current = await tx.query<EntityRow>(
        `SELECT "remoteEntityId", "latestVersion", "payloadHash", "entityData", "updatedAt" FROM "ReceiverEntity"
         WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 AND "entityType" = $3 AND "sourceEntityId" = $4`,
        [envelope.sourceInstanceId, envelope.datasetId, envelope.entityType, envelope.entityId],
      );
      if (current.rows.length && envelope.entityVersion <= current.rows[0].latestVersion) {
        throw new ReceiverError(409, "STALE_VERSION", "A versao recebida nao e mais recente que a versao persistida.");
      }

      const now = new Date().toISOString();
      const remoteEntityId = current.rows[0]?.remoteEntityId ?? `SIM-${envelope.entityType}-${randomUUID()}`;
      const receipt: DemoReceipt = {
        protocol,
        protocolVersion,
        receiverId: this.config.receiverId,
        receiverEnvironment: "DEMO",
        eventId: envelope.eventId,
        sourceInstanceId: envelope.sourceInstanceId,
        datasetId: envelope.datasetId,
        entityType: envelope.entityType,
        entityId: envelope.entityId,
        entityVersion: envelope.entityVersion,
        remoteEntityId,
        receiptId: `SIM-SIAFIC-${randomUUID()}`,
        processingStatus: "PROCESSED",
        processedAt: now,
        requestHash: hash,
        simulation: true,
        notice: simulationNotice,
      };
      const serializedEnvelope = JSON.stringify(envelope);
      await tx.query(
        `INSERT INTO "ReceiverEntity" ("id", "sourceInstanceId", "datasetId", "entityType", "sourceEntityId", "remoteEntityId", "latestVersion", "payloadHash", "entityData", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
         ON CONFLICT ("sourceInstanceId", "datasetId", "entityType", "sourceEntityId") DO UPDATE SET
           "latestVersion" = EXCLUDED."latestVersion", "payloadHash" = EXCLUDED."payloadHash", "entityData" = EXCLUDED."entityData", "updatedAt" = EXCLUDED."updatedAt"`,
        [randomUUID(), envelope.sourceInstanceId, envelope.datasetId, envelope.entityType, envelope.entityId, remoteEntityId, envelope.entityVersion, hash, serializedEnvelope, now],
      );
      await tx.query(
        `INSERT INTO "ReceiverEntityVersion" ("id", "sourceInstanceId", "datasetId", "entityType", "sourceEntityId", "entityVersion", "eventId", "payloadHash", "entityData", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [randomUUID(), envelope.sourceInstanceId, envelope.datasetId, envelope.entityType, envelope.entityId, envelope.entityVersion, envelope.eventId, hash, serializedEnvelope, now],
      );
      await tx.query(
        `INSERT INTO "ReceiverInboxReceipt" ("id", "sourceInstanceId", "datasetId", "eventId", "idempotencyKey", "requestHash", "processingStatus", "receiptJson", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, 'PROCESSED', $7, $8)`,
        [randomUUID(), envelope.sourceInstanceId, envelope.datasetId, envelope.eventId, idempotencyKey, hash, JSON.stringify(receipt), now],
      );
      return { receipt, replayed: false };
    });
  }

  async receiptByEvent(eventId: string) {
    const result = await this.database.query<ReceiptRow>(
      `SELECT "requestHash", "receiptJson" FROM "ReceiverInboxReceipt"
       WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 AND "eventId" = $3`,
      [this.config.sourceInstanceId, this.config.datasetId, eventId],
    );
    return result.rows[0] ? JSON.parse(result.rows[0].receiptJson) as DemoReceipt : null;
  }

  async entity(entityType: "PERSON" | "INSTRUMENT", sourceEntityId: string) {
    const result = await this.database.query<EntityRow>(
      `SELECT "remoteEntityId", "latestVersion", "payloadHash", "entityData", "updatedAt" FROM "ReceiverEntity"
       WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 AND "entityType" = $3 AND "sourceEntityId" = $4`,
      [this.config.sourceInstanceId, this.config.datasetId, entityType, sourceEntityId],
    );
    if (!result.rows[0]) return null;
    return { ...result.rows[0], entityData: JSON.parse(result.rows[0].entityData) as DemoEnvelope };
  }

  async entities(entityType: "PERSON" | "INSTRUMENT", limit: number, offset: number) {
    const items = await this.database.query<EntityRow & { sourceEntityId: string }>(
      `SELECT "sourceEntityId", "remoteEntityId", "latestVersion", "payloadHash", "entityData", "updatedAt" FROM "ReceiverEntity"
       WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 AND "entityType" = $3
       ORDER BY "updatedAt" DESC, "sourceEntityId" ASC LIMIT $4 OFFSET $5`,
      [this.config.sourceInstanceId, this.config.datasetId, entityType, limit, offset],
    );
    const count = await this.database.query<{ total: number }>(
      `SELECT COUNT(*)::int AS "total" FROM "ReceiverEntity" WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 AND "entityType" = $3`,
      [this.config.sourceInstanceId, this.config.datasetId, entityType],
    );
    return {
      total: count.rows[0]?.total ?? 0,
      rows: items.rows.map((row) => ({ ...row, entityData: JSON.parse(row.entityData) as DemoEnvelope })),
    };
  }

  async reconciliation() {
    const rows = await this.database.query<EntityRow & { entityType: "PERSON" | "INSTRUMENT"; sourceEntityId: string }>(
      `SELECT "entityType", "sourceEntityId", "remoteEntityId", "latestVersion", "payloadHash", "entityData", "updatedAt" FROM "ReceiverEntity"
       WHERE "sourceInstanceId" = $1 AND "datasetId" = $2 ORDER BY "entityType", "sourceEntityId"`,
      [this.config.sourceInstanceId, this.config.datasetId],
    );
    return rows.rows.map((row) => ({ ...row, entityData: JSON.parse(row.entityData) as DemoEnvelope }));
  }
}
