import Link from "next/link";
import { Plus, Wallet } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { FolhaRowActions } from "./FolhaRowActions";
import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import {
  ErpTableContainer,
  ErpTableThead,
  ErpTableTh,
  ErpTableTr,
  ErpTableTd,
  ErpStatusBadge,
  type ErpStatusVariant,
} from "@/components/app-ui/erp/ErpTable";

function folhaVariant(status: string): ErpStatusVariant {
  if (status === "Paga") return "success";
  if (status === "Aberta") return "info";
  return "neutral";
}

export default async function FolhaPage() {
  const { prisma } = await getTenantContextForModule("RH");
  const payrolls = await prisma.payroll.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 p-2 sm:p-2.5 overflow-hidden">
      <ErpPageTitle
        title="Folha de Pagamento"
        icon={<Wallet className="size-4 text-violet-600" />}
        action={
          <div className="flex items-center gap-1.5">
            <Link
              href="/rh/folha/eventos"
              className="inline-flex h-8 items-center px-3 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Configurar Eventos
            </Link>
            <Link
              href="/rh/folha/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-amber-500 px-3 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:bg-amber-600"
            >
              <Plus className="size-3.5" />
              Nova Folha
            </Link>
          </div>
        }
      />

      <ErpListFrame>
        <ErpTableContainer>
          <ErpTableThead>
            <tr>
              <ErpTableTh className="w-[30%]">Competência</ErpTableTh>
              <ErpTableTh className="w-[24%]">Tipo</ErpTableTh>
              <ErpTableTh className="w-[22%]">Valor Total</ErpTableTh>
              <ErpTableTh className="w-[12%]">Status</ErpTableTh>
              <ErpTableTh className="w-[12%] text-right">Ações</ErpTableTh>
            </tr>
          </ErpTableThead>
          <tbody>
            {payrolls.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                  Nenhuma folha cadastrada.
                </td>
              </tr>
            ) : (
              payrolls.map((folha) => (
                <ErpTableTr key={folha.id}>
                  <ErpTableTd className="font-semibold">{folha.competence}</ErpTableTd>
                  <ErpTableTd>{folha.type}</ErpTableTd>
                  <ErpTableTd className="font-mono">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(folha.totalValue)}
                  </ErpTableTd>
                  <ErpTableTd>
                    <ErpStatusBadge variant={folhaVariant(folha.status)}>{folha.status}</ErpStatusBadge>
                  </ErpTableTd>
                  <ErpTableTd className="text-right">
                    <FolhaRowActions folha={folha} />
                  </ErpTableTd>
                </ErpTableTr>
              ))
            )}
          </tbody>
        </ErpTableContainer>
      </ErpListFrame>
    </div>
  );
}
