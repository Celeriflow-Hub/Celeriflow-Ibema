import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";
import { sagresLayouts } from "@/lib/integrations/sagres/layouts";
import { municipality } from "@/lib/platform/municipality";
import { SagresClient } from "./SagresClient";

export const dynamic = "force-dynamic";

export default async function PrestacaoContasPage() {
  const { prisma } = await getTenantContextForModule("TRANSPARENCIA");
  const remessas = await prisma.sagresRemessa.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, layoutCode: true, layoutVersion: true, competence: true, managementUnit: true, status: true, recordCount: true, fileName: true, fileHash: true, protocol: true, sentAt: true, createdAt: true },
  });
  return (
    <PageFrame className="space-y-2 [&>div]:space-y-4 [&>div]:p-0 [&>div>div:first-child]:hidden">
      <PageHeader title="Prestação de Contas SAGRES — TCE-PB" />
      <p className="rounded-md border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900">
        SAGRES Frota: a conferência, certificação e reconciliação das competências ficam no{" "}
        <a href="/frotas/gestao/sagres" className="font-semibold underline">histórico certificado da Frota</a>. Gere aqui a remessa somente após certificar a competência.
      </p>
      <SagresClient
        layouts={sagresLayouts.map(({ code, name, version, official }) => ({ code, name, version, official }))}
        defaultUnit={municipality.prefectureName}
        identity={{ ibge: municipality.ibgeCode, sagres: municipality.sagresUnitCode, cnpj: municipality.cnpj }}
        remessas={remessas.map((r) => ({ ...r, sentAt: r.sentAt?.toISOString() ?? null, createdAt: r.createdAt.toISOString() }))}
      />
    </PageFrame>
  );
}
