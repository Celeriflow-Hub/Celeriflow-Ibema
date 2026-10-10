import { Landmark } from "lucide-react";
import { ModuleFoundationPanel } from "@/components/app-ui/erp/ModuleFoundationPanel";
import { canViewModule, getTenantContextForModule } from "@/lib/platform/tenant-context";

export const dynamic = "force-dynamic";

export default async function PlanejamentoDashboardPage() {
  const { user, prisma } = await getTenantContextForModule("PLANEJAMENTO");
  const finance = await prisma.configuracaoModulo.findUnique({ where: { codigo: "FINANCEIRO" }, select: { ativo: true } });
  const available = finance?.ativo !== false && canViewModule(user, "FINANCEIRO");
  return <ModuleFoundationPanel
    title="Planejamento e Orçamento"
    icon={<Landmark className="size-4 text-indigo-700" />}
    description="Módulo de elaboração e acompanhamento dos instrumentos de planejamento. A base existente pode ser acessada abaixo durante a organização das áreas próprias do módulo."
    links={[
      { title: "PPA, LDO e LOA", description: "Programas, objetivos, indicadores, ações, metas e instrumentos legais.", href: "/financeiro/orcamento/planejamento", available, source: "Financeiro e Contábil" },
      { title: "Cadastros orçamentários", description: "Unidades gestoras, classificações e fontes utilizadas pelos fluxos financeiros.", href: "/financeiro/orcamento/cadastros", available, source: "Financeiro e Contábil" },
      { title: "Dotações e reservas", description: "Orçamento, disponibilidade e alterações vinculadas à execução da despesa.", href: "/financeiro/orcamento", available, source: "Financeiro e Contábil" },
    ]}
    areas={[
      { title: "PPA", description: "Programas, objetivos, indicadores, ações e metas plurianuais." },
      { title: "LDO", description: "Prioridades, metas e riscos fiscais por exercício." },
      { title: "LOA", description: "Previsão de receitas, fixação de despesas e vinculação das dotações." },
      { title: "Alterações orçamentárias", description: "Créditos adicionais, revisão dos instrumentos e histórico de versões." },
      { title: "Programação e acompanhamento", description: "Programação de desembolso, metas de arrecadação e acompanhamento orçamentário." },
      { title: "Relatórios e entidades", description: "Relatórios próprios, acesso por unidade gestora e recortes de Prefeitura e Câmara." },
    ]}
  />;
}
