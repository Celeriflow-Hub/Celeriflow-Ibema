import assert from "node:assert/strict";
import { test } from "node:test";
import { AssetAcquisitionError, normalizeAssetAcquisitionInput } from "../asset-acquisition-service";

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
