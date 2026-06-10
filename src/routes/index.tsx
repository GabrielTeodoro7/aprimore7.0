import { createFileRoute, Link } from "@tanstack/react-router";
import { AppButton } from "@/design-system/AppButton";
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/design-system/AppCard";
import { AppInput } from "@/design-system/AppInput";
import { AppBadge } from "@/design-system/AppBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessibilitySettings } from "@/components/accessibility/AccessibilitySettings";
import { NotificationCenter } from "@/components/NotificationCenter";
import { AuditTimeline } from "@/components/AuditTimeline";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  MessageSquare, 
  ShieldCheck, 
  LayoutDashboard, 
  Settings,
  Bell,
  History,
  TrendingUp,
  Award,
  FileText,
  Handshake,
  Trophy,
  Gamepad2
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmartReportsModule } from "@/components/SmartReportsModule";
import { FamilySchoolPortal } from "@/components/FamilySchoolPortal";
import { GamificationCenter } from "@/components/GamificationCenter";
import { StudentGamesCenter } from "@/components/StudentGamesCenter";






export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aprimore Educação - Dashboard Global" },
      { name: "description", content: "Sistema de Gestão Escolar e Inclusão Educacional" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Header Responsivo */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight leading-none">Aprimore</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Educação Inclusiva</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/alunos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Alunos</Link>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Turmas</a>
            <div className="h-4 w-px bg-border" />
            <button className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity bg-primary/5 px-3 py-1.5 rounded-full">
              <span className="text-lg">♿</span> Acessibilidade
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <kbd className="hidden md:flex h-8 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs text-muted-foreground font-bold">⌘</span>
              <span className="text-xs text-muted-foreground font-bold">K</span>
            </kbd>
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-accent transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <NotificationCenter />
              </PopoverContent>
            </Popover>
            <AppButton size="sm" className="shadow-lg shadow-primary/20">Entrar</AppButton>
          </div>


        </div>
      </header>

      <main className="container px-4 py-8 md:px-6 md:py-12">
        <Tabs defaultValue="dashboard" className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 bg-transparent h-auto">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dashboard</TabsTrigger>
            <TabsTrigger value="family" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Família</TabsTrigger>
            <TabsTrigger value="gamification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Conquistas</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Relatórios</TabsTrigger>
            <TabsTrigger value="accessibility" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span className="text-base">♿</span> Acessibilidade
            </TabsTrigger>
          </TabsList>



          <TabsContent value="dashboard" className="space-y-12">
            {/* Seção Hero / Boas-vindas */}
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Olá, Bem-vindo ao Aprimore</h1>
                  <p className="text-muted-foreground mt-1 text-lg">Gerencie sua escola com eficiência e foco na inclusão.</p>
                </div>
                <div className="flex items-center gap-3">
                  <AppButton variant="outline" className="flex-1 sm:flex-none">Ver Agenda</AppButton>
                  <Link to="/alunos">
                    <AppButton className="flex-1 sm:flex-none">Novo Cadastro</AppButton>
                  </Link>
                </div>

              </div>
            </section>

            {/* Grid de Atalhos Rápidos / Módulos */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AppCard className="group hover:border-primary/50 transition-all cursor-pointer">
                <AppCardHeader>
                  <Users className="h-8 w-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  <AppCardTitle>Gestão de Alunos</AppCardTitle>
                  <AppCardDescription>Cadastro, matrículas e fichas individuais.</AppCardDescription>
                </AppCardHeader>
                <AppCardContent>
                  <div className="text-2xl font-bold">1.284</div>
                  <p className="text-xs text-muted-foreground mt-1">+12 novos esta semana</p>
                </AppCardContent>
              </AppCard>

              <AppCard className="group hover:border-primary/50 transition-all cursor-pointer">
                <AppCardHeader>
                  <ClipboardCheck className="h-8 w-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                  <AppCardTitle>Diário de Classe</AppCardTitle>
                  <AppCardDescription>Lançamento de frequência e notas.</AppCardDescription>
                </AppCardHeader>
                <AppCardContent>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-xs text-muted-foreground mt-1">Presença média global</p>
                </AppCardContent>
              </AppCard>

              <AppCard className="group hover:border-primary/50 transition-all cursor-pointer">
                <AppCardHeader>
                  <ShieldCheck className="h-8 w-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                  <AppCardTitle>Inclusão (PEI)</AppCardTitle>
                  <AppCardDescription>Planos de Desenvolvimento Individualizados.</AppCardDescription>
                </AppCardHeader>
                <AppCardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground mt-1">Planos ativos e monitorados</p>
                </AppCardContent>
              </AppCard>

              <AppCard className="group hover:border-primary/50 transition-all cursor-pointer">
                <AppCardHeader>
                  <MessageSquare className="h-8 w-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                  <AppCardTitle>Comunicação</AppCardTitle>
                  <AppCardDescription>Mensagens diretas e avisos no mural.</AppCardDescription>
                </AppCardHeader>
                <AppCardContent>
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-xs text-muted-foreground mt-1">Novos avisos pendentes</p>
                </AppCardContent>
              </AppCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <AppCard className="bg-gradient-to-br from-primary/10 via-background to-background">
                  <AppCardHeader>
                    <div className="flex items-center justify-between">
                      <AppCardTitle className="text-xl flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Desempenho Escolar
                      </AppCardTitle>
                      <AppBadge variant="success">Meta Alcançada</AppBadge>
                    </div>
                    <AppCardDescription>Visão geral da evolução das médias bimestrais.</AppCardDescription>
                  </AppCardHeader>
                  <AppCardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg mx-6 mb-6">
                    <p className="text-muted-foreground text-sm italic">Gráfico de desempenho em tempo real</p>
                  </AppCardContent>
                </AppCard>

                <section className="hide-on-focus">
                  <AppCard className="bg-primary/5 border-primary/10">
                    <AppCardContent className="pt-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">Busca Rápida</h3>
                          <p className="text-sm text-muted-foreground">Localize alunos, professores ou turmas instantaneamente.</p>
                        </div>
                        <div className="relative flex-1 md:max-w-md">
                          <AppInput placeholder="Nome, CPF ou Matrícula..." className="pl-10" />
                          <LayoutDashboard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        <AppButton>Pesquisar</AppButton>
                      </div>
                    </AppCardContent>
                  </AppCard>
                </section>
              </div>

              <div className="space-y-6">
                <AuditTimeline />
                
                <AppCard>
                  <AppCardHeader>
                    <AppCardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" /> Gamificação
                    </AppCardTitle>
                  </AppCardHeader>
                  <AppCardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">1º</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">Turma 9º Ano B</p>
                        <p className="text-[10px] text-muted-foreground">Engajamento Premium</p>
                      </div>
                      <AppBadge>2.450 pts</AppBadge>
                    </div>
                  </AppCardContent>
                </AppCard>
              </div>
            </div>

          </TabsContent>

          <TabsContent value="family">
            <FamilySchoolPortal />
          </TabsContent>

          <TabsContent value="gamification">
            <GamificationCenter />
          </TabsContent>

          <TabsContent value="reports">

            <SmartReportsModule />
          </TabsContent>

          <TabsContent value="accessibility">

            <AccessibilitySettings />
          </TabsContent>
        </Tabs>
      </main>


      {/* Footer Responsivo */}
      <footer className="mt-auto border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <a href="#" className="font-medium underline underline-offset-4">Aprimore Educação</a>. © 2026.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary">Termos</a>
            <a href="#" className="hover:text-primary">Privacidade</a>
            <a href="#" className="hover:text-primary">Acessibilidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
