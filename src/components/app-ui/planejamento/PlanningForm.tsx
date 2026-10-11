"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { savePlanningRecord } from "@/app/app-domain/planejamento/actions";
import type { PlanningJurisdiction } from "@/lib/planejamento/policy";

export type PlanningField = {
  name: string; label: string; type?: "text" | "number" | "date" | "email" | "textarea" | "select" | "money";
  required?: boolean; value?: string; options?: { id: string; name: string }[]; step?: string;
};

export function PlanningForm({ jurisdiction, operation, fields, hidden = {}, redirectTo }: {
  jurisdiction: PlanningJurisdiction; operation: string; fields: PlanningField[];
  hidden?: Record<string, string>; redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ error?: string; success?: string }>({});
  const [resetKey, setResetKey] = useState(0);
  const submissionKey = useRef<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value)]));
    if (operation === "import") {
      submissionKey.current ??= crypto.randomUUID();
      input.submissionKey = submissionKey.current;
    }
    setPending(true); setMessage({});
    try {
      const result = await savePlanningRecord(jurisdiction, operation, { ...input, ...hidden });
      if (result.error) setMessage({ error: result.error });
      else {
        setMessage({ success: "Registro salvo com sucesso." });
        form.reset();
        setResetKey((key) => key + 1);
        submissionKey.current = null;
        if (redirectTo && result.id) router.push(`${redirectTo}/${result.id}`);
        else router.refresh();
      }
    } catch { setMessage({ error: "Não foi possível concluir a solicitação. Tente novamente." }); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="space-y-3">
    <fieldset key={resetKey} disabled={pending} className="grid gap-3 md:grid-cols-2">
      {fields.map((field) => <div key={field.name} className={field.type === "textarea" ? "space-y-1 md:col-span-2" : "space-y-1"}>
        <Label htmlFor={`${operation}-${field.name}`}>{field.label}{field.required !== false && " *"}</Label>
        {field.type === "select" ? <select id={`${operation}-${field.name}`} name={field.name} required={field.required !== false} defaultValue={field.value ?? ""} className="h-9 w-full rounded-md border bg-background px-2 text-sm"><option value="">Selecione</option>{field.options?.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>
          : field.type === "money" ? <PlanningMoneyField field={field} operation={operation} />
          : field.type === "textarea" ? <Textarea id={`${operation}-${field.name}`} name={field.name} required={field.required !== false} defaultValue={field.value} />
          : <Input id={`${operation}-${field.name}`} name={field.name} type={field.type ?? "text"} step={field.step} required={field.required !== false} defaultValue={field.value} />}
      </div>)}
    </fieldset>
    {message.error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{message.error}</p>}
    {message.success && <p role="status" className="text-sm text-emerald-700">{message.success}</p>}
    <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
  </form>;
}

function PlanningMoneyField({ field, operation }: { field: PlanningField; operation: string }) {
  const [value, setValue] = useState(Number(field.value ?? "0"));
  return <><input type="hidden" name={field.name} value={value.toFixed(2)} /><MoneyInput id={`${operation}-${field.name}`} value={value} onChange={setValue} required={field.required !== false} /></>;
}
