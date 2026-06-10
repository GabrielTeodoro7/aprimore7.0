import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Link } from "@tanstack/react-router";
import { useNotifs, usePerfil } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { RequireRole } from "@/components/RequireRole";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function DashboardShell({ title, subtitle, children }: Props) {
  return (
    <RequireRole roles={["professor"]}>
      <DashboardShellInner title={title} subtitle={subtitle}>{children}</DashboardShellInner>
    </RequireRole>
  );
}

function DashboardShellInner({ title, subtitle, children }: Props) {
  const { perfil } = usePerfil();
  const { user } = useAuth();
  const { list, unread, markAll, markOne } = useNotifs();
  const [open, setOpen] = useState(false);

  const nome = user?.nome ?? perfil.nome;
  const cargo = user?.role === "professor" ? "Professor(a)" : perfil.cargo;

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", perfil.theme === "dark");
  }, [perfil.theme]);

  return (
    <div className="flex min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden" aria-label={title}>
        <ImpersonationBanner />
        <header className="flex items-center justify-between gap-4 px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="relative rounded-full bg-card p-3 shadow-sm transition hover:shadow-md"
                aria-label={`Notificações${unread ? `, ${unread} não lidas` : ""}`}
                aria-expanded={open}
              >
                <Bell className="h-5 w-5 text-foreground" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </button>
              {open && (
                <>
                  <button aria-label="Fechar" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 top-14 z-40 w-80 rounded-2xl border border-border bg-card shadow-xl">
                    <div className="flex items-center justify-between border-b border-border p-4">
                      <span className="text-sm font-semibold text-foreground">Notificações</span>
                      <button onClick={() => { markAll(); toast("Marcadas como lidas"); }} className="text-xs font-semibold text-primary hover:underline">
                        Marcar todas
                      </button>
                    </div>
                    <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                      {list.map((n) => (
                        <li key={n.id}>
                          <button
                            onClick={() => { markOne(n.id); toast(n.title, { description: n.sub }); }}
                            className={`flex w-full items-start gap-3 p-3 text-left hover:bg-accent ${n.read ? "opacity-60" : ""}`}
                          >
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: `var(--stat-${n.tone})` }} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-foreground">{n.title}</div>
                              <div className="truncate text-xs text-muted-foreground">{n.sub}</div>
                            </div>
                            <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
            <Link
              to="/configuracoes"
              className="flex items-center gap-3 rounded-full bg-card py-1.5 pl-1.5 pr-4 shadow-sm transition hover:shadow-md"
              aria-label="Abrir perfil e configurações"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--stat-purple)] to-[var(--stat-blue)] text-sm font-bold text-white">
                {nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold text-foreground">{nome}</div>
                <div className="text-xs text-muted-foreground">{cargo}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </header>
        <div className="space-y-6 px-8 pb-10">{children}</div>
      </main>
    </div>
  );
}
