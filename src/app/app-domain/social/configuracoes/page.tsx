import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import SocialCatalogsClient from "./SocialCatalogsClient";

export default async function SocialConfigurationPage() {
  const { prisma } = await getTenantContextForModule("SOCIAL");
  const [entries, wages] = await Promise.all([
    prisma.socialCatalogEntry.findMany({ orderBy: [{ kind: "asc" }, { name: "asc" }] }),
    prisma.socialMinimumWage.findMany({ orderBy: { validFrom: "desc" } }),
  ]);
  return <SocialCatalogsClient entries={entries.map(({ id, kind, name, description, isActive }) => ({ id, kind, name, description, isActive }))} wages={wages.map((wage) => ({ id: wage.id, validFrom: wage.validFrom.toISOString().slice(0, 10), value: wage.value.toString() }))} />;
}
