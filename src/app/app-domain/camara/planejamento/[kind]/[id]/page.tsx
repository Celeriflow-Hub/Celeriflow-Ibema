import { PlanningDetailPage } from "@/components/app-ui/planejamento/PlanningPages";

export default async function Page({ params, searchParams }: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { kind, id } = await params;
  return <PlanningDetailPage jurisdiction="LEGISLATIVE" kind={kind} id={id} page={(await searchParams).page} />;
}
