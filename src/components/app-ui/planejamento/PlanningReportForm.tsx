import { planningReportCatalog } from "@/lib/planejamento/report-catalog";
import { planningInstrumentWhere, planningLineWhere, planningUnitWhere, type PlanningContext } from "@/lib/planejamento/access";
import { planningBasePath } from "@/lib/planejamento/policy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanningReportSubmission } from "./PlanningReportSubmission";

export async function PlanningReportForm({ context, instrumentId, creditId }: { context: PlanningContext; instrumentId: string; creditId?: string }) {
  const [pieces, units, sources, dimensions, credits] = await Promise.all([
    context.prisma.planningInstrument.findMany({ where: planningInstrumentWhere(context), select: { id: true, title: true, kind: true, governmentEntity: { select: { name: true } } }, orderBy: [{ startYear: "desc" }, { id: "asc" }] }),
    context.prisma.budgetUnit.findMany({ where: planningUnitWhere(context), select: { id: true, name: true }, orderBy: { name: "asc" } }),
    context.prisma.resourceSource.findMany({ select: { id: true, name: true }, orderBy: { code: "asc" } }),
    context.prisma.planningBudgetLine.findMany({ where: { instrumentId, ...planningLineWhere(context) }, distinct: ["programId", "actionId"], select: { program: { select: { id: true, name: true } }, action: { select: { id: true, name: true } } } }),
    context.prisma.planningCreditBatch.findMany({ where: { instrumentId, items: { every: { line: planningLineWhere(context) } } }, select: { id: true, creditRequest: { select: { number: true } } }, orderBy: [{ createdAt: "desc" }, { id: "asc" }] }),
  ]);
  const selectedKind = pieces.find((piece) => piece.id === instrumentId)?.kind;
  const programs = [...new Map(dimensions.filter((row) => row.program).map((row) => [row.program!.id, row.program!])).values()];
  const actions = [...new Map(dimensions.filter((row) => row.action).map((row) => [row.action!.id, row.action!])).values()];
  const select = (name: string, label: string, values: { id: string; name: string }[], defaultValue?: string) => <label className="text-sm">{label}<select name={name} defaultValue={defaultValue} className="mt-1 w-full rounded border bg-background p-2"><option value="">Todos / não selecionar</option>{values.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>;
  return <Card><CardHeader><CardTitle>Catálogo de relatórios</CardTitle></CardHeader><CardContent><PlanningReportSubmission action={`${planningBasePath(context.jurisdiction)}/relatorios/emitir`}>
    <input type="hidden" name="instrumentIds" value={instrumentId} />
    <label className="text-sm">Relatório<select name="type" required className="mt-1 w-full rounded border bg-background p-2">{planningReportCatalog.map((row) => <option key={row.type} value={row.type}>{row.title}</option>)}</select></label>
    <label className="text-sm">Formato<select name="format" className="mt-1 w-full rounded border bg-background p-2"><option value="PDF">PDF</option><option value="CSV">CSV</option></select></label>
    {[["asOf", "Data de corte", "date"], ["from", "Data inicial das alterações", "date"], ["year", "Exercício (vazio: toda vigência)", "number"], ["version", "Versão (vazio: posição atual)", "number"], ["revenueDegree", "Grau da receita", "number"], ["nature", "Prefixo da natureza", "text"], ["functionCode", "Função", "text"], ["subfunctionCode", "Subfunção", "text"], ["product", "Produto", "text"]].map(([name, label, type]) => <label key={name} className="text-sm">{label}<input name={name} type={type} required={name === "asOf"} defaultValue={name === "asOf" ? new Date().toISOString().slice(0, 10) : undefined} className="mt-1 w-full rounded border bg-background p-2" /></label>)}
    {select("unitId", "Unidade", units)}{select("sourceId", "Fonte", sources)}{select("programId", "Programa", programs)}{select("actionId", "Ação", actions)}{select("creditId", "Lote de crédito", credits.map((row) => ({ id: row.id, name: row.creditRequest.number })), creditId)}
    {select("origin", "Origem dos recursos", [{ id: "CANCELLATION", name: "Anulação" }, { id: "SURPLUS", name: "Superávit" }, { id: "EXCESS", name: "Excesso de arrecadação" }, { id: "LOAN", name: "Operação de crédito" }])}
    <label className="text-sm">Agrupamento<select name="groupBy" className="mt-1 w-full rounded border bg-background p-2">{[["ENTITY", "Entidade"], ["CONSOLIDATED", "Consolidado"], ["UNIT", "Órgão/unidade"], ["PROGRAM", "Programa"], ["ACTION", "Ação"], ["FUNCTION", "Função"], ["SUBFUNCTION", "Subfunção"], ["SOURCE", "Fonte"], ["NATURE", "Natureza"]].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
    {select("transferPresentation", "Transferências", [{ id: "GROSS", name: "Valores brutos" }, { id: "NET", name: "Eliminar transferências internas conciliadas" }], "GROSS")}
    {select("targetId", "Peça de comparação", pieces.filter((piece) => piece.id !== instrumentId).map((piece) => ({ id: piece.id, name: `${piece.governmentEntity.name} · ${piece.title}` })))}
    <label className="text-sm md:col-span-2">Consolidar entidades (peças adicionais do mesmo tipo)<select name="additionalInstrumentIds" multiple className="mt-1 w-full rounded border bg-background p-2">{pieces.filter((piece) => piece.id !== instrumentId && piece.kind === selectedKind).map((piece) => <option key={piece.id} value={piece.id}>{piece.governmentEntity.name} · {piece.title}</option>)}</select></label>
    <button className="rounded border bg-primary p-2 text-sm text-primary-foreground">Gerar documento</button>
  </PlanningReportSubmission></CardContent></Card>;
}
