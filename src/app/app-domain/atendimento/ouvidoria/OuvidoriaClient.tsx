"use client";

import Link from "next/link";
import { useState } from "react";
import { EyeOff, Search } from "lucide-react";

type Ombudsman = {
  id: string;
  protocolNumber: string;
  type: string;
  subject: string;
  isAnonymous: boolean;
  isConfidential: boolean;
  status: string;
  createdAt: Date;
  person: { fullName: string } | null;
};

export default function OuvidoriaClient({ initialManifestacoes }: { initialManifestacoes: Ombudsman[]; canManage: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const manifestacoes = initialManifestacoes.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (!search || item.protocolNumber.toLowerCase().includes(search) || item.subject.toLowerCase().includes(search)) && (!filterType || item.type === filterType);
  });
  return <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm" aria-label="Listagem de manifestações">
    <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex-row">
      <label className="relative flex-1 max-w-md"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><span className="sr-only">Buscar manifestação</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por protocolo ou assunto" className="h-7 w-full rounded border border-slate-300 bg-white py-1 pl-8 pr-2 text-xs outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15" /></label>
      <select value={filterType} onChange={(event) => setFilterType(event.target.value)} className="h-7 rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15"><option value="">Todos os tipos</option><option>Denúncia</option><option>Reclamação</option><option>Sugestão</option><option>Elogio</option></select>
    </div>
    {!manifestacoes.length ? <div className="p-8 text-center text-xs text-slate-500">Nenhuma manifestação encontrada.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-600"><tr><th className="h-8 px-3">Protocolo</th><th className="h-8 px-3">Tipo</th><th className="h-8 px-3">Assunto</th><th className="h-8 px-3">Manifestante</th><th className="h-8 px-3">Status</th><th className="h-8 px-3" /></tr></thead><tbody className="divide-y">{manifestacoes.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-3 py-2 font-semibold">{item.protocolNumber}</td><td className="px-3 py-2">{item.type}</td><td className="px-3 py-2">{item.subject}</td><td className="px-3 py-2">{item.isAnonymous ? <span className="inline-flex gap-1 italic text-slate-500"><EyeOff className="size-3.5" />Anônimo</span> : item.person?.fullName || "Identidade restrita"}</td><td className="px-3 py-2">{item.status}</td><td className="px-3 py-2 text-right"><Link href={`/atendimento/ouvidoria/${item.id}`} className="font-semibold text-amber-700 hover:text-amber-800">Abrir</Link></td></tr>)}</tbody></table></div>}
  </section>;
}
