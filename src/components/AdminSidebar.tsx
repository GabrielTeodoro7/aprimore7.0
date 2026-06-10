import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, GraduationCap, ScrollText, Settings, LogOut, ShieldCheck, Code2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import logoUrl from "@/assets/aprimore-logo.png";

const items = [
  { to: "/admin", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/professores", label: "Professores", icon: Users },
  { to: "/admin/alunos", label: "Alunos", icon: GraduationCap },
  { to: "/guia-poo", label: "Guia POO (Java)", icon: Code2 },
  { to: "/admin/logs", label: "Logs", icon: ScrollText },
  { to: "/admin/usuarios", label: "Gestor Supremo", icon: ShieldCheck },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];


export function AdminSidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <Link to="/admin" className="flex flex-col items-center gap-3 px-6 py-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
          <img src={logoUrl} alt="Aprimore" className="h-full w-full object-contain" />
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin
        </div>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground shadow-md" : "text-sidebar-foreground/85 hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" /> {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => { logout(); navigate({ to: "/login" }); }}
        className="m-4 flex items-center gap-3 rounded-xl bg-sidebar-accent px-4 py-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/80"
      >
        <LogOut className="h-5 w-5" /> Sair
      </button>
    </aside>
  );
}
