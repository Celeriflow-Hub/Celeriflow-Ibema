import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import Link from "next/link";
import { InventoryStartClient } from "./InventoryStartClient";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

const statusLabel: Record<string, string> = {
  COUNTING: "Em contagem",
  PENDING_APPROVAL: "Aguardando aprovação",
  CLOSED: "Encerrado",
  CANCELLED: "Cancelado",
};

export default async function InventariosPage() {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const [warehouses, sessions] = await Promise.all([
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.inventorySession.findMany({
      take: 100,
      orderBy: { startedAt: "desc" },
      include: { warehouse: { select: { name: true } }, createdByUsuario: { select: { nome: true } }, _count: { select: { items: true } } },
    }),
  ]);

  return (
    <PageFrame className="space-y-2"><PageHeader title="Inventários de Estoque" /><p className="text-xs text-muted-foreground">A contagem bloqueia entradas, saídas e ajustes do almoxarifado até a aprovação e o encerramento.</p><Card className="rounded-md"><CardHeader className="border-b p-3"><CardTitle className="text-sm">Iniciar contagem</CardTitle><CardDescription className="text-xs">O saldo atual é congelado como esperado para cada posição de material e lote.</CardDescription></CardHeader><CardContent className="p-3"><InventoryStartClient warehouses={warehouses} /></CardContent></Card><Card className="rounded-md"><CardHeader className="border-b p-3"><CardTitle className="text-sm">Listagem e relatórios</CardTitle><CardDescription className="text-xs">Últimos 100 inventários, incluindo responsável, situação do bloqueio e acesso ao relatório de divergências.</CardDescription></CardHeader><CardContent className="p-3"><div className="overflow-x-auto rounded-md border"><table className="min-w-[760px] w-full text-left text-sm"><thead className="border-b bg-muted text-muted-foreground"><tr><th className="p-3">Início</th><th className="p-3">Almoxarifado</th><th className="p-3">Responsável</th><th className="p-3">Itens</th><th className="p-3">Situação</th><th className="p-3">Bloqueio</th><th className="p-3">Relatório</th></tr></thead><tbody>{sessions.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum inventário registrado.</td></tr> : sessions.map((session) => <tr key={session.id} className="border-b last:border-0"><td className="p-3">{session.startedAt.toLocaleDateString("pt-BR")}</td><td className="p-3">{session.warehouse.name}</td><td className="p-3">{session.createdByUsuario.nome}</td><td className="p-3">{session._count.items}</td><td className="p-3"><Badge variant={session.status === "CLOSED" ? "default" : "secondary"}>{statusLabel[session.status] ?? session.status}</Badge></td><td className="p-3">{session.lockMovements ? "Ativo" : "Liberado"}</td><td className="p-3"><Link className="font-medium text-amber-700 underline" href={`/patrimonio/inventarios/${session.id}`}>Abrir</Link></td></tr>)}</tbody></table></div></CardContent></Card></PageFrame>
  );
}
