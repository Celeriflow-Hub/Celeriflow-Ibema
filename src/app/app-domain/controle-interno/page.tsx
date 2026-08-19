import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ControlClient } from "./ControlClient";

export default async function ControleInternoPage() {
  const { prisma } = await getTenantContextForModule("ADMINISTRACAO");
  const [plans, employees, documents] = await Promise.all([
    prisma.internalControlPlan.findMany({ include: { findings: { orderBy: { createdAt: "desc" } }, }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.employee.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.document.findMany({ where: { status: "Válido" }, select: { id: true, title: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return <ControlClient plans={plans} employees={employees} documents={documents} />;
}
