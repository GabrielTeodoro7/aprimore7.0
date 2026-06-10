import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuth } from "@/lib/auth-store";

export function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden" aria-label={title}>
        <header className="flex items-center justify-between gap-4 px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 rounded-full bg-card py-1.5 pl-1.5 pr-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--stat-purple)] to-[var(--stat-blue)] text-sm font-bold text-white">
              {user?.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold text-foreground">{user?.nome}</div>
              <div className="text-xs text-muted-foreground">Administrador</div>
            </div>
          </div>
        </header>
        <div className="space-y-6 px-8 pb-10">{children}</div>
      </main>
    </div>
  );
}
