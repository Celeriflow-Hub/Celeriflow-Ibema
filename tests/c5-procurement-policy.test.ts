import assert from "node:assert/strict";
import { test } from "node:test";
import { approvePurchaseReceipt, ProcurementLifecycleError } from "../src/lib/compras/procurement-lifecycle";
import { normalizeStockMovement, StockServiceError } from "../src/lib/patrimonio/stock-service";

const actor = { usuarioId: "user-1", employeeId: "employee-1" };

test("C5 rejects manual stock entries before any database operation", () => {
  assert.throws(
    () => normalizeStockMovement({ kind: "ENTRY", warehouseId: "warehouse-1", materialId: "material-1", quantity: 1, actor }),
    StockServiceError,
  );
  assert.equal(
    normalizeStockMovement({ kind: "ENTRY", sourceType: "APPROVED_PURCHASE_RECEIPT", warehouseId: "warehouse-1", materialId: "material-1", quantity: 1, actor }).sourceType,
    "APPROVED_PURCHASE_RECEIPT",
  );
});

test("C5 rejects a receipt without items before any database operation", async () => {
  await assert.rejects(
    approvePurchaseReceipt({} as never, actor, {
      number: "REC-1",
      receivedAt: new Date("2026-08-17T12:00:00.000Z"),
      contractId: "contract-1",
      documentId: "document-1",
      receiverId: "employee-2",
      attesterId: "employee-3",
      idempotencyKey: "receipt-1",
      items: [],
    }),
    ProcurementLifecycleError,
  );
});

test("C5 requires separate receiver and attester before any database operation", async () => {
  await assert.rejects(
    approvePurchaseReceipt({} as never, actor, {
      number: "REC-1",
      receivedAt: new Date("2026-08-17T12:00:00.000Z"),
      contractId: "contract-1",
      documentId: "document-1",
      receiverId: "employee-2",
      attesterId: "employee-2",
      idempotencyKey: "receipt-2",
      items: [{ purchaseProcessItemId: "process-item-1", materialId: "material-1", warehouseId: "warehouse-1", quantity: 1, unitCost: 10 }],
    }),
    ProcurementLifecycleError,
  );
});
