import Link from "next/link";
import { randomUUID } from "node:crypto";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { OperationForm } from "../operacoes/OperationForm";

export const dynamic = "force-dynamic";
export default async function TravelAllowancePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { prisma } = await getTenantContextForModule("RH");
  const total = await prisma.hrPortalRequest.count({ where: { kind: "DIARIA_POC" } });
  const page = Math.min(Math.max(1, Number.parseInt((await searchParams).page || "1") || 1), Math.max(1, Math.ceil(total / 20)));
  const rows = await prisma.hrPortalRequest.findMany({ where: { kind: "DIARIA_POC" }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], skip: (page - 1) * 20, take: 20 });
  const employees = await prisma.employee.findMany({ where: { id: { in: [...new Set(rows.map(row => row.employeeId))] } }, select: { id: true, name: true } });
  const employeeNames = new Map(employees.map(employee => [employee.id, employee.name]));
  const rules = await prisma.hrPayrollRule.findMany({ where: { code: "DIARIAS_POC", isActive: true, ruleSet: { isDemo: true, scope: "DEMONSTRACAO" } }, orderBy: { id: "asc" } });
  const reports = new Set((await prisma.hrIntegrationEvent.findMany({ where: { sourceKey: { in: rows.map(row => `DIARIA:PRESTACAO:${row.id}`) } }, select: { sourceKey: true } })).map(event => event.sourceKey));
  return <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
    <ErpPageTitle title="Diárias — solicitação, autorização e prestação" description="Fluxo POC baseado na Cartilha Ibema julho/2025 e anexos I/II, com premissas substituíveis." action={<Link href="/rh/poc">Pacote POC</Link>} />
    <OperationForm command="diaria-solicitar" title="Solicitar e calcular diária demonstrativa" fields={[
      { name: "requestKey", label: "Chave da solicitação", value: randomUUID(), required: true },
      { name: "contractId", label: "Contrato", type: "lookup:contract", required: true },
      { name: "ruleId", label: "Tabela/política", options: [{ value: "", label: "Selecione" }, ...rules.map(rule => ({ value: rule.id, label: rule.name }))], required: true },
      { name: "destination", label: "Destino", required: true },
      { name: "destinationType", label: "Tipo de destino", options: ["INTERIOR", "CAPITAL", "DF", "INTERNACIONAL"].map(value => ({ value, label: value })) },
      { name: "departureAt", label: "Saída ISO com fuso", value: "2026-10-20T07:00:00-03:00", required: true },
      { name: "returnAt", label: "Retorno ISO com fuso", value: "2026-10-20T18:00:00-03:00", required: true },
      { name: "distanceKm", label: "Distância km", value: "100", required: true },
      { name: "overnight", label: "Pernoite", options: [{ value: "NAO", label: "Não" }, { value: "SIM", label: "Sim" }] },
      { name: "exchangeRate", label: "Cotação BRL/USD (internacional)", value: "5.00", required: true },
      { name: "purpose", label: "Finalidade / atividades previstas", type: "textarea", required: true },
      { name: "vehiclePlate", label: "Placa (opcional)" },
    ]} />
    {rows.map(row => {
      const memory = row.payload as { input: { destination: string }; assessment: { quantity: string; amountBRL: string } };
      return <section key={row.id} className="rounded border bg-white p-3 text-xs">
        <h2 className="font-semibold">{employeeNames.get(row.employeeId) ?? "Servidor não localizado"} · {memory.input.destination} · {row.status}</h2>
        <p>{memory.assessment.quantity} diária(s) · R$ {memory.assessment.amountBRL}</p>
        {row.status === "EM_ANALISE" && <OperationForm command="diaria-decidir" title="Autorizar ou indeferir diária" fields={[{ name: "requestId", label: "Solicitação", type: "hidden", value: row.id }, { name: "status", label: "Decisão", options: [{ value: "DEFERIDA", label: "Autorizar" }, { value: "INDEFERIDA", label: "Indeferir" }] }, { name: "authorizationNumber", label: "Número da autorização / decisão", required: true }, { name: "decision", label: "Fundamento", type: "textarea", required: true }]} />}
        {row.status === "DEFERIDA" && !reports.has(`DIARIA:PRESTACAO:${row.id}`) && <OperationForm command="diaria-prestar" title="Registrar relatório circunstanciado e restituição" fields={[{ name: "requestId", label: "Solicitação", type: "hidden", value: row.id }, { name: "activities", label: "Atividades realizadas", type: "textarea", required: true }, { name: "returnedAmount", label: "Restituição BRL", value: "0.00", required: true }, { name: "reportDate", label: "Data da prestação", type: "date", required: true }]} />}
        <div className="mt-2 flex flex-wrap gap-3">{["SOLICITACAO", ...(row.status === "DEFERIDA" ? ["AUTORIZACAO"] : []), ...(reports.has(`DIARIA:PRESTACAO:${row.id}`) ? ["PRESTACAO"] : [])].map(type => <Link key={type} href={`/api/rh/diarias/${row.id}?type=${type}&format=PDF`} target="_blank" className="underline">{type} PDF</Link>)}</div>
      </section>;
    })}
    <ErpPagination page={page} total={total} pageSize={20} label="diárias" previousHref={`?page=${page - 1}`} nextHref={`?page=${page + 1}`} />
  </div>;
}
