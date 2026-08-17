"use server";

import { revalidatePath } from "next/cache";
import { assertAdministratorLifecycleChange, isSystemAdministratorProfileCode, SYSTEM_ADMIN_PROFILE_CODE } from "@/lib/administration/c3-policy";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import { AccessError, getTenantContextForSystemAdministration } from "@/lib/platform/tenant-context";
import { adminAuth } from "@/lib/firebase/server";
import { createFirebaseUserProvisioner } from "@/lib/firebase/user-provisioning";

export async function upsertUsuario(data: {
  id?: string;
  nome: string;
  email: string;
  perfilId: string;
  employeeId?: string;
  ativo: boolean;
  permissoes: { moduloId: string; canView: boolean; canEdit: boolean }[];
}) {
  try {
    const context = await getTenantContextForSystemAdministration();
    const { prisma } = context;
    const perfil = await prisma.configuracaoPerfil.findFirst({ where: { id: data.perfilId, ativo: true }, select: { id: true, codigo: true } });
    if (!perfil) return { error: "Selecione um perfil de acesso ativo." };

    const email = data.email.trim().toLowerCase();
    if (!data.nome.trim() || !email) return { error: "Nome e e-mail são obrigatórios." };
    const existing = data.id
      ? await prisma.usuario.findUnique({ where: { id: data.id }, include: { perfil: { select: { codigo: true } } } })
      : null;
    if (data.id && !existing) return { error: "Usuário não encontrado." };

    if (existing) {
      const activeSystemAdministratorCount = await prisma.usuario.count({ where: { ativo: true, perfil: { codigo: SYSTEM_ADMIN_PROFILE_CODE } } });
      assertAdministratorLifecycleChange({
        actorUsuarioId: context.user.id,
        targetUsuarioId: existing.id,
        targetIsSystemAdministrator: isSystemAdministratorProfileCode(existing.perfil.codigo),
        targetWillBeSystemAdministrator: isSystemAdministratorProfileCode(perfil.codigo),
        targetWillBeActive: data.ativo,
        activeSystemAdministratorCount,
      });
    }

    const provisioner = createFirebaseUserProvisioner(adminAuth);
    const { firebaseUid } = await provisioner.provision({
      email,
      displayName: data.nome.trim(),
      disabled: !data.ativo,
      firebaseUid: existing?.firebaseUid,
    });

    await prisma.$transaction(async (tx) => {
      const user = existing
        ? await tx.usuario.update({
          where: { id: existing.id },
          data: {
            nome: data.nome.trim(), email, firebaseUid, perfilId: data.perfilId, employeeId: data.employeeId || null, ativo: data.ativo,
            permissoesModulo: { deleteMany: {}, create: data.permissoes.map((permission) => ({ moduloId: permission.moduloId, canView: permission.canView, canEdit: permission.canEdit })) },
          },
        })
        : await tx.usuario.create({
          data: {
            nome: data.nome.trim(), email, firebaseUid, perfilId: data.perfilId, employeeId: data.employeeId || null, ativo: data.ativo,
            permissoesModulo: { create: data.permissoes.map((permission) => ({ moduloId: permission.moduloId, canView: permission.canView, canEdit: permission.canEdit })) },
          },
        });
      await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "USUARIO", targetId: user.id });
    });
    revalidatePath("/configuracoes/usuarios");
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : "Erro ao salvar o usuário." };
  }
}

export async function toggleUsuarioStatus(id: string, ativo: boolean) {
  try {
    const context = await getTenantContextForSystemAdministration();
    const { prisma } = context;
    const target = await prisma.usuario.findUnique({ where: { id }, include: { perfil: { select: { codigo: true } } } });
    if (!target) return { error: "Usuário não encontrado." };
    const activeSystemAdministratorCount = await prisma.usuario.count({ where: { ativo: true, perfil: { codigo: SYSTEM_ADMIN_PROFILE_CODE } } });
    assertAdministratorLifecycleChange({
      actorUsuarioId: context.user.id,
      targetUsuarioId: target.id,
      targetIsSystemAdministrator: isSystemAdministratorProfileCode(target.perfil.codigo),
      targetWillBeSystemAdministrator: isSystemAdministratorProfileCode(target.perfil.codigo),
      targetWillBeActive: ativo,
      activeSystemAdministratorCount,
    });
    const provisioner = createFirebaseUserProvisioner(adminAuth);
    const { firebaseUid } = await provisioner.provision({ email: target.email, displayName: target.nome, disabled: !ativo, firebaseUid: target.firebaseUid });
    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({ where: { id }, data: { ativo, firebaseUid } });
      await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "USUARIO", targetId: id });
    });
    revalidatePath("/configuracoes/usuarios");
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error instanceof AccessError ? error.message : error instanceof Error ? error.message : "Erro ao alterar o status do usuário." };
  }
}
