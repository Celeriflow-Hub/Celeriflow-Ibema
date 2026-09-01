import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { FrotasClient } from "./FrotasClient";

export default async function FrotasPage() {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const [vehicles, operations, documents] = await Promise.all([
    prisma.asset.findMany({ where: { status: { not: "Baixado" }, category: { OR: [{ code: { startsWith: "V" } }, { name: { contains: "veículo", mode: "insensitive" } }] } }, select: { id: true, patrimonyNumber: true, name: true, status: true }, orderBy: { patrimonyNumber: "asc" } }),
    prisma.fleetOperation.findMany({ include: { asset: { select: { patrimonyNumber: true, name: true } } }, orderBy: { occurredAt: "desc" }, take: 50 }),
    prisma.document.findMany({ where: { status: "Válido" }, select: { id: true, title: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return (
    <PageFrame className="space-y-2 [&>div]:space-y-4 [&>div]:p-0 [&>div>div:first-child]:hidden">
      <PageHeader title="Frotas" />
      <FrotasClient vehicles={vehicles} operations={operations} documents={documents} />
    </PageFrame>
  );
}
