"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addPayrollVariable, closePayroll, processPayroll, removePayrollVariable, reopenPayroll } from "../actions";

type Props = {
  payrollId: string;
  status: string;
  employees: { id: string; name: string }[];
  kinds: { kind: string; label: string; unit: string }[];
  variables: { id: string; employee: string; kind: string; quantity: number; value: number; note: string | null }[];
};

export function PayrollRunPanel({ payrollId, status, employees, kinds, variables }: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [kind, setKind] = useState(kinds[0]?.kind ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const open = status === "Aberta";
  const unit = kinds.find((k) => k.kind === kind)?.unit;

  const run = (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn();
      setMessage(r.success ? { ok: true, text: ok } : { ok: false, text: r.error ?? "Falha." });
    });

  const field = "h-8 rounded-md border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-950";

  return (
    <section className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!open || pending} onClick={() => run(async () => {
          const r = await processPayroll(payrollId);
          if (r.success && "warnings" in r && r.warnings?.length) return { success: true };
          return r;
        }, "Folha calculada.")}>Calcular folha</Button>
        <Button size="sm" variant="outline" disabled={!open || pending} onClick={() => {
          if (confirm("Fechar a competência? Os valores ficarão congelados.")) run(() => closePayroll(payrollId), "Competência fechada.");
        }}>Fechar competência</Button>
        <Button size="sm" variant="outline" disabled={status !== "Fechada" || pending} onClick={() => {
          const reason = prompt("Justificativa para reabrir a competência (mínimo 10 caracteres):");
          if (reason) run(() => reopenPayroll(payrollId, reason), "Competência reaberta.");
        }}>Reabrir competência</Button>
        {pending && <span className="self-center text-xs text-slate-500">Processando...</span>}
      </div>
      {message && <p className={`text-xs ${message.ok ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>}

      <div>
        <h3 className="mb-2 text-sm font-semibold">Lançamentos do mês (faltas, horas extras, adicionais, consignados)</h3>
        {open && (
          <form
            className="mb-2 flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(amount.replace(",", "."));
              const isMoney = unit === "R$";
              run(() => addPayrollVariable({ payrollId, employeeId, kind, quantity: isMoney ? 0 : n, value: isMoney ? n : 0, note }), "Lançamento registrado. Recalcule a folha.");
              setAmount(""); setNote("");
            }}
          >
            <select aria-label="Servidor" className={field} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select aria-label="Tipo" className={field} value={kind} onChange={(e) => setKind(e.target.value)}>
              {kinds.map((k) => <option key={k.kind} value={k.kind}>{k.label}</option>)}
            </select>
            <input aria-label="Quantidade ou valor" className={`${field} w-28`} placeholder={unit} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <input aria-label="Observação" className={`${field} w-48`} placeholder="Observação" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button size="sm" type="submit" disabled={pending || !employeeId}>Adicionar</Button>
          </form>
        )}
        {variables.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhum lançamento.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {variables.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-2 py-1">
                <span>{v.employee} — {v.kind}: <b>{v.value > 0 ? `R$ ${v.value.toFixed(2)}` : v.quantity}</b>{v.note ? ` (${v.note})` : ""}</span>
                {open && <button className="text-red-600 hover:underline" onClick={() => run(() => removePayrollVariable(v.id), "Lançamento removido.")}>remover</button>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
