import Link from "next/link";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ErpPagination } from "@/components/app-ui/erp/ErpPagination";
import { getPlanningContext, canDecidePlanningLegally } from "@/lib/planejamento/access";
import { canPerformModuleOperation } from "@/lib/platform/tenant-context";
import { planningBasePath, type PlanningJurisdiction } from "@/lib/planejamento/policy";
import { PlanningForm } from "./PlanningForm";

export async function PlanningReferencePage({ jurisdiction, filters }: { jurisdiction: PlanningJurisdiction; filters: { page?: string; q?: string; versionId?: string } }) {
  const context = await getPlanningContext(jurisdiction);
  const base = `${planningBasePath(jurisdiction)}/cadastros/versions`;
  const requested = Math.max(1, Number(filters.page) || 1);
  const where = filters.q ? { OR: [{ label: { contains: filters.q.slice(0, 200), mode: "insensitive" as const } }, { normativeReference: { contains: filters.q.slice(0, 200), mode: "insensitive" as const } }] } : {};
  const total = await context.prisma.planningCatalogVersion.count({ where });
  const page = Math.min(requested, Math.max(1, Math.ceil(total / 20)));
  const versions = await context.prisma.planningCatalogVersion.findMany({ where, orderBy: [{ year: "desc" }, { id: "asc" }], take: 20, skip: (page - 1) * 20 });
  const selected = filters.versionId ? await context.prisma.planningCatalogVersion.findUnique({ where: { id: filters.versionId } }) : null;
  const entriesTotal = selected ? await context.prisma.planningCatalogEntry.count({ where: { versionId: selected.id } }) : 0;
  const entries = selected ? await context.prisma.planningCatalogEntry.findMany({ where: { versionId: selected.id }, orderBy: [{ kind: "asc" }, { code: "asc" }], take: 20, skip: (Math.min(requested, Math.max(1, Math.ceil(entriesTotal / 20))) - 1) * 20 }) : [];
  return <PageFrame className="space-y-3 p-3"><PageHeader title="Catálogos normativos por exercício" /><p className="text-xs text-muted-foreground">Importação versionada e imutável após disponibilização. Referência normativa e hash do arquivo são preservados; disponibilizar um catálogo não homologa seus dados.</p>
    <form method="get" className="flex gap-2"><input aria-label="Buscar referência" name="q" defaultValue={filters.q} className="rounded border p-2" /><button className="rounded border p-2 text-xs">Consultar</button></form>
    <Card><CardContent className="pt-3"><Table><TableHeader><TableRow><TableHead>Exercício / versão</TableHead><TableHead>Referência</TableHead><TableHead>Situação</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader><TableBody>{versions.map((version) => <TableRow key={version.id}><TableCell>{version.year} · {version.label}</TableCell><TableCell>{version.normativeReference}<p className="break-all text-xs">SHA-256 {version.sourceHash}</p></TableCell><TableCell>{version.status === "PUBLISHED" ? "Disponível e preservada" : "Em conferência"}</TableCell><TableCell><Link className="underline" href={`${base}?versionId=${version.id}`}>Consultar árvore</Link>{version.status === "DRAFT" && canDecidePlanningLegally(context) && <PlanningForm jurisdiction={jurisdiction} operation="catalogPublish" hidden={{ versionId: version.id }} fields={[]} />}</TableCell></TableRow>)}</TableBody></Table><ErpPagination page={page} total={total} previousHref={`${base}?page=${page - 1}`} nextHref={`${base}?page=${page + 1}`} /></CardContent></Card>
    {selected && <Card><CardHeader><CardTitle>Árvore de {selected.label}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Código / descrição</TableHead><TableHead>Pai</TableHead><TableHead>Grau</TableHead></TableRow></TableHeader><TableBody>{entries.map((entry) => <TableRow key={entry.id}><TableCell>{entry.kind}</TableCell><TableCell>{entry.code} · {entry.name}</TableCell><TableCell>{entry.parentCode ?? "Raiz"}</TableCell><TableCell>{entry.degree}</TableCell></TableRow>)}</TableBody></Table><ErpPagination page={Math.min(requested, Math.max(1, Math.ceil(entriesTotal / 20)))} total={entriesTotal} previousHref={`${base}?versionId=${selected.id}&page=${requested - 1}`} nextHref={`${base}?versionId=${selected.id}&page=${requested + 1}`} /></CardContent></Card>}
    {canPerformModuleOperation(context.user, "PLANEJAMENTO", "update") && <Card><CardHeader><CardTitle>Importar tabela de referência</CardTitle></CardHeader><CardContent><PlanningForm jurisdiction={jurisdiction} operation="catalogVersion" fields={[{ name: "year", label: "Exercício", type: "number" }, { name: "label", label: "Identificação da edição" }, { name: "normativeReference", label: "Documento / portaria / fonte normativa" }, { name: "csv", label: "CSV com cabeçalho kind;code;name;degree;parentCode;tceCode;stnGroup;stnSpecification;stnDetail", type: "textarea" }]} /></CardContent></Card>}
  </PageFrame>;
}
