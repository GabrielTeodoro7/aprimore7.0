/**
 * CEOShell — layout sigiloso, visual escuro distinto do admin.
 * Nenhum link para este shell aparece nos menus normais; somente quem
 * digita a URL (e tem role 'ceo') chega aqui.
 */
import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import {
  ShieldAlert,
  Activity,
  Users2,
  Brain,
  Eye,
  LogOut,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";

const nav: ReadonlyArray<{ to: string; label: string; icon: typeof ShieldAlert; exact?: boolean }> = [
  { to: "/ceo", label: "Onda Zero", icon: ShieldAlert, exact: true },
  { to: "/ceo/usuarios", label: "Usuários (global)", icon: Users2 },
  { to: "/ceo/auditoria", label: "Auditoria", icon: Activity },
  { to: "/ceo/insights-ia", label: "Insights IA", icon: Brain },
  { to: "/ceo/override", label: "Override", icon: KeyRound },
  { to: "/ceo/observar", label: "Modo Observador", icon: Eye },
];

export function CEOShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-[#070710] text-zinc-100">
      <Toaster position="top-right" richColors theme="dark" />
      <aside className="flex w-64 flex-col border-r border-zinc-800/80 bg-[#0a0a16] px-4 py-6">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-black text-white">
            Ø
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-zinc-100">
              ONDA ZERO
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-400">
              Acesso restrito
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-fuchsia-500/15 text-fuchsia-200"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => logout()}
          className="mt-4 flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
        >
          <LogOut className="h-4 w-4" /> Encerrar sessão
        </button>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-zinc-800/80 px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-zinc-400">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5 py-1.5 pl-1.5 pr-4">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-xs font-black">
              {user?.nome?.[0] ?? "C"}
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold">{user?.nome ?? "CEO"}</div>
              <div className="text-[10px] uppercase tracking-widest text-fuchsia-300">
                clearance · ceo
              </div>
            </div>
          </div>
        </header>
        <div className="space-y-6 px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
