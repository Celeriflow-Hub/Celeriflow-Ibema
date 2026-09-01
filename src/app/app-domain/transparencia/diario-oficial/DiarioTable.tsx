"use client";

import { Trash2, ExternalLink } from "lucide-react";
import { deleteDiary } from "./actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Diary = {
  id: string;
  editionNumber: number;
  publishDate: Date | string;
  status: string;
  pdfUrl: string;
};

export default function DiarioTable({ diaries }: { diaries: Diary[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta edição?")) {
      startTransition(async () => {
        await deleteDiary(id);
        router.refresh();
      });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
          <tr>
            <th className="px-3 py-2.5">Edição</th>
            <th className="px-3 py-2.5">Data de Publicação</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="w-20 px-3 py-2.5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {diaries.map(diary => (
            <tr key={diary.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-3 font-semibold text-slate-800">Nº {diary.editionNumber}</td>
              <td className="px-3 py-3 text-slate-600">{new Date(diary.publishDate).toLocaleDateString('pt-BR')}</td>
              <td className="px-3 py-3">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${diary.status === 'Publicado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {diary.status}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-1">
                <Link 
                  href={diary.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                  title="Ler PDF"
                  aria-label={`Ler edição ${diary.editionNumber}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => handleDelete(diary.id)}
                  disabled={isPending}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center"
                  title="Excluir"
                  aria-label={`Excluir edição ${diary.editionNumber}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
