import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth, homeForRole, type Role } from "@/lib/auth-store";
import { Toaster } from "@/components/ui/sonner";
import logoUrl from "@/assets/aprimore-logo.png";
import { PasswordStrengthMeter, avaliarSenha } from "@/components/PasswordStrengthMeter";
import { verificarBloqueio, registrarTentativaLogin } from "@/lib/seguranca.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Aprimore Educação" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  senha: z.string().min(3, "Informe a senha"),
});
type FormData = z.infer<typeof schema>;

// Detecção rudimentar de dispositivo+navegador para RN.61 (lado cliente).
function clientFingerprint() {
  if (typeof navigator === "undefined") return { user_agent: "", ip: "" };
  return { user_agent: navigator.userAgent.slice(0, 480), ip: "" };
}

function LoginPage() {
  const { login, loginGoogle, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nome, setNome] = useState("");
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "" },
  });
  const emailValue = watch("email");

  async function onSubmit(data: FormData) {
    setErro(null);
    setLoading(true);
    try {
      // RN.02 — Antes de tudo, verificar lock de conta.
      const lock = await verificarBloqueio({ data: { email: data.email.trim().toLowerCase() } });
      if (lock.bloqueado) {
        throw new Error(
          `Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em ${lock.minutos_restantes} minuto(s).`,
        );
      }

      if (mode === "signup") {
        if (nome.trim().length < 2) throw new Error("Informe seu nome");
        // RN.01 — bloquear cadastro com senha que não atenda à política.
        const a = avaliarSenha(data.senha);
        if (!a.valida) {
          throw new Error("A senha não atende aos requisitos mínimos de segurança.");
        }
        const u = await signup({ nome: nome.trim(), email: data.email, senha: data.senha });
        toast.success(`Conta criada, ${u.nome}!`);
        navigate({ to: homeForRole(u.role) });
      } else {
        try {
          const u = await login(data.email, data.senha);
          // Sucesso — registra tentativa (RN.02 / RN.61) sem bloquear o fluxo.
          void registrarTentativaLogin({
            data: { email: data.email.trim().toLowerCase(), sucesso: true, ...clientFingerprint() },
          }).catch(() => undefined);
          toast.success(`Bem-vindo(a), ${u.nome}!`);
          navigate({ to: homeForRole(u.role) });
        } catch (e) {
          // Falha — registra tentativa para alimentar bloqueio progressivo.
          void registrarTentativaLogin({
            data: {
              email: data.email.trim().toLowerCase(),
              sucesso: false,
              motivo: "senha_incorreta",
              ...clientFingerprint(),
            },
          }).catch(() => undefined);
          throw e;
        }
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  async function demo(role: Role) {
    setLoading(true);
    try {
      const demoAccounts: Record<Role, { email: string; senha: string }> = {
        ceo: { email: "aprimoreeducation@gmail.com", senha: "Onda#CEO-2826!Aprimore" },
        admin: { email: "admin@escola.com", senha: "admin123" },
        professor: { email: "ana@escola.com", senha: "ana123" },
        aluno: { email: "joao@escola.com", senha: "joao123" },
      };
      const d = demoAccounts[role];
      const u = await login(d.email, d.senha);
      toast.success(`Bem-vindo(a), ${u.nome}!`);
      navigate({ to: homeForRole(u.role) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  async function entrarGoogle() {
    setLoading(true);
    try {
      await loginGoogle();
      // o broker redireciona; em caso de retorno imediato:
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no login com Google");
    } finally {
      setLoading(false);
    }
  }

  async function esqueciSenha() {
    const email = (emailValue || "").trim();
    if (!email) {
      toast.error("Digite seu e-mail primeiro");
      return;
    }
    try {
      await resetPassword(email);
      toast.success("Enviamos um link de recuperação", { description: `Verifique ${email}` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar");
    }
  }

  // Sugestão de domínio institucional
  const suggestion =
    emailValue && !emailValue.includes("@") && emailValue.length > 1
      ? `${emailValue}@escola.com`
      : null;

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-b from-[oklch(0.96_0.04_240)] via-[oklch(0.94_0.05_230)] to-[oklch(0.92_0.06_225)] p-4">
      <Toaster position="top-right" richColors />

      {/* Doodles decorativos */}
      <Doodles />

      <div className="relative z-10 w-full max-w-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
        <div className="rounded-3xl bg-white p-8 shadow-[0_30px_80px_-30px_oklch(0.5_0.15_240/0.45)] ring-1 ring-white/60">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <div className="rounded-2xl bg-white p-3 motion-safe:animate-[float_4s_ease-in-out_infinite]">
              <img src={logoUrl} alt="Aprimore Educação" className="h-20 w-20 object-contain" />
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">
              {mode === "signup" ? "Criar nova conta" : "Bem-vindo(a) de volta"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup" ? "Cadastre-se para começar." : "Acesse sua conta para continuar."}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label htmlFor="nome" className="sr-only">Nome completo</label>
                <div className="flex items-center gap-3 rounded-2xl border border-input bg-[oklch(0.98_0.005_240)] px-4 py-3 transition focus-within:border-primary focus-within:bg-white">
                  <Sparkles className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                  <input
                    id="nome"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>
            )}
            {/* E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="sr-only">E-mail institucional</label>
              <div className={`flex items-center gap-3 rounded-2xl border bg-[oklch(0.98_0.005_240)] px-4 py-3 transition focus-within:border-primary focus-within:bg-white ${errors.email ? "border-destructive" : "border-input"}`}>
                <Mail className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="E-mail institucional"
                  {...register("email")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-err" : suggestion ? "email-hint" : undefined}
                />
              </div>
              {suggestion && (
                <button
                  type="button"
                  id="email-hint"
                  onClick={() => setValue("email", suggestion, { shouldValidate: true })}
                  className="ml-2 text-xs text-primary hover:underline"
                >
                  Usar <strong>{suggestion}</strong>?
                </button>
              )}
              {errors.email && <p id="email-err" className="ml-2 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="senha" className="sr-only">Senha</label>
              <div className={`flex items-center gap-3 rounded-2xl border bg-[oklch(0.98_0.005_240)] px-4 py-3 transition focus-within:border-primary focus-within:bg-white ${errors.senha ? "border-destructive" : "border-input"}`}>
                <Lock className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  id="senha"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Senha"
                  {...register("senha")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-invalid={!!errors.senha}
                  aria-describedby={errors.senha ? "senha-err" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.senha && <p id="senha-err" className="ml-2 text-xs text-destructive">{errors.senha.message}</p>}
              {mode === "signup" && (
                <div className="mx-2">
                  <PasswordStrengthMeter senha={watch("senha") ?? ""} />
                </div>
              )}
            </div>

            {/* Lembrar-me */}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Lembrar-me neste dispositivo
            </label>

            {erro && (
              <div role="alert" aria-live="assertive" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {erro}
              </div>
            )}

            {/* Entrar / Cadastrar */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(0.65_0.18_145)] py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:translate-y-px disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" /> {mode === "signup" ? "Criar conta" : "Entrar"}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setMode((m) => (m === "login" ? "signup" : "login")); setErro(null); }}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "signup" ? "Já tenho conta — entrar" : "Criar nova conta"}
              </button>
              <button
                type="button"
                onClick={esqueciSenha}
                className="font-semibold text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>

          {/* Google */}
          <button
            type="button"
            onClick={entrarGoogle}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-input bg-white py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2c-.3 1.5-1.1 2.7-2.4 3.5v2.9h3.9c2.3-2.1 3.6-5.2 3.6-8.6z"/>
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.8-2.9l-3.9-2.9c-1.1.7-2.5 1.2-3.9 1.2-3 0-5.6-2-6.5-4.7H1.5v3C3.4 21.3 7.4 24 12 24z"/>
              <path fill="#FBBC05" d="M5.5 14.7c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7.3H1.5C.6 9.1 0 11 0 12.5s.6 3.4 1.5 5.2l4-3z"/>
              <path fill="#EA4335" d="M12 4.7c1.7 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.5 6.7l4 3c.9-2.7 3.5-4.7 6.5-4.7z"/>
            </svg>
            Entrar com Google
          </button>

          {/* Separador */}
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou experimente (demo)
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Demo */}
          <div className="grid grid-cols-2 gap-2">
            {(["admin", "professor", "aluno"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => demo(r)}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white px-2 py-2.5 text-[11px] font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                <span className="capitalize">{r}</span>
              </button>
            ))}
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            Acesso institucional — contas são criadas pelo administrador da escola.
          </p>
        </div>
      </div>
    </div>
  );
}

/* Soft floating doodles (cloud, star, paper plane, heart, pencil) — pure SVG, respeitando reduced motion */
function Doodles() {
  const base = "absolute pointer-events-none motion-safe:animate-[float_6s_ease-in-out_infinite] text-[oklch(0.7_0.1_240)]";
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <svg className={`${base} left-[6%] top-[14%] h-16 w-16`} viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 30 Q4 30 4 22 Q4 14 14 14 Q14 6 24 6 Q34 6 36 14 Q48 14 50 22 Q50 30 38 30 Z" />
      </svg>
      <svg className={`${base} left-[12%] top-[55%] h-14 w-14`} viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "1s" }}>
        <polygon points="25,5 30,20 45,20 33,29 38,44 25,35 12,44 17,29 5,20 20,20" />
      </svg>
      <svg className={`${base} left-[8%] top-[78%] h-14 w-14 text-[oklch(0.75_0.1_220)]`} viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "2s" }}>
        <path d="M2 38 L58 4 L40 36 L30 24 L2 38 Z" />
        <path d="M30 24 L58 4" />
      </svg>
      <svg className={`${base} right-[10%] top-[18%] h-16 w-16 text-[oklch(0.7_0.08_240)]`} viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "1.5s" }}>
        <path d="M8 18 L52 10 L48 50 L12 54 Z" />
        <path d="M52 10 L56 6" />
      </svg>
      <svg className={`${base} right-[8%] top-[58%] h-14 w-14 text-[oklch(0.75_0.1_15)]`} viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "0.5s" }}>
        <path d="M25 42 C 5 28 5 10 18 10 C 22 10 25 12 25 16 C 25 12 28 10 32 10 C 45 10 45 28 25 42 Z" />
      </svg>
      <svg className={`${base} right-[14%] bottom-[8%] h-20 w-20`} viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "2.5s" }}>
        <circle cx="30" cy="30" r="22" strokeDasharray="3 5" />
        <path d="M22 30 Q30 20 38 30 Q30 40 22 30 Z" />
      </svg>
    </div>
  );
}
