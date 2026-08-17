import { ArrowLeft, Save, UserRound } from "lucide-react";
import Link from "next/link";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { createPerson } from "../../actions";

export default function NovaPessoaFisicaPage() {
  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Link href="/cadastros/pessoas-fisicas" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="w-4 h-4" />Voltar para listagem</Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900"><UserRound className="w-6 h-6 text-indigo-600" />Nova Pessoa Física</h1>
        <p className="mt-1 text-slate-500">Cadastre uma pessoa na base única municipal.</p>
      </div>
      <form action={createPerson} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <label className="field md:col-span-2">Nome completo *<input name="fullName" required className="input" /></label>
          <label className="field">CPF *<MaskedInput maskType="cpf" name="cpf" required placeholder="000.000.000-00" className="input" /></label>
          <label className="field">Data de nascimento<input name="birthDate" type="date" className="input" /></label>
          <label className="field">E-mail<input name="email" type="email" className="input" /></label>
          <label className="field">Telefone<MaskedInput maskType="phone" name="phonePrimary" className="input" /></label>
        </div>
        <div className="flex justify-end gap-3"><Link href="/cadastros/pessoas-fisicas" className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600">Cancelar</Link><button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"><Save className="w-4 h-4" />Salvar pessoa</button></div>
      </form>
    </div>
  );
}
