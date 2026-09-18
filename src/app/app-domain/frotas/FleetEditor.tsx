"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { categories, labels, type FleetMutationInput } from "@/lib/frotas/contract";
import { mutateFleetAction } from "./actions";
import { fieldClass, ReferencePicker } from "./ReferencePicker";

type Field = { key: string; label: string; type?: string; required?: boolean; options?: string[]; reference?: string; help?: string; wide?: boolean };
export type EditorKind = "unit" | "route" | "usage" | "plan" | "consumption" | "document" | "occurrence" | "expense" | "generateOrder" | "completeOrder" | "fulfillDocument";
export type Editor = { kind: EditorKind; title: string; initial: Record<string, string>; context?: string };
const required = (key: string, label: string, type = "text", wide = false): Field => ({ key, label, type, required: true, wide });
const ref = (key: string, label: string, reference: string, required = false): Field => ({ key, label, reference, required });
const select = (key: string, label: string, options: string[]): Field => ({ key, label, options, required: true });
const unitField = ref("unitId", "Unidade da frota · Frotas", "units", true);
const department = ref("departmentId", "Setor · Organograma", "departments", true);
const money = (key: string, label: string): Field => ({ key, label, type: "number", help: "Vazio = não informado; zero = custo conhecido de R$ 0,00." });
function fields(kind: EditorKind, data: Record<string, string>): Field[] {
  switch (kind) {
    case "unit": return [required("code", "Código interno"), required("name", "Descrição"), select("category", "Categoria", [...categories]), select("status", "Situação operacional", ["ATIVO", "EM_MANUTENCAO", "INATIVO"]), department, ref("assetId", "Bem vinculado · Patrimônio (opcional)", "assets"),
      ...(data.category === "VEICULO" || data.plate || data.renavam ? [{ key: "plate", label: "Placa (quando aplicável)" }, { key: "renavam", label: "RENAVAM (quando aplicável)" }] : []),
      { key: "brand", label: "Marca" }, { key: "model", label: "Modelo" }, { key: "year", label: "Ano", type: "number" }, ref("responsibleId", "Responsável · Servidores (opcional)", "employees"),
      ...(data.category === "AGREGADO" ? [ref("parentId", "Unidade principal · Frotas (opcional)", "principals")] : []), { key: "notes", label: "Observações", type: "textarea", wide: true }];
    case "route": return [required("code", "Código"), required("name", "Nome da rota"), department, select("active", "Situação", ["true", "false"]), required("origin", "Origem"), required("destination", "Destino"), required("itinerary", "Descrição do percurso", "textarea", true)];
    case "usage": return [{ ...unitField, label: "Veículo · Frotas", reference: "vehicles" }, ref("routeId", "Rota · Frotas (opcional)", "routes"), ref("employeeId", "Condutor · Servidores (opcional)", "employees"), required("startedAt", "Início (horário de Brasília)", "datetime-local"), required("endedAt", "Fim (horário de Brasília)", "datetime-local"), { key: "initialReading", label: "Hodômetro inicial (km)", type: "number" }, { key: "finalReading", label: "Hodômetro final (km)", type: "number" }, required("purpose", "Finalidade", "textarea", true)];
    case "plan": return [unitField, required("title", "Nome do plano"), select("type", "Tipo", ["REVISAO", "PREVENTIVA"]), required("firstDueAt", "Primeira ocorrência", "date"), required("intervalDays", "Intervalo de calendário (dias)", "number"), money("estimatedCost", "Custo previsto (não é gasto realizado)"), { ...required("services", "Serviços programados", "textarea", true), help: "Um serviço por linha. A emissão e a OS conservam todos os serviços." }];
    case "generateOrder": return [{ ...required("scheduledAt", "Data da ocorrência", "date"), help: "Use uma data da periodicidade do plano. Repetir a mesma ocorrência recupera a OS existente." }];
    case "completeOrder": return [required("completedAt", "Data efetiva da execução", "date"), money("actualCost", "Custo realizado dos serviços (exclua consumos já lançados)"), { key: "reference", label: "Referência do serviço / documento (opcional)" }, required("performed", "Serviços executados", "textarea", true), required("result", "Resultado da execução", "textarea", true)];
    case "consumption": return [unitField, select("type", "Tipo de material", ["COMBUSTIVEL", "LUBRIFICANTE"]), select("origin", "Origem do material", ["PROPRIO", "TERCEIRO"]), required("occurredAt", "Data do consumo", "date"), required("material", "Material / descrição"), required("quantity", "Quantidade consumida", "number"), select("measurementUnit", "Unidade de medida", ["L", "KG", "UN"]), money("cost", "Custo realizado do consumo"), ref("supplierId", "Fornecedor · Cadastros (opcional)", "suppliers"), ref("workOrderId", "OS vinculada · Frotas (opcional)", "orders"), { key: "reference", label: "Referência de origem (opcional)", help: "Referência informativa. Este lançamento não baixa estoque nem registra pagamento." }];
    case "document": return [unitField, ...(data.kind === "SEGURO" ? [required("type", "Tipo do seguro"), ref("insurerId", "Seguradora · Fornecedores (opcional)", "suppliers"), required("startsAt", "Início da vigência", "date")] : data.kind === "OBRIGACAO" ? [{ ...select("type", "Tipo de obrigação", ["IPVA", "LICENCIAMENTO", "OUTRO"]) }, required("scheduledAt", "Agendamento da providência", "date")] : [required("type", "Tipo documental")]), required("title", "Título"), required("reference", "Apólice / referência / exercício"), required("dueAt", "Vencimento", "date"), money("value", "Valor informado (não apropriado como gasto)"), { key: "notes", label: "Observações", type: "textarea", wide: true }];
    case "fulfillDocument": return [required("fulfilledAt", "Data do cumprimento administrativo", "date"), required("fulfillmentNote", "Providência e referência do cumprimento", "textarea", true)];
    case "occurrence": return [unitField, select("type", "Tipo de ocorrência", ["MULTA", "ACIDENTE", "OUTRO"]), required("occurredAt", "Data da ocorrência", "date"), money("involvedValue", "Valor envolvido (não é gasto realizado)"), { key: "reference", label: "Referência (opcional)" }, required("description", "Descrição", "textarea", true)];
    case "expense": return [unitField, required("occurredAt", "Data do fato", "date"), money("amount", "Gasto realizado"), ref("occurrenceId", "Ocorrência vinculada · Frotas (opcional)", "occurrences"), { key: "reference", label: "Referência de origem (opcional)" }, { ...required("description", "Descrição do gasto", "textarea", true), help: "Use para outros gastos operacionais. Consumos e OS concluídas já alimentam o consolidado automaticamente." }];
  }
}
const defaults: Record<EditorKind, Record<string, string>> = {
  unit: { category: "VEICULO", status: "ATIVO" }, route: { active: "true" }, usage: {}, plan: { type: "PREVENTIVA", intervalDays: "30" }, consumption: { type: "COMBUSTIVEL", origin: "TERCEIRO", measurementUnit: "L" }, document: { kind: "DOCUMENTO", type: "OUTRO" }, occurrence: { type: "OUTRO" }, expense: {}, generateOrder: {}, completeOrder: {}, fulfillDocument: {},
};
export function FleetEditor({ editor, onClose, onSuccess, defaultDepartment }: { editor: Editor; onClose: () => void; onSuccess: (message: string) => void; defaultDepartment: string }) {
  const dialog = useRef<HTMLDialogElement>(null), locked = useRef(false), requestId = useRef("");
  const [pending, startTransition] = useTransition();
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const [data, setData] = useState<Record<string, string>>({ departmentId: defaultDepartment, occurredAt: today, completedAt: today, fulfilledAt: today, ...defaults[editor.kind], ...editor.initial });
  const [error, setError] = useState(""), [errors, setErrors] = useState<Record<string, string>>({});
  const config = fields(editor.kind, data);
  useEffect(() => { requestId.current = crypto.randomUUID(); dialog.current?.showModal(); }, []);
  function submit(event: React.FormEvent) {
    event.preventDefault(); if (locked.current) return; locked.current = true; setError(""); setErrors({});
    const values: Record<string, string> = {};
    for (const field of config) values[field.key] = data[field.key] || "";
    if (editor.initial.id) { values.id = editor.initial.id; values.version = editor.initial.version; }
    if (editor.kind === "document") values.kind = data.kind;
    if (editor.kind === "unit") for (const key of ["plate", "renavam", "parentId"]) if (!(key in values)) values[key] = key === "parentId" && data.category !== "AGREGADO" ? "" : data[key] || "";
    if (editor.kind === "completeOrder") values.orderId = editor.initial.orderId;
    if (editor.kind === "fulfillDocument") values.documentId = editor.initial.documentId;
    const input = (editor.kind === "generateOrder" ? { requestId: requestId.current, kind: editor.kind, planId: editor.initial.planId, scheduledAt: values.scheduledAt } : { requestId: requestId.current, kind: editor.kind, data: values }) as FleetMutationInput;
    startTransition(async () => {
      try {
        const result = await mutateFleetAction(input);
        if (result.error) { setError(result.error); setErrors(result.fields || {}); return; }
        onSuccess("Operação confirmada e registrada."); onClose();
      } catch { setError("A confirmação não pôde ser consultada. Tente novamente com os mesmos dados."); }
      finally { locked.current = false; }
    });
  }
  const confirmLabel = editor.kind === "completeOrder" ? "Concluir execução e registrar gasto" : editor.kind === "generateOrder" ? "Gerar ordem de serviço" : editor.kind === "fulfillDocument" ? "Registrar cumprimento" : "Confirmar registro";
  return <dialog ref={dialog} onCancel={e => { e.preventDefault(); if (!pending) onClose(); }} className="m-auto max-h-[92dvh] w-[min(760px,calc(100%_-_24px))] rounded-lg border border-slate-300 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/35" aria-labelledby="fleet-editor-title">
    <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><div><h2 id="fleet-editor-title" className="text-base font-semibold">{editor.title}</h2>{editor.context && <p className="mt-1 text-sm text-slate-500">{editor.context}</p>}</div><button type="button" disabled={pending} onClick={onClose} aria-label="Fechar formulário" className="rounded p-2 focus-visible:ring-2 focus-visible:ring-teal-600"><X className="size-5" /></button></header>
      <div className="grid gap-4 overflow-y-auto p-5 md:grid-cols-2">
        {error && <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 md:col-span-2">{error}</div>}
        {config.map(field => <div key={field.key} className={field.wide ? "md:col-span-2" : ""}>
          <label htmlFor={`fleet-field-${field.key}`} className="mb-1.5 block text-sm font-medium">{field.label}{field.required && <span className="ml-1 text-red-700" aria-label="obrigatório">*</span>}</label>
          {field.reference ? <ReferencePicker id={`fleet-field-${field.key}`} kind={field.reference} label={field.label} value={data[field.key] || ""} required={field.required} unitId={data.unitId} onChange={value => setData(current => ({ ...current, [field.key]: value, ...(field.key === "unitId" ? { routeId: "", employeeId: "", workOrderId: "", occurrenceId: "" } : {}) }))} /> : field.options ? <select id={`fleet-field-${field.key}`} className={fieldClass} value={data[field.key] || field.options[0]} onChange={e => setData({ ...data, [field.key]: e.target.value })}>{field.options.map(value => <option key={value} value={value}>{value === "true" ? "Ativa" : value === "false" ? "Inativa" : labels[value] || value}</option>)}</select> : field.type === "textarea" ? <textarea id={`fleet-field-${field.key}`} className={fieldClass + " min-h-24"} rows={4} maxLength={10000} required={field.required} value={data[field.key] || ""} onChange={e => setData({ ...data, [field.key]: e.target.value })} aria-invalid={!!errors[field.key]} /> : <input id={`fleet-field-${field.key}`} className={fieldClass} type={field.type || "text"} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? (["year", "intervalDays"].includes(field.key) ? "1" : ["quantity", "initialReading", "finalReading"].includes(field.key) ? "0.001" : "0.01") : undefined} maxLength={200} required={field.required} value={data[field.key] || ""} onChange={e => setData({ ...data, [field.key]: e.target.value })} aria-invalid={!!errors[field.key]} />}
          {field.help && <p className="mt-1 text-xs leading-4 text-slate-500">{field.help}</p>}{errors[field.key] && <p className="mt-1 text-sm text-red-700" role="alert">{errors[field.key]}</p>}
        </div>)}
      </div>
      <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3"><button type="button" className="min-h-11 rounded border border-slate-300 bg-white px-4 text-sm md:min-h-9" onClick={onClose} disabled={pending}>Cancelar</button><button disabled={pending} type="submit" className="min-h-11 rounded bg-teal-700 px-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-50 md:min-h-9">{pending ? "Confirmando..." : confirmLabel}</button></footer>
    </form>
  </dialog>;
}
