import Link from "next/link";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { OperationForm, type OperationField } from "./OperationForm";
import { accessiblePayrollWhere } from "@/lib/rh/payroll-access";

export const dynamic = "force-dynamic";
type Params = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || "" : value || "";
const field = (name: string, label: string, value = "", type = "text", required = true): OperationField => {
  const references: Record<string, string> = { employeeId: "employee", personId: "person", contractId: "contract", departmentId: "department", costCenterId: "center", payrollId: "payroll", ruleId: "rule" };
  return { name, label: name === "contractIds" ? "Contratos selecionados" : label.replace("ID do ", "").replace("ID ", ""), value, type: name === "contractIds" ? "contracts" : type === "text" && references[name] ? `lookup:${references[name]}` : type, required };
};
const money = (value: Prisma.Decimal) => `R$ ${value.toFixed(2)}`;

export default async function WorkforcePage({ searchParams }: { searchParams: Promise<Params> }) {
  const { prisma, user } = await getTenantContextForModule("RH");
  const params = await searchParams;
  const tab = ["contratos", "movimentos", "direitos", "calculos", "integracoes"].includes(first(params.tab)) ? first(params.tab) : "contratos";
  const q = first(params.q).trim();
  const contractWhere: Prisma.HrEmploymentContractWhereInput = q ? { OR: [{ registration: { contains: q, mode: "insensitive" } }, { employee: { name: { contains: q, mode: "insensitive" } } }] } : {};
  const movementWhere: Prisma.HrMovementWhereInput = { contract: contractWhere };
  const rightWhere: Prisma.HrRightEntryWhereInput = { contract: contractWhere };
  const runWhere: Prisma.HrPayrollRunWhereInput = { ...(first(params.payrollId) ? { payrollId: first(params.payrollId) } : {}), payroll: { AND: [accessiblePayrollWhere(user), ...(q ? [{ competence: { contains: q } }] : [])] } };
  const eventWhere: Prisma.HrIntegrationEventWhereInput = q ? { OR: [{ domain: { contains: q, mode: "insensitive" } }, { status: { contains: q, mode: "insensitive" } }] } : {};
  const total = tab === "contratos" ? await prisma.hrEmploymentContract.count({ where: contractWhere }) : tab === "movimentos" ? await prisma.hrMovement.count({ where: movementWhere }) : tab === "direitos" ? await prisma.hrRightEntry.count({ where: rightWhere }) : tab === "calculos" ? await prisma.hrPayrollRun.count({ where: runWhere }) : await prisma.hrIntegrationEvent.count({ where: eventWhere });
  const page = Math.min(Math.max(1, Number.parseInt(first(params.page)) || 1), Math.max(1, Math.ceil(total / 20)));
  const paging = { skip: (page - 1) * 20, take: 20 };
  const href = (value: number) => `/rh/operacoes?${new URLSearchParams({ tab, q, page: String(value), ...(first(params.payrollId) ? { payrollId: first(params.payrollId) } : {}) })}`;
  const selected = first(params.id) ? await prisma.hrEmploymentContract.findUnique({ where: { id: first(params.id) } }) : null;
  const contracts = tab === "contratos" ? await prisma.hrEmploymentContract.findMany({ where: contractWhere, ...paging, include: { employee: true }, orderBy: [{ registration: "asc" }, { id: "asc" }] }) : [];
  const movements = tab === "movimentos" ? await prisma.hrMovement.findMany({ where: movementWhere, ...paging, include: { contract: true }, orderBy: [{ createdAt: "desc" }, { id: "asc" }] }) : [];
  const rights = tab === "direitos" ? await prisma.hrRightEntry.findMany({ where: rightWhere, ...paging, include: { contract: true }, orderBy: [{ createdAt: "desc" }, { id: "asc" }] }) : [];
  const runs = tab === "calculos" ? await prisma.hrPayrollRun.findMany({ where: runWhere, ...paging, include: { payroll: true }, orderBy: [{ createdAt: "desc" }, { id: "asc" }] }) : [];
  const events = tab === "integracoes" ? await prisma.hrIntegrationEvent.findMany({ where: eventWhere, ...paging, orderBy: [{ createdAt: "desc" }, { id: "asc" }] }) : [];
  const regimes = tab === "contratos" ? await prisma.hrEmploymentRegime.findMany({ where: { isActive: true }, include: { ruleSet: true }, orderBy: { code: "asc" } }) : [];
  const roles = tab === "contratos" ? await prisma.role.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }) : [];
  const dt = (value: Date | null | undefined) => value?.toISOString().slice(0, 10) || "";
  const contractFields: OperationField[] = [field("id", "ID", selected?.id, "hidden", false), field("version", "Versão", selected?.version.toString(), "hidden", false), field("employeeId", "ID do servidor (Cadastro funcional)", selected?.employeeId), field("registration", "Matrícula do contrato", selected?.registration), { ...field("regimeId", "Regime", selected?.regimeId), options: [{ value: "", label: "Selecione" }, ...regimes.map(r => ({ value: r.id, label: `${r.name} · ${r.ruleSet.scope}` }))] }, { ...field("roleId", "Cargo", selected?.roleId), options: [{ value: "", label: "Selecione" }, ...roles.map(r => ({ value: r.id, label: r.name }))] }, field("departmentId", "ID do departamento", selected?.departmentId || "", "text", false), field("costCenterId", "ID do centro de custo", selected?.costCenterId || "", "text", false), field("workLocation", "Local de trabalho", selected?.workLocation), field("salaryLevel", "Nível salarial", selected?.salaryLevel || "", "text", false), field("admittedAt", "Admissão", dt(selected?.admittedAt), "date"), field("appointedAt", "Nomeação", dt(selected?.appointedAt), "date", false), field("swornAt", "Posse", dt(selected?.swornAt), "date", false), field("endsAt", "Término", dt(selected?.endsAt), "date", false), field("monthlyHours", "Jornada mensal", selected?.monthlyHours.toString() || "220", "number"), field("salary", "Salário (decimal)", selected?.salary.toFixed(2) || "0.00", "number"), field("details", "Informações adicionais (JSON)", JSON.stringify(selected?.details || {}), "textarea"), field("reason", "Motivo / ato", "", "textarea")];
  return <div className="flex h-full min-h-0 flex-1 flex-col gap-2 p-3">
    <ErpPageTitle title="Operações de RH e Folha" description="Contratos, movimentos, saldos, cálculos rastreáveis e integrações pendentes de configuração." action={<Link href="/rh/esocial">Preparação eSocial</Link>} />
    <nav className="flex flex-wrap gap-2 text-xs">{["contratos", "movimentos", "direitos", "calculos", "integracoes"].map(value => <Link key={value} href={`/rh/operacoes?tab=${value}`} className={`rounded border px-3 py-2 ${tab === value ? "bg-blue-100" : "bg-white"}`}>{value}</Link>)}</nav>
    <Link href="/rh/solicitacoes" className="text-xs underline">Analisar solicitações do Portal</Link>
    {["contratos", "direitos", "calculos"].includes(tab) && <div className="flex gap-2 text-xs"><span>{tab === "calculos" ? "Exportar oficiais fechadas:" : "Exportar filtro integral:"}</span>{["CSV", "XLSX", "PDF"].map(format => {
      const args = new URLSearchParams({ kind: tab === "contratos" ? "CONTRATOS" : tab === "direitos" ? "DIREITOS" : "FOLHA", format, q: tab === "calculos" ? "" : q });
      if (tab === "calculos" && /^(0[1-9]|1[0-2])\/\d{4}$/.test(q)) args.set("competence", q);
      if (tab === "calculos" && first(params.payrollId)) args.set("payrollId", first(params.payrollId));
      return <Link key={format} href={`/api/rh/relatorios?${args}`} className="underline">{format}</Link>;
    })}</div>}
    {tab === "contratos" && <><OperationForm command="contrato" title={selected ? "Salvar revisão do contrato" : "Cadastrar contrato"} fields={contractFields} /><OperationForm command="vincular" title="Vincular servidor à pessoa física existente" fields={[field("employeeId", "ID servidor"), field("personId", "ID pessoa física")]} /></>}
    {tab === "movimentos" && <OperationForm command="movimento" title="Registrar movimento fixo/variável" fields={[field("contractId", "ID contrato"), field("sourceKey", "Chave única da origem", randomUUID()), field("rubricCode", "Código da rubrica"), field("startsAt", "Início", "", "date"), field("endsAt", "Fim", "", "date", false), field("amount", "Valor (BRL)", "0.00", "number"), field("reference", "Referência", "", "text", false), field("notes", "Observação / ato", "", "textarea")]} />}
    {tab === "movimentos" && <OperationForm command="importar" title="Validar / importar lote CSV de verbas fixas ou variáveis" fields={[field("batchKey", "Identificador estável do lote", randomUUID()), { ...field("mode", "Operação"), options: [{ value: "PREVIA", label: "Validar sem gravar" }, { value: "APLICAR", label: "Aplicar lote inteiro" }] }, field("csv", "CSV com cabeçalho e datas AAAA-MM-DD", "matricula;rubrica;valor;inicio;fim;referencia;observacao\n", "textarea")]} />}
    {tab === "movimentos" && <OperationForm command="beneficio" title="Calcular VT/VA pela regra e direito do servidor" fields={[field("contractId", "Contrato"), field("ruleId", "Regra JSON de benefício"), field("competence", "Competência MM/AAAA")]} />}
    {tab === "direitos" && <OperationForm command="direito" title="Registrar aquisição, baixa ou compensação" fields={[field("contractId", "ID contrato"), field("sourceKey", "Chave única da origem", randomUUID()), { ...field("kind", "Direito"), options: ["FERIAS", "LICENCA_PREMIO", "ATS", "BANCO_HORAS", "PROVISAO_FERIAS", "PROVISAO_13", "PROVISAO_LICENCA"].map(value => ({ value, label: value })) }, field("periodStart", "Período início", "", "date"), field("periodEnd", "Período fim", "", "date"), field("quantity", "Quantidade assinada", "0", "number"), field("amount", "Valor assinado", "0.00", "number"), field("details", "Origem e justificativa (JSON)", "{}", "textarea")]} />}
    {tab === "direitos" && <OperationForm command="aquisitivos" title="Gerar aquisitivos de férias pela política" fields={[field("contractId", "Contrato"), field("asOf", "Data de referência", new Date().toISOString().slice(0, 10), "date")]} />}
    {tab === "direitos" && <OperationForm command="reservar-ferias" title="Programar gozo ou pecúnia de férias" fields={[field("contractId", "Contrato"), field("sourceKey", "Chave da solicitação", randomUUID()), field("periodStart", "Aquisitivo início", "", "date"), field("periodEnd", "Aquisitivo fim", "", "date"), { ...field("kind", "Modalidade"), options: ["GOZO", "PECUNIA"].map(value => ({ value, label: value })) }, field("start", "Data de início", "", "date"), field("days", "Dias", "15", "number"), field("reason", "Ato / autorização", "", "textarea")]} />}
    {tab === "calculos" && <OperationForm command="calcular" title="Calcular seleção de contratos" fields={[field("payrollId", "ID folha", first(params.payrollId)), field("requestKey", "Chave da solicitação", randomUUID()), field("contractIds", "IDs de contratos separados por vírgula", "", "textarea"), { ...field("mode", "Modo"), options: ["SIMULACAO", "OFICIAL"].map(value => ({ value, label: value })) }, { ...field("scope", "Escopo"), options: ["DEMONSTRACAO", "HOMOLOGACAO", "PRODUCAO"].map(value => ({ value, label: value })) }]} />}
    <ErpListFrame className="[&>div:nth-last-child(2)]:overflow-y-hidden" toolbar={<form className="flex gap-2"><input type="hidden" name="tab" value={tab} /><input name="q" defaultValue={q} placeholder="Buscar nome/matrícula, competência ou integração" className="h-8 flex-1 rounded border px-2 text-xs" /><button className="rounded border px-3 text-xs">Buscar</button></form>} summary={<p className="text-xs">{total} registros no filtro · página {page}</p>} pagination={<ErpPagination page={page} total={total} pageSize={20} label="registros" previousHref={href(page - 1)} nextHref={href(page + 1)} />}>
      <table className="w-full table-fixed text-left text-xs"><thead className="border-b bg-slate-50"><tr><th className="p-2">Registro / origem</th><th className="p-2">Valores / situação</th><th className="p-2">Ficha</th></tr></thead><tbody>
        {contracts.map(row => <tr key={row.id} className="h-7 border-b"><td className="truncate px-2">{row.registration} · {row.employee.name}</td><td className="px-2">{money(row.salary)} · {row.status} · v{row.version}</td><td className="truncate px-2"><Link href={`/rh/operacoes?tab=contratos&id=${row.id}`}>Editar</Link> · {row.id}</td></tr>)}
        {movements.map(row => <tr key={row.id} className="h-7 border-b"><td className="truncate px-2">{row.contract.registration} · {row.rubricCode}</td><td className="px-2">{money(row.amount)}</td><td className="truncate px-2" title={row.notes}>{row.sourceKey} · {row.notes}</td></tr>)}
        {rights.map(row => <tr key={row.id} className="h-7 border-b"><td className="px-2">{row.contract.registration} · {row.kind}</td><td className="px-2">{row.quantity.toString()} · {money(row.amount)}</td><td className="truncate px-2">{row.sourceKey}</td></tr>)}
        {runs.map(row => <tr key={row.id} className="h-7 border-b"><td className="px-2">{row.payroll.competence} · {row.mode}</td><td className="px-2">{money(row.net)} · {row.status}</td><td className="px-2"><Link href={`/rh/operacoes/calculos/${row.id}`}>Conferir memória e demonstrativos</Link></td></tr>)}
        {events.map(row => <tr key={row.id} className="h-7 border-b"><td className="px-2">{row.domain} · {row.eventType}</td><td className="px-2">{row.status} · {row.environment}</td><td className="truncate px-2" title={row.payloadHash}>{row.sourceKey}</td></tr>)}
      </tbody></table>
      {!total && <p className="p-4 text-sm text-slate-500">Nenhum registro neste filtro.</p>}
    </ErpListFrame>
  </div>;
}
