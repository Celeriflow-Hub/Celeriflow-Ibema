"use server";

import { revalidatePath } from "next/cache";
import { AccessError, getTenantContextForSystemAdministration } from "@/lib/platform/tenant-context";
import { normalizeRestrictiveProfilePermissions, SYSTEM_ADMIN_PROFILE_CODE } from "@/lib/administration/c3-policy";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";

const MODULE_CODES = new Set([
  "ADMINISTRACAO", "RH", "CADASTROS", "DOCUMENTOS", "ATENDIMENTO", "COMPRAS", "CONTRATOS", "FINANCEIRO", "PATRIMONIO", "TRIBUTACAO", "PROCESSOS", "SAUDE",
  "EDUCACAO", "SOCIAL", "OBRAS", "MEIO_AMBIENTE", "SEGURANCA", "SANEAMENTO", "CAMARA", "CULTURA", "TRANSPARENCIA", "CONFIGURACOES",
]);

function normalizePermissions(value: string | undefined) {
  return normalizeRestrictiveProfilePermissions(value, MODULE_CODES);
}

export async function upsertPerfil(data: {
  id?: string;
  nome: string;
  descricao: string;
  permissoes?: string;
  ativo: boolean;
}) {
  try {
    const context = await getTenantContextForSystemAdministration();
    const { prisma } = context;
    const nome = data.nome.trim();
    if (!nome) return { error: "Informe o nome do perfil." };

    const jsonPermissoes = normalizePermissions(data.permissoes);

    if (data.id) {
      const existing = await prisma.configuracaoPerfil.findUnique({ where: { id: data.id } });
      if (!existing) return { error: "Perfil não encontrado." };
      
      await prisma.$transaction(async (tx) => {
        const profile = await tx.configuracaoPerfil.update({ where: { id: data.id }, data: { nome, descricao: data.descricao, permissoes: jsonPermissoes, ativo: data.ativo } });
        await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "PROFILE", targetId: profile.id });
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const profile = await tx.configuracaoPerfil.create({ data: { nome, descricao: data.descricao, permissoes: jsonPermissoes, ativo: data.ativo } });
        await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "PROFILE", targetId: profile.id });
      });
    }
    revalidatePermissionConsumers();
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : "Erro ao salvar o perfil." };
  }
}

export async function togglePerfilStatus(id: string, ativo: boolean) {
  try {
    const context = await getTenantContextForSystemAdministration();
    const { prisma } = context;
    const perfil = await prisma.configuracaoPerfil.findUnique({ where: { id } });
    if (!perfil) return { error: "Perfil não encontrado." };
    
    if (!ativo && perfil.codigo === SYSTEM_ADMIN_PROFILE_CODE) {
      const activeAdministrators = await prisma.usuario.count({ where: { ativo: true, perfilId: id } });
      if (activeAdministrators > 0) return { error: "Não é possível desativar o perfil do administrador do sistema enquanto houver administradores ativos." };
    }
    await prisma.$transaction(async (tx) => {
      await tx.configuracaoPerfil.update({ where: { id }, data: { ativo } });
      await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "PROFILE", targetId: id });
    });
    revalidatePermissionConsumers();
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error instanceof AccessError ? error.message : "Erro ao alterar o status do perfil." };
  }
}

function revalidatePermissionConsumers() {
  revalidatePath("/configuracoes/perfis");
  revalidatePath("/dashboard");
  revalidatePath("/app-domain/dashboard");
  revalidatePath("/");
}
