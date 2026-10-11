import { FileCheck2 } from "lucide-react";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { listEmployeePayrolls } from "@/lib/portal-servidor/document-service";

export const dynamic = "force-dynamic";

const btn = "inline-flex h-8 items-center rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50";
const doc = (q: string) => `/api/portal-servidor/documento?${q}`;

export default async function EmissaoDocumentosPage() {
  const access = await getEmployeePortalAccess();
  const title = <ErpPageTitle title="Emitir documentos" description="Contracheques, informe de rendimentos, ficha financeira e declarações com validação por QR Code" icon={<FileCheck2 className="size-5 text-emerald-700" />} />;
  if (access.status !== "AVAILABLE") return <div className="flex flex-1 flex-col">{title}<p className="m-3 border bg-white p-4 text-sm text-slate-600">Seu usuário ainda não possui vínculo funcional ativo.</p></div>;
  const payrolls = await listEmployeePayrolls(access.context.prisma, access.employee.id);
  const years = [...new Set(payrolls.map((p) => p.competence.split("/")[1]))].sort().reverse();
  if (!years.length) years.push(String(new Date().getFullYear()));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      {title}
      <div className="grid gap-3 p-3 lg:grid-cols-2">
        <section className="border border-slate-300 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Contracheques</h2>
          {!payrolls.length ? <p className="mt-2 text-xs text-slate-500">Nenhuma competência fechada disponível.</p> : (
            <ul className="mt-2 divide-y">
              {payrolls.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-1.5 text-xs">
                  <span><strong>{p.competence}</strong> · {p.type} · {p.status}</span>
                  <a className={btn} target="_blank" rel="noopener" href={doc(`tipo=contracheque&folha=${p.id}`)}>Emitir</a>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="space-y-3 border border-slate-300 bg-white p-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Documentos anuais e declarações</h2>
          {years.map((y) => (
            <div key={y} className="flex flex-wrap items-center gap-2 text-xs">
              <strong className="w-12">{y}</strong>
              <a className={btn} target="_blank" rel="noopener" href={doc(`tipo=informe&ano=${y}`)}>Informe de rendimentos</a>
              <a className={btn} target="_blank" rel="noopener" href={doc(`tipo=ficha&ano=${y}`)}>Ficha financeira</a>
            </div>
          ))}
          <div className="border-t pt-3">
            <a className={btn} target="_blank" rel="noopener" href={doc("tipo=declaracao")}>Declaração de vínculo funcional</a>
          </div>
          <p className="text-[11px] leading-5 text-slate-500">Cada documento recebe um código único e QR Code. Qualquer pessoa pode conferir a autenticidade na página de validação, sem acesso aos valores.</p>
        </section>
      </div>
    </div>
  );
}
