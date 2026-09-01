"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, FileSignature, X } from "lucide-react";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { signProcessDocumentInternally } from "../actions";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type PendingSignature = {
  id: string;
  requestedAt: Date | string;
  process: { id: string; protocolNumber: string };
  title: string;
  documentType: string;
};

export default function AssinaturasClient({ initialDocuments }: { initialDocuments: PendingSignature[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedDocument, setSelectedDocument] = useState<PendingSignature | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    if (isPending) return;
    setSelectedDocument(null);
    setPassword("");
    setError(null);
  }

  function sign() {
    if (!selectedDocument || !password) return;
    setError(null);
    startTransition(async () => {
      try {
        const user = auth.currentUser;
        if (!user?.email) throw new Error("Sua sessao Firebase nao esta disponivel. Entre novamente no sistema.");
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
        const result = await signProcessDocumentInternally(selectedDocument.id, await user.getIdToken(true));
        if (result.error) {
          setError(result.error);
          return;
        }
        setDocuments((current) => current.filter((document) => document.id !== selectedDocument.id));
        close();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Nao foi possivel confirmar sua senha.");
      }
    });
  }

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Assinaturas Pendentes" icon={<FileSignature className="size-4 shrink-0 text-emerald-600" />} />
      <p className="text-xs text-slate-500">Documentos de processos usam a mesma manifestação central do GED.</p>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        {documents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-slate-400 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Tudo em dia!</h3>
            <p className="text-slate-500 mt-1">Você não possui documentos aguardando assinatura no momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Documento / Processo</th>
                  <th className="px-6 py-3">Assunto</th>
                  <th className="px-6 py-3">Data de Solicitação</th>
                    <th className="px-6 py-3 text-right">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((processDocument) => (
                  <tr key={`${processDocument.id}-${processDocument.process.id}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="block font-bold text-slate-800">{processDocument.title}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{processDocument.process.protocolNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-medium text-slate-800">{processDocument.documentType || "Arquivo"}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Vinculado ao processo</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(processDocument.requestedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedDocument(processDocument)} disabled={isPending} className="text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50">Assinar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedDocument && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-lg rounded-xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-200 p-5"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><FileSignature className="h-5 w-5 text-emerald-600" />Assinar documento</h2><button onClick={close} disabled={isPending} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button></div><div className="space-y-4 p-5 text-sm text-slate-700"><p><strong>{selectedDocument.title}</strong> esta vinculado a uma versao bloqueada com hash SHA-256.</p><label className="block text-sm font-medium text-slate-700">Senha da conta<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>{error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}</div><div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-5"><button onClick={close} disabled={isPending} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button><button onClick={sign} disabled={!password || isPending} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{isPending ? "Registrando..." : "Registrar assinatura"}</button></div></div></div>}
    </PageFrame>
  );
}
