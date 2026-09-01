"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, RefreshCw, Search, Trash2 } from "lucide-react";
import { updateSecretariat, deactivateSecretariat, activateSecretariat } from "../actions";

const PAGE_SIZE = 20;

type Secretariat = {
  id: string;
  name: string;
  acronym: string | null;
  managerName: string | null;
  isActive: boolean;
  _count: { departments: number };
};

export default function SecretariasClient({ secretariats }: { secretariats: Secretariat[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", acronym: "", managerName: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredSecretariats = secretariats.filter((secretariat) => (
    secretariat.name.toLowerCase().includes(normalizedSearchTerm)
    || secretariat.acronym?.toLowerCase().includes(normalizedSearchTerm)
    || secretariat.managerName?.toLowerCase().includes(normalizedSearchTerm)
  ));
  const totalPages = Math.max(1, Math.ceil(filteredSecretariats.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const firstRecord = filteredSecretariats.length === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1;
  const pageSecretariats = filteredSecretariats.slice(firstRecord - 1, firstRecord - 1 + PAGE_SIZE);
  const lastRecord = firstRecord === 0 ? 0 : firstRecord + pageSecretariats.length - 1;
  const messageRowCount = pageSecretariats.length === 0 ? 1 : 0;
  const emptyRows = Math.max(0, PAGE_SIZE - pageSecretariats.length - messageRowCount);

  const handleEditClick = (secretariat: Secretariat) => {
    setEditingId(secretariat.id);
    setEditForm({
      name: secretariat.name,
      acronym: secretariat.acronym || "",
      managerName: secretariat.managerName || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !window.confirm("Tem certeza que deseja salvar estas alterações?")) return;
    const result = await updateSecretariat(editingId, editForm);
    if (result.error) alert(result.error);
    else setEditingId(null);
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja inativar esta secretaria? Ela não será excluída do sistema.")) return;
    const result = await deactivateSecretariat(id);
    if (result.error) alert(result.error);
  };

  const handleActivate = async (id: string) => {
    if (!window.confirm("Deseja reativar esta secretaria?")) return;
    const result = await activateSecretariat(id);
    if (result.error) alert(result.error);
  };

  return (
    <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm" aria-label="Listagem de secretarias">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Secretarias cadastradas</h2>
          <p className="text-xs text-slate-500">Grade preparada para 20 registros por página.</p>
        </div>
        <label className="relative block w-full sm:w-80">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <span className="sr-only">Buscar secretaria</span>
          <input
            type="search"
            placeholder="Buscar por nome, sigla ou responsável"
            className="h-9 w-full rounded-md border border-slate-300 bg-white py-1 pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
        </label>
      </div>

      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[28%]" />
          <col className="hidden md:table-column md:w-[10%]" />
          <col className="hidden md:table-column md:w-[24%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead className="border-b border-slate-200 bg-slate-100 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-600">
          <tr>
            <th scope="col" className="h-10 px-3">Nome</th>
            <th scope="col" className="hidden h-10 px-3 md:table-cell">Sigla</th>
            <th scope="col" className="hidden h-10 px-3 md:table-cell">Responsável</th>
            <th scope="col" className="h-10 px-3 text-center">Departamentos</th>
            <th scope="col" className="h-10 px-3 text-center">Status</th>
            <th scope="col" className="h-10 px-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {pageSecretariats.map((secretariat) => (
            <tr key={secretariat.id} className="h-10 hover:bg-slate-50">
              <td className="px-3 font-medium text-slate-800">
                {editingId === secretariat.id ? (
                  <input className="h-8 w-full rounded border border-slate-300 px-2 text-sm outline-none focus:border-blue-600" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
                ) : <span className="block truncate" title={secretariat.name}>{secretariat.name}</span>}
              </td>
              <td className="hidden px-3 text-slate-600 md:table-cell">
                {editingId === secretariat.id ? (
                  <input className="h-8 w-full rounded border border-slate-300 px-2 text-sm outline-none focus:border-blue-600" value={editForm.acronym} onChange={(event) => setEditForm({ ...editForm, acronym: event.target.value })} />
                ) : <span className="block truncate">{secretariat.acronym || "-"}</span>}
              </td>
              <td className="hidden px-3 text-slate-600 md:table-cell">
                {editingId === secretariat.id ? (
                  <input className="h-8 w-full rounded border border-slate-300 px-2 text-sm outline-none focus:border-blue-600" value={editForm.managerName} onChange={(event) => setEditForm({ ...editForm, managerName: event.target.value })} />
                ) : <span className="block truncate" title={secretariat.managerName || undefined}>{secretariat.managerName || "-"}</span>}
              </td>
              <td className="px-3 text-center text-slate-600">{secretariat._count.departments}</td>
              <td className="px-3 text-center">
                <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-bold ${secretariat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {secretariat.isActive ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-3">
                {editingId === secretariat.id ? (
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={handleSaveEdit} className="h-7 rounded bg-emerald-700 px-2 text-xs font-semibold text-white hover:bg-emerald-800">Salvar</button>
                    <button type="button" onClick={() => setEditingId(null)} className="h-7 rounded border border-slate-300 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => handleEditClick(secretariat)} className="flex size-7 items-center justify-center rounded text-blue-700 hover:bg-blue-50" title="Editar secretaria" aria-label={`Editar ${secretariat.name}`}><Pencil className="size-3.5" /></button>
                    {secretariat.isActive ? (
                      <button type="button" onClick={() => handleDeactivate(secretariat.id)} className="flex size-7 items-center justify-center rounded text-red-700 hover:bg-red-50" title="Inativar secretaria" aria-label={`Inativar ${secretariat.name}`}><Trash2 className="size-3.5" /></button>
                    ) : (
                      <button type="button" onClick={() => handleActivate(secretariat.id)} className="flex size-7 items-center justify-center rounded text-emerald-700 hover:bg-emerald-50" title="Reativar secretaria" aria-label={`Reativar ${secretariat.name}`}><RefreshCw className="size-3.5" /></button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
          {pageSecretariats.length === 0 && (
            <tr className="h-10">
              <td colSpan={6} className="px-3 text-center text-sm text-slate-500">
                {secretariats.length === 0 ? "Nenhuma secretaria cadastrada." : `Nenhuma secretaria encontrada para "${searchTerm}".`}
              </td>
            </tr>
          )}
          {Array.from({ length: emptyRows }, (_, index) => (
            <tr key={`empty-${index}`} aria-hidden="true" className="h-10">
              <td colSpan={6} className="px-3">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>{firstRecord === 0 ? "0 registros" : `Exibindo ${firstRecord}-${lastRecord} de ${filteredSecretariats.length} registros`}{normalizedSearchTerm && ` encontrados (${secretariats.length} cadastrados)`}</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Página {activePage} de {totalPages}</span>
          <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={activePage === 1} className="flex size-7 items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Página anterior"><ChevronLeft className="size-4" /></button>
          <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={activePage === totalPages} className="flex size-7 items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Próxima página"><ChevronRight className="size-4" /></button>
        </div>
      </footer>
    </section>
  );
}
