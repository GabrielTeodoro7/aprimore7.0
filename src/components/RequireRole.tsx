import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth-store";

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // aguarda hydration do localStorage do useAuth
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  // CEO é super-admin: tem acesso a tudo
  const allowed = !!user && (user.role === "ceo" || roles.includes(user.role));

  useEffect(() => {
    if (!ready) return;
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
  }, [ready, user, allowed, navigate]);

  if (!ready || !user || !allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }
  return <>{children}</>;
}
