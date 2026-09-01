"use client";

import { useState } from "react";
import { UserCog, Plus, Search, Shield, X } from "lucide-react";
import { upsertUsuario, toggleUsuarioStatus } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

type Perfil = { id: string; nome: string; codigo: string | null };
type Modulo = { id: string; nome: string; codigo: string };
type UsuarioModulo = { moduloId: string; canView: boolean; canEdit: boolean };
type Usuario = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfilId: string;
  perfil: { nome: string };
  employeeId: string | null;
  permissoesModulo: UsuarioModulo[];
};
type Servidor = {
  id: string;
  name: string;
  department: { name: string } | null;
};

export default function UsuariosClient({
  usuarios,
  perfis,
  modulos,
  servidores
}: {
  usuarios: Usuario[];
  perfis: Perfil[];
  modulos: Modulo[];
  servidores: Servidor[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<{
    id?: string;
    nome: string;
    email: string;
    perfilId: string;
    employeeId: string;
    ativo: boolean;
    permissoes: Record<string, { canView: boolean; canEdit: boolean }>;
  }>({
    nome: "",
    email: "",
    perfilId: perfis[0]?.id || "",
    employeeId: "",
    ativo: true,
    permissoes: {}
  });

  const filteredUsuarios = usuarios.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPerfil = perfis.find(p => p.id === formData.perfilId);
  const isAdmin = selectedPerfil?.codigo === "SYSTEM_ADMINISTRATOR";

  function openNewModal() {
    setFormData({
      nome: "",
      email: "",
      perfilId: perfis[0]?.id || "",
      employeeId: "",
      ativo: true,
      permissoes: {}
    });
    setIsModalOpen(true);
  }

  function openEditModal(usuario: Usuario) {
    const permMap: Record<string, { canView: boolean; canEdit: boolean }> = {};
    usuario.permissoesModulo.forEach(p => {
      permMap[p.moduloId] = { canView: p.canView, canEdit: p.canEdit };
    });

    setFormData({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfilId: usuario.perfilId,
      employeeId: usuario.employeeId || "",
      ativo: usuario.ativo,
      permissoes: permMap
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const permissoesArray = Object.entries(formData.permissoes).map(([moduloId, perms]) => ({
      moduloId,
      canView: perms.canView,
      canEdit: perms.canEdit
    }));

    const result = await upsertUsuario({
      id: formData.id,
      nome: formData.nome,
      email: formData.email,
      perfilId: formData.perfilId,
      employeeId: formData.employeeId || undefined,
      ativo: formData.ativo,
      permissoes: permissoesArray
    });

    if (result.error) {
      alert(result.error);
    } else {
      setIsModalOpen(false);
    }
    setIsSubmitting(false);
  }

  async function handleToggleStatus(id: string, ativo: boolean) {
    const result = await toggleUsuarioStatus(id, ativo);
    if (result.error) alert(result.error);
  }

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader
        title="Gestão de Usuários"
        icon={<UserCog className="size-4 shrink-0 text-slate-700 dark:text-slate-300" />}
        action={<button onClick={openNewModal} className="flex h-8 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900"><Plus className="h-4 w-4" />Novo Usuário</button>}
        className="dark:border-slate-700 dark:bg-slate-800 dark:[&>h1]:text-white"
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie acessos, perfis e permissões dos servidores.</p>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3">Nome / E-mail</th>
                <th className="px-6 py-3">Perfil</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.nome}</div>
                      <div className="text-slate-500 dark:text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      <Shield className="h-3 w-3" />
                      {u.perfil.nome}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(u.id, !u.ativo)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        u.ativo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(u)}
                      className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsuarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {formData.id ? "Editar Usuário" : "Novo Usuário"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Institucional</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Acesso</label>
                  <select
                    value={formData.perfilId}
                    onChange={e => setFormData({...formData, perfilId: e.target.value, permissoes: {}})}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                  >
                    {perfis.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servidor vinculado</label>
                  <select
                    value={formData.employeeId}
                    onChange={e => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                  >
                    <option value="">Sem vinculo operacional</option>
                    {servidores.map(servidor => (
                      <option key={servidor.id} value={servidor.id}>
                        {servidor.name}{servidor.department ? ` - ${servidor.department.name}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Obrigatorio para operar Protocolos e Processos.</p>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.ativo}
                      onChange={e => setFormData({...formData, ativo: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700">Usuário Ativo</span>
                  </label>
                </div>
              </div>

              {!isAdmin && (
                <div>
                  <h3 className="mb-3 border-b border-slate-200 pb-2 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-white">Permissões por Módulo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modulos.map(modulo => {
                      const perm = formData.permissoes[modulo.id] || { canView: false, canEdit: false };
                      return (
                        <Card key={modulo.id} className="shadow-sm">
                          <CardContent className="p-4">
                            <h4 className="font-bold text-sm text-gray-900 mb-3 truncate" title={modulo.nome}>
                              {modulo.nome}
                            </h4>
                            <div className="space-y-2">
                              <label className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
                                <span>Pode Ver</span>
                                <input 
                                  type="checkbox"
                                  checked={perm.canView || perm.canEdit}
                                  onChange={e => {
                                    const checked = e.target.checked;
                                    setFormData(prev => ({
                                      ...prev,
                                      permissoes: {
                                        ...prev.permissoes,
                                        [modulo.id]: { 
                                          canView: checked, 
                                          canEdit: checked ? perm.canEdit : false 
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                />
                              </label>
                              <label className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
                                <span>Pode Editar</span>
                                <input 
                                  type="checkbox"
                                  checked={perm.canEdit}
                                  onChange={e => {
                                    const checked = e.target.checked;
                                    setFormData(prev => ({
                                      ...prev,
                                      permissoes: {
                                        ...prev.permissoes,
                                        [modulo.id]: { 
                                          canView: checked ? true : perm.canView, 
                                          canEdit: checked 
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                />
                              </label>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3">
                  <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Acesso Total</h4>
                    <p className="text-sm mt-1">Este perfil de Administrador possui acesso irrestrito de visualização e edição em todos os módulos do sistema. Não é necessário configurar permissões individuais.</p>
                  </div>
                </div>
              )}
            </form>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                Salvar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </PageFrame>
  );
}
