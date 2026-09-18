import type { PrismaClient } from "@prisma/client";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import { applyStockMovement } from "./stock-service";

export class AssetAcquisitionError extends Error {}

export type AssetAcquisitionActor = {
  usuarioId: string;
  employeeId?: string | null;
};

export type AssetAcquisitionInput = {
  purchaseReceiptItemId: string;
  patrimonyNumber: string;
  name: string;
  categoryId: string;
  departmentId?: string;
  responsibleId?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
};

function required(value: string | undefined, label: string) {
  const normalized = value?.trim();
  if (!normalized) throw new AssetAcquisitionError(`${label} é obrigatório.`);
  return normalized;
}

export function normalizeAssetAcquisitionInput(input: AssetAcquisitionInput) {
  return {
    purchaseReceiptItemId: required(input.purchaseReceiptItemId, "Item do recebimento"),
    patrimonyNumber: required(input.patrimonyNumber, "Número de tombamento"),
    name: required(input.name, "Nome do bem"),
    categoryId: required(input.categoryId, "Categoria patrimonial"),
    departmentId: input.departmentId?.trim() || undefined,
    responsibleId: input.responsibleId?.trim() || undefined,
    brand: input.brand?.trim() || undefined,
    model: input.model?.trim() || undefined,
    serialNumber: input.serialNumber?.trim() || undefined,
  };
}

export async function acquireAssetFromPurchaseReceipt(db: PrismaClient, actor: AssetAcquisitionActor, rawInput: AssetAcquisitionInput) {
  const input = normalizeAssetAcquisitionInput(rawInput);
  const actorUsuarioId = required(actor.usuarioId, "Usuário responsável");

  return db.$transaction(async (tx) => {
    const receiptItem = await tx.purchaseReceiptItem.findUnique({
      where: { id: input.purchaseReceiptItemId },
      include: {
        purchaseReceipt: {
          select: {
            number: true,
            receivedAt: true,
            status: true,
            contract: { select: { supplierId: true } },
          },
        },
      },
    });
    if (!receiptItem || receiptItem.purchaseReceipt.status !== "APPROVED") {
      throw new AssetAcquisitionError("O tombamento exige um item de recebimento de compra aprovado.");
    }
    if (receiptItem.quantityIncorporated >= receiptItem.quantity) {
      throw new AssetAcquisitionError("Todos os itens deste recebimento já foram tombados.");
    }

    const [category, department, responsible] = await Promise.all([
      tx.assetCategory.findFirst({ where: { id: input.categoryId, isActive: true }, select: { id: true } }),
      input.departmentId ? tx.department.findUnique({ where: { id: input.departmentId }, select: { id: true } }) : null,
      input.responsibleId ? tx.employee.findFirst({ where: { id: input.responsibleId, isActive: true }, select: { id: true } }) : null,
    ]);
    if (!category) throw new AssetAcquisitionError("Categoria patrimonial não encontrada ou inativa.");
    if (input.departmentId && !department) throw new AssetAcquisitionError("Setor responsável não encontrado.");
    if (input.responsibleId && !responsible) throw new AssetAcquisitionError("Servidor responsável não encontrado ou inativo.");

    // The compare-and-swap increment makes concurrent tombamentos compete for
    // the same remaining unit instead of over-incorporating the receipt.
    const reserved = await tx.purchaseReceiptItem.updateMany({
      where: { id: receiptItem.id, quantityIncorporated: receiptItem.quantityIncorporated },
      data: { quantityIncorporated: { increment: 1 } },
    });
    if (reserved.count !== 1) {
      throw new AssetAcquisitionError("A disponibilidade do recebimento foi alterada por outra operação. Revise e tente novamente.");
    }

    const { movement } = await applyStockMovement(tx, {
      kind: "EXIT",
      sourceType: "ASSET_ACQUISITION",
      warehouseId: receiptItem.warehouseId,
      materialId: receiptItem.materialId,
      batchNumber: receiptItem.batchNumber,
      quantity: 1,
      unitCost: receiptItem.unitCost,
      reason: `Tombamento ${input.patrimonyNumber} do recebimento ${receiptItem.purchaseReceipt.number}`,
      actor,
    });

    const asset = await tx.asset.create({
      data: {
        patrimonyNumber: input.patrimonyNumber,
        name: input.name,
        brand: input.brand,
        model: input.model,
        serialNumber: input.serialNumber,
        acquisitionDate: receiptItem.purchaseReceipt.receivedAt,
        incorporationDate: receiptItem.purchaseReceipt.receivedAt,
        acquisitionValue: receiptItem.unitCost,
        currentValue: receiptItem.unitCost,
        categoryId: category.id,
        departmentId: department?.id,
        responsibleId: responsible?.id,
        supplierId: receiptItem.purchaseReceipt.contract.supplierId,
        invoiceNumber: receiptItem.purchaseReceipt.number,
        purchaseReceiptItemId: receiptItem.id,
        stockMovementId: movement.id,
      },
    });
    await writeAuditEvent(tx, {
      actorUsuarioId,
      eventType: auditEventTypes.assetAcquiredFromReceipt,
      targetType: "ASSET",
      targetId: asset.id,
    });
    return asset;
  });
}
