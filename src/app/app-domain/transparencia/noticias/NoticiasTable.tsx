"use client";

import { Trash2 } from "lucide-react";
import { deleteNews } from "./actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

type News = {
  id: string;
  title: string;
  status: string;
  author: { name: string } | null;
};

export default function NoticiasTable({ news }: { news: News[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta notícia?")) {
      startTransition(async () => {
        await deleteNews(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
          <tr>
            <th className="px-3 py-2.5">Título</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="hidden px-3 py-2.5 sm:table-cell">Autor</th>
            <th className="w-12 px-3 py-2.5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {news.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="break-words px-3 py-3 font-medium text-slate-800"><span>{item.title}</span><span className="mt-1 block text-xs font-normal text-slate-500 sm:hidden">{item.author?.name || "Sem autor"}</span></td>
              <td className="px-3 py-3">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${item.status === 'Publicado' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                  {item.status}
                </span>
              </td>
              <td className="hidden px-3 py-3 text-slate-600 sm:table-cell">{item.author?.name || "-"}</td>
              <td className="px-3 py-3 text-right">
                <button 
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Excluir"
                  aria-label={`Excluir ${item.title}`}
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
