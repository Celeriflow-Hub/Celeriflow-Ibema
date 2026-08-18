"use client";

import { LockKeyhole } from "lucide-react";

export default function UploadLicitacoesForm() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 text-sm font-semibold rounded-lg" title="A transparência não cria processos de compra.">
      <LockKeyhole className="w-4 h-4" />
      Importação desabilitada
    </div>
  );
}
