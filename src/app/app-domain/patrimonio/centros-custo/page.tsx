import Link from "next/link";
import { Landmark, Plus } from "lucide-react";
import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { buttonVariants } from "@/components/ui/button";
import { canPerformModuleOperation, getTenantContextForModule } from "@/lib/platform/tenant-context";
import { CostCenterTable } from "./CostCenterTable";

export default async function CentrosCustoPage() {
  const context = await getTenantContextForModule("PATRIMONIO");
  const costCenters = await context.prisma.costCenter.findMany({
    include: { _count: { select: { warehouses: true } } },
    orderBy: [{ code: "asc" }, { name: "asc" }],
  });
  const canCreate = canPerformModuleOperation(context.user, "PATRIMONIO", "create");
  const canUpdate = canPerformModuleOperation(context.user, "PATRIMONIO", "update");
  const canDelete = canPerformModuleOperation(context.user, "PATRIMONIO", "delete");
  return <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 sm:p-3"><ErpPageTitle title="Centros de custo" icon={<Landmark className="size-4 text-emerald-700" />} action={canCreate ? <Link href="/patrimonio/centros-custo/novo" className={buttonVariants({ size: "sm" })}><Plus className="size-3.5" />Novo centro de custo</Link> : undefined} /><ErpListFrame summary={<p className="text-[11px] text-slate-600"><strong className="text-slate-900">{costCenters.length}</strong> centro(s) de custo cadastrado(s)</p>}><CostCenterTable costCenters={costCenters.map((costCenter) => ({ id: costCenter.id, code: costCenter.code, name: costCenter.name, description: costCenter.description, isActive: costCenter.isActive, warehouseCount: costCenter._count.warehouses }))} canUpdate={canUpdate} canDelete={canDelete} /></ErpListFrame></div>;
}
