import { createFileRoute } from "@tanstack/react-router";
import { AppButton } from "@/design-system/AppButton";
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/design-system/AppCard";
import { AppInput } from "@/design-system/AppInput";
import { GraduationCap, Users, Calendar, ClipboardCheck, MessageSquare, ShieldCheck, LayoutDashboard } from "lucide-react";

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
            <span className="text-xl font-bold tracking-tight">Aprimore</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Alunos</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Turmas</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Relatórios</a>
          </nav>
          <div className="flex items-center gap-2">
            <AppButton variant="outline" size="sm" className="hidden sm:flex">Suporte</AppButton>
            <AppButton size="sm">Entrar</AppButton>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 md:px-6 md:py-12">
        {/* Seção Hero / Boas-vindas */}
        <section className="mb-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Olá, Bem-vindo ao Aprimore</h1>
              <p className="text-muted-foreground mt-1 text-lg">Gerencie sua escola com eficiência e foco na inclusão.</p>
            </div>
            <div className="flex items-center gap-3">
              <AppButton variant="outline" className="flex-1 sm:flex-none">Ver Agenda</AppButton>
              <AppButton className="flex-1 sm:flex-none">Novo Cadastro</AppButton>
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

        {/* Seção de Busca Rápida (UX) */}
        <section className="mt-12">
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
