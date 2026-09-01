import { AlertTriangle, Archive, ClipboardList, FileBox, FileText, Timer } from "lucide-react";
import Link from "next/link";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { getProtocolContext, protocolScope } from "@/lib/protocols/access";

export const dynamic = "force-dynamic";

export default async function ProtocolosDashboardPage() {
  const context = await getProtocolContext();
  const { prisma } = context;
  const scope = protocolScope(context);
  const now = new Date();
  const [totalProcesses, awaitingReceipt, inProgressProcesses, archivedProcesses, dueSoon, overdue] = await Promise.all([
    prisma.process.count({ where: scope }),
    prisma.process.count({ where: { ...scope, status: "Aguardando Recebimento" } }),
    prisma.process.count({ where: { ...scope, status: { in: ["Recebido", "Em Analise", "Reaberto"] } } }),
    prisma.process.count({ where: { ...scope, status: "Arquivado" } }),
    prisma.process.count({ where: { ...scope, expectedCompletionAt: { gte: now, lte: new Date(now.getTime() + 3 * 86_400_000) }, status: { notIn: ["Concluido", "Arquivado", "Cancelado"] } } }),
    prisma.process.count({ where: { ...scope, expectedCompletionAt: { lt: now }, status: { notIn: ["Concluido", "Arquivado", "Cancelado"] } } }),
  ]);

  const stats = [
    { title: "Total de Processos", value: totalProcesses.toString(), icon: ClipboardList, href: "/protocolos/acompanhamento", color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Em andamento", value: inProgressProcesses.toString(), icon: FileBox, href: "/protocolos/acompanhamento?status=Recebido", color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Aguardando recebimento", value: awaitingReceipt.toString(), icon: FileText, href: "/protocolos/acompanhamento?status=Aguardando+Recebimento", color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Arquivados", value: archivedProcesses.toString(), icon: Archive, href: "/protocolos/arquivados", color: "text-slate-600", bg: "bg-slate-100" },
    { title: "Próximos do prazo", value: dueSoon.toString(), icon: Timer, href: "/protocolos/acompanhamento?deadline=soon", color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Atrasados", value: overdue.toString(), icon: AlertTriangle, href: "/protocolos/acompanhamento?deadline=overdue", color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Painel de Protocolos" icon={<ClipboardList className="size-4 shrink-0 text-indigo-600" />} />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block group">
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 hover:shadow-md">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-0.5 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`flex size-9 items-center justify-center rounded-md ${stat.bg} ${stat.color} transition-transform duration-200 group-hover:scale-105`}>
                <stat.icon className="size-5" strokeWidth={2.5} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageFrame>
  );
}
