import { type Prisma, type PrismaClient } from "@prisma/client";
import { applyStockMovement } from "@/lib/patrimonio/stock-service";

type Db = PrismaClient;
type Tx = Prisma.TransactionClient;

export class ProcurementLifecycleError extends Error {}

export type ProcurementActor = {
  usuarioId: string;
  employeeId: string | null;
};

function required(value: string | null | undefined, label: string) {
  const normalized = value?.trim();
  if (!normalized) throw new ProcurementLifecycleError(`${label} é obrigatório.`);
  return normalized;
}

function quantity(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) throw new ProcurementLifecycleError(`${label} deve ser maior que zero.`);
  return value;
}

function idempotencyKey(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

async function writeLifecycleEvent(
  tx: Tx,
  input: { eventType: string; entityType: string; entityId: string; sourceType?: string; sourceId?: string; actorUsuarioId: string; idempotencyKey: string },
) {
  await tx.procurementLifecycleEvent.create({ data: input });
}

export async function approvePurchaseRequest(db: Db, actor: ProcurementActor, purchaseRequestId: string) {
  const actorEmployeeId = required(actor.employeeId, "Servidor aprovador");
  const requestId = required(purchaseRequestId, "Solicitação de compra");
  const eventKey = `C5:PURCHASE_REQUEST:${requestId}:APPROVE`;
  return db.$transaction(async (tx) => {
    const existingEvent = await tx.procurementLifecycleEvent.findUnique({ where: { idempotencyKey: eventKey }, select: { id: true } });
    if (existingEvent) return tx.purchaseRequest.findUniqueOrThrow({ where: { id: requestId } });

    const request = await tx.purchaseRequest.findUnique({ where: { id: requestId }, include: { items: true } });
    if (!request) throw new ProcurementLifecycleError("Solicitação de compra não encontrada.");
    if (!request.items.length) throw new ProcurementLifecycleError("A solicitação deve possuir ao menos um item antes da aprovação.");
    if (!['Rascunho', 'Enviada'].includes(request.status)) throw new ProcurementLifecycleError("Somente solicitações em rascunho ou enviadas podem ser aprovadas.");
    if (request.requesterId === actorEmployeeId) throw new ProcurementLifecycleError("Segregação de funções: o solicitante não pode aprovar a própria solicitação.");

    const approved = await tx.purchaseRequest.update({
      where: { id: request.id },
      data: { status: "Aprovada", approvedByEmployeeId: actorEmployeeId, approvedAt: new Date() },
    });
    await writeLifecycleEvent(tx, {
      eventType: "PURCHASE_REQUEST_APPROVED",
      entityType: "PURCHASE_REQUEST",
      entityId: approved.id,
      sourceType: "PURCHASE_REQUEST",
      sourceId: approved.id,
      actorUsuarioId: actor.usuarioId,
      idempotencyKey: eventKey,
    });
    return approved;
  });
}

export async function createPurchaseProcessFromApprovedRequest(
  db: Db,
  actor: ProcurementActor,
  input: { purchaseRequestId: string; number: string; type: string; modality?: string; idempotencyKey?: string },
) {
  const purchaseRequestId = required(input.purchaseRequestId, "Solicitação de compra");
  const number = required(input.number, "Número do processo");
  const type = required(input.type, "Tipo do processo");
  const eventKey = idempotencyKey(input.idempotencyKey, `C5:PURCHASE_PROCESS:${purchaseRequestId}:${number}`);
  return db.$transaction(async (tx) => {
    const existingEvent = await tx.procurementLifecycleEvent.findUnique({ where: { idempotencyKey: eventKey }, select: { entityId: true } });
    if (existingEvent) return tx.purchaseProcess.findUniqueOrThrow({ where: { id: existingEvent.entityId } });

    const request = await tx.purchaseRequest.findUnique({ where: { id: purchaseRequestId }, include: { items: true } });
    if (!request) throw new ProcurementLifecycleError("Solicitação de compra não encontrada.");
    if (request.status !== "Aprovada") throw new ProcurementLifecycleError("O processo de compra exige uma solicitação aprovada.");
    if (!request.items.length) throw new ProcurementLifecycleError("A solicitação aprovada não possui itens.");

    const process = await tx.purchaseProcess.create({
      data: {
        number,
        object: request.object,
        type,
        modality: input.modality?.trim() || undefined,
        estimatedValue: request.estimatedValue,
        status: "Em Planejamento",
        secretariatId: request.secretariatId,
        purchaseRequestId: request.id,
        items: {
          create: request.items.map((item) => ({
            // Catalog and material identities are copied only from their own fields.
            catalogItemId: item.catalogItemId,
            materialId: item.materialId,
            customName: item.customName,
            quantity: item.quantity,
            estimatedUnitValue: item.estimatedUnitValue,
          })),
        },
      },
    });
    await writeLifecycleEvent(tx, {
      eventType: "PURCHASE_PROCESS_CREATED",
      entityType: "PURCHASE_PROCESS",
      entityId: process.id,
      sourceType: "PURCHASE_REQUEST",
      sourceId: request.id,
      actorUsuarioId: actor.usuarioId,
      idempotencyKey: eventKey,
    });
    return process;
  });
}

export type ApprovePurchaseReceiptInput = {
  number: string;
  receivedAt: Date;
  contractId: string;
  documentId: string;
  receiverId: string;
  attesterId: string;
  idempotencyKey: string;
  items: Array<{
    purchaseProcessItemId: string;
    materialId: string;
    warehouseId: string;
    quantity: number;
    unitCost: number;
    batchNumber?: string;
    expirationDate?: Date;
  }>;
};

export async function approvePurchaseReceipt(db: Db, actor: ProcurementActor, rawInput: ApprovePurchaseReceiptInput) {
  const input = {
    ...rawInput,
    number: required(rawInput.number, "Número do recebimento"),
    contractId: required(rawInput.contractId, "Contrato"),
    documentId: required(rawInput.documentId, "Documento GED"),
    receiverId: required(rawInput.receiverId, "Recebedor"),
    attesterId: required(rawInput.attesterId, "Atestador"),
    idempotencyKey: required(rawInput.idempotencyKey, "Chave de idempotência"),
  };
  if (!Number.isFinite(input.receivedAt.valueOf())) throw new ProcurementLifecycleError("Data de recebimento inválida.");
  if (!input.items.length) throw new ProcurementLifecycleError("O recebimento deve possuir ao menos um item.");
  if (input.receiverId === input.attesterId) throw new ProcurementLifecycleError("Recebedor e atestador devem ser servidores distintos.");
  if (new Set(input.items.map((item) => item.purchaseProcessItemId)).size !== input.items.length) {
    throw new ProcurementLifecycleError("Cada item do processo pode constar uma única vez no recebimento.");
  }
  input.items.forEach((item) => {
    required(item.purchaseProcessItemId, "Item do processo");
    required(item.materialId, "Material de estoque");
    required(item.warehouseId, "Almoxarifado");
    quantity(item.quantity, "Quantidade recebida");
    if (!Number.isFinite(item.unitCost) || item.unitCost < 0) throw new ProcurementLifecycleError("Custo unitário inválido.");
  });

  return db.$transaction(async (tx) => {
    const existing = await tx.purchaseReceipt.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;

    const [contract, document, receiver, attester] = await Promise.all([
      tx.contract.findUnique({
        where: { id: input.contractId },
        include: { process: { include: { purchaseRequest: { select: { requesterId: true, status: true } } } } },
      }),
      tx.document.findUnique({ where: { id: input.documentId }, select: { id: true, status: true } }),
      tx.employee.findUnique({ where: { id: input.receiverId }, select: { id: true, isActive: true } }),
      tx.employee.findUnique({ where: { id: input.attesterId }, select: { id: true, isActive: true } }),
    ]);
    if (!contract || contract.status !== "Vigente" || input.receivedAt < contract.startDate || input.receivedAt > contract.endDate) {
      throw new ProcurementLifecycleError("O recebimento exige contrato vigente na data informada.");
    }
    if (!contract.process.purchaseRequest || contract.process.purchaseRequest.status !== "Aprovada") {
      throw new ProcurementLifecycleError("O contrato deve decorrer de uma solicitação de compra aprovada.");
    }
    if (!document || document.status !== "Válido") throw new ProcurementLifecycleError("O documento GED deve estar válido.");
    if (!receiver?.isActive || !attester?.isActive) throw new ProcurementLifecycleError("Recebedor e atestador devem estar ativos.");
    const requesterId = contract.process.purchaseRequest?.requesterId;
    if (requesterId && (requesterId === input.receiverId || requesterId === input.attesterId)) {
      throw new ProcurementLifecycleError("Segregação de funções: solicitante não pode receber ou atestar o próprio recebimento.");
    }

    const processItemIds = input.items.map((item) => item.purchaseProcessItemId);
    const [processItems, priorReceiptItems] = await Promise.all([
      tx.purchaseProcessItem.findMany({ where: { id: { in: processItemIds }, purchaseProcessId: contract.processId }, select: { id: true, quantity: true } }),
      tx.purchaseReceiptItem.findMany({
        where: { purchaseProcessItemId: { in: processItemIds }, purchaseReceipt: { status: "APPROVED" } },
        select: { purchaseProcessItemId: true, quantity: true },
      }),
    ]);
    if (processItems.length !== input.items.length) throw new ProcurementLifecycleError("Item recebido não pertence ao processo do contrato.");
    const priorByItem = new Map<string, number>();
    for (const item of priorReceiptItems) priorByItem.set(item.purchaseProcessItemId, (priorByItem.get(item.purchaseProcessItemId) ?? 0) + item.quantity);
    for (const item of input.items) {
      const source = processItems.find((processItem) => processItem.id === item.purchaseProcessItemId)!;
      if ((priorByItem.get(source.id) ?? 0) + item.quantity > source.quantity) {
        throw new ProcurementLifecycleError("A quantidade recebida excede o saldo do item do processo.");
      }
    }

    const receipt = await tx.purchaseReceipt.create({
      data: {
        number: input.number,
        receivedAt: input.receivedAt,
        contractId: contract.id,
        purchaseProcessId: contract.processId,
        documentId: document.id,
        receiverId: receiver.id,
        attesterId: attester.id,
        idempotencyKey: input.idempotencyKey,
        sourceType: "CONTRACT",
        sourceId: contract.id,
      },
    });
    for (const item of input.items) {
      const { movement } = await applyStockMovement(tx, {
        kind: "ENTRY",
        sourceType: "APPROVED_PURCHASE_RECEIPT",
        warehouseId: item.warehouseId,
        materialId: item.materialId,
        quantity: item.quantity,
        batchNumber: item.batchNumber,
        expirationDate: item.expirationDate,
        unitCost: item.unitCost,
        reason: `Recebimento aprovado ${receipt.number}`,
        supplierId: contract.supplierId,
        actor,
      });
      await tx.purchaseReceiptItem.create({
        data: {
          purchaseReceiptId: receipt.id,
          purchaseProcessItemId: item.purchaseProcessItemId,
          materialId: item.materialId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          batchNumber: item.batchNumber?.trim() ?? "",
          expirationDate: item.expirationDate,
          stockMovementId: movement.id,
        },
      });
    }
    await writeLifecycleEvent(tx, {
      eventType: "PURCHASE_RECEIPT_APPROVED",
      entityType: "PURCHASE_RECEIPT",
      entityId: receipt.id,
      sourceType: "CONTRACT",
      sourceId: contract.id,
      actorUsuarioId: actor.usuarioId,
      idempotencyKey: `C5:PURCHASE_RECEIPT:${receipt.id}:APPROVED`,
    });
    return receipt;
  });
}

export async function approveMaterialRequest(db: Db, actor: ProcurementActor, input: { requestId: string; quantities: Array<{ itemId: string; quantityApproved: number }> }) {
  const requestId = required(input.requestId, "Requisição de material");
  const actorEmployeeId = required(actor.employeeId, "Servidor aprovador");
  if (!input.quantities.length) throw new ProcurementLifecycleError("Informe as quantidades aprovadas.");
  return db.$transaction(async (tx) => {
    const request = await tx.materialRequest.findUnique({ where: { id: requestId }, include: { items: true } });
    if (!request) throw new ProcurementLifecycleError("Requisição de material não encontrada.");
    if (request.status !== "Pendente") throw new ProcurementLifecycleError("Somente requisições pendentes podem ser aprovadas.");
    if (request.requesterId === actorEmployeeId) throw new ProcurementLifecycleError("Segregação de funções: o solicitante não pode aprovar a própria requisição.");
    if (new Set(input.quantities.map((item) => item.itemId)).size !== input.quantities.length || input.quantities.length !== request.items.length) {
      throw new ProcurementLifecycleError("Informe uma quantidade aprovada para cada item da requisição.");
    }
    for (const approved of input.quantities) {
      const item = request.items.find((requestItem) => requestItem.id === approved.itemId);
      if (!item || !Number.isFinite(approved.quantityApproved) || approved.quantityApproved < 0 || approved.quantityApproved > item.quantityRequested) {
        throw new ProcurementLifecycleError("Quantidade aprovada inválida para a requisição.");
      }
      await tx.materialRequestItem.update({ where: { id: item.id }, data: { quantityApproved: approved.quantityApproved } });
    }
    const approved = await tx.materialRequest.update({ where: { id: request.id }, data: { status: "Aprovada", approvedByEmployeeId: actorEmployeeId, approvedAt: new Date() } });
    await writeLifecycleEvent(tx, {
      eventType: "MATERIAL_REQUEST_APPROVED",
      entityType: "MATERIAL_REQUEST",
      entityId: approved.id,
      sourceType: "MATERIAL_REQUEST",
      sourceId: approved.id,
      actorUsuarioId: actor.usuarioId,
      idempotencyKey: `C5:MATERIAL_REQUEST:${approved.id}:APPROVED`,
    });
    return approved;
  });
}

export async function issueMaterialRequestItem(db: Db, actor: ProcurementActor, input: { requestItemId: string; stockId: string; quantity: number }) {
  const requestItemId = required(input.requestItemId, "Item da requisição");
  const stockId = required(input.stockId, "Posição de estoque");
  const issuedQuantity = quantity(input.quantity, "Quantidade atendida");
  const issuerId = required(actor.employeeId, "Servidor responsável pela saída");
  return db.$transaction(async (tx) => {
    const [requestItem, stock] = await Promise.all([
      tx.materialRequestItem.findUnique({ where: { id: requestItemId }, include: { request: { include: { items: true } } } }),
      tx.materialStock.findUnique({ where: { id: stockId }, select: { id: true, warehouseId: true, materialId: true, batchNumber: true, unitCost: true } }),
    ]);
    if (!requestItem || !stock) throw new ProcurementLifecycleError("Item da requisição ou posição de estoque não encontrada.");
    if (requestItem.request.status !== "Aprovada" && requestItem.request.status !== "Atendida Parcialmente") {
      throw new ProcurementLifecycleError("A saída exige uma requisição de material aprovada.");
    }
    if (requestItem.materialId !== stock.materialId) throw new ProcurementLifecycleError("O material da posição de estoque não corresponde ao item requisitado.");
    if (requestItem.quantityDelivered + issuedQuantity > requestItem.quantityApproved) throw new ProcurementLifecycleError("A saída excede a quantidade aprovada.");

    await applyStockMovement(tx, {
      kind: "EXIT",
      sourceType: "MATERIAL_REQUEST_ISSUE",
      materialRequestItemId: requestItem.id,
      warehouseId: stock.warehouseId,
      materialId: stock.materialId,
      batchNumber: stock.batchNumber,
      quantity: issuedQuantity,
      unitCost: stock.unitCost,
      departmentId: requestItem.request.departmentId,
      reason: `Requisição de material ${requestItem.request.number}`,
      actor,
    });
    await tx.materialRequestItem.update({ where: { id: requestItem.id }, data: { quantityDelivered: { increment: issuedQuantity } } });
    const updatedItems = await tx.materialRequestItem.findMany({ where: { requestId: requestItem.requestId }, select: { quantityApproved: true, quantityDelivered: true } });
    const status = updatedItems.every((item) => item.quantityDelivered >= item.quantityApproved) ? "Atendida" : "Atendida Parcialmente";
    const request = await tx.materialRequest.update({
      where: { id: requestItem.requestId },
      data: { status, issuedByEmployeeId: issuerId, issuedAt: new Date() },
    });
    await writeLifecycleEvent(tx, {
      eventType: "MATERIAL_REQUEST_ISSUED",
      entityType: "MATERIAL_REQUEST",
      entityId: request.id,
      sourceType: "MATERIAL_REQUEST_ITEM",
      sourceId: requestItem.id,
      actorUsuarioId: actor.usuarioId,
      idempotencyKey: `C5:MATERIAL_REQUEST_ITEM:${requestItem.id}:ISSUED:${requestItem.quantityDelivered + issuedQuantity}`,
    });
    return request;
  });
}
