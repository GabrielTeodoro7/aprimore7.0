import { useNavigate } from "@tanstack/react-router";
import { Eye, LogOut } from "lucide-react";
import { useAuth, homeForRole } from "@/lib/auth-store";

export function ImpersonationBanner() {
  const { isImpersonating, user, realUser, stopImpersonate } = useAuth();
  const navigate = useNavigate();
  if (!isImpersonating || !user || !realUser) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-100 px-6 py-2.5 text-amber-900"
    >
      <div className="flex items-center gap-2 text-sm">
        <Eye className="h-4 w-4" aria-hidden />
        <span>
          <strong>Modo sandbox:</strong> você ({realUser.nome}) está navegando como{" "}
          <strong>{user.nome}</strong>.
        </span>
      </div>
      <button
        onClick={() => {
          stopImpersonate();
          navigate({ to: homeForRole(realUser.role) });
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-amber-800"
      >
        <LogOut className="h-3.5 w-3.5" /> Sair do modo sandbox
      </button>
    </div>
  );
}
