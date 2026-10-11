import { municipality } from "@/lib/platform/municipality";

/** Adaptador de prestação de contas por estado: define o tribunal e o formato das remessas. */
export type AccountabilityAdapter = {
  state: string;
  court: string;
  system: string;
  supportsLayouts: readonly string[];
};

const adapters: Record<string, AccountabilityAdapter> = {
  PB: { state: "PB", court: "TCE-PB", system: "SAGRES", supportsLayouts: ["MENSAL_FOLHA", "FROTA", "FARMACIA"] },
  ES: { state: "ES", court: "TCE-ES", system: "CidadES", supportsLayouts: [] },
};

export function getAccountabilityAdapter(state: string = municipality.state): AccountabilityAdapter | null {
  return adapters[state.toUpperCase()] ?? null;
}
