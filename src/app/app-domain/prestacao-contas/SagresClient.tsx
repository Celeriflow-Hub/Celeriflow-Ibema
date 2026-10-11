"use client";

import { useState, useTransition } from "react";
import { downloadSagresAction, generateSagresAction, registerSagresSubmissionAction, validateSagresAction } from "./actions";
import type { SagresIssue } from "@/lib/integrations/sagres/engine";

type Layout = { code: string; name: string; version: string; official: boolean };
type Remessa = { id: string; layoutCode: string; layoutVersion: string; competence: string; managementUnit: string; status: string; recordCount: number; fileName: string; fileHash: string; protocol: string | null; sentAt: string | null; createdAt: string };

const previousMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function SagresClient({ layouts, defaultUnit, identity, remessas }: { layouts: Layout[]; defaultUnit: string; identity: { ibge: string; sagres: string; cnpj: string }; remessas: Remessa[] }) {
  const [layoutCode, setLayoutCode] = useState(layouts[0]?.code ?? "");
  const [competence, setCompetence] = useState(previousMonth());
  const [managementUnit, setManagementUnit] = useState(defaultUnit);
  const [issues, setIssues] = useState<SagresIssue[] | null>(null);
  const [recordCount, setRecordCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const input = { layoutCode, competence, managementUnit };
  const layout = layouts.find((l) => l.code === layoutCode);

  const validate = () => start(async () => {
    setFeedback(null);
    const result = await validateSagresAction(input);
    if (result.error) return setFeedback(result.error);
    setIssues(result.issues ?? []);
    setRecordCount(result.recordCount ?? 0);
  });
  const generate = () => start(async () => {
    const result = await generateSagresAction(input);
    setFeedback(result.error ?? "Remessa gerada com sucesso.");
    if (!result.error) setIssues(null);
  });
  const download = (id: string) => start(async () => {
    const result = await downloadSagresAction(id);
    if (result.error || !result.content) return setFeedback(result.error ?? "Arquivo vazio.");
    const url = URL.createObjectURL(new Blob([result.content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = result.fileName ?? "sagres.txt";
    a.click();
    URL.revokeObjectURL(url);
  });
  const register = (id: string) => {
    const protocol = window.prompt("Número do protocolo de envio no TCE-PB:");
    if (!protocol) return;
    start(async () => {
      const result = await registerSagresSubmissionAction(id, protocol);
      setFeedback(result.error ?? "Envio registrado.");
    });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-card p-4">
        <p className="text-xs text-muted-foreground">IBGE {identity.ibge} · Código SAGRES {identity.sagres || "não informado"} · CNPJ {identity.cnpj}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <label className="text-sm">Arquivo
            <select className="mt-1 w-full rounded-md border bg-background px-2 py-2" value={layoutCode} onChange={(e) => { setLayoutCode(e.target.value); setIssues(null); }}>
              {layouts.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </label>
          <label className="text-sm">Competência
            <input type="month" className="mt-1 w-full rounded-md border bg-background px-2 py-2" value={competence} onChange={(e) => { setCompetence(e.target.value); setIssues(null); }} />
          </label>
          <label className="text-sm">Unidade gestora
            <input className="mt-1 w-full rounded-md border bg-background px-2 py-2" value={managementUnit} onChange={(e) => setManagementUnit(e.target.value)} />
          </label>
          <div className="flex items-end gap-2">
            <button disabled={pending} onClick={validate} className="rounded-md border px-3 py-2 text-sm font-medium">Validar</button>
            <button disabled={pending || !issues || issues.length > 0} onClick={generate} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Gerar arquivo</button>
          </div>
        </div>
        {layout && !layout.official && <p className="mt-2 text-xs text-amber-700">Leiaute {layout.version} provisório: será substituído pela versão oficial do TCE-PB.</p>}
        {feedback && <p className="mt-3 text-sm">{feedback}</p>}
        {issues && (
          <div className="mt-3 text-sm">
            {issues.length === 0
              ? <p className="text-emerald-700">Nenhuma pendência. {recordCount} registro(s) prontos para geração.</p>
              : <>
                  <p className="font-medium text-destructive">{issues.length} pendência(s) em {recordCount} registro(s):</p>
                  <ul className="mt-2 max-h-64 space-y-1 overflow-auto">
                    {issues.map((i, n) => <li key={n}>{i.line ? `Linha ${i.line} — ` : ""}{i.label}: {i.message}</li>)}
                  </ul>
                </>}
          </div>
        )}
      </section>

      <section className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-2">Arquivo</th><th className="p-2">Competência</th><th className="p-2">Registros</th><th className="p-2">Situação</th><th className="p-2">Protocolo</th><th className="p-2">Gerada em</th><th className="p-2" /></tr></thead>
          <tbody>
            {remessas.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">Nenhuma remessa gerada.</td></tr>}
            {remessas.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.fileName}<div className="text-xs text-muted-foreground">{r.managementUnit} · v{r.layoutVersion}</div></td>
                <td className="p-2">{r.competence}</td>
                <td className="p-2">{r.recordCount}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{r.protocol ?? "—"}</td>
                <td className="p-2">{new Date(r.createdAt).toLocaleString("pt-BR")}</td>
                <td className="flex gap-2 p-2">
                  <button onClick={() => download(r.id)} className="text-primary underline">Baixar</button>
                  {r.status === "GERADA" && <button onClick={() => register(r.id)} className="text-primary underline">Registrar envio</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
