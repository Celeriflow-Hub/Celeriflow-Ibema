import Link from "next/link";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { municipality } from "@/lib/platform/municipality";

export const dynamic = "force-dynamic";

const safe = <T,>(p: Promise<T>, f: T) => p.catch(() => f);

export default async function PainelPocPage() {
  const { prisma } = await getTenantContextForModule("ADMINISTRACAO");
  const [employees, payrolls, guides, openGuides, certs, fuel, trips, lots, dispense, remessas, tickets] = await Promise.all([
    safe(prisma.employee.count(), 0),
    safe(prisma.payroll.count({ where: { status: { in: ["Fechada", "Paga"] } } }), 0),
    safe(prisma.taxGuide.count(), 0),
    safe(prisma.taxGuide.count({ where: { status: { notIn: ["Paga", "Cancelada"] } } }), 0),
    safe(prisma.taxCertificate.count(), 0),
    safe(prisma.fleetFuelOrder.count(), 0),
    safe(prisma.fleetTrip.count(), 0),
    safe(prisma.materialStock.count({ where: { material: { healthProfile: { isNot: null } } } }), 0),
    safe(prisma.medicineDispensation.count(), 0),
    safe(prisma.sagresRemessa.findMany({ select: { layoutCode: true, competence: true, status: true }, orderBy: { createdAt: "desc" }, take: 30 }), []),
    safe(prisma.supportRequest.count({ where: { status: { in: ["ABERTO", "EM_ATENDIMENTO"] } } }), 0),
  ]);
  const hasSagres = (k: string) => remessas.some((r) => r.layoutCode.toUpperCase().includes(k));
  const cards: [string, string, string][] = [
    ["Folha", `${employees} servidores`, `${payrolls} folhas fechadas`],
    ["Tributação", `${guides} guias`, `${openGuides} em aberto · ${certs} certidões`],
    ["Frota", `${fuel} ordens de abastecimento`, `${trips} viagens registradas`],
    ["Farmácia", `${lots} lotes`, `${dispense} dispensações`],
    ["Suporte", `${tickets} chamados abertos`, "Prazos do Termo de Referência"],
  ];
  const roteiro: [string, string, boolean | null][] = [
    ["1. Gestão Tributária — cadastro, lançamento, guia, baixa e dívida ativa", "/tributacao", guides > 0],
    ["2. Portal do Contribuinte — 2ª via com Pix e certidão validável", "/portal/contribuinte", certs > 0],
    ["3. Folha — cálculo, fechamento, relatórios e CNAB", "/rh/folha", payrolls > 0],
    ["4. Portal do Servidor — contracheque com QR Code", "/portal-servidor", null],
    ["5. Gestão de Frota — cotas, ordens, diário de bordo", "/frotas/gestao", fuel > 0],
    ["6. Portal da Frota — motorista, posto e oficina", "/portal-frota", trips > 0],
    ["7. Farmácia — entrada, dispensação, controlados", "/saude/farmacia/gestao", dispense > 0],
    ["8.13 SAGRES Mensal (Folha)", "/prestacao-contas", hasSagres("FOLHA") || hasSagres("MENSAL")],
    ["8.13 SAGRES Frota", "/prestacao-contas", hasSagres("FROTA")],
    ["8.13 SAGRES Farmácia", "/prestacao-contas", hasSagres("FARM")],
  ];
  return (
    <PageFrame className="space-y-3">
      <PageHeader title={`Painel gerencial e ensaio da POC — ${municipality.name}/${municipality.state}`} />
      <section className="grid gap-2 sm:grid-cols-5">{cards.map(([t, a, b]) => <div key={t} className="rounded border bg-white p-3"><p className="text-xs font-bold uppercase text-emerald-800">{t}</p><p className="text-lg font-bold">{a}</p><p className="text-xs text-slate-500">{b}</p></div>)}</section>
      <section className="rounded border bg-white p-3">
        <h2 className="font-bold">Roteiro da POC (item 8.13)</h2>
        <p className="text-xs text-slate-500">Verde = já existe dado demonstrável no sistema. Cinza = conferir manualmente.</p>
        <ul className="mt-2 divide-y text-sm">{roteiro.map(([t, href, ok]) => <li key={t} className="flex items-center justify-between gap-2 py-2"><span><span className={`mr-2 inline-block size-2.5 rounded-full ${ok ? "bg-emerald-600" : ok === false ? "bg-red-500" : "bg-slate-300"}`} />{t}</span><Link href={href} className="text-emerald-800 underline">Abrir</Link></li>)}</ul>
      </section>
    </PageFrame>
  );
}
