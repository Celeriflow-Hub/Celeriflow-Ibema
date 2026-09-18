import assert from "node:assert/strict";
import { test } from "node:test";
import { AssetAcquisitionError, acquireAssetFromPurchaseReceipt, normalizeAssetAcquisitionInput } from "../asset-acquisition-service";

test("C5 requires a receipt item and an identifiable asset before tombamento", () => {
  assert.throws(
    () => normalizeAssetAcquisitionInput({ purchaseReceiptItemId: "", patrimonyNumber: "", name: "", categoryId: "" }),
    AssetAcquisitionError,
  );
});

test("C5 normalizes optional asset acquisition identifiers", () => {
  assert.deepEqual(
    normalizeAssetAcquisitionInput({
      purchaseReceiptItemId: " receipt-item ", patrimonyNumber: " TOM-1 ", name: " Notebook ", categoryId: " category ", brand: " Dell ",
    }),
    { purchaseReceiptItemId: "receipt-item", patrimonyNumber: "TOM-1", name: "Notebook", categoryId: "category", departmentId: undefined, responsibleId: undefined, brand: "Dell", model: undefined, serialNumber: undefined },
  );
});

test("tombamento reserves one receipt unit and removes it from free stock atomically", async () => {
  const receiptUpdates: Array<Record<string, unknown>> = [];
  const stockMovements: Array<Record<string, unknown>> = [];
  const assetCreates: Array<Record<string, unknown>> = [];
  const transaction = {
    purchaseReceiptItem: {
      findUnique: async () => ({
        id: "receipt-item-1",
        quantity: 5,
        quantityIncorporated: 1,
        warehouseId: "warehouse-1",
        materialId: "material-1",
        batchNumber: "LOTE-1",
        unitCost: 4800,
        purchaseReceipt: {
          number: "NF-DEMO-0052",
          receivedAt: new Date("2026-09-10T12:00:00.000Z"),
          status: "APPROVED",
          contract: { supplierId: "supplier-1" },
        },
      }),
      updateMany: async ({ data, where }: { data: Record<string, unknown>; where: Record<string, unknown> }) => {
        receiptUpdates.push({ data, where });
        return { count: 1 };
      },
    },
    assetCategory: { findFirst: async () => ({ id: "category-1" }) },
    warehouse: { findFirst: async () => ({ id: "warehouse-1" }) },
    material: { findUnique: async () => ({ id: "material-1" }) },
    inventorySession: { findFirst: async () => null },
    materialStock: {
      findUnique: async () => ({ id: "stock-1", unitCost: 4800 }),
      updateMany: async () => ({ count: 1 }),
    },
    materialMovement: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        stockMovements.push(data);
        return { id: "stock-movement-1" };
      },
    },
    asset: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        assetCreates.push(data);
        return { id: "asset-1", ...data };
      },
    },
    auditEvent: { create: async () => ({ id: "audit-1" }) },
  };
  const database = { $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction) };

  await acquireAssetFromPurchaseReceipt(database as never, { usuarioId: "user-1", employeeId: "employee-1" }, {
    purchaseReceiptItemId: "receipt-item-1",
    patrimonyNumber: "PAT-DEMO-0001",
    name: "Notebook administrativo",
    categoryId: "category-1",
  });

  assert.deepEqual(receiptUpdates[0], {
    where: { id: "receipt-item-1", quantityIncorporated: 1 },
    data: { quantityIncorporated: { increment: 1 } },
  });
  assert.equal(stockMovements[0]?.type, "Saída");
  assert.equal(stockMovements[0]?.quantity, 1);
  assert.match(String(stockMovements[0]?.reason), /PAT-DEMO-0001/);
  assert.equal(assetCreates[0]?.stockMovementId, "stock-movement-1");
  assert.equal(assetCreates[0]?.purchaseReceiptItemId, "receipt-item-1");
});

test("tombamento rejects a receipt unit claimed concurrently before moving stock", async () => {
  const transaction = {
    purchaseReceiptItem: {
      findUnique: async () => ({
        id: "receipt-item-1",
        quantity: 5,
        quantityIncorporated: 4,
        warehouseId: "warehouse-1",
        materialId: "material-1",
        batchNumber: "",
        unitCost: 4800,
        purchaseReceipt: {
          number: "NF-DEMO-0052",
          receivedAt: new Date("2026-09-10T12:00:00.000Z"),
          status: "APPROVED",
          contract: { supplierId: "supplier-1" },
        },
      }),
      updateMany: async () => ({ count: 0 }),
    },
    assetCategory: { findFirst: async () => ({ id: "category-1" }) },
  };
  const database = { $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction) };

  await assert.rejects(
    acquireAssetFromPurchaseReceipt(database as never, { usuarioId: "user-1" }, {
      purchaseReceiptItemId: "receipt-item-1",
      patrimonyNumber: "PAT-DEMO-0002",
      name: "Notebook administrativo",
      categoryId: "category-1",
    }),
    /disponibilidade do recebimento foi alterada/,
  );
});
