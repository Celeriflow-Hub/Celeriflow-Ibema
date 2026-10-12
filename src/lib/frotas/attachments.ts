// Anexos da frota (Termo de Referência de Ibema, item 1.578): upload, listagem e exclusão,
// sempre dentro do setor (fleetScope) do usuário e das extensões/tamanho permitidos.
import { put, del } from "@vercel/blob";
import type { Prisma, PrismaClient } from "@prisma/client";
import { getCeleriFlowInstanceId } from "@/lib/platform/instance";
import { FLEET_ATTACHMENT_EXTENSIONS, isAllowedAttachment } from "./tr-rules";
import { FleetError, type FleetScope } from "./service";

export const FLEET_ATTACHMENT_OWNER_TYPES = ["VEICULO", "MOTORISTA", "MULTA", "SINISTRO", "AUTORIZACAO"] as const;
export type FleetAttachmentOwnerType = (typeof FLEET_ATTACHMENT_OWNER_TYPES)[number];
export const FLEET_ATTACHMENT_OWNER_LABELS: Record<FleetAttachmentOwnerType, string> = {
  VEICULO: "Veículo",
  MOTORISTA: "Motorista",
  MULTA: "Multa",
  SINISTRO: "Sinistro",
  AUTORIZACAO: "Autorização de serviço",
};

/** 1.578 — limite de 20 MB por anexo. */
export const FLEET_ATTACHMENT_MAX_SIZE_BYTES = 20 * 1024 * 1024;

type Tx = Prisma.TransactionClient | PrismaClient;

function fleetAttachmentPrefix() {
  return `instances/${getCeleriFlowInstanceId()}/frotas/anexos/`;
}
function safeName(name: string) {
  const normalized = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const sanitized = normalized.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return sanitized.slice(0, 120) || "arquivo";
}
function blobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN nao configurada.");
  return token;
}

/** 1.578 — extensão permitida e tamanho máximo de 20 MB. */
export function validateFleetAttachmentFile(file: { name: string; size: number }) {
  if (!file.name || !(file.size > 0)) throw new FleetError("Selecione um arquivo válido.");
  if (file.size > FLEET_ATTACHMENT_MAX_SIZE_BYTES) throw new FleetError("O anexo deve ter no máximo 20 MB.");
  if (!isAllowedAttachment(file.name)) throw new FleetError(`Extensão não permitida. Formatos aceitos: ${FLEET_ATTACHMENT_EXTENSIONS.join(", ")}.`);
}

function assertDepartment(scope: FleetScope, departmentId: string | null) {
  if (!scope.administrator && departmentId !== scope.departmentId) throw new FleetError("Registro fora do seu setor de acesso.");
}

/** Resolve o registro (veículo, motorista, multa, sinistro ou autorização) e confirma que está no setor do usuário. */
async function resolveOwnerUnitId(tx: Tx, scope: FleetScope, ownerType: FleetAttachmentOwnerType, ownerId: string): Promise<string> {
  switch (ownerType) {
    case "VEICULO": {
      const unit = await tx.fleetUnit.findUnique({ where: { id: ownerId }, select: { id: true, departmentId: true } });
      if (!unit) throw new FleetError("Veículo não encontrado.");
      assertDepartment(scope, unit.departmentId);
      return unit.id;
    }
    case "MOTORISTA": {
      const driver = await tx.fleetDriver.findUnique({ where: { id: ownerId }, select: { id: true, departmentId: true } });
      if (!driver) throw new FleetError("Motorista não encontrado.");
      assertDepartment(scope, driver.departmentId);
      return driver.id;
    }
    case "MULTA": {
      const fine = await tx.fleetFine.findUnique({ where: { id: ownerId }, select: { id: true, unitId: true } });
      if (!fine) throw new FleetError("Multa não encontrada.");
      const unit = await tx.fleetUnit.findUnique({ where: { id: fine.unitId }, select: { departmentId: true } });
      assertDepartment(scope, unit?.departmentId ?? null);
      return fine.unitId;
    }
    case "SINISTRO": {
      const claim = await tx.fleetClaim.findUnique({ where: { id: ownerId }, select: { id: true, unitId: true } });
      if (!claim) throw new FleetError("Sinistro não encontrado.");
      const unit = await tx.fleetUnit.findUnique({ where: { id: claim.unitId }, select: { departmentId: true } });
      assertDepartment(scope, unit?.departmentId ?? null);
      return claim.unitId;
    }
    case "AUTORIZACAO": {
      const auth = await tx.fleetServiceAuthorization.findUnique({ where: { id: ownerId }, select: { id: true, unitId: true } });
      if (!auth) throw new FleetError("Autorização não encontrada.");
      const unit = await tx.fleetUnit.findUnique({ where: { id: auth.unitId }, select: { departmentId: true } });
      assertDepartment(scope, unit?.departmentId ?? null);
      return auth.unitId;
    }
    default:
      throw new FleetError("Tipo de anexo inválido.");
  }
}

export async function uploadFleetAttachment(tx: Tx, scope: FleetScope, input: { ownerType: FleetAttachmentOwnerType; ownerId: string; file: File }) {
  if (!(FLEET_ATTACHMENT_OWNER_TYPES as readonly string[]).includes(input.ownerType)) throw new FleetError("Tipo de anexo inválido.");
  if (!input.ownerId) throw new FleetError("Selecione o registro para anexar o arquivo.");
  validateFleetAttachmentFile(input.file);
  const unitId = await resolveOwnerUnitId(tx, scope, input.ownerType, input.ownerId);
  const blob = await put(`${fleetAttachmentPrefix()}${crypto.randomUUID()}-${safeName(input.file.name)}`, input.file, { access: "private", token: blobToken() });
  return tx.fleetAttachment.create({
    data: {
      unitId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      fileName: input.file.name,
      mimeType: input.file.type || "application/octet-stream",
      sizeBytes: input.file.size,
      url: blob.url,
      createdById: scope.actorId,
    },
  });
}

export async function listFleetAttachments(tx: Tx, scope: FleetScope, ownerType: FleetAttachmentOwnerType, ownerId: string) {
  await resolveOwnerUnitId(tx, scope, ownerType, ownerId);
  return tx.fleetAttachment.findMany({ where: { ownerType, ownerId }, orderBy: { createdAt: "desc" } });
}

/** Exclusão definitiva (o modelo não guarda histórico de versões de anexo). */
export async function deleteFleetAttachment(tx: Tx, scope: FleetScope, id: string) {
  const row = await tx.fleetAttachment.findUnique({ where: { id } });
  if (!row) throw new FleetError("Anexo não encontrado.");
  await resolveOwnerUnitId(tx, scope, row.ownerType as FleetAttachmentOwnerType, row.ownerId ?? "");
  if (!scope.administrator && row.createdById !== scope.actorId) throw new FleetError("Apenas quem enviou o anexo ou um administrador pode excluí-lo.");
  await del(row.url, { token: blobToken() }).catch(() => undefined);
  await tx.fleetAttachment.delete({ where: { id } });
  return row;
}
