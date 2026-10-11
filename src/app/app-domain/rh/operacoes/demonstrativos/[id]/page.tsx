import Link from "next/link";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { assertPayrollBudgetScope } from "@/lib/rh/payroll-access";
import { getPayrollStatement } from "@/lib/rh/statement-service";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";

export const dynamic = "force-dynamic";
export default async function StatementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await getTenantContextForModule("RH"); const { id } = await params;
  const source = await context.prisma.hrPayrollStatement.findUniqueOrThrow({ where: { id }, select: { run: { select: { id: true, payrollId: true } } } });
  await assertPayrollBudgetScope(context, source.run.payrollId);
  const statement = await getPayrollStatement(context.prisma, id);
  return <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
    <ErpPageTitle title={`${statement.contract.employee.name} · ${statement.competence}`} description={`${statement.payrollType} · matrícula ${statement.contract.registration} · ${statement.mode} · ${statement.scope}`} action={<Link href={`/rh/operacoes/calculos/${source.run.id}`}>Voltar ao cálculo</Link>} />
    <p className="rounded border bg-white p-3 text-sm">Bruto R$ {statement.gross} · descontos R$ {statement.deductions} · líquido R$ {statement.net} · encargos R$ {statement.employer}</p>
    <p className="text-xs">Local: {statement.contract.workLocation} · salário de referência R$ {statement.contract.salary} · {statement.days} dias</p>
    <Link href={`/api/rh/demonstrativos/${id}`} target="_blank" className="text-xs underline">PDF integral</Link>
    <table className="w-full border bg-white text-left text-xs"><thead><tr><th className="p-2">Rubrica</th><th>Tipo</th><th>Valor BRL</th><th>Memória de cálculo</th></tr></thead><tbody>{statement.items.map(item => <tr key={item.code} className="border-t"><td className="p-2">{item.code} · {item.name}</td><td>{item.type}</td><td>{item.value}</td><td className="p-2"><p>Método: {item.method}</p><p>Fórmula: {item.formula || "—"}</p><p>Base: {item.base || "—"} · percentual: {item.rate || "—"} · movimento: {item.movement}</p></td></tr>)}</tbody></table>
    <section className="rounded border bg-white p-3 text-xs"><strong>Bases efetivamente calculadas</strong>{Object.entries(statement.bases).map(([code, value]) => <p key={code}>{code}: R$ {value}</p>)}</section>
    <p className="text-xs text-slate-500">Versão {statement.id} · cálculo em {statement.createdAt.toISOString()}. Dados provenientes do snapshot; a consulta não comprova pagamento.</p>
  </div>;
}
