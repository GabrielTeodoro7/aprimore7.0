import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  Users,
  Calendar,
  BarChart3,
  HeartHandshake,
  FileText,
  MessageSquare,
  Settings,
  Accessibility,
  MessageCircle,
  CalendarDays,
  Sparkles,
  HelpCircle,
  Smile,
} from "lucide-react";
import logoUrl from "@/assets/aprimore-logo.png";
import { useState } from "react";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  badge?: string;
};

const items: NavItem[] = [
  { to: "/turma", label: "Visão Geral", icon: Home },
  { to: "/turma", label: "Minha Turma", icon: Users },
  { to: "/comunicacao", label: "Comunicação", icon: MessageCircle },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/frequencia", label: "Frequência", icon: Calendar },
  { to: "/avaliacoes", label: "Avaliações", icon: BarChart3 },
  { to: "/inclusao", label: "Inclusão", icon: Sparkles, badge: "Adaptados" },
  { to: "/atividades", label: "Atividades", icon: HeartHandshake },
  { to: "/professor/ia", label: "IA do Professor", icon: Sparkles, badge: "Novo" },
  { to: "/acessibilidade-ia", label: "Acessibilidade IA", icon: Accessibility },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/mensagens", label: "Mensagens", icon: MessageSquare },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/ajuda", label: "Ajuda", icon: HelpCircle },
  { to: "/aluno", label: "Modo Aluno", icon: Smile },
];

export function DashboardSidebar() {
  const { pathname } = useLocation();
  const [a11yOpen, setA11yOpen] = useState(false);
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <Link to="/" className="flex flex-col items-center gap-3 px-6 py-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
          <img src={logoUrl} alt="Aprimore Educação" className="h-full w-full object-contain" />
        </div>
        <div className="text-center leading-tight">
          <div className="text-base font-extrabold tracking-wide">APRIMORE</div>
          <div className="text-[10px] tracking-[0.25em] text-sidebar-foreground/70">EDUCAÇÃO</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon, badge }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          const className = `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
            active
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-sidebar-foreground/85 hover:bg-sidebar-accent"
          }`;
          const inner = (
            <>
              <Icon className="h-5 w-5 shrink-0" />
              <div className="flex flex-col">
                <span>{label}</span>
                {badge && (
                  <span className="mt-0.5 inline-flex w-fit rounded-md bg-[var(--stat-purple)]/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {badge}
                  </span>
                )}
              </div>
            </>
          );
          return (
            <Link key={to} to={to} className={className}>
              {inner}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setA11yOpen(true)}
        className="m-4 flex items-center gap-3 rounded-xl bg-sidebar-accent px-4 py-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/80"
      >
        <Accessibility className="h-5 w-5" />
        Acessibilidade
      </button>
      <AccessibilityPanel open={a11yOpen} onClose={() => setA11yOpen(false)} />
    </aside>
  );
}
