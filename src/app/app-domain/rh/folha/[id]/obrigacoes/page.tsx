import Link from "next/link";
import { notFound } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { ErpPageTitle } from "@/components/app-ui/erp/ErpPageTitle";
import { loadPayrollObligations } from "@/lib/rh/payroll-obligations-data";
import { accountingEntries, bySecretariat, EMPLOYER_RATES, employerCharges, netByBank, provisions, rubricSummary } from "@/lib/rh/payroll-obligations";
import { CnabForm } from "./CnabForm";

export const dynamic = "force-dynamic";
const brl = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

function Table({ title, head, rows, exportHref }: { title: string; head: string[]; rows: (string | number)[][]; exportHref: string }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <a href={exportHref} className="text-xs font-medium text-violet-700 hover:underline">Baixar CSV</a>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr>{head.map((h, i) => <th key={h} className={`px-3 py-1.5 text-slate-500 ${i ? "text-right" : "text-left"}`}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, idx) => <tr key={idx} className="border-t">{r.map((c, i) => <td key={i} className={`px-3 py-1.5 ${i ? "text-right tabular-nums" : ""}`}>{typeof c === "number" ? brl(c) : c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

export default async function ObrigacoesFolhaPage({ params }: { params: Promise<{ id: string }> }) {
  const { prisma } = await getTenantContextForModule("RH");
  const { id } = await params;
  const data = await loadPayrollObligations(prisma, id);
  if (!data) notFound();
  const { payroll, rows, items } = data;
  const base = `/api/rh/folha/${id}/exportar?tipo=`;
  const charges = employerCharges(rows);
  const prov = provisions(rows);
  const noBank = rows.filter((r) => r.net > 0 && !(r.bankCode && r.bankAccount));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto bg-slate-50 p-3 dark:bg-slate-950">
      <ErpPageTitle
        title={`Relatórios e obrigações — ${payroll.type} ${payroll.competence}`}
        icon={<FileSpreadsheet className="size-4 text-violet-600" />}
        action={<Link href={`/rh/folha/${id}`} className="inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">Voltar à folha</Link>}
      />
      {!rows.length ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Calcule a folha para liberar relatórios e arquivos.</p>
      ) : (
        <>
          {payroll.status === "Aberta" && <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">Folha ainda aberta: os arquivos são prévias. Feche a competência antes de enviar ao banco ou ao eSocial.</p>}
          <div className="grid gap-3 lg:grid-cols-2">
            <Table title="Resumo por rubrica" head={["Rubrica", "Tipo", "Total"]} rows={rubricSummary(items).filter((r) => r.type !== "Base").map((r) => [`${r.code} — ${r.name}`, r.type, r.total])} exportHref={`${base}resumo`} />
            <Table title="Líquidos por banco" head={["Banco", "Servidores", "Líquido"]} rows={netByBank(rows).map((r) => [r.group, String(r.employees), r.net])} exportHref={`${base}banco`} />
            <Table title="Por secretaria" head={["Secretaria", "Servidores", "Bruto", "Líquido"]} rows={bySecretariat(rows).map((r) => [r.group, String(r.employees), r.gross, r.net])} exportHref={`${base}secretaria`} />
            <Table title={`Encargos patronais (alíquotas presumidas: ${EMPLOYER_RATES.rgpsPatronal * 100}% + RAT ${EMPLOYER_RATES.rat * 100}% / RPPS ${EMPLOYER_RATES.rppsPatronal * 100}%)`} head={["Encargo", "Base", "Valor"]} rows={[...charges.lines.map((l) => [l.name, l.base, l.value]), ["Total", "", charges.total]]} exportHref={`${base}encargos`} />
            <Table title="Provisões do mês" head={["Provisão", "Valor"]} rows={[["13º salário (1/12)", prov.thirteenth], ["Férias + 1/3 (1/12)", prov.vacation], ["Total", prov.total]]} exportHref={`${base}provisoes`} />
            <Table title="Integração contábil — proposta de empenho" head={["Natureza", "Descrição", "Valor"]} rows={accountingEntries(rows, charges).map((e) => [e.natureza, e.descricao, e.valor])} exportHref={`${base}contabil`} />
          </div>

          <section className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-semibold">Arquivos de envio</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              <a className="rounded-md border px-3 py-1.5 hover:bg-slate-50" href={`${base}esocial`}>eSocial — remuneração (S-1200/S-1202, XML)</a>
              <a className="rounded-md border px-3 py-1.5 hover:bg-slate-50" href={`${base}informe`}>Informe de rendimentos do ano (CSV)</a>
              <a className="rounded-md border px-3 py-1.5 hover:bg-slate-50" href={`${base}r4010`}>EFD-Reinf R-4010 — IRRF (XML, sem assinatura)</a>
              <a className="rounded-md border px-3 py-1.5 hover:bg-slate-50" href={`${base}s1010`}>eSocial S-1010 — rubricas (XML, sem assinatura)</a>
              <Link className="rounded-md border px-3 py-1.5 hover:bg-slate-50" href="/prestacao-contas">SAGRES Mensal (Folha)</Link>
            </div>
            {noBank.length > 0 && <p className="mt-2 text-xs text-amber-700">{noBank.length} servidor(es) sem conta bancária ficarão fora da remessa: {noBank.map((r) => r.name).join(", ")}.</p>}
            <CnabForm href={`${base}cnab`} />
          </section>
        </>
      )}
    </div>
  );
}
