import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { StudentSidebar } from "@/components/StudentSidebar";
import { useAlunoPerfil } from "@/lib/student-store";
import { RequireRole } from "@/components/RequireRole";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

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
  return (
    <div className="flex min-h-screen bg-[oklch(0.985_0.01_240)]">
      <Toaster position="top-right" richColors />
      <StudentSidebar />
      <main className="flex-1 overflow-x-hidden">
        <ImpersonationBanner />
        <header className="flex items-center justify-between gap-4 px-8 py-6">
          <div>
            {title && <h1 className="text-3xl font-extrabold text-foreground">{title}</h1>}
            {subtitle && <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>}
          </div>
          {showStars && (
            <div className="flex items-center gap-3 rounded-2xl bg-card px-5 py-3 shadow-sm">
              <Star className="h-7 w-7 fill-yellow-400 text-yellow-400" />
              <div className="leading-tight">
                <div className="text-2xl font-extrabold text-foreground">{perfil.estrelas}</div>
                <div className="text-xs text-muted-foreground">Minhas estrelas</div>
              </div>
            </div>
          )}
        </header>
        <div className="space-y-6 px-8 pb-10">{children}</div>
      </main>
    </div>
  );
}

