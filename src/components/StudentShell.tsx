import type { ReactNode } from "react";
import { Star, Accessibility } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { StudentSidebar } from "@/components/StudentSidebar";
import { useAlunoPerfil } from "@/lib/student-store";
import { RequireRole } from "@/components/RequireRole";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { MobileTopBar } from "@/components/MobileTopBar";
import { useState } from "react";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";


interface Props {
  title?: ReactNode;
  subtitle?: ReactNode;
  showStars?: boolean;
  children: ReactNode;
}

export function StudentShell(props: Props) {
  return (
    <RequireRole roles={["aluno"]}>
      <StudentShellInner {...props} />
    </RequireRole>
  );
}

function StudentShellInner({ title, subtitle, showStars = true, children }: Props) {
  const { perfil } = useAlunoPerfil();
  const [a11yOpen, setA11yOpen] = useState(false);
  return (
    <div className="flex min-h-dvh bg-[oklch(0.985_0.01_240)]">
      <Toaster position="top-right" richColors />
      <div className="hidden md:flex"><StudentSidebar /></div>
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <MobileTopBar sidebar={<StudentSidebar />} title={typeof title === "string" ? title : "Aprimore"} />
        <ImpersonationBanner />
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="min-w-0">
            {title && <h1 className="truncate text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h1>}
            {subtitle && <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setA11yOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card shadow-sm transition hover:bg-accent sm:h-12 sm:w-12"
              title="Acessibilidade"
              aria-label="Acessibilidade"
            >
              <Accessibility className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </button>
            <AccessibilityPanel open={a11yOpen} onClose={() => setA11yOpen(false)} />

            {showStars && (
              <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-sm sm:gap-3 sm:px-5 sm:py-3">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 sm:h-7 sm:w-7" />
                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-foreground sm:text-2xl">{perfil.estrelas}</div>
                  <div className="hidden text-xs text-muted-foreground sm:block">Minhas estrelas</div>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="space-y-6 px-4 pb-10 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}


