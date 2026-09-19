"use client";

import { useState } from "react";
import { Search, Plus, FileText, Trash2, XCircle } from "lucide-react";
import { createInvoice, cancelInvoice } from "./actions";
import { ErpListFrame } from "@/components/app-ui/erp/ErpListFrame";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import {
  ErpTableContainer,
  ErpTableThead,
  ErpTableTh,
  ErpTableTr,
  ErpTableTd,
  ErpStatusBadge,
  type ErpStatusVariant,
} from "@/components/app-ui/erp/ErpTable";

type TaxpayerInfo = {
  id: string;
  person: { fullName: string; cpf: string } | null;
  company: { corporateName: string; cnpj: string } | null;
};

type Invoice = {
  id: string;
  invoiceNumber: number;
  verificationCode: string;
  serviceValue: number;
  competence: string;
  status: string;
  createdAt: Date;
  provider: TaxpayerInfo;
  taker: TaxpayerInfo | null;
};

type Taxpayer = {
  id: string;
  name: string;
};

function invoiceVariant(status: string): ErpStatusVariant {
  if (status === "Emitida") return "info";
  if (status === "Cancelada") return "danger";
  return "neutral";
}

export default function NfseClient({ 
  invoices,
  taxpayers
}: { 
  invoices: Invoice[];
  taxpayers: Taxpayer[];
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createForm, setCreateForm] = useState({
    providerId: taxpayers[0]?.id || "",
    takerId: "",
    serviceValue: 0,
    competence: `${new Date().getMonth() + 1}`.padStart(2, '0') + "/" + new Date().getFullYear(),
  });

  const filtered = invoices.filter((inv) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const num = String(inv.invoiceNumber);
    const prov = (inv.provider?.company?.corporateName || inv.provider?.person?.fullName || "").toLowerCase();
    const take = (inv.taker?.company?.corporateName || inv.taker?.person?.fullName || "").toLowerCase();
    return num.includes(term) || prov.includes(term) || take.includes(term);
  });

  const handleCancel = async (id: string) => {
    if (confirm("Deseja cancelar esta NFS-e? Esta ação não pode ser desfeita.")) {
      try {
        await cancelInvoice(id);
      } catch (e) {
        console.error(e);
        alert("Erro ao cancelar NFS-e.");
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.providerId) {
      alert("Selecione um prestador válido.");
      return;
    }
    if (createForm.serviceValue <= 0) {
      alert("O valor do serviço deve ser maior que zero.");
      return;
    }
    try {
      await createInvoice(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({ 
        providerId: taxpayers[0]?.id || "",
        takerId: "",
        serviceValue: 0,
        competence: `${new Date().getMonth() + 1}`.padStart(2, '0') + "/" + new Date().getFullYear(),
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar rascunho interno.");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 p-2 sm:p-2.5 overflow-hidden">
      <ErpPageTitle
        title="Notas Fiscais de Serviço (NFS-e)"
        icon={<FileText className="size-4 text-blue-600" />}
        action={
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-amber-500 px-3 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:bg-amber-600"
          >
            <Plus className="size-3.5" />
            Nova Nota
          </button>
        }
      />

      <ErpListFrame
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-[180px] flex-1">
              <span className="sr-only">Buscar NFS-e</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por número da nota, prestador ou tomador"
                className="h-8 w-full rounded-md border border-slate-200 bg-white py-1 pl-8 pr-2.5 text-xs outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          </div>
        }
      >
        <ErpTableContainer>
          <ErpTableThead>
            <tr>
              <ErpTableTh className="w-[12%]">Nº NFS-e</ErpTableTh>
              <ErpTableTh className="w-[12%]">Emissão</ErpTableTh>
              <ErpTableTh className="w-[28%]">Prestador</ErpTableTh>
              <ErpTableTh className="w-[24%]">Tomador</ErpTableTh>
              <ErpTableTh className="w-[12%] text-right">Valor Serviço</ErpTableTh>
              <ErpTableTh className="w-[6%]">Status</ErpTableTh>
              <ErpTableTh className="w-[6%] text-right">Ações</ErpTableTh>
            </tr>
          </ErpTableThead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs text-slate-400">
                  Nenhum registro de NFS-e encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <ErpTableTr key={inv.id}>
                  <ErpTableTd className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    #{inv.invoiceNumber}
                  </ErpTableTd>
                  <ErpTableTd>
                    {new Date(inv.createdAt).toLocaleDateString("pt-BR")}
                  </ErpTableTd>
                  <ErpTableTd>
                    {inv.provider?.company?.corporateName || inv.provider?.person?.fullName || "—"}
                  </ErpTableTd>
                  <ErpTableTd>
                    {inv.taker?.company?.corporateName || inv.taker?.person?.fullName || "—"}
                  </ErpTableTd>
                  <ErpTableTd className="text-right font-semibold tabular-nums">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(inv.serviceValue)}
                  </ErpTableTd>
                  <ErpTableTd>
                    <ErpStatusBadge variant={invoiceVariant(inv.status)}>{inv.status}</ErpStatusBadge>
                  </ErpTableTd>
                  <ErpTableTd className="text-right">
                    {inv.status === "Emitida" && (
                      <button
                        onClick={() => handleCancel(inv.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Cancelar NFS-e"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </ErpTableTd>
                </ErpTableTr>
              ))
            )}
          </tbody>
        </ErpTableContainer>
      </ErpListFrame>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">Registrar NFS-e</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prestador (Contribuinte)</label>
                <select 
                  required
                  value={createForm.providerId}
                  onChange={(e) => setCreateForm({...createForm, providerId: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20" 
                >
                  <option value="">Selecione o prestador...</option>
                  {taxpayers.map(tp => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tomador (Opcional)</label>
                <select 
                  value={createForm.takerId}
                  onChange={(e) => setCreateForm({...createForm, takerId: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20" 
                >
                  <option value="">Selecione o tomador (ou deixe em branco)...</option>
                  {taxpayers.map(tp => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Competência</label>
                  <input 
                    type="text"
                    required
                    placeholder="MM/AAAA"
                    value={createForm.competence}
                    onChange={(e) => setCreateForm({...createForm, competence: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor do Serviço (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={createForm.serviceValue}
                    onChange={(e) => setCreateForm({...createForm, serviceValue: Number(e.target.value)})}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20" 
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-600 transition-colors shadow-xs"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
