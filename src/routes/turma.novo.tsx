import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { DashboardShell } from "@/components/DashboardShell";
import { useStudents, useTurmas, type Student } from "@/lib/store";
import { useAuth, useUsers, type AuthUser } from "@/lib/auth-store";
import { enviarEmail, templates, gerarSenhaTemporaria } from "@/lib/email-mock";
import { criarUsuarioReal } from "@/lib/users.functions";

export const Route = createFileRoute("/turma/novo")({
  head: () => ({ meta: [{ title: "Novo aluno — Aprimore" }] }),
  component: NovoAlunoPage,
});

const tones: Student["tone"][] = ["blue", "green", "orange", "purple", "pink", "yellow"];
const tags: Student["tag"][] = ["Regular", "Destaque", "Acompanhar", "Adaptado"];

function NovoAlunoPage() {
  const navigate = useNavigate();
  const { add } = useStudents();
  const { primeiraId: turmaIdAtual, primeira: turmaAtual } = useTurmas();
  const { add: addUser, list: users } = useUsers();
  const { user: currentUser } = useAuth();
  const criarReal = useServerFn(criarUsuarioReal);
  const [form, setForm] = useState({
    nome: "",
    idade: 10,
    media: 7.0,
    freq: "90%",
    tag: "Regular" as Student["tag"],
    tone: "blue" as Student["tone"],
    responsavel: "",
    email: "",
    telefone: "",
    necessidade: "",
    observacoes: "",
    turma: "5º Ano A",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <DashboardShell title="Novo aluno" subtitle="Cadastre um aluno na turma">
      <Link to="/turma" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <div className="flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Campos marcados com <span className="text-destructive font-bold">*</span> são obrigatórios. O e-mail é usado pelo aluno para fazer login.
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const nome = form.nome.trim();
          const email = form.email.trim().toLowerCase();
          if (!nome) {
            toast.error("Informe o nome do aluno");
            return;
          }
          if (!email) {
            toast.error("Informe o e-mail do aluno", { description: "É necessário para criar o login." });
            return;
          }
          if (users.some((u) => u.email.toLowerCase() === email)) {
            toast.error("Já existe um usuário com esse e-mail");
            return;
          }

          if (!turmaIdAtual) {
            toast.error("Você precisa criar uma turma antes de cadastrar alunos.");
            return;
          }
          // 1) adiciona na lista visual da turma
          await add({ ...form, turmaId: turmaIdAtual });

          // 2) cria o usuário aluno (mock) vinculado ao professor logado
          const professorId =
            currentUser?.role === "professor"
              ? currentUser.id
              : currentUser?.role === "admin"
                ? currentUser.id
                : undefined;
          const senha = gerarSenhaTemporaria();
          const novo: AuthUser = {
            id: "aluno-" + Date.now(),
            nome,
            email,
            role: "aluno",
            status: "ativo",
            criadoEm: new Date().toISOString().slice(0, 10),
            professorId,
            turma: turmaAtual?.nome ?? form.turma,
            senha,
          };
          addUser(novo);
          enviarEmail(templates.boasVindas(nome, email, senha, "aluno"));

          // 3) cria a conta real no backend
          const res = await criarReal({
            data: { email, senha, nome, role: "aluno", turma: form.turma },
          });
          if (!res.ok) {
            toast.error("Conta backend não criada", { description: res.error });
          } else {
            toast.success("Aluno cadastrado!", {
              description: `${nome} pode entrar com ${email} (senha enviada por e-mail).`,
            });
          }
          navigate({ to: "/turma" });
        }}
        className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2"
      >
        <Field label="Nome completo" hint="Como o aluno será chamado nas listas" required>
          <input value={form.nome} onChange={(e) => set("nome", e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="Turma" hint="Ex: 5º Ano A">
          <input value={form.turma} onChange={(e) => set("turma", e.target.value)} className="input" />
        </Field>
        <Field label="Idade" hint="Em anos completos">
          <input type="number" min="4" max="20" value={form.idade} onChange={(e) => set("idade", +e.target.value)} className="input" />
        </Field>
        <Field label="Média inicial" hint="Nota base (0 a 10). Pode ser ajustada depois.">
          <input type="number" step="0.1" min="0" max="10" value={form.media} onChange={(e) => set("media", +e.target.value)} className="input" />
        </Field>
        <Field label="Frequência" hint="Porcentagem de presença (ex: 95%)">
          <input value={form.freq} onChange={(e) => set("freq", e.target.value)} className="input" />
        </Field>
        <Field label="Categoria" hint="Como o aluno se enquadra no acompanhamento">
          <select value={form.tag} onChange={(e) => set("tag", e.target.value as Student["tag"])} className="input">
            {tags.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Cor de destaque" hint="Aparece no avatar e nas listas">
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                key={t}
                type="button"
                aria-label={`Cor ${t}`}
                onClick={() => set("tone", t)}
                className={`h-9 w-9 rounded-full border-2 ${form.tone === t ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: `var(--stat-${t})` }}
              />
            ))}
          </div>
        </Field>
        <Field label="Responsável" hint="Nome do responsável principal">
          <input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} className="input" />
        </Field>
        <Field label="E-mail do aluno" hint="Usado para fazer login e receber comunicados" required>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" />
        </Field>
        <Field label="Telefone" hint="Com DDD, ex: (11) 90000-0000">
          <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} className="input" />
        </Field>
        <Field label="Necessidade específica" hint="Ex: TDAH, Dislexia, TEA — deixe em branco se não houver">
          <input value={form.necessidade} onChange={(e) => set("necessidade", e.target.value)} placeholder="Ex: TDAH, Dislexia, TEA..." className="input" />
        </Field>
        <Field label="Observações" hint="Anotações pedagógicas sobre o aluno (opcional)" full>
          <textarea rows={4} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} className="input resize-none" />
        </Field>

        <div className="md:col-span-2 flex justify-end gap-3">
          <Link to="/turma" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent">Cancelar</Link>
          <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Cadastrar aluno
          </button>
        </div>
      </form>

      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.75rem;padding:0.6rem 0.85rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--primary)}`}</style>
    </DashboardShell>
  );
}

function Field({ label, hint, children, required, full }: { label: string; hint?: string; children: React.ReactNode; required?: boolean; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
