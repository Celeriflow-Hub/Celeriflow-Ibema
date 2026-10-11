import { z } from "zod";
import { AccessError, getTenantContextForModule } from "@/lib/platform/tenant-context";
import { loadPayrollObligations, loadYearPayrolls } from "@/lib/rh/payroll-obligations-data";
import {
  accountingEntries, annualIncome, bySecretariat, employerCharges, generateCnab240, generateEsocialRemuneration,
  netByBank, provisions, rubricSummary, toCsv,
} from "@/lib/rh/payroll-obligations";
import { buildR4010, buildS1010 } from "@/lib/rh/reinf-esocial";
import { municipality } from "@/lib/platform/municipality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const kinds = z.enum(["resumo", "banco", "secretaria", "encargos", "provisoes", "contabil", "cnab", "esocial", "informe", "r4010", "s1010"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { prisma } = await getTenantContextForModule("RH");
    const { id } = await params;
    const url = new URL(request.url);
    const kind = kinds.parse(url.searchParams.get("tipo") || "resumo");
    const data = await loadPayrollObligations(prisma, id);
    if (!data) return Response.json({ error: "Folha não encontrada." }, { status: 404 });
    const { payroll, rows, items } = data;
    if (!rows.length) return Response.json({ error: "Calcule a folha antes de exportar." }, { status: 400 });
    const tag = payroll.competence.replace("/", "-");
    const charges = employerCharges(rows);
    let body = "";
    let ext = "csv";
    let type = "text/csv; charset=utf-8";

    switch (kind) {
      case "resumo":
        body = toCsv(["Rubrica", "Descrição", "Tipo", "Lançamentos", "Total"], rubricSummary(items).map((r) => [r.code, r.name, r.type, String(r.count), r.total]));
        break;
      case "banco":
        body = toCsv(["Banco", "Servidores", "Bruto", "Descontos", "Líquido"], netByBank(rows).map((r) => [r.group, String(r.employees), r.gross, r.discounts, r.net]));
        break;
      case "secretaria":
        body = toCsv(["Secretaria", "Servidores", "Bruto", "Descontos", "Líquido"], bySecretariat(rows).map((r) => [r.group, String(r.employees), r.gross, r.discounts, r.net]));
        break;
      case "encargos":
        body = toCsv(["Encargo", "Base", "Alíquota", "Valor"], [...charges.lines.map((l) => [l.name, l.base, `${(l.rate * 100).toFixed(2)}%`, l.value]), ["Total", null, null, charges.total]]);
        break;
      case "provisoes": {
        const p = provisions(rows);
        body = toCsv(["Provisão", "Valor"], [["Base salarial", p.base], ["13º salário (1/12)", p.thirteenth], ["Férias + 1/3 (1/12)", p.vacation], ["Total", p.total]]);
        break;
      }
      case "contabil":
        body = toCsv(["Natureza", "Descrição", "Valor"], accountingEntries(rows, charges).map((e) => [e.natureza, e.descricao, e.valor]));
        break;
      case "cnab": {
        const q = z.object({ banco: z.string().regex(/^\d{3}$/, "Banco com 3 dígitos."), agencia: z.string().min(1, "Informe a agência."), conta: z.string().min(1, "Informe a conta."), convenio: z.string().optional(), data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de pagamento inválida.") })
          .parse(Object.fromEntries(url.searchParams.entries()));
        const [y, m, d] = q.data.split("-").map(Number);
        const cnab = generateCnab240(rows, { bankCode: q.banco, agency: q.agencia, account: q.conta, agreement: q.convenio, paymentDate: new Date(y, m - 1, d) });
        body = cnab.content; ext = "rem"; type = "text/plain; charset=us-ascii";
        return new Response(body, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="folha-${tag}.rem"`, "X-Cnab-Count": String(cnab.count), "X-Cnab-Skipped": encodeURIComponent(cnab.skipped.join(", ")), "Cache-Control": "private, no-store" } });
      }
      case "esocial":
        body = generateEsocialRemuneration(rows, items, payroll.competence); ext = "xml"; type = "application/xml; charset=utf-8";
        break;
      case "r4010": {
        const [mm, yyyy] = payroll.competence.split("/");
        const per = `${yyyy}-${mm}`;
        const date = `${per}-${new Date(Number(yyyy), Number(mm), 0).getDate()}`;
        body = `<?xml version="1.0" encoding="UTF-8"?><lote>${rows.filter((r) => r.cpf && r.irrf > 0).map((r, i) =>
          buildR4010(municipality.cnpj, per, { cpf: r.cpf!, name: r.name }, [{ cpf: r.cpf!, name: r.name, natRend: "10001", date, gross: r.gross, irrf: r.irrf }], i + 1).replace(/^<\?xml[^>]*>/, "")).join("")}</lote>`;
        ext = "xml"; type = "application/xml; charset=utf-8";
        break;
      }
      case "s1010": {
        const [mm, yyyy] = payroll.competence.split("/");
        const seen = new Map<string, { code: string; name: string; type: string }>();
        for (const it of items) if (!seen.has(it.code)) seen.set(it.code, it);
        body = `<?xml version="1.0" encoding="UTF-8"?><lote>${[...seen.values()].map((r, i) =>
          buildS1010(municipality.cnpj, { code: r.code, description: r.name, nature: "1000", type: r.type === "Desconto" ? 2 : r.type === "Vencimento" ? 1 : 3, startCompetence: `${yyyy}-${mm}` }, i + 1).replace(/^<\?xml[^>]*>/, "")).join("")}</lote>`;
        ext = "xml"; type = "application/xml; charset=utf-8";
        break;
      }
      case "informe": {
        const year = payroll.competence.split("/")[1];
        const income = annualIncome(await loadYearPayrolls(prisma, year));
        body = toCsv(["CPF", "Nome", "Rendimentos tributáveis", "Previdência oficial", "IRRF", "13º salário", "IRRF 13º"], income.map((a) => [a.cpf, a.name, a.taxable, a.prev, a.irrf, a.thirteenth, a.thirteenthIrrf]));
        return new Response(body, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="informe-rendimentos-${year}.csv"`, "Cache-Control": "private, no-store" } });
      }
    }
    return new Response(body, { headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="folha-${tag}-${kind}.${ext}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    const status = error instanceof AccessError ? error.status : error instanceof z.ZodError ? 400 : 500;
    const message = error instanceof AccessError ? error.message : error instanceof z.ZodError ? error.issues.map((i) => i.message).join(" ") : "Não foi possível gerar a exportação.";
    if (status === 500) console.error("Exportação da folha:", error);
    return Response.json({ error: message }, { status });
  }
}
