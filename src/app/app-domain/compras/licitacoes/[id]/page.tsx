import { getTenantContextForModule } from "@/lib/platform/tenant-context";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Gavel } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function LicitacaoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { prisma } = await getTenantContextForModule("COMPRAS");
  const resolvedParams = await params;
  const licitacao = await prisma.bidding.findUnique({
    where: { id: resolvedParams.id },
    include: {
      process: true
    }
  });

  if (!licitacao) {
    notFound();
  }

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="Detalhes da Licitação" icon={<Gavel className="size-4 shrink-0 text-amber-600" />} action={<><Link href="/compras/licitacoes" aria-label="Voltar"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link><Link href={`/compras/licitacoes/${licitacao.id}/editar`}><Button variant="outline" size="sm"><Edit className="size-3.5" /><span className="hidden sm:inline">Editar</span></Button></Link></>} />

      <Card className="rounded-md">
        <CardHeader className="border-b p-3">
          <CardTitle className="text-sm">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Número</p>
              <p className="text-lg">{licitacao.number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="secondary">{licitacao.status}</Badge>
            </div>
          </div>
          <div className="grid gap-3 border-t pt-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Modalidade</p>
              <p>{licitacao.modality}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processo Vinculado</p>
              <p>{licitacao.process?.number}</p>
            </div>
          </div>
          <div className="grid gap-3 border-t pt-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Publicação</p>
              <p>{licitacao.publicationDate ? format(new Date(licitacao.publicationDate), "dd/MM/yyyy", { locale: ptBR }) : "Não informada"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data da Sessão</p>
              <p>{licitacao.sessionDate ? format(new Date(licitacao.sessionDate), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Não informada"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageFrame>
  );
}
