import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth-store";

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allowed = !!user && (user.role === "ceo" || roles.includes(user.role));

  useEffect(() => {
    if (!mounted || loading) return;
    if (!user) {
      navigate({ to: "/login" });
    } else if (!allowed) {
      navigate({
        to:
          user.role === "ceo"
            ? "/ceo"
            : user.role === "admin"
              ? "/admin"
              : user.role === "aluno"
                ? "/aluno"
                : "/",
      });
    }
  }, [mounted, loading, user, allowed, navigate]);

  // Durante SSR e até a primeira hidratação, renderiza o conteúdo otimisticamente.
  // Após hidratar, se já carregou e não está autorizado, mostra fallback (o useEffect navega).
  if (mounted && !loading && (!user || !allowed)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Redirecionando…
      </div>
    );
  }
  return <>{children}</>;
}
