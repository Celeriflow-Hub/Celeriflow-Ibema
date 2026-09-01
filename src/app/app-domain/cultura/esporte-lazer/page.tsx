import { ClipboardList, MapPin, Trophy, Users } from "lucide-react";
import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import AtividadesEsporteLazerClient from "../components/AtividadesEsporteLazerClient";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function EsporteLazerPage() {
  const { prisma } = await getTenantContextForModule("CULTURA");
  const activities = await prisma.culturaAtividade.findMany({
    include: {
      space: {
        include: {
          asset: {
            include: {
              realEstate: true,
            },
          },
          realEstate: true,
        },
      },
      instructorEmployee: true,
      agent: {
        include: {
          person: true,
          company: true,
        },
      },
    },
    orderBy: [{ active: "desc" }, { startsAt: "desc" }],
  });

  const activeActivities = activities.filter((activity) => activity.active);
  const activeModalities = new Set(
    activeActivities.map((activity) => activity.modalidade.trim().toLocaleLowerCase("pt-BR")),
  );
  const usedSpaces = new Set(
    activeActivities.flatMap((activity) => (activity.space ? [activity.space.id] : [])),
  );

  const serializedActivities = activities.map((activity) => ({
    id: activity.id,
    nome: activity.nome,
    modalidade: activity.modalidade,
    publicoAlvo: activity.publicoAlvo,
    startsAt: activity.startsAt.toISOString(),
    endsAt: activity.endsAt?.toISOString() ?? null,
    status: activity.status,
    active: activity.active,
    space: activity.space
      ? {
          nome: activity.space.nome,
          tipo: activity.space.tipo,
          asset: activity.space.asset
            ? {
                nome: activity.space.asset.name,
                patrimonio: activity.space.asset.patrimonyNumber,
                realEstate: activity.space.asset.realEstate
                  ? {
                      inscricao: activity.space.asset.realEstate.municipalInsc,
                      endereco: [
                        activity.space.asset.realEstate.streetName,
                        activity.space.asset.realEstate.number,
                      ]
                        .filter(Boolean)
                        .join(", "),
                    }
                  : null,
              }
            : null,
          realEstate: activity.space.realEstate
            ? {
                inscricao: activity.space.realEstate.municipalInsc,
                endereco: [activity.space.realEstate.streetName, activity.space.realEstate.number]
                  .filter(Boolean)
                  .join(", "),
              }
            : null,
        }
      : null,
    instructorName: activity.instructorEmployee?.name ?? null,
    agentName:
      activity.agent?.person?.socialName ??
      activity.agent?.person?.fullName ??
      activity.agent?.company?.tradeName ??
      activity.agent?.company?.corporateName ??
      activity.agent?.nome ??
      null,
  }));

  return (
    <PageFrame className="space-y-3 px-1 py-1 md:px-2">
      <PageHeader title="Esporte e Lazer" icon={<Trophy className="size-4 shrink-0 text-rose-600 dark:text-rose-300" />} className="dark:border-slate-700 dark:bg-slate-800 dark:[&>h1]:text-white" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhamento das atividades esportivas e de lazer cadastradas no município.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Atividades cadastradas</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{activities.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Atividades ativas</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeActivities.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Modalidades ativas</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeModalities.size}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-sky-100 p-3 text-sky-600 dark:bg-sky-900/30">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Espaços utilizados</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{usedSpaces.size}</p>
            </div>
          </div>
        </div>
      </div>

      <AtividadesEsporteLazerClient activities={serializedActivities} />
    </PageFrame>
  );
}
