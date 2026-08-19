import { getTenantContextForModule } from "@/lib/platform/tenant-context";

export default async function PortalServidorPage() {
  const context = await getTenantContextForModule("RH");
  if (!context.user.employeeId) return <main className="mx-auto max-w-3xl p-8"><h1 className="text-3xl font-bold">Portal do Servidor</h1><p className="mt-4 rounded border p-4 text-sm text-slate-600">Seu usuário não está vinculado a um servidor municipal.</p></main>;
  const employee = await context.prisma.employee.findUnique({
    where: { id: context.user.employeeId },
    include: {
      role: true,
      secretariat: true,
      department: true,
      vacations: { orderBy: { acquisitionStart: "desc" }, take: 5 },
      leaves: { orderBy: { startDate: "desc" }, take: 5 },
      personnelActs: { orderBy: { createdAt: "desc" }, take: 10 },
      documentSignatures: { include: { document: { select: { title: true, documentType: true } } }, orderBy: { requestedAt: "desc" }, take: 10 },
    },
  });
  if (!employee) return <main className="mx-auto max-w-3xl p-8"><p>Servidor não encontrado.</p></main>;
  return <main className="mx-auto max-w-5xl space-y-6 p-8"><header><h1 className="text-3xl font-bold">Portal do Servidor</h1><p className="mt-1 text-sm text-muted-foreground">Consulta autenticada de dados funcionais e documentos disponibilizados.</p></header><section className="grid gap-4 rounded-lg border bg-white p-5 md:grid-cols-3"><div><p className="text-xs text-muted-foreground">Servidor</p><p className="font-semibold">{employee.name}</p></div><div><p className="text-xs text-muted-foreground">Cargo / lotação</p><p>{employee.role?.name ?? "Não informado"}</p><p className="text-sm text-muted-foreground">{employee.department?.name ?? employee.secretariat?.name ?? "Não informado"}</p></div><div><p className="text-xs text-muted-foreground">Situação</p><p>{employee.isActive ? "Ativo" : "Inativo"}</p></div></section><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-lg border bg-white p-5"><h2 className="font-semibold">Férias e afastamentos</h2><div className="mt-3 space-y-2 text-sm">{employee.vacations.map((item) => <p key={item.id}>{item.enjoymentStart?.toLocaleDateString("pt-BR") ?? item.acquisitionStart.toLocaleDateString("pt-BR")} a {item.enjoymentEnd?.toLocaleDateString("pt-BR") ?? item.acquisitionEnd.toLocaleDateString("pt-BR")} · {item.status}</p>)}{employee.leaves.map((item) => <p key={item.id}>{item.type} · {item.startDate.toLocaleDateString("pt-BR")} a {item.endDate.toLocaleDateString("pt-BR")}</p>)}{!employee.vacations.length && !employee.leaves.length && <p className="text-muted-foreground">Nenhum registro disponibilizado.</p>}</div></section><section className="rounded-lg border bg-white p-5"><h2 className="font-semibold">Atos funcionais</h2><div className="mt-3 space-y-2 text-sm">{employee.personnelActs.map((item) => <p key={item.id}>{item.type} · {item.date.toLocaleDateString("pt-BR")}{item.actNumber ? ` · ${item.actNumber}` : ""}</p>)}{!employee.personnelActs.length && <p className="text-muted-foreground">Nenhum ato disponibilizado.</p>}</div></section></div><section className="rounded-lg border bg-white p-5"><h2 className="font-semibold">Documentos para assinatura</h2><div className="mt-3 space-y-2 text-sm">{employee.documentSignatures.map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 rounded border p-3"><span>{item.document.title} · {item.document.documentType}</span><span>{item.status}</span></div>)}{!employee.documentSignatures.length && <p className="text-muted-foreground">Nenhum documento disponibilizado.</p>}</div></section></main>;
}
