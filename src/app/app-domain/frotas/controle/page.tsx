import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { departmentWhere, fleetScope } from "@/lib/frotas/service";
import { averageConsumption, CONSUMPTION_UNIT, type MeterType } from "@/lib/frotas/gestao-engine";
import { CNH_SUSPENSION_POINTS, consumptionStatus, driverEligibility } from "@/lib/frotas/tr-rules";
import { FLEET_ATTACHMENT_EXTENSIONS } from "@/lib/frotas/tr-rules";
import { FLEET_ATTACHMENT_OWNER_LABELS } from "@/lib/frotas/attachments";
import * as A from "./actions";

export const dynamic = "force-dynamic";

const TABS = [["cadastro", "Cadastro complementar"], ["agenda", "Agenda e destinos"], ["guarita", "Guarita"], ["motoristas", "CNH e pontos"], ["baterias", "Baterias"], ["seguros", "Seguros e taxas"], ["autorizacoes", "Autorizações de serviço"], ["multas", "Multas (CTB)"], ["sinistros", "Ocorrências e sinistros"], ["consumo", "Consumo alto/normal/baixo"], ["anexos", "Anexos"]] as const;
const inp = "h-9 rounded-md border border-slate-400 bg-white px-2 text-sm dark:bg-slate-900";
const btn = "h-9 rounded-md bg-emerald-800 px-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const money = (v: unknown) => (v == null ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
const dt = (d: Date | null) => (d ? d.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—");
const dtt = (d: Date | null) => (d ? d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—");

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section aria-label={title} className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="mb-2 font-semibold">{title}</h2>{children}</section>;
}
function Table({ caption, head, rows }: { caption: string; head: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <p className="text-slate-600">Nenhum registro.</p>;
  return <div className="overflow-x-auto"><table className="w-full text-left"><caption className="sr-only">{caption}</caption><thead className="bg-slate-100 dark:bg-slate-800"><tr>{head.map((h) => <th scope="col" key={h} className="p-2 font-semibold">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t border-slate-100 dark:border-slate-800">{r.map((c, j) => <td key={j} className="p-2 align-top">{c}</td>)}</tr>)}</tbody></table></div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-0.5 text-xs font-medium">{label}{children}</label>;
}

export default async function FrotaControlePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const aba = TABS.some(([k]) => k === sp.aba) ? sp.aba! : "cadastro";
  const context = await getTenantContextForModule("FROTAS");
  const { prisma } = context;
  const scope = fleetScope(context);
  const units = await prisma.fleetUnit.findMany({ where: { status: "ATIVO", ...departmentWhere(scope) }, orderBy: { code: "asc" }, take: 500 });
  const ids = units.map((u) => u.id);
  const unitById = new Map(units.map((u) => [u.id, u]));
  const label = (id: string | null) => { const u = id ? unitById.get(id) : null; return u ? `${u.code} · ${u.plate ?? u.name}` : "—"; };
  const [drivers, schedules, destinations, gate, batteries, policies, auths, fines, ctb, occurrences, claims, fuel] = await Promise.all([
    prisma.fleetDriver.findMany({ where: { ...(scope.administrator ? {} : { departmentId: scope.departmentId }) }, orderBy: { name: "asc" } }),
    prisma.fleetSchedule.findMany({ where: { unitId: { in: ids } }, orderBy: { startsAt: "desc" }, take: 200 }),
    prisma.fleetDestination.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.fleetGateEvent.findMany({ where: { unitId: { in: ids } }, orderBy: { occurredAt: "desc" }, take: 300 }),
    prisma.fleetBattery.findMany({ where: { unitId: { in: ids } }, orderBy: { installedAt: "desc" }, take: 200 }),
    prisma.fleetInsurancePolicy.findMany({ where: { unitId: { in: ids } }, orderBy: { endsAt: "asc" }, take: 300 }),
    prisma.fleetServiceAuthorization.findMany({ where: { unitId: { in: ids } }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.fleetFine.findMany({ where: { unitId: { in: ids }, ...(sp.placa ? { unitId: { in: units.filter((u) => u.plate?.includes(sp.placa!.toUpperCase())).map((u) => u.id) } } : {}), ...(sp.situacao ? { status: sp.situacao } : {}) }, orderBy: { occurredAt: "desc" }, take: 300 }),
    prisma.fleetCtbInfraction.findMany({ orderBy: { code: "asc" } }),
    prisma.fleetOccurrence.findMany({ where: { unitId: { in: ids } }, orderBy: { occurredAt: "desc" }, take: 200 }),
    prisma.fleetClaim.findMany({ where: { unitId: { in: ids } }, take: 200 }),
    prisma.fleetFuelOrder.findMany({ where: { unitId: { in: ids }, status: "ABASTECIDA" }, select: { unitId: true, reading: true, litersFilled: true } }),
  ]);
  const authIds = auths.map((a) => a.id), fineIds = fines.map((f) => f.id), claimIds = claims.map((c) => c.id), driverIds = drivers.map((d) => d.id);
  const attachments = aba === "anexos" ? await prisma.fleetAttachment.findMany({ where: { OR: [
    { ownerType: "VEICULO", ownerId: { in: ids } },
    { ownerType: "MOTORISTA", ownerId: { in: driverIds } },
    { ownerType: "MULTA", ownerId: { in: fineIds } },
    { ownerType: "SINISTRO", ownerId: { in: claimIds } },
    { ownerType: "AUTORIZACAO", ownerId: { in: authIds } },
  ] }, orderBy: { createdAt: "desc" }, take: 300 }) : [];
  const driverName = new Map(drivers.map((d) => [d.id, d.name]));
  const eligible = drivers.filter((d) => !driverEligibility({ cnhNumber: d.cnhNumber, cnhExpiresAt: d.cnhExpiresAt, points: d.cnhPoints, active: d.active }));
  const unitOptions = units.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.plate ?? u.name}</option>);
  const driverOptions = eligible.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.cnhCategory})</option>);
  const claimByOcc = new Map(claims.map((c) => [c.occurrenceId, c]));
  const outside = new Set<string>();
  for (const u of units) { const last = gate.find((g) => g.unitId === u.id); if (last?.kind === "SAIDA") outside.add(u.id); }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-slate-50 p-3 dark:bg-slate-950">
      <ErpPageTitle title="Controle da Frota — Termo de Referência" icon={<ClipboardCheck className="size-4 text-emerald-800" />} />
      <nav aria-label="Rotinas de controle da frota" className="flex flex-wrap gap-1 text-sm">{TABS.map(([k, t]) => <Link key={k} href={`?aba=${k}`} aria-current={k === aba ? "page" : undefined} className={`rounded-md border px-3 py-1 ${k === aba ? "border-emerald-800 bg-emerald-50 font-semibold text-emerald-900" : "bg-white dark:bg-slate-900"}`}>{t}</Link>)}</nav>
      {sp.erro && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-900">{sp.erro}</p>}
      {sp.ok && <p role="status" className="rounded-md border border-emerald-300 bg-emerald-50 p-2 text-sm text-emerald-900">Registro salvo.</p>}

      {aba === "cadastro" && <Card title="Dados complementares do veículo (espécie, cor, tanque, FIPE, aquisição)">
        <Table caption="Veículos" head={["Veículo", "RENAVAM", "Dados", "Atualizar"]} rows={units.map((u) => [label(u.id), u.renavam ?? "—", `${u.species ?? "—"} · ${u.color ?? "—"} · tanque ${u.tankCapacity ?? "—"} L · FIPE ${u.fipeCode ?? "—"} · aquisição ${dt(u.acquisitionDate)}`,
          <form key="f" action={A.saveVehicleDetails} className="flex flex-wrap items-end gap-1"><input type="hidden" name="unitId" value={u.id} />
            <F label="Espécie"><select name="species" defaultValue={u.species ?? ""} className={inp}><option value="">—</option><option>PASSAGEIRO</option><option>CARGA</option><option>MISTO</option><option>ESPECIAL</option><option>MAQUINA</option></select></F>
            <F label="Cor"><input name="color" defaultValue={u.color ?? ""} className={`${inp} w-24`} /></F>
            <F label="Tanque (L)"><input name="tankCapacity" inputMode="decimal" defaultValue={u.tankCapacity?.toString() ?? ""} className={`${inp} w-20`} /></F>
            <F label="Código FIPE"><input name="fipeCode" defaultValue={u.fipeCode ?? ""} className={`${inp} w-28`} /></F>
            <F label="Aquisição"><input type="date" name="acquisitionDate" defaultValue={u.acquisitionDate?.toISOString().slice(0, 10) ?? ""} className={inp} /></F>
            {u.currentReading == null && <F label="Marcador"><select name="meterType" defaultValue={u.meterType} className={inp}><option value="HODOMETRO">Hodômetro</option><option value="HORIMETRO">Horímetro</option><option value="SEM_MARCADOR">Sem marcador</option></select></F>}
            <button className={btn}>Salvar</button></form>])} />
        <p className="mt-2 text-slate-600">Dados de bens patrimoniais (setor, responsável, aquisição) continuam vindo do Patrimônio sem duplicação.</p>
      </Card>}

      {aba === "agenda" && <>
        <Card title="Agendar viagem, serviço ou conserto"><form action={A.createSchedule} className="flex flex-wrap items-end gap-2">
          <F label="Veículo"><select name="unitId" required className={inp}>{unitOptions}</select></F>
          <F label="Motorista"><select name="driverId" className={inp}><option value="">—</option>{driverOptions}</select></F>
          <F label="Tipo"><select name="kind" className={inp}><option>VIAGEM</option><option>SERVICO</option><option>CONSERTO</option><option>OBRIGACAO</option></select></F>
          <F label="Motivo e finalidade"><input name="purpose" required className={inp} /></F>
          <F label="Destino"><input name="destination" list="destinos" className={inp} /></F>
          <datalist id="destinos">{destinations.map((d) => <option key={d.id} value={d.name} />)}</datalist>
          <F label="Início"><input type="datetime-local" name="startsAt" required className={inp} /></F>
          <F label="Término"><input type="datetime-local" name="endsAt" required className={inp} /></F>
          <button className={btn}>Agendar</button></form></Card>
        <Card title="Agenda (por veículo, setor e motorista)"><Table caption="Agenda" head={["Período", "Veículo", "Motorista", "Tipo", "Finalidade", "Situação", ""]} rows={schedules.map((s) => [`${dtt(s.startsAt)} – ${dtt(s.endsAt)}`, label(s.unitId), s.driverId ? driverName.get(s.driverId) ?? "—" : "—", s.kind, `${s.purpose}${s.destination ? ` → ${s.destination}` : ""}`, s.status, s.status === "AGENDADO" ? <form key="c" action={A.cancelSchedule}><input type="hidden" name="id" value={s.id} /><button className="text-red-800 underline">Cancelar</button></form> : null])} /></Card>
        <Card title="Cadastro de destinos"><form action={A.saveDestination} className="mb-2 flex flex-wrap items-end gap-2"><F label="Destino"><input name="name" required className={inp} /></F><F label="Cidade"><input name="city" className={inp} /></F><F label="Distância (km)"><input name="distanceKm" inputMode="decimal" className={`${inp} w-24`} /></F><button className={btn}>Cadastrar</button></form>
          <Table caption="Destinos" head={["Destino", "Cidade", "km"]} rows={destinations.map((d) => [d.name, d.city ?? "—", d.distanceKm?.toString() ?? "—"])} /></Card>
      </>}

      {aba === "guarita" && <>
        <Card title="Registrar saída ou entrada do pátio"><form action={A.registerGate} className="flex flex-wrap items-end gap-2">
          <F label="Veículo"><select name="unitId" required className={inp}>{units.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.plate ?? u.name}{outside.has(u.id) ? " (fora do pátio)" : ""}</option>)}</select></F>
          <F label="Movimento"><select name="kind" className={inp}><option value="SAIDA">Saída</option><option value="ENTRADA">Entrada</option></select></F>
          <F label="Motorista (saída)"><select name="driverId" className={inp}><option value="">—</option>{driverOptions}</select></F>
          <F label="Leitura do marcador"><input name="reading" inputMode="decimal" className={`${inp} w-28`} /></F>
          <F label="Observação"><input name="notes" className={inp} /></F>
          <button className={btn}>Registrar</button></form>
          <p className="mt-2 text-slate-600">Só aparecem motoristas com CNH válida e abaixo de {CNH_SUSPENSION_POINTS} pontos.</p></Card>
        <Card title={`Movimentação da garagem — ${outside.size} veículo(s) fora`}><Table caption="Guarita" head={["Data e hora", "Veículo", "Movimento", "Motorista", "Leitura"]} rows={gate.map((g) => [dtt(g.occurredAt), label(g.unitId), g.kind === "SAIDA" ? "Saída" : "Entrada", g.driverId ? driverName.get(g.driverId) ?? "—" : "—", g.reading?.toString() ?? "—"])} /></Card>
      </>}

      {aba === "motoristas" && <Card title="CNH, pontuação e vínculo"><Table caption="Motoristas" head={["Motorista", "CNH", "Validade", "Pontos", "Situação", "Atualizar"]} rows={drivers.map((d) => { const p = driverEligibility({ cnhNumber: d.cnhNumber, cnhExpiresAt: d.cnhExpiresAt, points: d.cnhPoints, active: d.active }); return [d.name + (d.outsourced ? " (terceirizado)" : ""), `${d.cnhNumber} · ${d.cnhCategory}`, dt(d.cnhExpiresAt), String(d.cnhPoints), p ? <b key="b" className="text-red-800">{p}</b> : "Apto",
        <form key="f" action={A.saveDriverPoints} className="flex items-end gap-1"><input type="hidden" name="driverId" value={d.id} /><F label="Pontos"><input name="cnhPoints" defaultValue={d.cnhPoints} inputMode="numeric" className={`${inp} w-16`} /></F><label className="flex items-center gap-1 text-xs"><input type="checkbox" name="outsourced" defaultChecked={d.outsourced} /> Terceirizado</label><button className={btn}>Salvar</button></form>]; })} />
        <p className="mt-2 text-slate-600">Cadastro de novos motoristas: Gestão da Frota → Motoristas.</p></Card>}

      {aba === "baterias" && <><Card title="Instalar ou trocar bateria"><form action={A.installBattery} className="flex flex-wrap items-end gap-2"><F label="Veículo"><select name="unitId" required className={inp}>{unitOptions}</select></F><F label="Identificação"><input name="identifier" required className={inp} /></F><F label="Marca"><input name="brand" required className={inp} /></F><F label="Data"><input type="date" name="installedAt" required className={inp} /></F><F label="Custo (R$)"><input name="cost" inputMode="decimal" className={`${inp} w-24`} /></F><button className={btn}>Registrar</button></form></Card>
        <Card title="Histórico de baterias"><Table caption="Baterias" head={["Veículo", "Identificação", "Marca", "Instalada", "Retirada", "Custo"]} rows={batteries.map((b) => [label(b.unitId), b.identifier, b.brand, dt(b.installedAt), b.removedAt ? dt(b.removedAt) : "Em uso", money(b.cost)])} /></Card></>}

      {aba === "seguros" && <><Card title="Seguro obrigatório, facultativo ou licenciamento"><form action={A.savePolicy} className="flex flex-wrap items-end gap-2"><F label="Veículo"><select name="unitId" required className={inp}>{unitOptions}</select></F><F label="Tipo"><select name="kind" className={inp}><option value="FACULTATIVO">Seguro facultativo</option><option value="OBRIGATORIO">Seguro obrigatório / licenciamento</option></select></F><F label="Seguradora / órgão"><input name="insurer" required className={inp} /></F><F label="Apólice / guia"><input name="policyNumber" required className={inp} /></F><F label="Início"><input type="date" name="startsAt" required className={inp} /></F><F label="Fim"><input type="date" name="endsAt" required className={inp} /></F><F label="Valor"><input name="premium" inputMode="decimal" className={`${inp} w-24`} /></F><button className={btn}>Salvar</button></form></Card>
        <Card title="Obrigações e vencimentos"><Table caption="Seguros" head={["Veículo", "Tipo", "Seguradora", "Apólice", "Vigência", "Valor", "Situação"]} rows={policies.map((p) => [label(p.unitId), p.kind === "FACULTATIVO" ? "Facultativo" : "Obrigatório", p.insurer, p.policyNumber, `${dt(p.startsAt)} – ${dt(p.endsAt)}`, money(p.premium), p.endsAt < new Date() ? <b key="v" className="text-red-800">Vencido</b> : "Vigente"])} /></Card></>}

      {aba === "autorizacoes" && <><Card title="Emitir autorização de serviço"><form action={A.issueServiceAuthorization} className="flex flex-wrap items-end gap-2"><F label="Veículo"><select name="unitId" required className={inp}>{unitOptions}</select></F><F label="Motorista"><select name="driverId" className={inp}><option value="">—</option>{driverOptions}</select></F><F label="Destino"><input name="destination" className={inp} /></F><F label="Fornecedor / oficina"><input name="supplierName" required className={inp} /></F><F label="CNPJ"><input name="supplierCnpj" className={inp} /></F><F label="Serviço"><input name="description" required className={inp} /></F><F label="Valor limite"><input name="amountLimit" inputMode="decimal" required className={`${inp} w-24`} /></F><F label="Origem da contratação"><select name="procurementKind" className={inp}><option value="">—</option><option value="DISPENSA">Compra dispensável</option><option value="LICITACAO">Licitação</option><option value="ATA">Ata de registro de preços</option></select></F><F label="Nº do processo/ordem"><input name="procurementRef" className={inp} /></F><F label="Validade"><input type="date" name="validUntil" className={inp} /></F><button className={btn}>Emitir</button></form>
          <p className="mt-2 text-slate-600">Use o link Imprimir de cada autorização para gerar o documento oficial formatado.</p></Card>
        <Card title="Autorizações de serviço"><Table caption="Autorizações" head={["Código", "Veículo", "Motorista", "Destino", "Fornecedor", "Serviço", "Limite", "Contratação", "Situação", "Imprimir", "Executar"]} rows={auths.map((a) => [a.code, label(a.unitId), a.driverId ? driverName.get(a.driverId) ?? "—" : "—", a.destination ?? "—", a.supplierName, a.description, money(a.amountLimit), a.procurementRef ? `${a.procurementKind} ${a.procurementRef}` : "—", a.status === "EXECUTADA" ? `Executada · ${money(a.amountActual)}` : a.status,
          <Link key="p" href={`/api/frotas/relatorios?documentType=auth&documentId=${a.id}&format=print`} target="_blank" className="font-semibold text-emerald-900 underline underline-offset-2">Imprimir</Link>,
          a.status === "EMITIDA" ? <form key="e" action={A.executeServiceAuthorization} className="flex items-end gap-1"><input type="hidden" name="id" value={a.id} /><F label="Valor executado"><input name="amountActual" inputMode="decimal" required className={`${inp} w-24`} /></F><button className={btn}>Lançar despesa</button></form> : "—"])} /></Card></>}

      {aba === "multas" && <><Card title="Registrar multa (tabela CTB)"><form action={A.registerFine} className="flex flex-wrap items-end gap-2"><F label="Veículo"><select name="unitId" required className={inp}>{unitOptions}</select></F><F label="Motorista"><select name="driverId" className={inp}><option value="">—</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></F><F label="Infração (CTB)"><select name="ctbCode" required className={`${inp} max-w-72`}>{ctb.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.description} ({c.points} pts)</option>)}</select></F><F label="Nº do auto"><input name="aitNumber" required className={inp} /></F><F label="Cidade da infração"><input name="city" required className={inp} /></F><F label="Data"><input type="date" name="occurredAt" required className={inp} /></F><F label="Vencimento"><input type="date" name="dueAt" className={inp} /></F><button className={btn}>Registrar</button></form></Card>
        <Card title="Consulta de multas"><form className="mb-2 flex flex-wrap items-end gap-2"><input type="hidden" name="aba" value="multas" /><F label="Placa"><input name="placa" defaultValue={sp.placa ?? ""} className={inp} /></F><F label="Situação"><select name="situacao" defaultValue={sp.situacao ?? ""} className={inp}><option value="">Todas</option><option>PENDENTE</option><option>PAGA_PARCIAL</option><option>PAGA</option></select></F><button className={btn}>Filtrar</button></form>
          <Table caption="Multas" head={["Auto", "Veículo", "Infração", "Cidade", "Motorista", "Data / venc.", "Valor", "Situação", "Pagamento"]} rows={fines.map((m) => [m.aitNumber, label(m.unitId), m.infraction, m.city ?? "—", m.driverId ? driverName.get(m.driverId) ?? "—" : "—", `${dt(m.occurredAt)} / ${dt(m.dueAt)}`, money(m.amount), m.status, m.status === "PAGA" ? `${dt(m.paidAt)} · ${money(m.paidAmount)}` :
            <form key="p" action={A.payFine} className="flex items-end gap-1"><input type="hidden" name="id" value={m.id} /><F label="Valor"><input name="paidAmount" inputMode="decimal" required className={`${inp} w-20`} /></F><F label="Data"><input type="date" name="paidAt" required className={inp} /></F><F label="Comprovante"><input name="paymentReference" className={`${inp} w-28`} /></F><button className={btn}>Pagar</button></form>])} /></Card></>}

      {aba === "sinistros" && <><Card title="Registrar ocorrência ou avaria"><form action={A.registerOccurrence} className="flex flex-wrap items-end gap-2"><F label="Veículo"><select name="unitId" required className={inp}>{unitOptions}</select></F><F label="Tipo"><select name="type" className={inp}><option>AVARIA</option><option>ACIDENTE</option><option>FURTO</option><option>OUTRO</option></select></F><F label="Data"><input type="date" name="occurredAt" required className={inp} /></F><F label="Descrição"><input name="description" required className={inp} /></F><F label="Valor envolvido"><input name="involvedValue" inputMode="decimal" className={`${inp} w-24`} /></F><F label="Latitude"><input name="latitude" inputMode="decimal" className={`${inp} w-28`} /></F><F label="Longitude"><input name="longitude" inputMode="decimal" className={`${inp} w-28`} /></F><button className={btn}>Registrar</button></form></Card>
        <Card title="Ocorrências e sinistros"><Table caption="Ocorrências" head={["Data", "Veículo", "Tipo", "Descrição", "Local", "Sinistro"]} rows={occurrences.map((o) => { const c = claimByOcc.get(o.id); return [dt(o.occurredAt), label(o.unitId), o.type, o.description, o.latitude && o.longitude ? <a key="m" className="text-emerald-900 underline" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${o.latitude}&mlon=${o.longitude}#map=17/${o.latitude}/${o.longitude}`}>Ver no mapa</a> : "—",
          c ? `${c.responsibility} · ${c.insurer ?? "sem seguro vigente"} ${c.policyNumber ?? ""} · oficina ${c.workshopName ?? "—"} · ${(c.parties as unknown[]).length} parte(s)` :
          <form key="s" action={A.openClaim} className="flex flex-wrap items-end gap-1"><input type="hidden" name="occurrenceId" value={o.id} /><F label="Responsabilidade"><select name="responsibility" className={inp}><option value="PROPRIO">Própria</option><option value="TERCEIROS">Terceiros</option><option value="OUTROS">Outros</option></select></F><F label="Oficina"><input name="workshopName" className={`${inp} w-28`} /></F><F label="Placa envolvida"><input name="partyPlate" className={`${inp} w-24`} /></F><F label="Proprietário"><input name="partyOwner" className={`${inp} w-28`} /></F><F label="Condutor"><input name="partyDriver" className={`${inp} w-28`} /></F><button className={btn}>Abrir sinistro</button></form>]; })} /></Card></>}

      {aba === "consumo" && <Card title="Média de consumo por veículo"><Table caption="Consumo" head={["Veículo", "Média", "Esperado", "Status"]} rows={units.filter((u) => u.meterType !== "SEM_MARCADOR").map((u) => { const m = u.meterType as MeterType; const avg = averageConsumption(m, fuel.filter((x) => x.unitId === u.id).map((x) => ({ reading: Number(x.reading ?? 0), liters: Number(x.litersFilled ?? 0) }))); const st = consumptionStatus(m, avg, u.expectedConsumption ? Number(u.expectedConsumption) : null); return [label(u.id), avg == null ? "Sem dados" : `${avg} ${CONSUMPTION_UNIT[m]}`, u.expectedConsumption ? `${u.expectedConsumption} ${CONSUMPTION_UNIT[m]}` : "Não definido", st == null ? "—" : st === "ALTO" ? <b key="a" className="text-red-800">Alto</b> : st === "BAIXO" ? "Baixo" : "Normal"]; })} /></Card>}

      {aba === "anexos" && (() => {
        const fineLabel = new Map(fines.map((f) => [f.id, `Multa ${f.aitNumber} · ${label(f.unitId)}`]));
        const claimLabel = new Map(claims.map((c) => [c.id, `Sinistro ${dt(c.createdAt)} · ${label(c.unitId)}`]));
        const authLabel = new Map(auths.map((a) => [a.id, `${a.code} · ${label(a.unitId)}`]));
        const ownerDescription = (ownerType: string, ownerId: string | null) => {
          if (!ownerId) return "—";
          if (ownerType === "VEICULO") return label(ownerId);
          if (ownerType === "MOTORISTA") return driverName.get(ownerId) ?? "—";
          if (ownerType === "MULTA") return fineLabel.get(ownerId) ?? "—";
          if (ownerType === "SINISTRO") return claimLabel.get(ownerId) ?? "—";
          if (ownerType === "AUTORIZACAO") return authLabel.get(ownerId) ?? "—";
          return "—";
        };
        const sizeKb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
        return (
          <section aria-labelledby="anexos-titulo" className="flex flex-col gap-3">
            <Card title="Anexar documento (item 1.578 do Termo de Referência)">
              <form action={A.uploadFleetAttachmentAction} className="flex flex-wrap items-end gap-2" aria-describedby="anexos-ajuda">
                <F label="Registro">
                  <select name="ownerRef" required className={`${inp} max-w-80`} aria-label="Registro ao qual o anexo pertence">
                    <option value="">Selecione…</option>
                    <optgroup label={FLEET_ATTACHMENT_OWNER_LABELS.VEICULO}>{units.map((u) => <option key={`v-${u.id}`} value={`VEICULO|${u.id}`}>{u.code} · {u.plate ?? u.name}</option>)}</optgroup>
                    <optgroup label={FLEET_ATTACHMENT_OWNER_LABELS.MOTORISTA}>{drivers.map((d) => <option key={`m-${d.id}`} value={`MOTORISTA|${d.id}`}>{d.name}</option>)}</optgroup>
                    <optgroup label={FLEET_ATTACHMENT_OWNER_LABELS.MULTA}>{fines.map((f) => <option key={`f-${f.id}`} value={`MULTA|${f.id}`}>{f.aitNumber} · {label(f.unitId)}</option>)}</optgroup>
                    <optgroup label={FLEET_ATTACHMENT_OWNER_LABELS.SINISTRO}>{claims.map((c) => <option key={`s-${c.id}`} value={`SINISTRO|${c.id}`}>{dt(c.createdAt)} · {label(c.unitId)}</option>)}</optgroup>
                    <optgroup label={FLEET_ATTACHMENT_OWNER_LABELS.AUTORIZACAO}>{auths.map((a) => <option key={`a-${a.id}`} value={`AUTORIZACAO|${a.id}`}>{a.code} · {label(a.unitId)}</option>)}</optgroup>
                  </select>
                </F>
                <F label="Arquivo (máx. 20 MB)">
                  <input type="file" name="file" required className={inp} aria-label="Arquivo do anexo" accept={FLEET_ATTACHMENT_EXTENSIONS.map((e) => `.${e}`).join(",")} />
                </F>
                <button className={btn}>Enviar anexo</button>
              </form>
              <p id="anexos-ajuda" className="mt-2 text-slate-600">Formatos aceitos: {FLEET_ATTACHMENT_EXTENSIONS.join(", ").toUpperCase()}. Tamanho máximo de 20 MB por arquivo.</p>
            </Card>
            <Card title="Anexos do setor">
              <h3 id="anexos-titulo" className="sr-only">Lista de anexos</h3>
              <Table caption="Anexos" head={["Tipo", "Registro", "Arquivo", "Tamanho", "Enviado em", "Abrir", "Excluir"]} rows={attachments.map((a) => [
                FLEET_ATTACHMENT_OWNER_LABELS[a.ownerType as keyof typeof FLEET_ATTACHMENT_OWNER_LABELS] ?? a.ownerType,
                ownerDescription(a.ownerType, a.ownerId),
                a.fileName,
                sizeKb(a.sizeBytes),
                dtt(a.createdAt),
                <Link key="o" href={`/api/frotas/anexos/${a.id}`} target="_blank" className="font-semibold text-emerald-900 underline underline-offset-2" aria-label={`Abrir anexo ${a.fileName}`}>Abrir</Link>,
                <form key="d" action={A.deleteFleetAttachmentAction}><input type="hidden" name="id" value={a.id} /><button className="text-red-800 underline" aria-label={`Excluir anexo ${a.fileName}`}>Excluir</button></form>,
              ])} />
            </Card>
          </section>
        );
      })()}
    </div>
  );
}
