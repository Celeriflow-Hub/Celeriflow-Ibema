import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { Button } from "@/components/ui/button";
import { getTenantContextForModule, getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";

const warehouseInput = z.object({
  name: z.string().trim().min(1, "Informe o nome do almoxarifado.").max(160, "O nome deve ter no máximo 160 caracteres."),
  type: z.enum(["Central", "Setorial"]),
  address: z.string().trim().optional(),
  managerId: z.string().trim().optional(),
});

export default async function NovoAlmoxarifadoPage() {
  const { prisma } = await getTenantContextForModule("PATRIMONIO");
  const managers = await prisma.employee.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  async function createWarehouse(formData: FormData): Promise<void> {
    "use server";

    const parsed = warehouseInput.safeParse({
      name: formData.get("name"),
      type: formData.get("type"),
      address: formData.get("address"),
      managerId: formData.get("managerId"),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados do almoxarifado inválidos.");

    const context = await getTenantContextForModuleOperation("PATRIMONIO", "create");
    const managerId = parsed.data.managerId || undefined;
    if (managerId) {
      const manager = await context.prisma.employee.findFirst({ where: { id: managerId, isActive: true }, select: { id: true } });
      if (!manager) throw new Error("Selecione um responsável ativo.");
    }

    await context.prisma.warehouse.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        address: parsed.data.address || null,
        managerId,
      },
    });
    revalidatePath("/patrimonio/almoxarifados");
    revalidatePath("/patrimonio/materiais");
    redirect("/patrimonio/almoxarifados");
  }

  return (
    <PageFrame className="max-w-3xl space-y-2">
      <PageHeader title="Novo Almoxarifado" action={<Link href="/patrimonio/almoxarifados"><Button size="sm" variant="outline">Cancelar</Button></Link>} />
      <form action={createWarehouse} className="grid gap-3 rounded-md border bg-white p-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Nome
          <input name="name" required maxLength={160} className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Ex.: Almoxarifado Central" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Tipo
          <select name="type" defaultValue="Central" className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="Central">Central</option>
            <option value="Setorial">Setorial</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Responsável
          <select name="managerId" className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="">Não atribuir agora</option>
            {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Endereço ou referência física
          <input name="address" className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Ex.: Prédio administrativo, térreo" />
        </label>
        <div className="flex justify-end gap-2 border-t pt-3 md:col-span-2">
          <Link href="/patrimonio/almoxarifados"><Button type="button" variant="outline">Cancelar</Button></Link>
          <Button type="submit">Salvar almoxarifado</Button>
        </div>
      </form>
    </PageFrame>
  );
}
