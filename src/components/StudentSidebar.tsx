import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Calendar, MessageCircle, Puzzle, Star, Heart, Sparkles, MessagesSquare, LogOut, Accessibility, BookOpen, Gamepad2, User, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { useState } from "react";
import logoUrl from "@/assets/aprimore-logo.png";

const items = [
  { to: "/aluno", label: "Início", icon: Home, exact: true },
  { to: "/aluno/tutor", label: "Tutor IA", icon: MessagesSquare },
  { to: "/aluno/ajudante-maximo", label: "Ajudante Máximo", icon: Sparkles },
  { to: "/aluno/ia", label: "Central de IA", icon: Sparkles },
  { to: "/aluno/rotina", label: "Minha Rotina", icon: Calendar },
  { to: "/aluno/comunicacao", label: "Comunicação", icon: MessageCircle },
  { to: "/aluno/atividades", label: "Atividades", icon: Puzzle },
  { to: "/aluno/conquistas", label: "Minhas Conquistas", icon: Star },
  { to: "/aluno/biblioteca", label: "Áudio Biblioteca", icon: BookOpen },
  { to: "/aluno/jogos", label: "Jogos", icon: Gamepad2 },
  { to: "/aluno/avatar", label: "Meu Avatar", icon: User },
  { to: "/aluno/loja", label: "Loja de Prêmios", icon: Star },
  { to: "/aluno/sentimentos", label: "Como estou me sentindo?", icon: Heart },
];

export function StudentSidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [a11yOpen, setA11yOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <Link to="/aluno" className="flex flex-col items-center gap-2 px-6 py-6" id="student-top">
        <img src={logoUrl} alt="Aprimore Educação" className="h-20 w-20 object-contain" />
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="leading-tight">{label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => setA11yOpen(true)}
        className="mx-4 mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
      >
        <Accessibility className="h-5 w-5" /> Acessibilidade
      </button>
      <AccessibilityPanel open={a11yOpen} onClose={() => setA11yOpen(false)} />
      <a
        href="mailto:aprimoreeducation@gmail.com"
        className="mx-4 mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
      >
        <Mail className="h-5 w-5" /> Falar com Suporte
      </a>
      <button
        disabled={loggingOut}
        onClick={async () => {
          setLoggingOut(true);
          try {
            await logout();
            navigate({ to: "/login" });
          } finally {
            setLoggingOut(false);
          }
        }}
        className="mx-4 mb-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-accent disabled:opacity-50"
      >
        {loggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
        Sair
      </button>
    </aside>
  );
}
