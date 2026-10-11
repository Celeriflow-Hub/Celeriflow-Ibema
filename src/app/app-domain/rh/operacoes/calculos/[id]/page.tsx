import Link from "next/link";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { OperationForm } from "../../OperationForm";
import { assertPayrollBudgetScope } from "@/lib/rh/payroll-access";

export const dynamic = "force-dynamic";
export default async function PayrollRunPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> }) {
  const context = await getTenantContextForModule("RH");
  const { prisma } = context;
  const { id } = await params;
  const run = await prisma.hrPayrollRun.findUniqueOrThrow({ where: { id }, include: { payroll: true } });
  await assertPayrollBudgetScope(context, run.payrollId);
  const total = await prisma.hrPayrollStatement.count({ where: { runId: id } });
  const page = Math.min(Math.max(1, Number.parseInt((await searchParams).page || "1") || 1), Math.max(1, Math.ceil(total / 20)));
  const statements = await prisma.hrPayrollStatement.findMany({ where: { runId: id }, include: { contract: { include: { employee: true } } }, orderBy: { id: "asc" }, take: 20, skip: (page - 1) * 20 });
  const hidden = { name: "runId", label: "Cálculo", value: id, type: "hidden" };
  return <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
    <ErpPageTitle title={`Cálculo ${run.payroll.competence}`} description={`${run.mode} · ${run.scope} · ${run.status}`} action={<Link href="/rh/operacoes?tab=calculos">Voltar</Link>} />
    <p className="rounded border bg-white p-3 text-sm">Bruto R$ {run.gross.toFixed(2)} · descontos R$ {run.deductions.toFixed(2)} · líquido R$ {run.net.toFixed(2)} · patronal R$ {run.employer.toFixed(2)}</p>
    {run.mode === "OFICIAL" && run.status === "CALCULADA" && <OperationForm command="fechar" title="Conferir e fechar cálculo oficial" fields={[hidden]} />}
    {run.status === "CALCULADA" && <OperationForm command="cancelar" title="Cancelar cálculo preservando histórico" fields={[hidden, { name: "reason", label: "Motivo", required: true }]} />}
    {run.status === "FECHADA" && <OperationForm command="publicar" title="Liberar demonstrativos no Portal" fields={[hidden, { name: "releaseAt", label: "Data/hora ISO com fuso (ex.: 2026-10-15T09:00:00-03:00)", required: true }]} />}
    <table className="w-full table-fixed border bg-white text-xs"><thead><tr><th className="p-2 text-left">Servidor / contrato</th><th className="text-left">Líquido</th><th className="text-left">Memória</th></tr></thead><tbody>{statements.map(statement => <tr key={statement.id} className="h-7 border-t"><td className="truncate px-2">{statement.contract.employee.name} · {statement.contract.registration}</td><td>R$ {statement.net.toFixed(2)}</td><td><Link href={`/api/rh/demonstrativos/${statement.id}`} target="_blank">PDF completo</Link></td></tr>)}</tbody></table>
    <ErpPagination page={page} total={total} pageSize={20} label="demonstrativos" previousHref={`?page=${page - 1}`} nextHref={`?page=${page + 1}`} />
    <details className="rounded border bg-white p-3 text-xs"><summary>Snapshot das regras e origens</summary><pre className="whitespace-pre-wrap break-words">{JSON.stringify(run.snapshot, null, 2)}</pre></details>
  </div>;
}
