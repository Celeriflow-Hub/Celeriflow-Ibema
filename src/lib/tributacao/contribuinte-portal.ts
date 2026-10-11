import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { municipality } from "@/lib/platform/municipality";
import { buildPixBrCode, evaluateFiscalSituation, formatCpfCnpj, onlyDigits, readSession, type DebtItem } from "./contribuinte-engine";

export const SESSION_COOKIE = "contribuinte_portal";

export function portalSecret() {
  const s = process.env.CONTRIBUINTE_PORTAL_SECRET || process.env.PRICE_RESEARCH_PORTAL_SECRET || process.env.FIREBASE_PRIVATE_KEY;
  if (!s) throw new Error("Segredo do Portal do Contribuinte não configurado.");
  return s;
}

/** Localiza o contribuinte exigindo CPF/CNPJ + inscrição municipal (dois fatores). */
export async function findTaxpayer(document: string, inscription: string) {
  const d = onlyDigits(document);
  if (d.length !== 11 && d.length !== 14) return null;
  const variants = [d, formatCpfCnpj(d)];
  const t = await prisma.taxpayer.findFirst({
    where: { OR: [{ person: { cpf: { in: variants } } }, { company: { cnpj: { in: variants } } }] },
    include: { realEstates: true, economicRegistrations: true },
  });
  if (!t) return null;
  const insc = onlyDigits(inscription);
  const known = [t.municipalInsc, ...t.realEstates.flatMap((r) => [r.municipalInsc, r.registration]), ...t.economicRegistrations.map((e) => e.municipalInsc)]
    .filter(Boolean).map((v) => onlyDigits(String(v)));
  return insc && known.includes(insc) ? t : null;
}

export async function currentTaxpayerId() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return readSession(token, portalSecret());
}

export async function loadStatement(taxpayerId: string) {
  const taxpayer = await prisma.taxpayer.findUnique({
    where: { id: taxpayerId },
    include: {
      person: true, company: true,
      taxAssessments: { include: { tax: true, guides: { include: { payments: true }, orderBy: { dueDate: "desc" } } }, orderBy: { year: "desc" } },
      activeDebts: true,
      taxCertificates: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!taxpayer) return null;
  const guides = taxpayer.taxAssessments.flatMap((a) => a.guides.map((g) => {
    const total = Number(g.totalValueDecimal ?? g.totalValue);
    const paid = g.payments.filter((p) => p.status === "Confirmado").reduce((s, p) => s + Number(p.amountPaidDecimal ?? p.amountPaid), 0);
    return { id: g.id, number: g.guideNumber ?? g.id.slice(-8), tax: a.tax.name, year: a.year, dueDate: g.dueDate, status: g.status, total, balance: Math.max(total - paid, 0) };
  }));
  const debts = taxpayer.activeDebts.map((d) => ({ id: d.id, status: d.status, balance: Number(d.updatedValueDecimal ?? d.updatedValue) }));
  const items: DebtItem[] = [
    ...guides.map((g) => ({ kind: "GUIA" as const, status: g.status, dueDate: g.dueDate, balance: g.balance })),
    ...debts.map((d) => ({ kind: "DIVIDA_ATIVA" as const, status: d.status, balance: d.balance })),
  ];
  return {
    taxpayer, guides, debts,
    name: taxpayer.company?.corporateName ?? taxpayer.person?.fullName ?? "Contribuinte",
    document: formatCpfCnpj(taxpayer.company?.cnpj ?? taxpayer.person?.cpf ?? ""),
    fiscal: evaluateFiscalSituation(items),
  };
}

export function pixFor(guide: { id: string; number: string; balance: number }) {
  return buildPixBrCode({ key: municipality.pixKey, name: municipality.prefectureName, city: municipality.cityName, amount: guide.balance, txid: `DAM${guide.number}` });
}
