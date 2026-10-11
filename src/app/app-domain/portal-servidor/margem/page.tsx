import { HandCoins } from "lucide-react";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { listEmployeePayrolls, loadPayslip } from "@/lib/portal-servidor/document-service";
import { brl, consignableMargin } from "@/lib/portal-servidor/documents";

export const dynamic = "force-dynamic";

export default async function MargemPage() {
  const access = await getEmployeePortalAccess();
  const title = <ErpPageTitle title="Margem consignável e histórico funcional" description="Calculada sobre o último contracheque fechado" icon={<HandCoins className="size-5 text-emerald-700" />} />;
  if (access.status !== "AVAILABLE") return <div className="flex flex-1 flex-col">{title}<p className="m-3 border bg-white p-4 text-sm text-slate-600">Seu usuário ainda não possui vínculo funcional ativo.</p></div>;
  const db = access.context.prisma;
  const id = access.employee.id;
  const [payrolls, vacations, leaves, requests, employee] = await Promise.all([
    listEmployeePayrolls(db, id),
    db.vacation.findMany({ where: { employeeId: id }, orderBy: { acquisitionStart: "desc" }, take: 20 }),
    db.leave.findMany({ where: { employeeId: id }, orderBy: { startDate: "desc" }, take: 20 }),
    db.employeePortalRequest.findMany({ where: { employeeId: id, status: { in: ["APROVADA", "INDEFERIDA"] } }, orderBy: { decidedAt: "desc" }, take: 20 }),
    db.employee.findUnique({ where: { id }, select: { admissionDate: true, employmentNature: true, socialSecurityRegime: true } }),
  ]);
  const latest = payrolls.find((p) => p.type === "Mensal") ?? payrolls[0];
  const slip = latest ? await loadPayslip(db, id, latest.id) : null;
  const m = slip ? consignableMargin(slip.lines) : null;

  const events = [
    ...(employee?.admissionDate ? [{ date: employee.admissionDate, text: `Admissão (${employee.employmentNature ?? "vínculo não informado"}, ${employee.socialSecurityRegime})` }] : []),
    ...vacations.map((v) => ({ date: v.enjoymentStart ?? v.acquisitionStart, text: `Férias — ${v.days} dias · ${v.status}` })),
    ...leaves.map((l) => ({ date: l.startDate, text: `${l.type} até ${l.endDate.toLocaleDateString("pt-BR", { timeZone: "UTC" })} · ${l.status}` })),
    ...requests.map((r) => ({ date: r.decidedAt ?? r.createdAt, text: `Solicitação ${r.kind.toLowerCase().replace("_", " ")} ${r.status.toLowerCase()}` })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      {title}
      <div className="grid gap-3 p-3 lg:grid-cols-2">
        <section className="border border-slate-300 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Margem consignável {latest ? `— ${latest.competence}` : ""}</h2>
          {!m ? <p className="mt-2 text-xs text-slate-500">Sem contracheque fechado para calcular a margem.</p> : (
            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-slate-50 p-2"><dt className="text-slate-500">Base (bruto − previdência − IRRF)</dt><dd className="text-sm font-semibold">{brl(m.base)}</dd></div>
              <div className="rounded bg-slate-50 p-2"><dt className="text-slate-500">Limite ({(m.rate * 100).toFixed(0)}%)</dt><dd className="text-sm font-semibold">{brl(m.limit)}</dd></div>
              <div className="rounded bg-slate-50 p-2"><dt className="text-slate-500">Consignados em folha</dt><dd className="text-sm font-semibold">{brl(m.used)}</dd></div>
              <div className="rounded bg-emerald-50 p-2"><dt className="text-emerald-800">Margem disponível</dt><dd className="text-sm font-semibold text-emerald-900">{brl(m.available)}</dd></div>
            </dl>
          )}
          <p className="mt-2 text-[11px] text-slate-500">Valor informativo. A averbação de novo consignado depende de confirmação do RH.</p>
        </section>
        <section className="border border-slate-300 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Histórico funcional</h2>
          {!events.length ? <p className="mt-2 text-xs text-slate-500">Sem registros.</p> : (
            <ol className="mt-2 space-y-1.5 border-l border-slate-200 pl-3 text-xs">
              {events.map((e, i) => <li key={i}><span className="font-semibold">{e.date.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span> — {e.text}</li>)}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
