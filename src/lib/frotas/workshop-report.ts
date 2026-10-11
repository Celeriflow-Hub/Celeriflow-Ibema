import { type PrismaClient } from "@prisma/client";
import { validateCnpj } from "@/lib/identifiers/brazilian-identifiers";
import { tokenMatches } from "./portal";

export class WorkshopReportError extends Error {}

export type WorkshopSubmission = {
  orderCode: string;
  cnpj: string;
  token: string;
  performed: string;
  parts?: string | null;
  amount?: number | null;
  reading?: number | null;
};

/**
 * External workshop submissions must match a named workshop authorization.
 * Locking the work order makes the single-use token and report creation atomic.
 * Report reviews stay in the authenticated Fleet management area.
 */
export async function submitWorkshopReport(db: PrismaClient, input: WorkshopSubmission) {
  const generic = "Não foi possível conferir a autorização. Verifique os dados e consulte o setor de frota.";
  const code = input.orderCode.trim().toLowerCase();
  const cnpj = validateCnpj(input.cnpj);
  if (code.length < 8 || !cnpj.valid || !input.performed.trim()) throw new WorkshopReportError(generic);
  if (input.amount != null && (!Number.isFinite(input.amount) || input.amount < 0)) throw new WorkshopReportError("Valor inválido.");
  if (input.reading != null && (!Number.isFinite(input.reading) || input.reading < 0)) throw new WorkshopReportError("Leitura inválida.");
  const matched = await db.fleetWorkOrder.findMany({ where: { id: { endsWith: code } }, select: { id: true }, take: 2 });
  if (matched.length !== 1) throw new WorkshopReportError(generic);
  return db.$transaction(async tx => {
    const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "FleetWorkOrder" WHERE "id" = ${matched[0].id} FOR UPDATE`;
    if (!locked.length) throw new WorkshopReportError(generic);
    const order = await tx.fleetWorkOrder.findUniqueOrThrow({ where: { id: matched[0].id } });
    if (!order.workshopCnpj || order.workshopCnpj !== cnpj.normalized || !order.workshopName || !tokenMatches(order.portalToken, input.token)) {
      throw new WorkshopReportError(generic);
    }
    if (order.status === "CONCLUIDA") throw new WorkshopReportError("Esta ordem de serviço já foi concluída.");
    if (await tx.fleetWorkshopReport.count({ where: { workOrderId: order.id, status: { in: ["RECEBIDO", "CONFERIDO"] } } })) {
      throw new WorkshopReportError("Esta ordem já possui registro aguardando conferência.");
    }
    const report = await tx.fleetWorkshopReport.create({
      data: {
        workOrderId: order.id,
        workshopCnpj: order.workshopCnpj,
        workshopName: order.workshopName,
        performed: input.performed.trim(),
        parts: input.parts?.trim() || null,
        amount: input.amount ?? null,
        reading: input.reading ?? null,
      },
    });
    await tx.fleetWorkOrder.update({ where: { id: order.id }, data: { portalToken: null } });
    return report;
  });
}
