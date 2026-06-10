import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Eye, Moon, Globe, Shield, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { usePerfil } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Aprimore" }] }),
  component: ConfigPage,
});

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-border"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function ConfigPage() {
  const { perfil, update } = usePerfil();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notif, setNotif] = useState(true);
  const [contrast, setContrast] = useState(false);
  const dark = perfil.theme === "dark";
  const [form, setForm] = useState({ nome: perfil.nome, email: perfil.email, cargo: perfil.cargo, turma: perfil.turma, ano: perfil.ano });

  const items = [
    { icon: Bell, label: "Notificações por e-mail", sub: "Resumo diário no seu e-mail", val: notif, set: setNotif },
    { icon: Eye, label: "Alto contraste", sub: "Use também o botão Acessibilidade no menu lateral", val: contrast, set: setContrast },
    { icon: Moon, label: "Modo escuro", sub: "Reduz cansaço visual à noite", val: dark, set: (v: boolean) => update({ theme: v ? "dark" : "light" }) },
  ];

  const supportItems = [
    { icon: Globe, label: "Falar com suporte", sub: "E-mail: aprimoreeducation@gmail.com", action: () => window.open('mailto:aprimoreeducation@gmail.com') },
    { icon: Shield, label: "Privacidade", sub: "Gerenciar seus dados (LGPD)", action: () => navigate({ to: "/privacidade" }) },
  ];

  return (
    <DashboardShell title="Configurações" subtitle="Personalize sua experiência — tudo é salvo automaticamente">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Preferências</h2>
            <ul className="divide-y divide-border">
              {items.map((i) => (
                <li key={i.label} className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <i.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{i.label}</div>
                    <div className="text-xs text-muted-foreground">{i.sub}</div>
                  </div>
                  <Toggle on={i.val} label={i.label} onChange={(v) => { i.set(v); toast(i.label, { description: v ? "Ativado" : "Desativado" }); }} />
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Conta</h2>
            <p className="mb-4 text-xs text-muted-foreground">Estes dados aparecem no topo da plataforma.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.nome.trim() || !form.email.trim()) { toast.error("Nome e e-mail são obrigatórios"); return; }
                update(form);
                toast.success("Perfil atualizado!");
              }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <FormField label="Nome completo" hint="Como aparece no painel" required>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input" />
              </FormField>
              <FormField label="E-mail" hint="Usado para receber notificações" required>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
              </FormField>
              <FormField label="Cargo" hint="Ex: Professora, Coordenadora">
                <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="input" />
              </FormField>
              <FormField label="Turma" hint="Sua turma principal">
                <select value={form.turma} onChange={(e) => setForm({ ...form, turma: e.target.value })} className="input">
                  <option value="1º Ano">1º Ano</option>
                  <option value="2º Ano">2º Ano</option>
                  <option value="3º Ano">3º Ano</option>
                  <option value="4º Ano">4º Ano</option>
                  <option value="5º Ano">5º Ano</option>
                  <option value="6º Ano">6º Ano</option>
                  <option value="7º Ano">7º Ano</option>
                  <option value="8º Ano">8º Ano</option>
                  <option value="9º Ano">9º Ano</option>
                  <option value="1º Médio">1º Médio</option>
                  <option value="2º Médio">2º Médio</option>
                  <option value="3º Médio">3º Médio</option>
                </select>
              </FormField>
              <FormField label="Ano letivo" hint="Aparece no cabeçalho">
                <input value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} className="input" />
              </FormField>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Salvar alterações
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Ambiente de Desenvolvimento</h2>
            <p className="mb-4 text-xs text-muted-foreground italic">Configurações para exportação GitHub/VSCode.</p>
            <div className="bg-zinc-100 p-3 rounded-xl mb-4 text-[10px] font-mono border border-zinc-200">
               STABLE_IA_FALLBACK="llama-3.3-70b-groq"
            </div>
            <h2 className="text-lg font-semibold text-foreground mt-6">Dados da plataforma</h2>
            <p className="mb-4 text-xs text-muted-foreground">Todos os dados ficam salvos apenas neste navegador.</p>
            <button
              onClick={() => {
                if (confirm("Limpar TODOS os dados (alunos, atividades, mensagens)? Isso não pode ser desfeito.")) {
                  ["aprimore.students","aprimore.activities","aprimore.frequencia","aprimore.avaliacoes","aprimore.conversas","aprimore.notifs","aprimore.perfil"].forEach((k) => localStorage.removeItem(k));
                  toast.success("Dados limpos");
                  setTimeout(() => location.reload(), 600);
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="h-4 w-4" /> Resetar dados do app
            </button>
          </section>
        </div>

        <aside className="space-y-3">
          {supportItems.map((c) => (
            <button
              key={c.label}
              onClick={c.action}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md transition group"
            >
              <c.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{c.label}</div>
                <div className="text-xs text-muted-foreground truncate">{c.sub}</div>
              </div>
            </button>
          ))}
          <button
            onClick={async () => {
              const tid = toast.loading("Encerrando sessão...");
              try {
                await logout();
                navigate({ to: "/login" });
                toast.dismiss(tid);
              } catch (e) {
                toast.error("Erro ao sair", { id: tid });
              }
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-destructive/30 bg-card p-4 text-left text-destructive shadow-sm hover:bg-destructive/5"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-semibold">Sair da conta</span>
          </button>
        </aside>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.75rem;padding:0.6rem 0.85rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--primary)}`}</style>
    </DashboardShell>
  );
}

function FormField({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}