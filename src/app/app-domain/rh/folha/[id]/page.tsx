import Link from "next/link";
import { notFound } from "next/navigation";
import { Wallet } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { VARIABLE_KINDS } from "@/lib/rh/payroll-engine";
import { PayrollRunPanel } from "./PayrollRunPanel";

const brl = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export default async function FolhaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { prisma } = await getTenantContextForModule("RH");
  const { id } = await params;
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      items: { include: { event: true, employee: { select: { id: true, name: true, registration: true } } }, orderBy: { event: { code: "asc" } } },
      variables: { include: { employee: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!payroll) notFound();
  const employees = await prisma.employee.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });

  const byEmployee = new Map<string, { name: string; registration: string | null; gross: number; discounts: number; rubrics: { code: string; name: string; type: string; value: number; reference: string | null }[] }>();
  for (const item of payroll.items) {
    const row = byEmployee.get(item.employeeId) ?? { name: item.employee.name, registration: item.employee.registration, gross: 0, discounts: 0, rubrics: [] };
    if (item.event.type === "Vencimento") row.gross += item.value;
    if (item.event.type === "Desconto") row.discounts += item.value;
    row.rubrics.push({ code: item.event.code, name: item.event.name, type: item.event.type, value: item.value, reference: item.reference });
    byEmployee.set(item.employeeId, row);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-slate-50 p-3 dark:bg-slate-950">
      <ErpPageTitle
        title={`Folha ${payroll.type} — ${payroll.competence}`}
        icon={<Wallet className="size-4 text-violet-600" />}
        action={<div className="flex gap-2">
          <Link href={`/rh/folha/${payroll.id}/obrigacoes`} className="inline-flex h-8 items-center rounded-md bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700">Relatórios e arquivos</Link>
          <Link href="/rh/folha" className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">Voltar</Link>
        </div>}
      />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[["Situação", payroll.status], ["Bruto", brl(payroll.grossValue)], ["Descontos", brl(payroll.discountValue)], ["Líquido", brl(payroll.totalValue)]].map(([label, value]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] uppercase text-slate-500">{label}</p>
            <p className="text-base font-semibold">{value}</p>
          </div>
        ))}
      </div>
      {payroll.snapshotHash && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
          Competência fechada em {payroll.closedAt?.toLocaleString("pt-BR")} por {payroll.closedBy ?? "—"}. Código de conferência: <span className="font-mono break-all">{payroll.snapshotHash}</span>
        </p>
      )}

      <PayrollRunPanel
        payrollId={payroll.id}
        status={payroll.status}
        employees={employees}
        kinds={VARIABLE_KINDS}
        variables={payroll.variables.map((v) => ({ id: v.id, employee: v.employee.name, kind: VARIABLE_KINDS.find((k) => k.kind === v.kind)?.label ?? v.kind, quantity: v.quantity, value: v.value, note: v.note }))}
      />

      <section className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 p-2 text-sm font-semibold dark:border-slate-800">Resultado por servidor ({byEmployee.size})</h2>
        {byEmployee.size === 0 ? (
          <p className="p-6 text-center text-xs text-slate-400">Folha ainda não calculada.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...byEmployee.entries()].map(([employeeId, row]) => (
              <details key={employeeId} className="p-2 text-xs">
                <summary className="flex cursor-pointer flex-wrap justify-between gap-2">
                  <span className="font-semibold">{row.name} {row.registration ? `(${row.registration})` : ""}</span>
                  <span className="font-mono">Bruto {brl(row.gross)} · Desc. {brl(row.discounts)} · Líquido <b>{brl(row.gross - row.discounts)}</b></span>
                </summary>
                <table className="mt-2 w-full">
                  <tbody>
                    {row.rubrics.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="py-1 font-mono text-slate-500">{r.code}</td>
                        <td>{r.name}</td>
                        <td className="text-slate-500">{r.reference ?? ""}</td>
                        <td className={`text-right font-mono ${r.type === "Desconto" ? "text-red-600" : r.type === "Base" ? "text-slate-400" : "text-emerald-700"}`}>{brl(r.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 p-2 text-sm font-semibold dark:border-slate-800">Histórico da competência</h2>
        <ul className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
          {payroll.auditLogs.length === 0 && <li className="p-3 text-slate-400">Sem registros.</li>}
          {payroll.auditLogs.map((log) => (
            <li key={log.id} className="p-2">
              <b>{log.action}</b> — {log.createdAt.toLocaleString("pt-BR")} — {log.actor ?? "sistema"}
              {log.reason ? <span className="block text-slate-500">Justificativa: {log.reason}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
