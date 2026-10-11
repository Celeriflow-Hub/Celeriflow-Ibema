"use server";

import { revalidatePath } from "next/cache";
import { getCurrentTenantContext, isSystemAdministrator } from "@/lib/platform/tenant-context";
import { computeDueAt, suggestSeverity, type SupportSeverity } from "@/lib/platform/support-sla";

const SEV = ["CRITICA", "ALTA", "MEDIA", "BAIXA"];
const CAT = ["DUVIDA", "ERRO", "MELHORIA", "INDISPONIBILIDADE"];
const txt = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);

export async function openSupportRequest(f: FormData) {
  const { prisma, user } = await getCurrentTenantContext();
  const category = txt(f, "category", 30);
  const subject = txt(f, "subject", 150);
  const description = txt(f, "description", 4000);
  if (!CAT.includes(category) || !subject || !description) throw new Error("Preencha categoria, assunto e descrição.");
  const chosen = txt(f, "severity", 10);
  const severity = (SEV.includes(chosen) ? chosen : suggestSeverity(category, f.get("blocks") === "on")) as SupportSeverity;
  const now = new Date();
  const count = await prisma.supportRequest.count();
  await prisma.supportRequest.create({
    data: {
      number: `SUP-${now.getFullYear()}-${String(count + 1).padStart(5, "0")}`,
      module: txt(f, "module", 60) || "Geral", category, severity, subject, description,
      requesterId: user.id, requesterName: user.name, dueAt: computeDueAt(severity, now),
    },
  });
  revalidatePath("/suporte");
}

export async function replySupportRequest(f: FormData) {
  const { prisma, user } = await getCurrentTenantContext();
  const id = txt(f, "id", 40);
  const message = txt(f, "message", 4000);
  const status = txt(f, "status", 20);
  const r = await prisma.supportRequest.findUnique({ where: { id } });
  if (!r) throw new Error("Chamado não encontrado.");
  const admin = isSystemAdministrator(user);
  if (!admin && r.requesterId !== user.id) throw new Error("Sem permissão para este chamado.");
  const messages = [...((r.messages as unknown[]) ?? []), ...(message ? [{ at: new Date().toISOString(), by: user.name, support: admin, text: message }] : [])];
  const next = admin && ["EM_ATENDIMENTO", "RESOLVIDO", "CANCELADO"].includes(status) ? status : r.status;
  await prisma.supportRequest.update({
    where: { id },
    data: {
      messages: messages as object[], status: next,
      firstResponseAt: r.firstResponseAt ?? (admin && message ? new Date() : null),
      resolvedAt: next === "RESOLVIDO" ? new Date() : r.resolvedAt,
      solution: next === "RESOLVIDO" ? message || r.solution : r.solution,
    },
  });
  revalidatePath("/suporte");
}
