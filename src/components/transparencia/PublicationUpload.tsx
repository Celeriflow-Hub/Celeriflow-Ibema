"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { transparencyCatalog } from "@/lib/transparencia/consultation-catalog";

export function PublicationUpload({ years }: { years: number[] }) {
  const [busy, setBusy] = useState(false), [messages, setMessages] = useState<string[]>([]);
  const router = useRouter();
  return <form className="space-y-3 rounded border bg-white p-4" onSubmit={async event => {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    const files = data.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
    setBusy(true); setMessages([]);
    try {
      for (const file of files) {
        const payload = new FormData();
        for (const key of ["collectionSlug", "entity", "year", "group", "referencePeriod"]) payload.set(key, String(data.get(key) || ""));
        payload.set("title", files.length === 1 && data.get("title") ? String(data.get("title")) : file.name.replace(/\.pdf$/i, "")); payload.set("file", file);
        try {
          const response = await fetch("/api/transparencia/gestao/publicacoes", { method: "POST", body: payload });
          const result = await response.json();
          setMessages(previous => [...previous, `${file.name}: ${response.ok ? "enviado como rascunho" : result.error || "falha no upload"}`]);
        } catch { setMessages(previous => [...previous, `${file.name}: conexão interrompida`]); }
      }
      router.refresh();
    } finally { setBusy(false); }
  }}>
    <h2 className="font-bold">Upload de documentos para acesso externo</h2>
    <p className="text-sm text-slate-600">Selecione PDFs do acervo Novos Docs ou novos documentos. Em lote, o nome de cada arquivo será o título; agrupe por assunto e exercício. Após o upload, publique os rascunhos na lista abaixo.</p>
    <fieldset disabled={busy} className="grid gap-3 md:grid-cols-3">
      <label>Título (arquivo único)<input name="title" className="block w-full rounded border p-2" maxLength={250} /></label>
      <label>Entidade<select name="entity" className="block w-full rounded border p-2"><option value="prefeitura">Prefeitura</option><option value="camara">Câmara</option></select></label>
      <label>Exercício<select name="year" className="block w-full rounded border p-2">{years.map(year => <option key={year}>{year}</option>)}</select></label>
      <label>Consulta<select name="collectionSlug" defaultValue="publicacoes" className="block w-full rounded border p-2">{transparencyCatalog.map(collection => <option key={collection.slug} value={collection.slug}>{collection.title}</option>)}</select></label>
      <label>Assunto<input required name="group" placeholder="Ex.: RREO, Saúde, LDO, Obras" className="block w-full rounded border p-2" maxLength={200} /></label>
      <label>Competência/período<input required name="referencePeriod" placeholder="Ex.: 2º quadrimestre/2026" className="block w-full rounded border p-2" maxLength={200} /></label>
      <label className="md:col-span-3">Documentos PDF (até 20 MB cada)<input required multiple type="file" accept="application/pdf,.pdf" name="files" className="block w-full rounded border p-2" /></label>
      <button className="rounded bg-sky-900 px-4 py-2 text-white">{busy ? "Enviando…" : "Enviar documentos"}</button>
    </fieldset>
    <ul aria-live="polite" className="text-sm">{messages.map((message, index) => <li key={index}>{message}</li>)}</ul>
  </form>;
}
