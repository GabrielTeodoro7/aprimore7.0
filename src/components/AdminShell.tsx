import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuth } from "@/lib/auth-store";
import { MobileTopBar } from "@/components/MobileTopBar";

export function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="flex min-h-dvh bg-background">
      <Toaster position="top-right" richColors />
      <div className="hidden md:flex"><AdminSidebar /></div>
      <main className="min-w-0 flex-1 overflow-x-hidden" aria-label={title}>
        <MobileTopBar sidebar={<AdminSidebar />} title={title} />
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3 shadow-sm sm:gap-3 sm:pr-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--stat-purple)] to-[var(--stat-blue)] text-sm font-bold text-white sm:h-10 sm:w-10">
              {user?.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="hidden min-w-0 text-left leading-tight sm:block">
              <div className="truncate text-sm font-semibold text-foreground">{user?.nome}</div>
              <div className="truncate text-xs text-muted-foreground">Administrador</div>
            </div>
          </div>
        </header>
        <div className="space-y-6 px-4 pb-10 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
