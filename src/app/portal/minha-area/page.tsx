import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CircleCheck, Clock3, ShieldCheck, UserRound } from "lucide-react";
import { getSessionPrincipal, SESSION_COOKIE_NAME } from "@/lib/platform/session";

export const dynamic = "force-dynamic";

export default async function CitizenAreaPage() {
  const cookieStore = await cookies();
  const principal = await getSessionPrincipal(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!principal) redirect("/portal/entrar");

  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Minha área</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Olá, {principal.name}</h1>
              <p className="mt-2 text-sm text-slate-600">Sessão ativa para {principal.email}</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <CircleCheck className="size-4" aria-hidden="true" />
              Acesso verificado
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard icon={UserRound} title="Identificação" text="Sua conta local autorizada foi reconhecida com sucesso." />
            <InfoCard icon={ShieldCheck} title="Acesso protegido" text="Esta área é exibida somente após validação da sessão no servidor." />
            <InfoCard icon={Clock3} title="Serviços digitais" text="Nenhum serviço pessoal está disponível nesta etapa inicial." />
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5">
            <p className="text-sm leading-6 text-slate-600">
              Este é o início da área autenticada do cidadão. Novos serviços serão apresentados aqui somente quando estiverem integrados e disponíveis.
            </p>
            <Link href="/portal" className="mt-4 inline-flex text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline">
              Voltar ao portal oficial
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof UserRound; title: string; text: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="size-5 text-emerald-700" aria-hidden="true" />
      <h2 className="mt-3 font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
    </section>
  );
}
