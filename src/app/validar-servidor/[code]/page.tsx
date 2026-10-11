import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { municipality } from "@/lib/platform/municipality";
import { EMPLOYEE_DOCUMENT_KINDS, VALIDATION_CODE_PATTERN, type EmployeeDocumentKind } from "@/lib/portal-servidor/documents";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `Validação de documento do servidor — ${municipality.prefectureName}`, robots: { index: false } };

export default async function EmployeeDocumentValidationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!VALIDATION_CODE_PATTERN.test(code)) notFound();
  const issue = await prisma.employeeDocumentIssue.findUnique({ where: { code } });
  if (!issue) notFound();
  const employee = await prisma.employee.findUnique({ where: { id: issue.employeeId }, select: { name: true, registration: true } });
  // Exibe apenas o necessário para conferência: nome, matrícula, tipo e referência.
  return (
    <main className="mx-auto max-w-xl p-6 sm:p-10">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-emerald-700">Documento autêntico</p>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{EMPLOYEE_DOCUMENT_KINDS[issue.kind as EmployeeDocumentKind] ?? issue.kind}</h1>
        <p className="mt-1 text-sm text-slate-600">Emitido pelo Portal do Servidor — {municipality.prefectureName}</p>
        <dl className="mt-6 space-y-3 text-sm text-slate-700">
          <div><dt className="font-semibold">Servidor</dt><dd>{employee?.name ?? "—"} · matrícula {employee?.registration ?? "—"}</dd></div>
          <div><dt className="font-semibold">Referência</dt><dd>{issue.reference}</dd></div>
          <div><dt className="font-semibold">Emissão</dt><dd>{issue.issuedAt.toLocaleString("pt-BR", { timeZone: "America/Fortaleza" })}</dd></div>
          <div><dt className="font-semibold">Código</dt><dd className="font-mono">{issue.code}</dd></div>
          <div><dt className="font-semibold">Hash SHA-256</dt><dd className="break-all font-mono text-xs">{issue.hashSha256}</dd></div>
        </dl>
      </section>
    </main>
  );
}
