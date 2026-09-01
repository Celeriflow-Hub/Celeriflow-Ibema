"use client";

import { useState } from "react";
import { Home, Pencil, Trash2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { updateRealEstate, deactivateRealEstate, activateRealEstate } from "../actions";

type RealEstate = {
  id: string;
  municipalInsc: string | null;
  propertyType: string | null;
  status: string;
  streetName: string | null;
  number: string | null;
  neighborhood: { name: string } | null;
  taxpayer: {
    person: { fullName: string } | null;
    company: { corporateName: string } | null;
  } | null;
};

export default function ImoveisClient({ realEstates }: { realEstates: RealEstate[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RealEstate>>({});

  const handleEditClick = (re: RealEstate) => {
    setEditingId(re.id);
    setEditForm({
      municipalInsc: re.municipalInsc,
      propertyType: re.propertyType,
      streetName: re.streetName,
      number: re.number,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (confirm("Deseja salvar as alterações?")) {
      try {
        await updateRealEstate(editingId, editForm);
        setEditingId(null);
      } catch (e) {
        console.error(e);
        alert("Erro ao salvar");
      }
    }
  };

  const handleDeactivate = async (id: string) => {
    if (confirm("Deseja realmente inativar este registro?")) {
      await deactivateRealEstate(id);
    }
  };

  const handleActivate = async (id: string) => {
    if (confirm("Deseja realmente reativar este registro?")) {
      await activateRealEstate(id);
    }
  };

  if (realEstates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-2 flex size-9 items-center justify-center rounded bg-slate-100">
          <Home className="size-5 text-slate-400" />
        </div>
        <h2 className="text-sm font-bold text-slate-700">Nenhum registro encontrado</h2>
        <p className="mt-0.5 text-xs text-slate-500">Comece adicionando o primeiro imóvel na base de dados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-xs whitespace-nowrap">
        <thead className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-600">
          <tr>
            <th className="h-8 px-3">Insc. Imobiliária</th>
            <th className="h-8 px-3">Endereço</th>
            <th className="h-8 px-3">Tipo</th>
            <th className="h-8 px-3">Proprietário (Contribuinte)</th>
            <th className="h-8 px-3">Status</th>
            <th className="h-8 px-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {realEstates.map((re) => {
            let owner = 'N/A';
            if (re.taxpayer?.person) {
              owner = re.taxpayer.person.fullName;
            } else if (re.taxpayer?.company) {
              owner = re.taxpayer.company.corporateName;
            }

            return (
              <tr key={re.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2 font-medium text-slate-800">
                  {editingId === re.id ? (
                    <input
                      type="text"
                      value={editForm.municipalInsc || ""}
                      onChange={(e) => setEditForm({ ...editForm, municipalInsc: e.target.value })}
                      className="w-full border rounded px-2 py-1 placeholder-slate-400"
                      placeholder="Inscrição Imobiliária"
                    />
                  ) : (
                    re.municipalInsc || 'S/ Inscrição'
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {editingId === re.id ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={editForm.streetName || ""}
                        onChange={(e) => setEditForm({ ...editForm, streetName: e.target.value })}
                        className="w-full border rounded px-2 py-1 placeholder-slate-400 font-normal text-xs"
                        placeholder="Rua/Avenida"
                      />
                      <input
                        type="text"
                        value={editForm.number || ""}
                        onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                        className="w-full border rounded px-2 py-1 placeholder-slate-400 font-normal text-xs"
                        placeholder="Número"
                      />
                    </div>
                  ) : (
                    `${re.streetName || ''}, ${re.number || 'S/N'}${re.neighborhood ? ` - ${re.neighborhood.name}` : ''}` || '-'
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {editingId === re.id ? (
                    <input
                      type="text"
                      value={editForm.propertyType || ""}
                      onChange={(e) => setEditForm({ ...editForm, propertyType: e.target.value })}
                      className="w-full border rounded px-2 py-1 placeholder-slate-400"
                      placeholder="Tipo (Ex: Casa, Terreno)"
                    />
                  ) : (
                    re.propertyType || '-'
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600">{owner}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${re.status === 'Regular' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                    {re.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {editingId === re.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={handleSaveEdit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Salvar">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded" title="Cancelar">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditClick(re)} className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {re.status === 'Regular' ? (
                        <button onClick={() => handleDeactivate(re.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Inativar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(re.id)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Reativar">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}
