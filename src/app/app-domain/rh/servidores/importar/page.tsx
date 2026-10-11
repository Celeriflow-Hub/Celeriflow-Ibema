"use client";

import Link from "next/link";
import { useState } from "react";
import { Upload } from "lucide-react";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { IMPORT_COLUMNS } from "@/lib/rh/payroll-obligations";
import { importServidores, type ImportResult } from "./actions";

export default function ImportarServidoresPage() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function run(dryRun: boolean) {
    setBusy(true);
    setResult(await importServidores(text, dryRun));
    setBusy(false);
  }
  const errors = result?.issues?.filter((i) => i.severity === "erro").length ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-slate-50 p-3 dark:bg-slate-950">
      <ErpPageTitle title="Importar base de servidores" icon={<Upload className="size-4 text-violet-600" />}
        action={<Link href="/rh/servidores" className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">Voltar</Link>} />
      <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-600">Envie um CSV (separado por ; ou ,) com cabeçalho. Colunas aceitas: <code>{IMPORT_COLUMNS.join(";")}</code>. Obrigatórias: nome e cpf. Servidores com CPF já cadastrado são atualizados.</p>
        <input type="file" accept=".csv,text/csv" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setFileName(f.name); setText(await f.text()); setResult(null); } }} className="text-xs" />
        <div className="flex gap-2">
          <button disabled={!text || busy} onClick={() => run(true)} className="h-8 rounded-md border px-3 text-xs font-medium disabled:opacity-50">Verificar inconsistências</button>
          <button disabled={!text || busy || !result?.dryRun || !result.valid} onClick={() => run(false)} className="h-8 rounded-md bg-violet-600 px-3 text-xs font-medium text-white disabled:opacity-50">Importar {result?.valid ?? 0} registro(s) válidos</button>
        </div>
        {fileName && <p className="text-xs text-slate-500">Arquivo: {fileName}</p>}
        {result?.error && <p className="text-xs text-red-600">{result.error}</p>}
        {result && !result.error && (
          <div className="space-y-2">
            <p className="text-xs">{result.dryRun ? `Simulação: ${result.valid} válido(s), ${errors} erro(s), ${(result.issues?.length ?? 0) - errors} aviso(s).` : `Importação concluída: ${result.created} criado(s), ${result.updated} atualizado(s).`}</p>
            {!!result.issues?.length && (
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500"><th className="py-1">Linha</th><th>Campo</th><th>Situação</th><th>Mensagem</th></tr></thead>
                <tbody>{result.issues.map((i, idx) => <tr key={idx} className="border-t"><td className="py-1">{i.line}</td><td>{i.field}</td><td className={i.severity === "erro" ? "text-red-600" : "text-amber-700"}>{i.severity}</td><td>{i.message}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
