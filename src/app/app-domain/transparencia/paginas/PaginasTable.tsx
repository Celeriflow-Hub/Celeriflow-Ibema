"use client";

import { Trash2 } from "lucide-react";
import { deletePage } from "./actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

type PortalPage = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

export default function PaginasTable({ pages }: { pages: PortalPage[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta página?")) {
      startTransition(async () => {
        await deletePage(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
          <tr>
            <th className="px-3 py-2.5">Título da Página</th>
            <th className="hidden px-3 py-2.5 sm:table-cell">URL (Slug)</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="w-12 px-3 py-2.5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pages.map(page => (
            <tr key={page.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-3 font-semibold text-slate-800"><span className="block break-words">{page.title}</span><span className="mt-1 block break-all font-mono text-xs font-normal text-slate-500 sm:hidden">/portal/{page.slug}</span></td>
              <td className="hidden break-all px-3 py-3 font-mono text-xs text-slate-500 sm:table-cell">/portal/{page.slug}</td>
              <td className="px-3 py-3">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${page.status === 'Publicado' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                  {page.status}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <button 
                  onClick={() => handleDelete(page.id)}
                  disabled={isPending}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Excluir"
                  aria-label={`Excluir ${page.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
