/**
 * Read-only reconciliation of a monthly Frota fuel ledger. Never updates
 * operational data or creates a SAGRES submission. Certified comparison
 * deliberately uses the original input rows rather than current unit status.
 */
export type FuelLedgerRow = {
  id: string;
  unitId: string;
  material: string;
  measurementUnit: string;
  quantity: number;
  occurredAt: string; // YYYY-MM-DD, in the reporting competence
  origin: string;
  cost: number | null;
  reference: string | null;
};
export type CertifiedFuelRow = Pick<
  FuelLedgerRow, "id" | "unitId" | "material" | "measurementUnit" | "quantity" | "occurredAt"
> & Partial<Pick<FuelLedgerRow, "cost" | "origin" | "reference">>;
export type FuelOrderRow = {
  id: string;
  code: string;
  unitId: string;
  status: string;
  consumptionId: string | null;
  litersFilled: number | null;
  pricePerLiter: number | null;
};
export type FuelExpenseRow = {
  id: string;
  unitId: string;
  nature: string;
  sourceType: string;
  sourceId: string;
  sourceKey: string;
  amount: number | null;
};
export type FleetReconciliationIssue = {
  reference: string;
  kind: "MISSING_SOURCE" | "DIVERGENT_SOURCE" | "DUPLICATE_LINK" | "COST_DIFFERENCE";
  message: string;
};
const near = (a: number, b: number, precision = 0.005) => Math.abs(a - b) < precision;
const valid = (v: number) => Number.isFinite(v) && v >= 0;
const sorted = (v: CertifiedFuelRow[]) => [...v].sort((a,b) => a.id.localeCompare(b.id));
const isOrderOrigin = (origin: string) => origin === "PORTAL_POSTO" || origin === "ORDEM_ABASTECIMENTO";

export function reconcileFleetFuelLedger(input: {
  current: FuelLedgerRow[];
  orders: FuelOrderRow[];
  expenses: FuelExpenseRow[];
  certified?: CertifiedFuelRow[];
}) {
  const issues: FleetReconciliationIssue[] = [];
  const record = (reference: string, kind: FleetReconciliationIssue["kind"], message: string) => {
    issues.push({ reference, kind, message });
  };
  const fuelById = new Map<string, FuelLedgerRow>();
  let liters = 0, costKnown = 0, costUnknown = 0;
  for (const item of input.current) {
    if (fuelById.has(item.id)) {
      record(item.id, "DUPLICATE_LINK", "O abastecimento aparece duas vezes na consulta.");
      continue;
    }
    fuelById.set(item.id, item);
    if (!valid(item.quantity) || (item.cost !== null && !valid(item.cost))) {
      record(item.id, "DIVERGENT_SOURCE", "Abastecimento com quantidade ou custo inválido.");
      continue;
    }
    liters += item.measurementUnit.toUpperCase() === "L" ? item.quantity : 0;
    if (item.cost == null) costUnknown++;
    else costKnown += item.cost;
  }

  const usedOrderIds = new Set<string>();
  const orderLinkedFuel = new Set<string>();
  for (const order of input.orders) {
    if (order.status !== "ABASTECIDA") continue;
    if (!order.consumptionId) {
      record(order.code, "MISSING_SOURCE", "Ordem abastecida sem registro de consumo.");
      continue;
    }
    if (usedOrderIds.has(order.id) || orderLinkedFuel.has(order.consumptionId)) {
      record(order.code, "DUPLICATE_LINK", "Ordem ou consumo vinculado mais de uma vez.");
      continue;
    }
    usedOrderIds.add(order.id);
    orderLinkedFuel.add(order.consumptionId);
    const item = fuelById.get(order.consumptionId);
    if (!item) {
      record(order.code, "MISSING_SOURCE", "O consumo vinculado à ordem não está no período auditado.");
      continue;
    }
    if (item.unitId !== order.unitId || item.reference !== order.code || !isOrderOrigin(item.origin)) {
      record(order.code, "DIVERGENT_SOURCE", "Veículo, referência ou origem divergem da ordem.");
    }
    if (order.litersFilled == null || !valid(order.litersFilled) || !near(item.quantity, order.litersFilled, 0.0005)) {
      record(order.code, "DIVERGENT_SOURCE", "Litros da ordem e do consumo não conferem.");
    }
    if (item.cost != null && order.pricePerLiter != null && valid(order.pricePerLiter) &&
        !near(item.cost, Math.round(order.pricePerLiter * (order.litersFilled ?? 0) * 100) / 100)) {
      record(order.code, "COST_DIFFERENCE", "O custo do consumo diverge do preço e litros da ordem.");
    }
  }
  for (const item of input.current) {
    if (isOrderOrigin(item.origin) && !orderLinkedFuel.has(item.id)) {
      record(item.id, "MISSING_SOURCE", "Abastecimento de posto/ordem sem ordem correspondente no período.");
    }
  }

  const expenseSources = new Set<string>();
  for (const expense of input.expenses) {
    if (expense.sourceType !== "CONSUMO" || expense.nature !== "COMBUSTIVEL") continue;
    if (expenseSources.has(expense.sourceId)) {
      record(expense.sourceId, "DUPLICATE_LINK", "Existem apropriações de combustível repetidas.");
      continue;
    }
    expenseSources.add(expense.sourceId);
    const item = fuelById.get(expense.sourceId);
    if (!item) {
      record(expense.id, "MISSING_SOURCE", "Despesa de combustível sem consumo correspondente no período.");
      continue;
    }
    if (expense.unitId !== item.unitId || expense.sourceKey !== "consumption:" + item.id) {
      record(expense.id, "DIVERGENT_SOURCE", "Vínculo financeiro não corresponde ao consumo.");
    }
    if ((expense.amount == null) !== (item.cost == null) ||
      (expense.amount != null && item.cost != null && !near(expense.amount, item.cost))) {
      record(expense.id, "COST_DIFFERENCE", "Valor da despesa não corresponde ao custo registrado no consumo.");
    }
  }
  // A portal order and an internal fueling event each generate exactly
  // one expense for their linked consumption. Count that expense only once.
  for (const item of input.current) {
    if (!expenseSources.has(item.id)) {
      record(item.id, "MISSING_SOURCE", "Consumo sem apropriação financeira correspondente.");
    }
  }

  if (input.certified) {
    const old = new Map(sorted(input.certified).map(item => [item.id, item]));
    for (const item of input.current) {
      const stored = old.get(item.id);
      if (!stored) {
        record(item.id, "DIVERGENT_SOURCE", "Consumo acrescentado após a certificação.");
        continue;
      }
      if (stored.unitId !== item.unitId || stored.material !== item.material ||
          stored.measurementUnit !== item.measurementUnit || stored.occurredAt !== item.occurredAt ||
          !valid(stored.quantity) || !near(stored.quantity, item.quantity, 0.0005)) {
        record(item.id, "DIVERGENT_SOURCE", "Consumo modificado após a certificação.");
      }
      // Legacy revisions lacked financial metadata; validate it when available.
      if (stored.cost !== undefined && ((stored.cost === null) !== (item.cost === null) ||
          (stored.cost !== null && item.cost !== null && !near(stored.cost, item.cost)))) {
        record(item.id, "COST_DIFFERENCE", "Custo alterado depois da certificação.");
      }
      if ((stored.origin !== undefined && stored.origin !== item.origin) ||
          (stored.reference !== undefined && stored.reference !== item.reference)) {
        record(item.id, "DIVERGENT_SOURCE", "Origem ou referência alterada depois da certificação.");
      }
      old.delete(item.id);
    }
    for (const missing of old.keys()) {
      record(missing, "MISSING_SOURCE", "Consumo certificado não localizado no registro operacional.");
    }
  }

  return {
    balanced: issues.length === 0,
    issues,
    totals: {
      records: fuelById.size,
      liters: Math.round(liters * 1000) / 1000,
      fuelCostKnown: Math.round(costKnown * 100) / 100,
      costUnknown,
    },
  };
}
