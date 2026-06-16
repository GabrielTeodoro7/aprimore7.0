import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth-store";

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // CEO é super-admin: tem acesso a tudo
  const allowed = !!user && (user.role === "ceo" || roles.includes(user.role));

  useEffect(() => {
    if (loading) return;
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
  }, [loading, user, allowed, navigate]);

  if (loading || !user || !allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }
  return <>{children}</>;
}
