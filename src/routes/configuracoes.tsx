import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Eye, Moon, Globe, Shield, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { usePerfil } from "@/lib/store";

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
  const [notif, setNotif] = useState(true);
  const [contrast, setContrast] = useState(false);
  const dark = perfil.theme === "dark";
  const [form, setForm] = useState({ nome: perfil.nome, email: perfil.email, cargo: perfil.cargo, turma: perfil.turma, ano: perfil.ano });

  const items = [
    { icon: Bell, label: "Notificações por e-mail", sub: "Resumo diário no seu e-mail", val: notif, set: setNotif },
    { icon: Eye, label: "Alto contraste", sub: "Use também o botão Acessibilidade no menu lateral", val: contrast, set: setContrast },
    { icon: Moon, label: "Modo escuro", sub: "Reduz cansaço visual à noite", val: dark, set: (v: boolean) => update({ theme: v ? "dark" : "light" }) },
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
              <FormField label="Turma" hint="A turma principal que você leciona">
                <input value={form.turma} onChange={(e) => setForm({ ...form, turma: e.target.value })} className="input" />
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
            <h2 className="text-lg font-semibold text-foreground">Dados da plataforma</h2>
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
          {[
            { icon: Globe, label: "Idioma", sub: "Português (BR)" },
            { icon: Shield, label: "Privacidade", sub: "Gerenciar dados" },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => toast(c.label, { description: c.sub })}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md"
            >
              <c.icon className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.sub}</div>
              </div>
            </button>
          ))}
          <button
            onClick={() => toast.error("Sair", { description: "Encerrando sessão..." })}
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