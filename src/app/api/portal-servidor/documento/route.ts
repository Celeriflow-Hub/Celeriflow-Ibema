import { z } from "zod";
import { AccessError } from "@/lib/platform/tenant-context";
import { municipality } from "@/lib/platform/municipality";
import { auditEventTypes, writeAuditEvent } from "@/lib/platform/audit-evidence";
import { getEmployeePortalAccess } from "@/lib/portal-servidor/access";
import { issueEmployeeDocument, loadEmployeeYear, loadPayslip, qrSvg } from "@/lib/portal-servidor/document-service";
import { brl, consignableMargin, EMPLOYEE_DOCUMENT_KINDS, maskCpf, payslipTotals, renderEmployeeDocumentHtml, type DocumentSection, type EmployeeDocumentKind } from "@/lib/portal-servidor/documents";
import { round2 } from "@/lib/rh/payroll-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const query = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("contracheque"), folha: z.string().min(1).max(64) }),
  z.object({ tipo: z.literal("informe"), ano: z.string().regex(/^\d{4}$/) }),
  z.object({ tipo: z.literal("ficha"), ano: z.string().regex(/^\d{4}$/) }),
  z.object({ tipo: z.literal("declaracao") }),
]);

const fmtDate = (d: Date | null | undefined) => (d ? d.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "não informada");

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = query.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) return Response.json({ error: "Parâmetros inválidos." }, { status: 400 });
    const access = await getEmployeePortalAccess();
    if (access.status !== "AVAILABLE") return Response.json({ error: "Sem vínculo funcional ativo." }, { status: 403 });
    const { context } = access;
    const db = context.prisma;
    const employee = await db.employee.findUniqueOrThrow({
      where: { id: access.employee.id },
      select: { id: true, name: true, cpf: true, registration: true, admissionDate: true, employmentNature: true, socialSecurityRegime: true, salaryBase: true, pisPasep: true, role: { select: { name: true } }, secretariat: { select: { name: true } }, department: { select: { name: true } } },
    });
    const baseLines: [string, string][] = [
      ["Servidor", employee.name],
      ["CPF", maskCpf(employee.cpf)],
      ["Matrícula", employee.registration ?? "não informada"],
      ["Cargo", employee.role?.name ?? "não informado"],
      ["Lotação", employee.department?.name ?? employee.secretariat?.name ?? "não informada"],
      ["Admissão", fmtDate(employee.admissionDate)],
    ];

    let kind: EmployeeDocumentKind;
    let reference: string;
    let sections: DocumentSection[] = [];
    let paragraphs: string[] = [];
    let summary: Record<string, unknown>;
    let extraLines: [string, string][] = [];

    const p = parsed.data;
    if (p.tipo === "contracheque") {
      const slip = await loadPayslip(db, employee.id, p.folha);
      if (!slip || !slip.lines.length) return Response.json({ error: "Contracheque não disponível." }, { status: 404 });
      const t = payslipTotals(slip.lines);
      const m = consignableMargin(slip.lines);
      kind = "CONTRACHEQUE";
      reference = `${slip.payroll.type} ${slip.payroll.competence}`;
      extraLines = [["Competência", slip.payroll.competence], ["Tipo de folha", slip.payroll.type], ["Regime", employee.socialSecurityRegime]];
      sections = [
        { title: "Proventos e descontos", head: ["Rubrica", "Referência", "Proventos", "Descontos"], rows: slip.lines.filter((l) => l.type !== "Base").map((l) => [`${l.code.replace(/^CF/, "")} — ${l.name}`, l.reference ?? "", l.type === "Vencimento" ? brl(l.value) : "", l.type === "Desconto" ? brl(l.value) : ""]) },
        { title: "Totais", rows: [["Total de proventos", t.gross], ["Total de descontos", t.discounts], ["Valor líquido", t.net]] },
        { title: "Bases e margem", rows: [...slip.lines.filter((l) => l.type === "Base").map((l) => [l.name, l.value] as (string | number)[]), ["Margem consignável (35%)", m.limit], ["Margem disponível", m.available]] },
      ];
      summary = { competence: slip.payroll.competence, type: slip.payroll.type, gross: t.gross, discounts: t.discounts, net: t.net, payrollHash: slip.payroll.snapshotHash };
    } else if (p.tipo === "informe" || p.tipo === "ficha") {
      const months = await loadEmployeeYear(db, employee.id, p.ano);
      if (!months.length) return Response.json({ error: `Não há folhas fechadas em ${p.ano}.` }, { status: 404 });
      reference = p.ano;
      if (p.tipo === "ficha") {
        kind = "FICHA_FINANCEIRA";
        const rows = months.map((mo) => { const t = payslipTotals(mo.lines); return [`${mo.competence} — ${mo.type}`, t.gross, t.discounts, t.net] as (string | number)[]; });
        const tot = months.reduce((a, mo) => { const t = payslipTotals(mo.lines); return { g: a.g + t.gross, d: a.d + t.discounts, n: a.n + t.net }; }, { g: 0, d: 0, n: 0 });
        rows.push(["Total do ano", round2(tot.g), round2(tot.d), round2(tot.n)]);
        sections = [{ title: `Ficha financeira ${p.ano}`, head: ["Competência", "Proventos", "Descontos", "Líquido"], rows }];
        summary = { year: p.ano, gross: round2(tot.g), discounts: round2(tot.d), net: round2(tot.n), months: months.length };
      } else {
        kind = "INFORME_RENDIMENTOS";
        let taxable = 0, prev = 0, irrf = 0, th = 0, thIrrf = 0;
        for (const mo of months) {
          const t = payslipTotals(mo.lines);
          if (mo.type === "13º Salário" || mo.type === "Adiantamento 13º") { th += t.gross; thIrrf += t.irrf; } else { taxable += t.gross; irrf += t.irrf; }
          prev += t.previdencia;
        }
        sections = [
          { title: "3. Rendimentos tributáveis, deduções e imposto retido", rows: [["Total dos rendimentos (inclusive férias)", round2(taxable)], ["Contribuição previdenciária oficial", round2(prev)], ["Imposto sobre a renda retido na fonte", round2(irrf)]] },
          { title: "5. Rendimentos sujeitos à tributação exclusiva", rows: [["13º salário", round2(th)], ["IRRF sobre 13º salário", round2(thIrrf)]] },
        ];
        paragraphs = [`Fonte pagadora: ${municipality.legalName} — CNPJ ${municipality.cnpj}. Ano-calendário ${p.ano}. Documento para simples conferência; os valores oficiais são os declarados à Receita Federal.`];
        summary = { year: p.ano, taxable: round2(taxable), prev: round2(prev), irrf: round2(irrf), thirteenth: round2(th) };
      }
    } else {
      kind = "DECLARACAO_VINCULO";
      reference = new Date().toISOString().slice(0, 10);
      paragraphs = [
        `Declaramos, para os devidos fins, que ${employee.name}, CPF ${maskCpf(employee.cpf)}, matrícula ${employee.registration ?? "não informada"}, integra o quadro de pessoal do ${municipality.legalName}/${municipality.state}, no cargo de ${employee.role?.name ?? "não informado"}, com admissão em ${fmtDate(employee.admissionDate)}, vínculo ${employee.employmentNature ?? "não informado"} e regime previdenciário ${employee.socialSecurityRegime}, encontrando-se em atividade nesta data.`,
      ];
      summary = { name: employee.name, registration: employee.registration, role: employee.role?.name ?? null, active: true };
    }

    const issue = await issueEmployeeDocument(db, { kind, employeeId: employee.id, reference, summary });
    const validationUrl = `${url.origin}/validar-servidor/${issue.code}`;
    await writeAuditEvent(db, { actorUsuarioId: context.user.id, eventType: auditEventTypes.documentDownload, targetType: "EMPLOYEE_DOCUMENT", targetId: issue.id });
    const html = renderEmployeeDocumentHtml({
      title: `${EMPLOYEE_DOCUMENT_KINDS[kind]} — ${reference}`,
      issuer: municipality.prefectureName,
      issuerDetail: `CNPJ ${municipality.cnpj} · ${municipality.address} · ${municipality.cityName}/${municipality.state}`,
      coatOfArms: municipality.coatOfArms,
      employeeLines: [...baseLines, ...extraLines],
      sections, paragraphs,
      code: issue.code, hash: issue.hashSha256, validationUrl,
      qrSvg: await qrSvg(validationUrl),
      issuedAt: issue.issuedAt,
    });
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AccessError) return Response.json({ error: error.message }, { status: error.status ?? 403 });
    console.error("portal-servidor/documento", error);
    return Response.json({ error: "Não foi possível emitir o documento." }, { status: 500 });
  }
}
