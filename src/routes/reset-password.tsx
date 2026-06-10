import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir senha — Aprimore" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // Supabase envia link com #access_token=...&type=recovery — o cliente
    // detecta automaticamente e dispara o evento PASSWORD_RECOVERY.
    const { data } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // fallback: se já houver sessão (já clicou no link), libera
    supabase.auth.getSession().then(({ data: s }: { data: { session: unknown } }) => {
      if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) return toast.error("A senha precisa ter pelo menos 6 caracteres");
    if (senha !== senha2) return toast.error("As senhas não coincidem");
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada! Faça login novamente.");
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-[oklch(0.96_0.04_240)] to-[oklch(0.92_0.06_225)] p-4">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-white/60">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Redefinir senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        {!ready ? (
          <p className="rounded-xl bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
            Validando o link de recuperação…
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Campo label="Nova senha" value={senha} onChange={setSenha} />
            <Campo label="Confirmar senha" value={senha2} onChange={setSenha2} />
            <button
              type="submit"
              disabled={salvando}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition hover:brightness-110 disabled:opacity-60"
            >
              {salvando ? "Salvando…" : "Atualizar senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-foreground">{label}</label>
      <div className="flex items-center gap-3 rounded-2xl border border-input bg-[oklch(0.98_0.005_240)] px-4 py-3 focus-within:border-primary focus-within:bg-white">
        <Lock className="h-5 w-5 text-muted-foreground" aria-hidden />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
    </div>
  );
}
