export type ReportRow = Record<string, string | number>;
export type ReportSection = { title: string; rows: ReportRow[] };

export type DossieUnit = {
  id: string;
  code: string;
  plate: string | null;
  name: string;
  category: string;
  status: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  renavam: string | null;
  consumptions: { occurredAt: Date | null; material: string; quantity: string; measurementUnit: string; cost: number | null }[];
  expenses: { occurredAt: Date | null; description: string; amount: number | null }[];
  usages: { startedAt: Date; endedAt: Date; purpose: string; initialReading: number | null; finalReading: number | null }[];
};

export type DossieFine = { unitId: string; occurredAt: Date; aitNumber: string; infraction: string; amount: number; status: string };
export type DossieOccurrence = { unitId: string; occurredAt: Date; type: string; description: string; involvedValue: number | null };

export type DossieFormatters = {
  label: (v: string) => string;
  money: (v: number) => string;
  date: (v: Date | null) => string;
};

const sum = (values: (number | null | undefined)[]) => values.reduce<number>((total, value) => total + (value || 0), 0);

/**
 * Pure function that consolidates the per-vehicle dossier sections (identification, fuel,
 * maintenance, fines, occurrences, trips and per-vehicle cost totals) plus a single grand
 * total section covering every selected vehicle.
 */
export function buildDossieSections(units: DossieUnit[], fines: DossieFine[], occurrences: DossieOccurrence[], fmt: DossieFormatters): ReportSection[] {
  const sections: ReportSection[] = [];
  let grandFines = 0, grandMaintenance = 0, grandFuel = 0, grandOccurrences = 0, grandTrips = 0, grandDistance = 0;

  for (const u of units) {
    const vehicleLabel = `${u.code}${u.plate ? ` / ${u.plate}` : ""}`;
    sections.push({ title: `Veículo: ${vehicleLabel} — ${u.name}`, rows: [{ "Categoria": fmt.label(u.category), "Situação": fmt.label(u.status), "Marca/Modelo/Ano": `${u.brand || "—"} / ${u.model || "—"} / ${u.year || "—"}`, "RENAVAM": u.renavam || "—" }] });

    const uFines = fines.filter(f => f.unitId === u.id);
    const finesTotal = sum(uFines.map(f => f.amount));
    if (uFines.length) sections.push({ title: `Multas — ${vehicleLabel}`, rows: uFines.map(f => ({ "Data": fmt.date(f.occurredAt), "Auto": f.aitNumber, "Infração": f.infraction, "Valor": fmt.money(f.amount), "Situação": f.status })) });

    const uOccurrences = occurrences.filter(o => o.unitId === u.id);
    const occurrencesTotal = sum(uOccurrences.map(o => o.involvedValue));
    if (uOccurrences.length) sections.push({ title: `Ocorrências/Sinistros — ${vehicleLabel}`, rows: uOccurrences.map(o => ({ "Data": fmt.date(o.occurredAt), "Tipo": fmt.label(o.type), "Descrição": o.description, "Valor envolvido": o.involvedValue == null ? "Não informado" : fmt.money(o.involvedValue) })) });

    const fuelTotal = sum(u.consumptions.map(c => c.cost));
    if (u.consumptions.length) sections.push({ title: `Abastecimentos — ${vehicleLabel}`, rows: u.consumptions.map(c => ({ "Data": fmt.date(c.occurredAt), "Material": c.material, "Qtd": `${c.quantity} ${c.measurementUnit}`, "Custo": c.cost == null ? "Não informado" : fmt.money(c.cost) })) });

    const maintenanceTotal = sum(u.expenses.map(e => e.amount));
    if (u.expenses.length) sections.push({ title: `Manutenções — ${vehicleLabel}`, rows: u.expenses.map(e => ({ "Data": fmt.date(e.occurredAt), "Descrição": e.description, "Valor": e.amount == null ? "Não informado" : fmt.money(e.amount) })) });

    const distanceTotal = sum(u.usages.map(t => t.initialReading != null && t.finalReading != null ? t.finalReading - t.initialReading : null));
    if (u.usages.length) sections.push({ title: `Viagens — ${vehicleLabel}`, rows: u.usages.map(t => ({ "Início": t.startedAt.toISOString(), "Fim": t.endedAt.toISOString(), "Finalidade": t.purpose, "Distância": t.initialReading != null && t.finalReading != null ? `${(t.finalReading - t.initialReading).toFixed(2)} km` : "Não informada" })) });

    const vehicleTotal = finesTotal + occurrencesTotal + fuelTotal + maintenanceTotal;
    sections.push({ title: `Totais — ${vehicleLabel}`, rows: [{ "Multas": fmt.money(finesTotal), "Ocorrências": fmt.money(occurrencesTotal), "Combustível": fmt.money(fuelTotal), "Manutenção": fmt.money(maintenanceTotal), "Viagens (quantidade)": u.usages.length, "Distância percorrida": `${distanceTotal.toFixed(2)} km`, "Total geral do veículo": fmt.money(vehicleTotal) }] });

    grandFines += finesTotal; grandOccurrences += occurrencesTotal; grandFuel += fuelTotal; grandMaintenance += maintenanceTotal; grandTrips += u.usages.length; grandDistance += distanceTotal;
  }

  sections.push({ title: "Total consolidado — todos os veículos selecionados", rows: [{ "Veículos no dossiê": units.length, "Multas": fmt.money(grandFines), "Ocorrências": fmt.money(grandOccurrences), "Combustível": fmt.money(grandFuel), "Manutenção": fmt.money(grandMaintenance), "Viagens (quantidade)": grandTrips, "Distância percorrida": `${grandDistance.toFixed(2)} km`, "Total geral do dossiê": fmt.money(grandFines + grandOccurrences + grandFuel + grandMaintenance) }] });

  return sections;
}
