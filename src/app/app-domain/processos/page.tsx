import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default function ProcessosPage() {
  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Processos" />
      <div className="flex h-[280px] items-center justify-center rounded border border-dashed bg-background">
        <div className="text-center">
          <h3 className="text-lg font-medium">Módulo de Processos</h3>
          <p className="text-sm text-muted-foreground mt-1">Em breve você poderá gerenciar processos aqui.</p>
        </div>
      </div>
    </PageFrame>
  );
}
