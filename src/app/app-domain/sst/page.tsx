import { HardHat } from "lucide-react";
import { ModuleFoundationPanel } from "@/components/app-ui/erp/ModuleFoundationPanel";
import { canViewModule, getTenantContextForModule } from "@/lib/platform/tenant-context";

export const dynamic = "force-dynamic";

export default async function SstDashboardPage() {
  const { user, prisma } = await getTenantContextForModule("SST");
  const rh = await prisma.configuracaoModulo.findUnique({ where: { codigo: "RH" }, select: { ativo: true } });
  const available = rh?.ativo !== false && canViewModule(user, "RH");
  return <ModuleFoundationPanel
    title="Segurança e Medicina do Trabalho"
    icon={<HardHat className="size-4 text-teal-700" />}
    description="Módulo de segurança e saúde ocupacional dos servidores, com acesso próprio. Os cadastros funcionais existentes no RH serão a referência para os vínculos ocupacionais."
    links={[
      { title: "Atestados e perícias", description: "Entrega de atestados, anexos GED, decisão pericial e afastamento vinculado ao RH.", href: "/sst/atestados", available: true, source: "SST" },
      { title: "Servidores e vínculos", description: "Cadastro funcional canônico, lotação e vínculo de trabalho.", href: "/rh/servidores", available, source: "RH e Folha" },
      { title: "Licenças e afastamentos", description: "Registros funcionais existentes para futura integração com os eventos ocupacionais.", href: "/rh/licencas", available, source: "RH e Folha" },
    ]}
    areas={[
      { title: "Exames ocupacionais e ASO", description: "Exames admissionais, periódicos, retorno ao trabalho e avaliação de aptidão." },
      { title: "Ambientes e riscos", description: "Ambientes de trabalho, exposição e gerenciamento de riscos ocupacionais." },
      { title: "Programas e laudos", description: "Programas de saúde ocupacional, laudos e documentos vinculados ao servidor." },
      { title: "Equipamentos de proteção", description: "Controle de entrega de EPI e integração com o estoque." },
      { title: "Acidentes e acompanhamento", description: "Ocorrências ocupacionais e acompanhamento integrado aos vínculos funcionais." },
      { title: "eSocial e relatórios", description: "Eventos ocupacionais, relatórios e acesso restrito aos registros de saúde do trabalhador." },
    ]}
  />;
}
