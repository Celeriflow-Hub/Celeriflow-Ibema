import Link from "next/link";
import { Plus, ArrowLeft, ReceiptText } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
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

function eventoVariant(type: string): ErpStatusVariant {
  if (type === "Vencimento") return "success";
  if (type === "Desconto") return "danger";
  return "neutral";
}

export default async function EventosPage() {
  const { prisma } = await getTenantContextForModule("RH");
  const events = await prisma.payrollEvent.findMany({
    orderBy: { code: "asc" },
  });

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 p-2 sm:p-2.5 overflow-hidden">
      <ErpPageTitle
        title="Eventos da Folha"
        icon={<ReceiptText className="size-4 text-violet-600" />}
        action={
          <div className="flex items-center gap-1.5">
            <Link
              href="/rh/folha"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Voltar para folha"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <Link
              href="/rh/folha/eventos/novo"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-amber-500 px-3 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:bg-amber-600"
            >
              <Plus className="size-3.5" />
              Novo Evento
            </Link>
          </div>
        }
      />

      <ErpListFrame>
        <ErpTableContainer>
          <ErpTableThead>
            <tr>
              <ErpTableTh className="w-[12%]">Código</ErpTableTh>
              <ErpTableTh className="w-[28%]">Descrição</ErpTableTh>
              <ErpTableTh className="w-[14%]">Tipo</ErpTableTh>
              <ErpTableTh className="w-[22%]">Fórmula Base</ErpTableTh>
              <ErpTableTh className="w-[10%]">Status</ErpTableTh>
              <ErpTableTh className="w-[14%] text-right">Ações</ErpTableTh>
            </tr>
          </ErpTableThead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-slate-400">
                  Nenhum evento configurado.
                </td>
              </tr>
            ) : (
              events.map((ev) => (
                <ErpTableTr key={ev.id}>
                  <ErpTableTd className="font-mono font-semibold">{ev.code}</ErpTableTd>
                  <ErpTableTd className="font-medium">{ev.name}</ErpTableTd>
                  <ErpTableTd>
                    <ErpStatusBadge variant={eventoVariant(ev.type)}>{ev.type}</ErpStatusBadge>
                  </ErpTableTd>
                  <ErpTableTd className="font-mono text-[10.5px]">{ev.formula || "—"}</ErpTableTd>
                  <ErpTableTd>
                    <ErpStatusBadge variant={ev.isActive ? "success" : "neutral"}>
                      {ev.isActive ? "Ativo" : "Inativo"}
                    </ErpStatusBadge>
                  </ErpTableTd>
                  <ErpTableTd className="text-right">
                    <Link
                      href={`/rh/folha/eventos/${ev.id}/editar`}
                      className="inline-flex h-6 items-center rounded px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Editar
                    </Link>
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
