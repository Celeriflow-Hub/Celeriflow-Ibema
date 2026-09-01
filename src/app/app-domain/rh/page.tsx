import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, 
  FileText, 
  Clock, 
  Banknote,
  GraduationCap,
  HeartPulse,
  Briefcase
} from "lucide-react"
import Link from "next/link"
import { PageFrame } from "@/components/app-ui/PageFrame"
import { PageHeader } from "@/components/app-ui/PageHeader"
import { getTenantContextForModule } from "@/lib/platform/tenant-context";

export default async function RHDashboard() {
  const { prisma } = await getTenantContextForModule("RH");
  const totalEmployees = await prisma.employee.count().catch(() => 0)
  const activeEmployees = await prisma.employee.count({ where: { isActive: true } }).catch(() => 0)
  const totalRoles = await prisma.role.count().catch(() => 0)
  const activeRoles = await prisma.role.count({ where: { isActive: true } }).catch(() => 0)

  const activePayrolls = await prisma.payroll.count({ where: { status: "Aberta" } }).catch(() => 0)
  const vacationRequests = await prisma.vacation.count({ where: { status: "Programada" } }).catch(() => 0)
  const totalAttendances = await prisma.attendanceRecord.count().catch(() => 0)

  return (
    <PageFrame className="space-y-2">
      <PageHeader title="RH e Folha" icon={<Users className="size-4 shrink-0 text-violet-600" />} />

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Card size="sm" className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Servidores Ativos</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              de {totalEmployees} servidores no total
            </p>
          </CardContent>
        </Card>
        
        <Card size="sm" className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Folhas Abertas</CardTitle>
            <Banknote className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePayrolls}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando fechamento
            </p>
          </CardContent>
        </Card>
        
        <Card size="sm" className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Férias Solicitadas</CardTitle>
            <HeartPulse className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vacationRequests}</div>
            <p className="text-xs text-muted-foreground">
              Programadas para aprovação
            </p>
          </CardContent>
        </Card>
        
        <Card size="sm" className="rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Cargos Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoles}</div>
            <p className="text-xs text-muted-foreground">
              de {totalRoles} cargos cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-7">
        <Card size="sm" className="rounded-md md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visão Geral</CardTitle>
            <CardDescription className="text-xs">
              Acesso rápido às rotinas do módulo de Recursos Humanos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/rh/servidores" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <Users className="mr-3 size-5 text-emerald-500" />
                <div>
                  <div className="font-semibold">Servidores</div>
                  <div className="text-xs text-muted-foreground">Gestão de pessoal</div>
                </div>
              </Link>
              <Link href="/rh/folha" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <Banknote className="mr-3 size-5 text-blue-500" />
                <div>
                  <div className="font-semibold">Folha de Pagamento</div>
                  <div className="text-xs text-muted-foreground">Cálculos e holerites</div>
                </div>
              </Link>
              <Link href="/rh/ponto" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <Clock className="mr-3 size-5 text-amber-500" />
                <div>
                  <div className="font-semibold">Controle de Ponto</div>
                  <div className="text-xs text-muted-foreground">Frequência e espelho ({totalAttendances} registros)</div>
                </div>
              </Link>
              <Link href="/rh/ferias" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <HeartPulse className="mr-3 size-5 text-rose-500" />
                <div>
                  <div className="font-semibold">Férias e Licenças</div>
                  <div className="text-xs text-muted-foreground">Afastamentos legais</div>
                </div>
              </Link>
              <Link href="/rh/cargos" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <Briefcase className="mr-3 size-5 text-indigo-500" />
                <div>
                  <div className="font-semibold">Cargos e Salários</div>
                  <div className="text-xs text-muted-foreground">Estrutura organizacional</div>
                </div>
              </Link>
              <Link href="/rh/treinamentos" className="flex items-center rounded-md border p-3 hover:bg-muted transition-colors">
                <GraduationCap className="mr-3 size-5 text-slate-500" />
                <div>
                  <div className="font-semibold">Treinamentos</div>
                  <div className="text-xs text-muted-foreground">Capacitação contínua</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="rounded-md md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Últimas Movimentações</CardTitle>
            <CardDescription className="text-xs">
              Acompanhamento de eventos recentes no RH.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="flex h-full flex-col items-center justify-center p-3 text-center text-muted-foreground">
                <FileText className="mb-2 size-7 opacity-20" />
                <p>Nenhum evento recente encontrado.</p>
                <p className="text-xs">As movimentações de pessoal e folha aparecerão aqui automaticamente.</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </PageFrame>
  )
}
