import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Info, Search, UserPlus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { DashboardShell } from "@/components/DashboardShell";
import { useStudents, useTurmas, type Student } from "@/lib/store";
import { useAuth, useUsers, type AuthUser } from "@/lib/auth-store";
import { enviarEmail, templates, gerarSenhaTemporaria } from "@/lib/email-mock";
import { criarUsuarioReal } from "@/lib/users.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/turma/novo")({
  head: () => ({ meta: [{ title: "Novo aluno — Aprimore" }] }),
  component: NovoAlunoPage,
});

const tones: Student["tone"][] = ["blue", "green", "orange", "purple", "pink", "yellow"];
const tags: Student["tag"][] = ["Regular", "Destaque", "Acompanhar", "Adaptado"];

function NovoAlunoPage() {
  const navigate = useNavigate();
  const { add, list: alunosExistentes } = useStudents();
  const { primeiraId: turmaIdAtual, primeira: turmaAtual } = useTurmas();
  const { add: addUser, list: users } = useUsers();
  const { user: currentUser } = useAuth();
  const criarReal = useServerFn(criarUsuarioReal);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filtra usuários que são "alunos" mas não estão em nenhuma turma (ou pelo menos não na lista atual de alunos)
  const alunosDisponiveis = users.filter(u => 
    u.role === "aluno" && 
    !alunosExistentes.some(a => a.email?.toLowerCase() === u.email.toLowerCase()) &&
    (u.nome.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleVincular = async (u: AuthUser) => {
    if (!turmaIdAtual) {
      toast.error("Você precisa de uma turma ativa");
      return;
    }
    setLoading(true);
    try {
      await add({
        nome: u.nome,
        email: u.email,
        turmaId: turmaIdAtual,
        idade: 10,
        media: 7.0,
        freq: "100%",
        tag: "Regular",
        tone: "blue",
      });
      toast.success("Aluno vinculado com sucesso!");
      navigate({ to: "/turma" });
    } catch (e) {
      toast.error("Erro ao vincular aluno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Novo aluno" subtitle="Adicione ou cadastre um aluno na turma">
      <Link to="/turma" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <Tabs defaultValue="cadastro" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cadastro">Novo Cadastro</TabsTrigger>
          <TabsTrigger value="vincular">Vincular Existente</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro">
          <div className="flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-xs text-muted-foreground mb-6">
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
              
              setLoading(true);
              try {
                const senha = prompt("Defina uma senha para o aluno (mín. 6 caracteres):");
                if (!senha || senha.length < 6) {
                   toast.error("Senha inválida ou muito curta");
                   setLoading(false);
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

                // 3) cria a conta real no backend
                const res = await criarReal({
                  data: { email, senha, nome, role: "aluno", turma: form.turma },
                });
                
                if (!res.ok) {
                  toast.error("Conta backend não criada", { description: res.error });
                } else {
                  toast.success("Aluno cadastrado!", {
                    description: `${nome} pode entrar com ${email} e a senha definida.`,
                  });
                }
                navigate({ to: "/turma" });
              } catch (err) {
                toast.error("Erro ao cadastrar aluno");
              } finally {
                setLoading(false);
              }
            }}
            className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2"
          >
            <Field label="Nome completo" hint="Como o aluno será chamado nas listas" required>
              <input value={form.nome} onChange={(e) => set("nome", e.target.value)} className="input" autoFocus disabled={loading} />
            </Field>
            <Field label="Turma" hint="Selecione a turma">
              <select value={form.turma} onChange={(e) => set("turma", e.target.value)} className="input" disabled={loading}>
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
            </Field>
            <Field label="Idade" hint="Em anos completos">
              <input type="number" min="4" max="20" value={form.idade} onChange={(e) => set("idade", +e.target.value)} className="input" disabled={loading} />
            </Field>
            <Field label="Média inicial" hint="Nota base (0 a 10). Pode ser ajustada depois.">
              <input type="number" step="0.1" min="0" max="10" value={form.media} onChange={(e) => set("media", +e.target.value)} className="input" disabled={loading} />
            </Field>
            <Field label="Frequência" hint="Porcentagem de presença (ex: 95%)">
              <input value={form.freq} onChange={(e) => set("freq", e.target.value)} className="input" disabled={loading} />
            </Field>
            <Field label="Categoria" hint="Como o aluno se enquadra no acompanhamento">
              <select value={form.tag} onChange={(e) => set("tag", e.target.value as Student["tag"])} className="input" disabled={loading}>
                {tags.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Cor de destaque" hint="Aparece no avatar e nas listas">
              <div className="flex gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    disabled={loading}
                    aria-label={`Cor ${t}`}
                    onClick={() => set("tone", t)}
                    className={`h-9 w-9 rounded-full border-2 ${form.tone === t ? "border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: `var(--stat-${t})` }}
                  />
                ))}
              </div>
            </Field>
            <Field label="Responsável" hint="Nome do responsável principal">
              <input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} className="input" disabled={loading} />
            </Field>
            <Field label="E-mail do aluno (@gmail.com)" hint="O admin define o acesso inicial" required>
              <input type="email" placeholder="exemplo@gmail.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" disabled={loading} />
            </Field>
            <Field label="Telefone" hint="Com DDD, ex: (11) 90000-0000">
              <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} className="input" disabled={loading} />
            </Field>
            <Field label="Necessidade específica" hint="Ex: TDAH, Dislexia, TEA — deixe em branco se não houver">
              <input value={form.necessidade} onChange={(e) => set("necessidade", e.target.value)} placeholder="Ex: TDAH, Dislexia, TEA..." className="input" disabled={loading} />
            </Field>
            <Field label="Observações" hint="Anotações pedagógicas sobre o aluno (opcional)" full>
              <textarea rows={4} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} className="input resize-none" disabled={loading} />
            </Field>

            <div className="md:col-span-2 flex justify-end gap-3">
              <Link to="/turma" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent">Cancelar</Link>
              <button 
                type="submit" 
                disabled={loading}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Cadastrar aluno
              </button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="vincular">
          <Card className="p-6 border-border">
            <h3 className="text-lg font-bold mb-2">Vincular aluno existente</h3>
            <p className="text-sm text-muted-foreground mb-6">Busque por alunos que já possuem cadastro na plataforma para adicioná-los à sua turma.</p>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full bg-muted/30 border border-input rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-3">
              {alunosDisponiveis.length > 0 ? (
                alunosDisponiveis.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {u.nome[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{u.nome}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleVincular(u)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                      Vincular
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto opacity-20 mb-2" />
                  <p className="text-sm">{searchQuery ? "Nenhum aluno encontrado." : "Digite para buscar alunos cadastrados."}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

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