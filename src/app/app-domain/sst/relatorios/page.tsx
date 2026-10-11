import { getTenantContextForModuleOperation, getTenantContextForModule } from "@/lib/platform/tenant-context";
import { sstUnitWhere } from "@/lib/sst/access";
import { certificateReport } from "@/lib/sst/report-service";
import { SstValidationError } from "@/lib/sst/errors";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { z } from "zod";

export default async function SstReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const context = await getTenantContextForModuleOperation("SST", "issueReports");
  const filters = await searchParams;
  const units = await context.prisma.budgetUnit.findMany({ where: sstUnitWhere(context), select: { id: true, name: true } });
  let report: Awaited<ReturnType<typeof certificateReport>> | null = null;
  let error: string | null = null;
  let costs: Record<string, number | null> | null = null;
  if (filters.budgetUnitId && filters.from && filters.until) {
    try {
      report = await certificateReport(context, { ...filters, from: `${filters.from}T00:00:00-03:00`, until: `${filters.until}T23:59:59.999-03:00` });
      if (filters.cost === "1") {
        const rh = await getTenantContextForModule("RH");
        const salaries = await rh.prisma.employee.findMany({ where: { id: { in: report.statistics.map((item) => item.employeeId) } }, select: { id: true, salaryBase: true, contractedHours: true } });
        costs = Object.fromEntries(report.statistics.map((item) => {
          const salary = salaries.find((value) => value.id === item.employeeId);
          return [item.employeeId, salary && salary.contractedHours > 0 ? salary.salaryBase / salary.contractedHours * item.absentMinutes / 60 : null];
        }));
      }
      await writeAuditEvent(context.prisma, { actorUsuarioId: context.user.id, eventType: auditEventTypes.reportIssued, targetType: "SST_CERTIFICATES_REPORT", targetId: filters.budgetUnitId });
    } catch (cause) {
      if (cause instanceof z.ZodError) error = cause.issues[0]?.message || "Confira os filtros.";
      else if (cause instanceof SstValidationError) error = cause.message;
      else throw cause;
    }
  }
  const page = Math.min(Math.max(1, Math.trunc(Number(filters.page)) || 1), Math.max(1, Math.ceil((report?.total || 0) / 20)));
  const values = Object.fromEntries(Object.entries(filters).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  const href = (value: number) => `/sst/relatorios?${new URLSearchParams({ ...values, page: String(value) })}`;
  const exportHref = (kind: string) => `/api/sst/relatorios?${new URLSearchParams({ ...values, kind })}`;
  const plannedMinutes = report?.statistics.reduce((sum, item) => sum + item.plannedMinutes, 0) || 0;
  const absentMinutes = report?.statistics.reduce((sum, item) => sum + item.absentMinutes, 0) || 0;
  const days = report?.statistics.reduce((sum, item) => sum + item.acceptedCalendarDays, 0) || 0;
  const formatDate = (date: Date) => date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const field = (name: string, label: string, type = "text") => <label>{label}<input type={type} name={name} defaultValue={filters[name]} className="block w-full rounded border p-2"/></label>;

  return <div className="space-y-4 p-4">
    <h1 className="text-xl font-semibold">Atestados e absenteísmo — relatórios</h1>
    <form className="grid gap-3 rounded border p-4 sm:grid-cols-3">
      <label>UG<select required name="budgetUnitId" defaultValue={filters.budgetUnitId} className="block w-full rounded border p-2"><option value="">Selecione</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
      {field("from", "Início", "date")}{field("until", "Fim", "date")}
      {field("employeeId", "Identificador do servidor")}{field("roleId", "Identificador do cargo")}
      {field("departmentId", "Local/centro de custo — identificador do departamento")}
      {field("reasonId", "Identificador do motivo")}{field("issuerPersonId", "Identificador do profissional")}{field("cid", "CID")}
      <label>Situação<select name="status" defaultValue={filters.status} className="block rounded border p-2"><option value="">Todas</option><option value="RECEIVED">Recebido</option><option value="APPROVED">Deferido</option><option value="REJECTED">Indeferido</option></select></label>
      <label><input name="cost" value="1" type="checkbox" defaultChecked={filters.cost === "1"} className="mr-2"/>Exibir custo estimado (exige acesso RH)</label>
      <button className="rounded bg-teal-700 p-2 text-white">Consultar</button>
    </form>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {report && <>
      <section className="grid gap-3 rounded border p-4 sm:grid-cols-3">
        <p>{report.total} atestados</p><p>Horas planejadas: {(plannedMinutes / 60).toFixed(2)}</p>
        <p>Horas atestadas aceitas: {(absentMinutes / 60).toFixed(2)}</p>
        <p>Índice: {plannedMinutes ? `${(absentMinutes / plannedMinutes * 100).toFixed(2)}%` : "Indisponível — sem jornada planejada"}</p>
        <p>Dias corridos aceitos: {days.toFixed(2)}</p>
        <p>Idade média dos servidores com atestado: {report.meanAge?.toFixed(1) || "Não informada"}</p>
      </section>
      <p className="text-sm">Intervalos sobrepostos são unidos e intersectados com a jornada planejada no período. Apenas atestados deferidos integram as horas de ausência aceita. Servidores com turnos planejados e sem atestados também integram o denominador.</p>
      <section className="rounded border p-4"><h2 className="font-semibold">CIDs por frequência de atestados</h2><p>{Object.entries(report.cidCounts).sort((a, b) => b[1] - a[1]).map(([cid, count]) => `${cid}: ${count}`).join(" · ") || "Sem CIDs"}</p></section>
      {costs && <section className="rounded border p-4"><h2 className="font-semibold">Custo estimado</h2><p>R$ {Object.values(costs).reduce<number>((sum, value) => sum + (value || 0), 0).toFixed(2)}</p><p className="text-sm">Referência: salário base atual ÷ horas mensais contratuais × horas atestadas na jornada. Não representa desconto nem custo efetivamente pago em folha.</p></section>}
      <nav className="flex flex-wrap gap-3" aria-label="Exportação de relatórios">
        <a href={exportHref("atestados")} className="rounded border p-2 text-sm">Exportar todos os atestados (CSV)</a>
        <a href={exportHref("absenteismo")} className="rounded border p-2 text-sm">Exportar absenteísmo por servidor (CSV)</a>
      </nav>
      <table className="w-full table-fixed text-left text-xs">
        <thead><tr><th className="p-2">Servidor</th><th className="p-2">Emitente/motivo</th><th className="p-2">Período</th><th className="p-2">CIDs</th><th className="p-2">Situação</th></tr></thead>
        <tbody>{report.records.slice((page - 1) * 20, page * 20).map((record) => <tr className="border-b" key={record.id}>
          <td className="break-words p-2">{record.employee.name} · {record.employee.registration}</td>
          <td className="break-words p-2">{record.issuer.fullName}<br/>{record.reason.name}</td>
          <td className="p-2">{formatDate(record.startsAt)} — {formatDate(record.endsAt)}</td>
          <td className="p-2">{record.cidCodes.join(", ")}</td><td className="p-2">{record.status}</td>
        </tr>)}</tbody>
      </table>
      <ErpPagination page={page} total={report.total} previousHref={href(page - 1)} nextHref={href(page + 1)}/>
    </>}
  </div>;
}
