"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleAlert, FileCog, Landmark, ListChecks, Plus, Save, Settings2, SlidersHorizontal, Umbrella, WalletCards } from "lucide-react";
import {
  initializeHrPayrollDemoConfiguration,
  saveHrCalculationPolicy,
  saveHrEmploymentRegime,
  saveHrPayrollRubric,
  saveHrPayrollRule,
  saveHrPayrollRuleSet,
  saveHrSocialSecurityBand,
  saveHrSocialSecurityScheme,
  saveHrVacationPolicy,
} from "./actions";

type RuleSetView = {
  id: string;
  code: string;
  name: string;
  status: string;
  scope: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  legalReference: string | null;
  notes: string | null;
  isDemo: boolean;
};

type RuleView = {
  id: string;
  category: string;
  code: string;
  name: string;
  description: string | null;
  valueType: string;
  value: string;
  unit: string | null;
  sortOrder: number;
  legalReference: string | null;
  isRequired: boolean;
  isActive: boolean;
};

type RubricView = {
  id: string;
  code: string;
  name: string;
  type: string;
  esocialNatureCode: string | null;
  calculationMethod: string;
  formulaExpression: string | null;
  calculationBaseCode: string | null;
  fixedValue: string | null;
  percentageRate: string | null;
  priority: number;
  legalReference: string | null;
  notes: string | null;
  isActive: boolean;
  incidences: string[];
};

type VacationPolicyView = {
  id: string;
  code: string;
  name: string;
  employmentNature: string;
  acquisitionMonths: number;
  concessionMonths: number;
  entitlementDays: number;
  maxSplits: number;
  minFirstSplitDays: number;
  minOtherSplitDays: number;
  additionalPayRate: string;
  allowsCashAbono: boolean;
  maxCashAbonoDays: number;
  allowsAdvanceThirteenth: boolean;
  requiresApproval: boolean;
  legalReference: string | null;
  notes: string | null;
  isActive: boolean;
};

type SocialSecurityBandView = {
  id: string;
  sequence: number;
  lowerLimit: string;
  upperLimit: string | null;
  employeeRate: string;
  employerRate: string | null;
};

type SocialSecuritySchemeView = {
  id: string;
  code: string;
  name: string;
  regime: string;
  employeeCalculationMethod: string;
  ceilingValue: string | null;
  employerContributionRate: string | null;
  actuarialContributionRate: string | null;
  legalReference: string | null;
  notes: string | null;
  isActive: boolean;
  bands: SocialSecurityBandView[];
};

type CalculationPolicyView = {
  id: string;
  currency: string;
  roundingMode: string;
  roundingScale: number;
  movementCutoffDay: number;
  paymentDay: number | null;
  negativeNetPayPolicy: string;
  maxConsignmentMarginRate: string | null;
  remunerationCeiling: string | null;
  freezeOnClose: boolean;
  legalReference: string | null;
  notes: string | null;
};

type EmploymentRegimeView = {
  id: string;
  code: string;
  name: string;
  employmentNature: string;
  esocialCategory: string | null;
  defaultMonthlyHours: number | null;
  socialSecuritySchemeId: string | null;
  vacationPolicyId: string | null;
  legalReference: string | null;
  isActive: boolean;
};

export type HrPayrollSettingsView = {
  ruleSet: RuleSetView;
  rules: RuleView[];
  rubrics: RubricView[];
  vacationPolicies: VacationPolicyView[];
  socialSecuritySchemes: SocialSecuritySchemeView[];
  calculationPolicy: CalculationPolicyView | null;
  employmentRegimes: EmploymentRegimeView[];
};

type TabKey = "visao" | "regras" | "rubricas" | "ferias" | "previdencia" | "calculo" | "vinculos";
type ActionResult = { error?: string; message?: string; ruleSetId?: string };

const tabItems: { key: TabKey; label: string; icon: typeof Settings2 }[] = [
  { key: "visao", label: "Visão", icon: Settings2 },
  { key: "regras", label: "Regras", icon: ListChecks },
  { key: "rubricas", label: "Rubricas", icon: WalletCards },
  { key: "ferias", label: "Férias", icon: Umbrella },
  { key: "previdencia", label: "Previdência", icon: Landmark },
  { key: "calculo", label: "Cálculo", icon: FileCog },
  { key: "vinculos", label: "Vínculos", icon: SlidersHorizontal },
];

const inputClass = "h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15";
const textAreaClass = "min-h-16 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15";
const labelClass = "block text-[11px] font-semibold text-slate-600";
const secondaryButtonClass = "inline-flex h-8 items-center justify-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";
const primaryButtonClass = "inline-flex h-8 items-center justify-center gap-1.5 rounded bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const PAGE_SIZE = 20;

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function prettyDate(value: string | null) {
  if (!value) return "Sem término";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

function ruleValueForInput(rule: RuleView) {
  try {
    const parsed: unknown = JSON.parse(rule.value);
    return rule.valueType === "JSON" ? JSON.stringify(parsed) : String(parsed);
  } catch {
    return rule.value;
  }
}

function PageControls({ page, total, onPageChange }: { page: number; total: number; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total <= PAGE_SIZE) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-[11px] text-slate-500">
      <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}</span>
      <span className="flex items-center gap-1">
        <button type="button" aria-label="Página anterior" disabled={page === 1} onClick={() => onPageChange(page - 1)} className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
        <span>Página {page} de {pages}</span>
        <button type="button" aria-label="Próxima página" disabled={page === pages} onClick={() => onPageChange(page + 1)} className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronRight className="size-4" /></button>
      </span>
    </div>
  );
}

function usePage<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const safePage = Math.min(page, Math.max(1, Math.ceil(items.length / PAGE_SIZE)));
  return { page: safePage, setPage, items: items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE) };
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900"><CircleAlert className="mt-0.5 size-4 shrink-0" />{children}</div>;
}

function SectionHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 px-3 py-2.5"><div><h2 className="text-sm font-semibold text-slate-900">{title}</h2><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p></div>{action}</div>;
}

function TableShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm"><div className="overflow-hidden">{children}</div>{footer}</section>;
}

export function HrPayrollSettingsClient({ ruleSets, settings }: { ruleSets: RuleSetView[]; settings: HrPayrollSettingsView | null }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("visao");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingRuleSet, setEditingRuleSet] = useState<RuleSetView | null | "new">(null);

  const activeLabel = useMemo(() => settings?.ruleSet.isDemo ? "Demonstração editável" : settings?.ruleSet.scope === "PRODUCAO" ? "Produção" : "Homologação", [settings]);

  async function execute(action: () => Promise<ActionResult>) {
    setPending(true);
    setFeedback(null);
    const result = await action();
    setPending(false);
    if (result.error) {
      setFeedback({ type: "error", text: result.error });
      return result;
    }
    setFeedback({ type: "success", text: result.message || "Alteração salva." });
    router.refresh();
    return result;
  }

  if (!settings) {
    return (
      <section className="flex min-h-[320px] flex-1 flex-col items-center justify-center border border-dashed border-slate-300 bg-white p-6 text-center">
        <Settings2 className="size-7 text-slate-400" />
        <h2 className="mt-3 text-sm font-semibold text-slate-900">Nenhum conjunto de regras de RH disponível</h2>
        <p className="mt-1 max-w-lg text-xs leading-5 text-slate-600">Inicialize a referência municipal demonstrativa. Ela será persistida no Neon, poderá ser editada nesta área e fica identificada como não normativa.</p>
        <button type="button" disabled={pending} onClick={() => void execute(initializeHrPayrollDemoConfiguration)} className={`mt-4 ${primaryButtonClass}`}><Plus className="size-4" />{pending ? "Inicializando…" : "Criar referência demonstrativa"}</button>
        {feedback && <p role="status" className={`mt-3 text-xs ${feedback.type === "error" ? "text-rose-700" : "text-emerald-700"}`}>{feedback.text}</p>}
      </section>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <section className="flex flex-wrap items-center justify-between gap-2 border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{settings.ruleSet.name}</p>
          <p className="text-[11px] text-slate-500">{settings.ruleSet.code} · vigência {prettyDate(settings.ruleSet.effectiveFrom)}{settings.ruleSet.effectiveUntil ? ` até ${prettyDate(settings.ruleSet.effectiveUntil)}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${settings.ruleSet.isDemo ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{activeLabel}</span>
          <select aria-label="Selecionar conjunto de regras" value={settings.ruleSet.id} onChange={(event) => router.push(`/rh/parametrizacoes?ruleSet=${event.target.value}`)} className="h-8 max-w-56 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700">
            {ruleSets.map((ruleSet) => <option key={ruleSet.id} value={ruleSet.id}>{ruleSet.name}</option>)}
          </select>
        </div>
      </section>

      {feedback && <p role="status" className={`border px-3 py-2 text-xs ${feedback.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{feedback.text}</p>}

      <Notice><span><strong>Referência controlada:</strong> as rubricas desta tela são versionadas e não alteram nem são consumidas pelo motor de folha legado. O motor novo deverá copiar esta configuração para o snapshot da competência antes do cálculo. O Portal mantém o filtro de folhas <strong>Fechada</strong> ou <strong>Paga</strong>, mesmo quando a publicação de demonstrativos estiver habilitada.</span></Notice>

      <nav aria-label="Seções de parametrizações" className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return <button type="button" key={item.key} onClick={() => setTab(item.key)} className={`inline-flex h-8 items-center gap-1.5 rounded px-3 text-xs font-semibold ${active ? "bg-emerald-700 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}><Icon className="size-3.5" />{item.label}</button>;
        })}
      </nav>

      {tab === "visao" && <Overview settings={settings} onEditRuleSet={() => setEditingRuleSet(settings.ruleSet)} onNewRuleSet={() => setEditingRuleSet("new")} />}
      {tab === "regras" && <RulesEditor settings={settings} pending={pending} execute={execute} />}
      {tab === "rubricas" && <RubricsEditor settings={settings} pending={pending} execute={execute} />}
      {tab === "ferias" && <VacationEditor settings={settings} pending={pending} execute={execute} />}
      {tab === "previdencia" && <SocialSecurityEditor settings={settings} pending={pending} execute={execute} />}
      {tab === "calculo" && <CalculationEditor settings={settings} pending={pending} execute={execute} />}
      {tab === "vinculos" && <EmploymentRegimeEditor settings={settings} pending={pending} execute={execute} />}

       {editingRuleSet && <RuleSetEditor current={editingRuleSet === "new" ? null : editingRuleSet} onClose={() => setEditingRuleSet(null)} onSaved={(ruleSetId) => { setEditingRuleSet(null); router.push(`/rh/parametrizacoes?ruleSet=${ruleSetId}`); }} pending={pending} execute={execute} />}
    </div>
  );
}

function Overview({ settings, onEditRuleSet, onNewRuleSet }: { settings: HrPayrollSettingsView; onEditRuleSet: () => void; onNewRuleSet: () => void }) {
  const metrics = [
    ["Regras", settings.rules.length],
    ["Rubricas", settings.rubrics.length],
    ["Políticas de férias", settings.vacationPolicies.length],
    ["Regimes previdenciários", settings.socialSecuritySchemes.length],
    ["Vínculos", settings.employmentRegimes.length],
  ];
  return <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.8fr)]"><section className="border border-slate-200 bg-white shadow-sm"><SectionHeader title="Conjunto de regras" description="Vigência, escopo e fonte normativa da configuração selecionada." action={<span className="flex gap-1"><button type="button" onClick={onEditRuleSet} className={secondaryButtonClass}>Editar versão</button><button type="button" onClick={onNewRuleSet} className={primaryButtonClass}><Plus className="size-4" />Nova versão</button></span>} /><dl className="grid gap-x-4 gap-y-3 p-3 text-xs sm:grid-cols-2"><div><dt className="text-slate-500">Status</dt><dd className="mt-0.5 font-semibold text-slate-800">{settings.ruleSet.status}</dd></div><div><dt className="text-slate-500">Escopo</dt><dd className="mt-0.5 font-semibold text-slate-800">{settings.ruleSet.scope}</dd></div><div className="sm:col-span-2"><dt className="text-slate-500">Referência legal</dt><dd className="mt-0.5 leading-5 text-slate-800">{settings.ruleSet.legalReference || "Não informada — não ativar em produção."}</dd></div><div className="sm:col-span-2"><dt className="text-slate-500">Observações</dt><dd className="mt-0.5 leading-5 text-slate-700">{settings.ruleSet.notes || "Sem observações."}</dd></div></dl></section><section className="border border-slate-200 bg-white shadow-sm"><SectionHeader title="Cobertura configurada" description="Itens persistidos no Neon para reutilização pelo RH, Portal e relatórios autorizados." /><div className="grid grid-cols-2 gap-px bg-slate-200">{metrics.map(([label, value]) => <div key={String(label)} className="bg-white p-3"><p className="text-xl font-bold text-slate-900">{value}</p><p className="mt-0.5 text-[11px] text-slate-500">{label}</p></div>)}</div></section></div>;
}

function RuleSetEditor({ current, onClose, onSaved, pending, execute }: { current: RuleSetView | null; onClose: () => void; onSaved: (ruleSetId: string) => void; pending: boolean; execute: (action: () => Promise<ActionResult>) => Promise<ActionResult> }) {
  return <section className="border border-emerald-200 bg-emerald-50/40 shadow-sm"><SectionHeader title={current ? "Editar conjunto de regras" : "Nova versão de regras"} description="Conjuntos de produção ativos exigem referência legal, não podem ser demonstrativos e não podem ter vigência sobreposta." action={<button type="button" onClick={onClose} className={secondaryButtonClass}>Fechar</button>} /><form key={current?.id || "new"} className="grid gap-3 p-3 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void execute(() => saveHrPayrollRuleSet({ id: current?.id, code: form.get("code"), name: form.get("name"), status: form.get("status"), scope: form.get("scope"), effectiveFrom: form.get("effectiveFrom"), effectiveUntil: form.get("effectiveUntil") || null, legalReference: form.get("legalReference"), notes: form.get("notes"), isDemo: form.get("isDemo") === "on" })).then((result) => { if (!result.error && result.ruleSetId) onSaved(result.ruleSetId); }); }}><Field label="Código"><input required name="code" defaultValue={current?.code || "MUNICIPAL_2026_V2"} className={inputClass} /></Field><Field label="Nome"><input required name="name" defaultValue={current?.name || "Regras municipais — nova versão"} className={inputClass} /></Field><Field label="Status"><select name="status" defaultValue={current?.status || "RASCUNHO"} className={inputClass}><option value="RASCUNHO">Rascunho</option><option value="ATIVA">Ativa</option><option value="ARQUIVADA">Arquivada</option></select></Field><Field label="Escopo"><select name="scope" defaultValue={current?.scope || "DEMONSTRACAO"} className={inputClass}><option value="DEMONSTRACAO">Demonstração</option><option value="HOMOLOGACAO">Homologação</option><option value="PRODUCAO">Produção</option></select></Field><Field label="Início de vigência"><input required type="date" name="effectiveFrom" defaultValue={dateInputValue(current?.effectiveFrom || new Date().toISOString())} className={inputClass} /></Field><Field label="Fim de vigência"><input type="date" name="effectiveUntil" defaultValue={dateInputValue(current?.effectiveUntil || null)} className={inputClass} /></Field><div className="md:col-span-2"><Field label="Referência legal"><textarea name="legalReference" defaultValue={current?.legalReference || ""} className={textAreaClass} /></Field></div><div className="md:col-span-2"><Field label="Observações"><textarea name="notes" defaultValue={current?.notes || ""} className={textAreaClass} /></Field></div><label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" name="isDemo" defaultChecked={current?.isDemo ?? true} /> Configuração demonstrativa</label><div className="flex justify-end"><button disabled={pending} className={primaryButtonClass}><Save className="size-4" />{pending ? "Salvando…" : "Salvar versão"}</button></div></form></section>;
}

function RulesEditor({ settings, pending, execute }: { settings: HrPayrollSettingsView; pending: boolean; execute: (action: () => Promise<ActionResult>) => Promise<ActionResult> }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = settings.rules.find((item) => item.id === selectedId) ?? null;
  const pager = usePage(settings.rules);
  return <div className="grid min-h-0 gap-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(21rem,.75fr)]"><TableShell footer={<PageControls page={pager.page} total={settings.rules.length} onPageChange={pager.setPage} />}><SectionHeader title="Regras operacionais" description="Valores tipados por categoria, com vigência herdada do conjunto selecionado." action={<button type="button" onClick={() => setSelectedId(null)} className={secondaryButtonClass}><Plus className="size-4" />Nova regra</button>} /><CompactTable headers={["Código", "Nome", "Categoria", "Valor", "Status"]}>{pager.items.map((rule) => <tr key={rule.id} cla