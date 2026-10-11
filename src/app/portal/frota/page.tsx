import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { municipality } from "@/lib/platform/municipality";
import { loadPublicFleetReport } from "@/lib/frotas/public-report";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `Frota Municipal | ${municipality.prefectureName}`,
  description: "Consulta pública da frota municipal e dos custos conhecidos de abastecimento e manutenção.",
};

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const unknown = (value: number | null) => value == null ? "Não informado" : money(value);

export default async function FrotaPublicaPage({ searchParams }: { searchParams: Promise<{ mes?: string; setor?: string }> }) {
  const sp = await searchParams;
  const now = new Date();
  const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const period = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.mes ?? "") ? sp.mes! : fallback;
  const department = (sp.setor ?? "").slice(0, 128);
  const data = await loadPublicFleetReport(prisma, period, department).catch(() => null);
  const exportUrl = `/api/portal/frota/exportar?mes=${encodeURIComponent(period)}${department ? `&setor=${encodeURIComponent(department)}` : ""}`;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Frota municipal</h1>
      <p className="mt-2 text-sm text-slate-600">
        Veículos e máquinas ativos, consumo mensal de combustível e despesas de manutenção
        conhecidas da {municipality.prefectureName}.
      </p>
      <form className="mt-4 flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1">
          Mês
          <input type="month" name="mes" defaultValue={period} className="h-9 rounded-md border px-2" />
        </label>
        <label className="flex flex-col gap-1">
          Secretaria/setor
          <select name="setor" defaultValue={department} className="h-9 rounded-md border px-2">
            <option value="">Todos os setores</option>
            {data?.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <button className="h-9 rounded-md border px-3">Consultar</button>
        {data && <Link href={exportUrl} className="flex h-9 items-center rounded-md border px-3">Baixar CSV</Link>}
      </form>
      {!data ? <p className="mt-6 rounded-md border bg-white p-4 text-sm text-slate-600">Consulta indisponível no momento.</p> : <>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <p className="rounded-md border bg-white p-3"><b>{data.totals.activeVehicles}</b><br />Veículos ativos no filtro</p>
          <p className="rounded-md border bg-white p-3"><b>{data.totals.liters.toLocaleString("pt-BR")} L</b><br />Combustível no período</p>
          <p className="rounded-md border bg-white p-3"><b>{money(data.totals.fuelCostKnown)}</b><br />Custo conhecido de combustível</p>
          <p className="rounded-md border bg-white p-3"><b>{money(data.totals.maintenanceCostKnown)}</b><br />Custo conhecido de manutenção</p>
        </div>
        {(data.totals.fuelUnknown > 0 || data.totals.maintenanceUnknown > 0) &&
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Existem registros sem valor informado: {data.totals.fuelUnknown} abastecimento(s) e
            {" "}{data.totals.maintenanceUnknown} despesa(s) de manutenção. Os totais financeiros
            acima incluem somente valores conhecidos.
          </p>}
        <div className="mt-4 overflow-x-auto rounded-md border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50"><tr>
              {["Código", "Veículo", "Tipo", "Placa", "Ano", "Secretaria/setor", "Litros", "Combustível (R$)", "Manutenção (R$)"].map(h => <th key={h} className="p-2">{h}</th>)}
            </tr></thead>
            <tbody>{data.rows.map(u => <tr key={u.code} className="border-t">
              <td className="p-2">{u.code}</td>
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.category}</td>
              <td className="p-2">{u.plate ?? "—"}</td>
              <td className="p-2">{u.year ?? "—"}</td>
              <td className="p-2">{u.department}</td>
              <td className="p-2">{u.liters.toLocaleString("pt-BR")}</td>
              <td className="p-2">{unknown(u.fuelCost)}</td>
              <td className="p-2">{unknown(u.maintenanceCost)}</td>
            </tr>)}</tbody>
          </table>
          {!data.rows.length && <p className="p-4 text-sm text-slate-500">Nenhum veículo ativo encontrado.</p>}
        </div>
        <p className="mt-3 text-xs text-slate-500">Os valores apresentados refletem somente os veículos ativos do filtro selecionado e não incluem registros financeiros sem valor definido.</p>
      </>}
      <p className="mt-6 text-sm">
        <Link className="underline" href="/portal/frota/posto">Área do posto credenciado</Link>
        {" · "}
        <Link className="underline" href="/portal/frota/oficina">Área da oficina</Link>
      </p>
    </main>
  );
}
