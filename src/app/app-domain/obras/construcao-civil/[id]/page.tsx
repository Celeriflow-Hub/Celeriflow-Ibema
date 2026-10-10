import Link from "next/link";
import { notFound } from "next/navigation";
import { HardHat } from "lucide-react";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { getTenantContextForModule, canViewModule } from "@/lib/platform/tenant-context";
import { resolveConstructionAccess } from "@/lib/obras/construction-access";
import { areaKeys, areaLabels, constructionCaseWhere } from "@/lib/obras/construction-policy";

export default async function ConstructionCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getTenantContextForModule("OBRAS");
  const access = await resolveConstructionAccess(context);
  const item = await context.prisma.constructionCase.findFirst({ where: { AND: [{ id }, constructionCaseWhere(access)] }, include: { process: { select: { id: true, protocolNumber: true, status: true, description: true, person: { select: { fullName: true } }, company: { select: { corporateName: true } }, currentDepartment: { select: { name: true } } } }, configuration: true, properties: { select: { id: true, realEstateId: true, cadastralSnapshot: true } } } });
  if (!item) notFound();
  return <PageFrame className="space-y-3 p-3"><PageHeader title={`Construção Civil — ${item.process.protocolNumber}`} icon={<HardHat className="size-4" />} />
    <div className="flex gap-3 text-xs"><Link href="/obras/construcao-civil" className="text-blue-700 underline">Voltar às solicitações</Link>{canViewModule(context.user, "PROCESSOS") && <Link href={`/protocolos/processos/${item.process.id}`} className="text-blue-700 underline">Abrir protocolo vinculado</Link>}</div>
    <section className="grid gap-2 rounded-lg border p-3 text-xs sm:grid-cols-2"><p><strong>Requerente:</strong> {item.process.person?.fullName || item.process.company?.corporateName}</p><p><strong>Setor responsável:</strong> {item.process.currentDepartment?.name || "—"}</p><p><strong>Situação do protocolo:</strong> {item.process.status}</p><p><strong>Categoria:</strong> {item.category === "BUILDING" ? "Obra" : "Parcelamento do solo"} — {item.locationType === "URBAN" ? "Urbana" : "Rural"}</p><p><strong>Modalidade:</strong> {item.regularization ? "Regularização" : "Normal"}</p><p><strong>Configuração preservada:</strong> v{item.configuration.version}</p><p className="whitespace-pre-wrap sm:col-span-2"><strong>Descrição:</strong> {item.process.description}</p></section>
    <section className="space-y-2 rounded-lg border p-3 text-xs"><h2 className="font-semibold">Áreas e memória de cálculo</h2><div className="grid gap-2 sm:grid-cols-5">{areaKeys.map((key) => <p key={key}><strong>{areaLabels[key]}:</strong> {item[key].toString()} m²</p>)}</div><p><strong>Total:</strong> {item.totalArea.toString()} m²</p><pre className="whitespace-pre-wrap break-words rounded bg-slate-50 p-2 text-[11px] text-slate-700">{JSON.stringify(item.calculationSnapshot, null, 2)}</pre></section>
    <section className="space-y-2 rounded-lg border p-3 text-xs"><h2 className="font-semibold">Classificações preservadas na abertura</h2><pre className="whitespace-pre-wrap break-words">{JSON.stringify(item.catalogSnapshot, null, 2)}</pre></section>
    <section className="space-y-2 rounded-lg border p-3 text-xs"><h2 className="font-semibold">Imóveis — snapshot cadastral na abertura</h2>{item.properties.map((property) => <details key={property.id} className="rounded border p-2"><summary className="cursor-pointer">{property.realEstateId}</summary><pre className="mt-2 whitespace-pre-wrap break-words">{JSON.stringify(property.cadastralSnapshot, null, 2)}</pre></details>)}</section>
  </PageFrame>;
}
