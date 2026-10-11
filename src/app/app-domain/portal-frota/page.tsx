import { Truck } from "lucide-react";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { cnhStatus, METER_UNIT, type MeterType } from "@/lib/frotas/gestao-engine";
import { TRIP_CHECKLIST } from "@/lib/frotas/portal";
import { driverArrive, driverDepart, resolveDriver } from "./actions";

export const dynamic = "force-dynamic";

const inp = "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:bg-slate-900";
const btn = "h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white";

export default async function PortalFrotaPage({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { context, driver, departmentId } = await resolveDriver();
  const shell = (children: React.ReactNode) => <div className="mx-auto flex w-full max-w-xl flex-col gap-3 overflow-auto p-3"><ErpPageTitle title="Portal da Frota — Motorista" icon={<Truck className="size-4 text-emerald-700" />} />{sp.erro && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{sp.erro}</p>}{sp.ok && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Registro salvo.</p>}{children}</div>;
  if (!driver) return shell(<p className="rounded-md border bg-white p-4 text-sm text-slate-600">Seu usuário não está vinculado a um cadastro de motorista. Peça ao setor de frota para cadastrar você com o mesmo CPF do seu cadastro de servidor.</p>);

  const [open, units, history] = await Promise.all([
    context.prisma.fleetTrip.findFirst({ where: { driverId: driver.id, returnedAt: null } }),
    context.prisma.fleetUnit.findMany({ where: { status: "ATIVO", departmentId: departmentId ?? "__no_department__", operationalStatus: { not: "EM_MANUTENCAO" } }, orderBy: { code: "asc" }, select: { id: true, code: true, name: true, plate: true, meterType: true, currentReading: true } }),
    context.prisma.fleetTrip.findMany({ where: { driverId: driver.id, returnedAt: { not: null } }, orderBy: { departedAt: "desc" }, take: 10 }),
  ]);
  const unitById = new Map(units.map((u) => [u.id, u]));
  const cnh = cnhStatus(driver.cnhExpiresAt);

  return shell(<>
    <section className="rounded-md border bg-white p-3 text-sm dark:bg-slate-900">
      <p className="font-semibold">{driver.name}</p>
      <p className="text-slate-600">CNH {driver.cnhCategory} · validade {driver.cnhExpiresAt.toLocaleDateString("pt-BR", { timeZone: "UTC" })} {cnh.status === "VENCIDA" ? <b className="text-red-700">— vencida</b> : cnh.status === "A_VENCER" ? <b className="text-amber-700">— vence em {cnh.days} dia(s)</b> : null}</p>
    </section>

    {open ? (() => { const u = unitById.get(open.unitId); return (
      <form action={driverArrive} className="flex flex-col gap-3 rounded-md border bg-white p-3 text-sm dark:bg-slate-900">
        <h2 className="font-semibold">Registrar chegada</h2>
        <p className="text-slate-600">{u?.code} · {u?.name} — {open.destination}. Saída {open.departedAt.toLocaleString("pt-BR")} com {Number(open.startReading)} {METER_UNIT[(u?.meterType ?? "HODOMETRO") as MeterType]}.</p>
        <input type="hidden" name="tripId" value={open.id} />
        <label>Leitura de chegada<input name="reading" inputMode="decimal" required className={inp} /></label>
        <label>Foto do painel (opcional)<input type="file" name="photo" accept="image/*" capture="environment" className="mt-1 block w-full text-xs" /></label>
        <label>Observações<input name="notes" className={inp} /></label>
        <button className={btn}>Registrar chegada</button>
      </form>); })() : (
      <form action={driverDepart} className="flex flex-col gap-3 rounded-md border bg-white p-3 text-sm dark:bg-slate-900">
        <h2 className="font-semibold">Registrar saída</h2>
        <label>Veículo<select name="unitId" required className={inp}>{units.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.name}{u.plate ? ` (${u.plate})` : ""}</option>)}</select></label>
        <label>Leitura do painel (km ou horas)<input name="reading" inputMode="decimal" required className={inp} /></label>
        <label>Destino<input name="destination" required className={inp} /></label>
        <label>Finalidade<input name="purpose" required className={inp} /></label>
        <fieldset className="rounded-md border p-2"><legend className="px-1 font-semibold">Checklist do veículo</legend>
          {TRIP_CHECKLIST.map(([k, l]) => <label key={k} className="flex items-center gap-2 py-1"><input type="checkbox" name={`check_${k}`} className="size-5" /> {l}</label>)}
        </fieldset>
        <label>Foto do painel (opcional)<input type="file" name="photo" accept="image/*" capture="environment" className="mt-1 block w-full text-xs" /></label>
        <button className={btn}>Registrar saída</button>
      </form>)}

    <section className="rounded-md border bg-white p-3 text-sm dark:bg-slate-900">
      <h2 className="mb-2 font-semibold">Minhas últimas viagens</h2>
      {!history.length ? <p className="text-slate-500">Nenhuma viagem concluída.</p> : <ul className="divide-y">{history.map((t) => <li key={t.id} className="py-2">{unitById.get(t.unitId)?.code} — {t.destination}<br /><span className="text-xs text-slate-500">{t.departedAt.toLocaleDateString("pt-BR")} · {Number(t.startReading)} → {Number(t.endReading)}</span></li>)}</ul>}
    </section>
  </>);
}
