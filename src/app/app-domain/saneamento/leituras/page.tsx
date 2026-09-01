import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { FileText } from "lucide-react";
import { LeiturasClient } from "../components/LeiturasClient";
import { LeiturasInteractiveClient } from "./LeiturasInteractiveClient";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function LeiturasPage() {
  const { prisma } = await getTenantContextForModule("SANEAMENTO");
  const [readings, units] = await Promise.all([
    prisma.sanMeterReading.findMany({
      include: { unit: { select: { code: true } } },
      orderBy: { readingDate: "desc" },
    }),
    prisma.sanConsumerUnit.findMany({
      select: { id: true, code: true, address: true },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <PageFrame className="space-y-2 px-1 py-1 md:px-2">
      <PageHeader title="Leituras e Consumo" icon={<FileText className="size-4 shrink-0 text-emerald-500" />} className="dark:border-gray-700 dark:bg-gray-800 dark:[&>h1]:text-white" />
      <p className="px-1 text-xs text-gray-500 dark:text-gray-400">{readings.length} leitura{readings.length !== 1 ? "s" : ""} registrada{readings.length !== 1 ? "s" : ""}</p>
      <LeiturasInteractiveClient />
      <LeiturasClient readings={readings} units={units} />
    </PageFrame>
  );
}
