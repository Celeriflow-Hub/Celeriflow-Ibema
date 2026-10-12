import Link from "next/link";
import { Gauge } from "lucide-react";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { departmentWhere, fleetScope } from "@/lib/frotas/service";
import { averageConsumption, cnhStatus, CONSUMPTION_UNIT, consumptionDeviation, groupCosts, METER_UNIT, tireWear, type CostEntry, type MeterType } from "@/lib/frotas/gestao-engine";
import * as A from "./actions";

export const dynamic = "force-dynamic";

const TABS = [["painel", "Painel e alertas"], ["veiculos", "Medidores e consumo"], ["motoristas", "Motoristas"], ["postos", "Postos credenciados"], ["cotas", "Cotas"], ["ordens", "Ordens de abastecimento"], ["viagens", "Diário de bordo"], ["pneus", "Pneus"], ["multas", "Multas"], ["oficinas", "Oficinas (portal)"], ["custos", "Custos"], ["combustivel", "Saldo Licitação"]] as const;
const inp = "h-8 rounded-md border border-slate-300 bg-white px-2 text-xs dark:bg-slate-900";
const btn = "h-8 rounded-md bg-emerald-700 px-3 text-xs font-semibold text-white";
const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (d: Date | null) => (d ? d.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—");

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-md border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900"><h2 className="mb-2 text-sm font-semibold">{title}</h2>{children}</section>;
}
function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <p className="text-slate-500">Nenhum registro.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-800"><tr>{head.map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t border-slate-100 dark:border-slate-800">{r.map((c, j) => <td key={j} className="p-2 align-top">{c}</td>)}</tr>)}</tbody></table></div>;
}

export default async function FrotaGestaoPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const aba = TABS.some(([k]) => k === sp.aba) ? sp.aba! : "painel";
  const context = await getTenantContextForModule("FROTAS");
  const { prisma } = context;
  const scope = fleetScope(context);
  const units = await prisma.fleetUnit.findMany({ where: { status: "ATIVO", ...departmentWhere(scope) }, orderBy: { code: "asc" }, take: 500 });
  const unitIds = units.map((u) => u.id);
  const [drivers, stations, quotas, orders, trips, tires, fines, fuel, expenses, departments, fuelBalances, contracts] = await Promise.all([
    prisma.fleetDriver.findMany({ where: { active: true, ...(scope.administrator ? {} : { departmentId: scope.departmentId }) }, orderBy: { name: "asc" } }),
    prisma.fleetFuelStation.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.fleetFuelQuota.findMany({ where: { unitId: { in: unitIds } }, orderBy: { period: "desc" }, take: 200 }),
    prisma.fleetFuelOrder.findMany({ where: { unitId: { in: unitIds } }, include: { station: true }, orderBy: { issuedAt: "desc" }, take: 200 }),
    prisma.fleetTrip.findMany({ where: { unitId: { in: unitIds } }, orderBy: { departedAt: "desc" }, take: 200 }),
    prisma.fleetTire.findMany({ where: { OR: [{ unitId: { in: unitIds } }, ...(scope.administrator ? [{ unitId: null }] : [])] }, orderBy: { fireNumber: "asc" }, take: 500 }),
    prisma.fleetFine.findMany({ where: { unitId: { in: unitIds } }, orderBy: { occurredAt: "desc" }, take: 200 }),
    prisma.fleetFuelOrder.findMany({ where: { unitId: { in: unitIds }, status: "ABASTECIDA" }, select: { unitId: true, reading: true, litersFilled: true } }),
    prisma.fleetExpense.findMany({ where: { unitId: { in: unitIds } }, select: { unitId: true, nature: true, amount: true, sourceType: true, sourceId: true } }),
    prisma.department.findMany({ select: { id: true, name: true } }),
    prisma.fleetFuelBalance.findMany({ include: { contract: true } }),
    prisma.contract.findMany({ where: { status: "Vigente" }, select: { id: true, number: true, object: true } }),
  ]);
  const scopedWorkOrderIds = aba === "oficinas" ? (await prisma.fleetWorkOrder.findMany({ where: { unitId: { in: unitIds } }, select: { id: true } })).map(w => w.id) : [];
  const [workOrders, reports] = aba === "oficinas" ? await Promise.all([
    prisma.fleetWorkOrder.findMany({ where: { id: { in: scopedWorkOrderIds }, status: { not: "CONCLUIDA" } }, orderBy: { scheduledAt: "asc" }, take: 200 }),
    prisma.fleetWorkshopReport.findMany({ where: { workOrderId: { in: scopedWorkOrderIds } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]) : [[], []];
  const unitById = new Map(units.map((u) => [u.id, u]));
  const driverById = new Map(drivers.map((d) => [d.id, d]));
  const deptName = new Map(departments.map((d) => [d.id, d.name]));
  const label = (id: string | null) => { const u = id ? unitById.get(id) : null; return u ? `${u.code} · ${u.name}` : "—"; };

  const consumption = units.map((u) => {
    const meter = u.meterType as MeterType;
    const avg = averageConsumption(meter, fuel.filter((f) => f.unitId === u.id).map((f) => ({ reading: Number(f.reading ?? 0), liters: Number(f.litersFilled ?? 0) })));
    return { u, meter, avg, ...consumptionDeviation(meter, avg, u.expectedConsumption ? Number(u.expectedConsumption) : null) };
  });
  const cnhAlerts = drivers.map((d) => ({ d, ...cnhStatus(d.cnhExpiresAt) })).filter((x) => x.status !== "REGULAR");
  const tireAlerts = tires.filter((t) => { const u = t.unitId ? unitById.get(t.unitId) : null; const w = tireWear(t.lifeKm, t.installReading ? Number(t.installReading) : null, u?.currentReading ? Number(u.currentReading) : null); return w != null && w >= 85; });
  // Orders confirmed through the internal page or the station portal create
  // FleetConsumption but do not automatically create FleetExpense.
  const orderReceipts = await prisma.fleetConsumption.findMany({
    where: { unitId: { in: unitIds }, origin: { in: ["ORDEM_ABASTECIMENTO", "PORTAL_POSTO"] } },
    select: { id: true, unitId: true, cost: true },
  });
  const accountedConsumptionIds = new Set(expenses.filter(e => e.sourceType === "CONSUMO").map(e => e.sourceId));
  const costEntries: CostEntry[] = [
    ...orderReceipts.filter(r => !accountedConsumptionIds.has(r.id)).map(r => {
      const u = unitById.get(r.unitId);
      return { unitLabel: label(r.unitId), department: deptName.get(u?.departmentId ?? "") ?? "", costCenter: u?.costCenter ?? "", nature: "COMBUSTIVEL", amount: Number(r.cost ?? 0) };
    }),
    ...expenses.map((e) => { const u = unitById.get(e.unitId); return { unitLabel: label(e.unitId), department: deptName.get(u?.departmentId ?? "") ?? "", costCenter: u?.costCenter ?? "", nature: e.nature, amount: Number(e.amount ?? 0) }; }),
    ...fines.filter((f) => f.status !== "CANCELADA" && f.status !== "RESSARCIDA_CONDUTOR").map((f) => { const u = unitById.get(f.unitId); return { unitLabel: label(f.unitId), department: deptName.get(u?.departmentId ?? "") ?? "", costCenter: u?.costCenter ?? "", nature: "MULTA", amount: Number(f.amount) }; }),
  ];
  const unitOptions = units.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.name}</option>);
  const driverOptions = drivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.cnhCategory})</option>);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-slate-50 p-3 dark:bg-slate-950">
      <ErpPageTitle title="Gestão da Frota" icon={<Gauge className="size-4 text-emerald-700" />} />
      <div className="flex flex-wrap gap-2"><Link href="/frotas/controle" className="inline-flex rounded-md bg-emerald-800 px-3 py-2 text-xs font-semibold text-white">Agenda, guarita, multas, sinistros e autorizações</Link><Link href="/frotas/gestao/sagres" className="inline-flex rounded-md border border-emerald-700 px-3 py-2 text-xs font-semibold text-emerald-800">SAGRES · histórico mensal</Link></div>
      <nav className="flex flex-wrap gap-1 text-xs">{TABS.map(([k, t]) => <Link key={k} href={`?aba=${k}`} className={`rounded-md border px-3 py-1 ${k === aba ? "border-emerald-700 bg-emerald-50 font-semibold text-emerald-800" : "bg-white dark:bg-slate-900"}`}>{t}</Link>)}</nav>
      {sp.erro && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800">{sp.erro}</p>}
      {sp.ok && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">Registro salvo.</p>}

      {aba === "painel" && <div className="grid gap-3 md:grid-cols-2">
        <Card title={`CNH vencida ou a vencer (${cnhAlerts.length})`}><Table head={["Motorista", "Validade", "Situação"]} rows={cnhAlerts.map((x) => [x.d.name, date(x.d.cnhExpiresAt), x.status === "VENCIDA" ? <b key="s" className="text-red-700">Vencida</b> : `Vence em ${x.days} dia(s)`])} /></Card>
        <Card title={`Consumo fora do padrão (${consumption.filter((c) => c.alert).length})`}><Table head={["Veículo", "Média", "Esperado", "Desvio"]} rows={consumption.filter((c) => c.alert).map((c) => [label(c.u.id), `${c.avg} ${CONSUMPTION_UNIT[c.meter]}`, `${c.u.expectedConsumption} ${CONSUMPTION_UNIT[c.meter]}`, `${c.deviationPct}%`])} /></Card>
        <Card title={`Pneus perto do fim da vida útil (${tireAlerts.length})`}><Table head={["Fogo", "Veículo"]} rows={tireAlerts.map((t) => [t.fireNumber, label(t.unitId)])} /></Card>
        <Card title={`Saldos baixos de combustível (${fuelBalances.filter(b => Number(b.quantityContracted) - Number(b.quantityConsumed) <= Number(b.alertThreshold)).length})`}><Table head={["Contrato", "Tipo", "Saldo"]} rows={fuelBalances.filter(b => Number(b.quantityContracted) - Number(b.quantityConsumed) <= Number(b.alertThreshold)).map(b => [b.contract.number, b.fuelType, <b key="s" className="text-red-700">{Number(b.quantityContracted) - Number(b.quantityConsumed)} L</b>])} /></Card>
        <Card title="Pendências"><ul className="list-disc pl-4"><li>{orders.filter((o) => o.status === "EMITIDA").length} ordem(ns) de abastecimento aguardando baixa</li><li>{trips.filter((t) => !t.returnedAt).length} veículo(s) em viagem</li><li>{fines.filter((f) => f.status === "PENDENTE").length} multa(s) pendentes</li></ul></Card>
      </div>}

      {aba === "veiculos" && <Card title="Medidor, combustível e consumo esperado por veículo ou máquina">
        <Table head={["Veículo", "Medidor e leitura", "Consumo médio", "Ajustar"]} rows={consumption.map((c) => [label(c.u.id), `${c.meter === "HORIMETRO" ? "Horímetro" : "Hodômetro"} · ${c.u.currentReading ?? "—"} ${METER_UNIT[c.meter]}`, c.avg == null ? "Sem dados" : <span key="a" className={c.alert ? "font-semibold text-red-700" : ""}>{c.avg} {CONSUMPTION_UNIT[c.meter]}{c.deviationPct != null ? ` (${c.deviationPct}%)` : ""}</span>,
          <form key="f" action={A.saveMeter} className="flex flex-wrap gap-1"><input type="hidden" name="unitId" value={c.u.id} /><select name="meterType" defaultValue={c.meter} className={inp}><option value="HODOMETRO">Hodômetro (km)</option><option value="HORIMETRO">Horímetro (h)</option></select><input name="currentReading" defaultValue={c.u.currentReading?.toString() ?? ""} placeholder="Leitura" className={`${inp} w-20`} /><input name="fuelType" defaultValue={c.u.fuelType ?? ""} placeholder="Combustível" className={`${inp} w-24`} /><input name="expectedConsumption" defaultValue={c.u.expectedConsumption?.toString() ?? ""} placeholder="Consumo esperado" className={`${inp} w-28`} /><input name="costCenter" defaultValue={c.u.costCenter ?? ""} placeholder="Centro de custo" className={`${inp} w-28`} /><button className={btn}>Salvar</button></form>])} />
      </Card>}

      {aba === "motoristas" && <><Card title="Novo motorista"><form action={A.saveDriver} className="flex flex-wrap gap-2"><input name="name" placeholder="Nome" className={inp} required /><input name="cpf" placeholder="CPF" className={inp} required /><input name="cnhNumber" placeholder="Nº CNH" className={inp} required /><input name="cnhCategory" placeholder="Categoria (ex.: AD)" className={`${inp} w-32`} required /><label className="flex items-center gap-1">Validade <input type="date" name="cnhExpiresAt" className={inp} required /></label><button className={btn}>Cadastrar</button></form></Card>
        <Card title="Motoristas"><Table head={["Nome", "CNH", "Categoria", "Validade", "Situação"]} rows={drivers.map((d) => { const s = cnhStatus(d.cnhExpiresAt); return [d.name, d.cnhNumber, d.cnhCategory, date(d.cnhExpiresAt), s.status === "REGULAR" ? "Regular" : s.status === "VENCIDA" ? <b key="v" className="text-red-700">Vencida</b> : <span key="a" className="text-amber-700">A vencer ({s.days} dias)</span>]; })} /></Card></>}

      {aba === "postos" && <><Card title="Credenciar posto"><form action={A.saveStation} className="flex flex-wrap gap-2"><input name="name" placeholder="Razão social" className={inp} required /><input name="cnpj" placeholder="CNPJ" className={inp} required /><input name="contractRef" placeholder="Contrato/ata" className={inp} /><input name="pricePerLiter" placeholder="Preço por litro" className={`${inp} w-28`} /><button className={btn}>Credenciar</button></form></Card>
        <Card title="Postos credenciados"><Table head={["Posto", "CNPJ", "Contrato", "Preço/L"]} rows={stations.map((s) => [s.name, s.cnpj, s.contractRef ?? "—", s.pricePerLiter ? money(Number(s.pricePerLiter)) : "—"])} /></Card></>}

      {aba === "cotas" && <><Card title="Definir cota mensal de combustível"><form action={A.saveQuota} className="flex flex-wrap gap-2"><select name="unitId" className={inp} required>{unitOptions}</select><input type="month" name="period" className={inp} required /><input name="litersLimit" placeholder="Limite (L)" className={`${inp} w-28`} required /><button className={btn}>Salvar cota</button></form></Card>
        <Card title="Cotas"><Table head={["Veículo", "Competência", "Limite", "Usado"]} rows={quotas.map((q) => [label(q.unitId), q.period, `${q.litersLimit} L`, `${orders.filter((o) => o.unitId === q.unitId && o.status !== "CANCELADA" && o.issuedAt.toISOString().startsWith(q.period)).reduce((s, o) => s + Number(o.litersFilled ?? o.litersAuthorized), 0)} L`])} /></Card></>}

      {aba === "ordens" && <><Card title="Emitir ordem de abastecimento"><form action={A.issueFuelOrder} className="flex flex-wrap gap-2"><select name="unitId" className={inp} required>{unitOptions}</select><select name="driverId" className={inp}><option value="">Motorista (opcional)</option>{driverOptions}</select><select name="stationId" className={inp} required>{stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><input name="fuelType" placeholder="Combustível" className={`${inp} w-24`} /><input name="liters" placeholder="Litros" className={`${inp} w-20`} required /><button className={btn}>Emitir</button></form></Card>
        <Card title="Ordens"><p className="mb-2 text-slate-500">Entregue ao motorista o código da ordem e o código de conferência. O posto confirma em /portal/frota/posto.</p><Table head={["Código", "Conferência", "Veículo", "Posto", "Autorizado", "Situação", "Baixa"]} rows={orders.map((o) => [o.code, o.status === "EMITIDA" ? <b key="t" className="font-mono">{o.portalToken ?? "—"}</b> : "—", label(o.unitId), o.station.name, `${o.litersAuthorized} L`, o.status === "ABASTECIDA" ? `Abastecida: ${o.litersFilled} L · leitura ${o.reading}` : o.status,
          o.status === "EMITIDA" ? <form key="b" action={A.confirmFuelOrder} className="flex flex-wrap gap-1"><input type="hidden" name="orderId" value={o.id} /><input name="litersFilled" placeholder="Litros" className={`${inp} w-16`} required /><input name="reading" placeholder="Leitura" className={`${inp} w-20`} required /><input name="pricePerLiter" placeholder="R$/L" className={`${inp} w-16`} /><button className={btn}>Baixar</button></form> : "—"])} /></Card></>}

      {aba === "viagens" && <><Card title="Registrar saída"><form action={A.startTrip} className="flex flex-wrap gap-2"><select name="unitId" className={inp} required>{unitOptions}</select><select name="driverId" className={inp} required>{driverOptions}</select><input name="destination" placeholder="Destino" className={inp} required /><input name="purpose" placeholder="Finalidade" className={inp} required /><input name="startReading" placeholder="Leitura de saída" className={`${inp} w-28`} /><button className={btn}>Registrar saída</button></form></Card>
        <Card title="Diário de bordo"><Table head={["Veículo", "Motorista", "Destino", "Saída", "Leituras", "Chegada"]} rows={trips.map((t) => [label(t.unitId), driverById.get(t.driverId)?.name ?? "—", `${t.destination} — ${t.purpose}`, t.departedAt.toLocaleString("pt-BR"), `${t.startReading} → ${t.endReading ?? "…"}`,
          t.returnedAt ? t.returnedAt.toLocaleString("pt-BR") : <form key="c" action={A.finishTrip} className="flex flex-wrap gap-1"><input type="hidden" name="tripId" value={t.id} /><input name="endReading" placeholder="Leitura" className={`${inp} w-20`} required /><input name="notes" placeholder="Observações" className={`${inp} w-28`} /><button className={btn}>Registrar chegada</button></form>])} /></Card></>}

      {aba === "pneus" && <><Card title="Cadastrar pneu"><form action={A.saveTire} className="flex flex-wrap gap-2"><input name="fireNumber" placeholder="Nº de fogo" className={inp} required /><input name="brand" placeholder="Marca" className={inp} required /><input name="size" placeholder="Medida" className={`${inp} w-24`} required /><select name="unitId" className={inp}><option value="">Em estoque</option>{unitOptions}</select><input name="position" placeholder="Posição" className={`${inp} w-24`} /><input name="lifeKm" placeholder="Vida útil (km)" className={`${inp} w-28`} /><input name="cost" placeholder="Custo" className={`${inp} w-20`} /><button className={btn}>Cadastrar</button></form></Card>
        <Card title="Pneus"><Table head={["Fogo", "Marca/medida", "Veículo", "Posição", "Desgaste"]} rows={tires.map((t) => { const u = t.unitId ? unitById.get(t.unitId) : null; const w = tireWear(t.lifeKm, t.installReading ? Number(t.installReading) : null, u?.currentReading ? Number(u.currentReading) : null); return [t.fireNumber, `${t.brand} ${t.size}`, t.unitId ? label(t.unitId) : "Estoque", t.position ?? "—", w == null ? "—" : `${w}%`]; })} /></Card></>}

      {aba === "multas" && <><Card title="Registrar multa"><form action={A.saveFine} className="flex flex-wrap gap-2"><select name="unitId" className={inp} required>{unitOptions}</select><select name="driverId" className={inp}><option value="">Condutor (opcional)</option>{driverOptions}</select><input name="aitNumber" placeholder="Nº do auto (AIT)" className={inp} required /><input name="infraction" placeholder="Infração" className={inp} required /><input type="date" name="occurredAt" className={inp} required /><input name="amount" placeholder="Valor" className={`${inp} w-20`} required /><input name="points" placeholder="Pontos" className={`${inp} w-16`} /><label className="flex items-center gap-1">Vencimento <input type="date" name="dueAt" className={inp} /></label><button className={btn}>Registrar</button></form></Card>
        <Card title="Multas"><Table head={["AIT", "Veículo", "Condutor", "Data", "Valor", "Situação"]} rows={fines.map((m) => [m.aitNumber, label(m.unitId), m.driverId ? driverById.get(m.driverId)?.name ?? "—" : "Não identificado", date(m.occurredAt), money(Number(m.amount)),
          <form key="s" action={A.updateFineStatus} className="flex gap-1"><input type="hidden" name="fineId" value={m.id} /><select name="status" defaultValue={m.status} className={inp}><option value="PENDENTE" disabled>Pendente</option><option value="PAGA">Paga</option><option value="RECURSO">Em recurso</option><option value="RESSARCIDA_CONDUTOR">Ressarcida pelo condutor</option><option value="CANCELADA">Cancelada</option></select><button className={btn}>Atualizar</button></form>])} /></Card></>}

      {aba === "oficinas" && <><Card title="Ordens de serviço abertas — código para a oficina"><p className="mb-2 text-slate-500">A oficina registra o serviço em /portal/frota/oficina com o código da OS e o código de conferência. A conclusão continua em Frotas → Ordens de serviço.</p><Table head={["Código da OS", "Veículo", "Serviço", "Previsto", "Conferência"]} rows={workOrders.map((w) => [<b key="c" className="font-mono">{w.id.slice(-8).toUpperCase()}</b>, label(w.unitId), w.title, date(w.scheduledAt), <form key="g" action={A.generateWorkshopToken} className="flex items-center gap-2"><input type="hidden" name="workOrderId" value={w.id} /><input name="workshopCnpj" defaultValue={w.workshopCnpj ?? ""} required placeholder="CNPJ da oficina" className={`${inp} w-40`} /><input name="workshopName" defaultValue={w.workshopName ?? ""} required placeholder="Oficina autorizada" className={`${inp} w-40`} />{w.portalToken && <b className="font-mono">{w.portalToken}</b>}<button className={btn}>{w.portalToken ? "Gerar novo" : "Gerar código"}</button></form>])} /></Card>
        <Card title="Registros enviados pelas oficinas"><Table head={["Data", "OS", "Oficina", "Serviço", "Valor", "Situação"]} rows={reports.map((r) => [r.createdAt.toLocaleString("pt-BR"), r.workOrderId.slice(-8).toUpperCase(), `${r.workshopName} (${r.workshopCnpj})`, `${r.performed}${r.parts ? ` · Peças: ${r.parts}` : ""}`, r.amount ? money(Number(r.amount)) : "—", r.status === "RECEBIDO" ? <form key="r" action={A.reviewWorkshopReport} className="flex gap-1"><input type="hidden" name="reportId" value={r.id} /><button name="status" value="CONFERIDO" className={btn}>Conferido</button><button name="status" value="RECUSADO" className="h-8 rounded-md border border-red-300 px-3 text-xs font-semibold text-red-700">Recusar</button></form> : r.status])} /></Card></>}

      {aba === "custos" && <div className="grid gap-3 md:grid-cols-2">
        {([["unitLabel", "Custo por veículo"], ["department", "Custo por secretaria"], ["costCenter", "Custo por centro de custo"], ["nature", "Custo por natureza"]] as const).map(([k, t]) => <Card key={k} title={t}><Table head={["", "Total"]} rows={groupCosts(costEntries, k).map((g) => [g.label, money(g.total)])} /></Card>)}
        <p className="text-xs text-slate-500 md:col-span-2">Inclui gastos lançados na frota (abastecimentos, manutenções, seguros) e multas não ressarcidas. Para exportar, use Frotas → Emissões e relatórios.</p>
      </div>}
    </div>
  );
}
