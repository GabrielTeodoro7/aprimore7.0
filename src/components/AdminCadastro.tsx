import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useUsers, useAuth, type Role, type AuthUser } from "@/lib/auth-store";
import { enviarEmail, templates, gerarSenhaTemporaria } from "@/lib/email-mock";
import { criarUsuarioReal } from "@/lib/users.functions";


const profSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  escola: z.string().min(2, "Informe a escola"),
});
const alunoSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  professorId: z.string().min(1, "Selecione um professor"),
  turma: z.string().min(1, "Informe a turma"),
  diagnostico: z.object({
    tea: z.boolean().default(false),
    dcd: z.boolean().default(false),
    motor: z.boolean().default(false),
    cognitivo: z.boolean().default(false),
    visual: z.boolean().default(false),
    auditivo: z.boolean().default(false),
    outros: z.string().optional(),
  }).optional(),
});

export function NovoCadastroModal({ defaultRole = "professor", onClose }: { defaultRole?: Role; onClose: () => void }) {
  const { add, professores } = useUsers();
  const { user } = useAuth();
  const isDemo = Boolean(user?.isDemo);
  const [tab, setTab] = useState<Role>(defaultRole);
  const criarReal = useServerFn(criarUsuarioReal);


  const profForm = useForm({ resolver: zodResolver(profSchema), defaultValues: { nome: "", email: "", escola: "EMEF Aprimore" } });
  const alunoForm = useForm({ 
    resolver: zodResolver(alunoSchema), 
    defaultValues: { 
      nome: "", 
      email: "", 
      professorId: professores[0]?.id ?? "", 
      turma: "5º Ano A",
      diagnostico: {
        tea: false,
        dcd: false,
        motor: false,
        cognitivo: false,
        visual: false,
        auditivo: false,
        outros: ""
      }
    } 
  });

  async function criarProfessor(data: z.infer<typeof profSchema>) {
    const senha = prompt("Defina uma senha inicial (mín. 6 caracteres):");
    if (!senha || senha.length < 6) return toast.error("Senha inválida ou muito curta");
    
    const novo: AuthUser = {
      id: "prof-" + Date.now(),
      role: "professor",
      status: "ativo",
      criadoEm: new Date().toISOString().slice(0, 10),
      senha,
      ...data,
    };
    add(novo);
    const res = await criarReal({ data: { email: data.email, senha, nome: data.nome, role: "professor", escola: data.escola } });
    if (!res.ok) toast.error("Conta backend não criada", { description: res.error });
    else toast.success("Professor criado com a senha definida");
    onClose();
  }
  async function criarAluno(data: z.infer<typeof alunoSchema>) {
    const senha = prompt("Defina uma senha para o aluno (mín. 6 caracteres):");
    if (!senha || senha.length < 6) return toast.error("Senha inválida ou muito curta");

    const novo: AuthUser = {
      id: "aluno-" + Date.now(),
      role: "aluno",
      status: "ativo",
      criadoEm: new Date().toISOString().slice(0, 10),
      senha,
      ...data,
    };
    add(novo);
    const res = await criarReal({ data: { 
      email: data.email, 
      senha, 
      nome: data.nome, 
      role: "aluno", 
      turma: data.turma,
      diagnostico: data.diagnostico
    } });
    if (!res.ok) toast.error("Conta backend não criada", { description: res.error });
    else toast.success("Aluno criado com a senha definida");
    onClose();
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Novo cadastro" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Novo cadastro</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 hover:bg-accent"><X className="h-5 w-5" /></button>
        </div>
        {isDemo && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
            Modo demonstração: criação de contas está desativada nesta conta.
          </div>
        )}

        <div className="mb-4 flex gap-2 rounded-xl bg-muted/40 p-1">
          {(["professor", "aluno"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTab(r)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize ${tab === r ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
            >
              {r === "professor" ? "Docente" : "Discente"}
            </button>
          ))}
        </div>

        {tab === "professor" ? (
          <form onSubmit={profForm.handleSubmit(criarProfessor)} className="space-y-3">
            <Field label="Nome completo" id="p-nome" error={profForm.formState.errors.nome?.message}>
              <input id="p-nome" {...profForm.register("nome")} className="form-input" />
            </Field>
            <Field label="E-mail @gmail.com" id="p-email" error={profForm.formState.errors.email?.message}>
              <input id="p-email" type="email" placeholder="exemplo@gmail.com" {...profForm.register("email")} className="form-input" />
            </Field>
            <Field label="Escola" id="p-escola" error={profForm.formState.errors.escola?.message}>
              <input id="p-escola" {...profForm.register("escola")} className="form-input" />
            </Field>
            <p className="text-xs text-muted-foreground">O admin define o e-mail @gmail.com e a senha inicial.</p>
            <button disabled={isDemo} className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="mr-1 inline h-4 w-4" /> Cadastrar Docente
            </button>

          </form>
        ) : (
          <form onSubmit={alunoForm.handleSubmit(criarAluno)} className="space-y-3">
            <Field label="Nome do aluno" id="a-nome" error={alunoForm.formState.errors.nome?.message}>
              <input id="a-nome" {...alunoForm.register("nome")} className="form-input" />
            </Field>
            <Field label="E-mail @gmail.com" id="a-email" error={alunoForm.formState.errors.email?.message}>
              <input id="a-email" type="email" placeholder="exemplo@gmail.com" {...alunoForm.register("email")} className="form-input" />
            </Field>
            <Field label="Professor responsável" id="a-prof" error={alunoForm.formState.errors.professorId?.message}>
              <select id="a-prof" {...alunoForm.register("professorId")} className="form-input">
                {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </Field>
            <Field label="Turma" id="a-turma" error={alunoForm.formState.errors.turma?.message}>
              <select id="a-turma" {...alunoForm.register("turma")} className="form-input">
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

            <div className="space-y-2 rounded-xl border border-border p-3">
              <label className="text-xs font-bold text-foreground">Diagnóstico / Necessidades Assistivas</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "tea", label: "TEA" },
                  { id: "dcd", label: "DCD / TDC" },
                  { id: "motor", label: "Motor" },
                  { id: "cognitivo", label: "Cognitivo" },
                  { id: "visual", label: "Visual" },
                  { id: "auditivo", label: "Auditivo" },
                ].map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-primary">
                    <input type="checkbox" {...alunoForm.register(`diagnostico.${d.id}` as any)} className="rounded border-input text-primary focus:ring-primary" />
                    {d.label}
                  </label>
                ))}
              </div>
              <input 
                placeholder="Outras observações..." 
                {...alunoForm.register("diagnostico.outros")} 
                className="form-input text-xs" 
              />
            </div>
            <button disabled={isDemo} className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="mr-1 inline h-4 w-4" /> Cadastrar Discente
            </button>

          </form>
        )}
      </div>
      <style>{`.form-input{width:100%;border:1px solid var(--input);background:var(--background);border-radius:.75rem;padding:.5rem .75rem;font-size:.875rem;outline:none}.form-input:focus{border-color:var(--primary)}`}</style>
    </div>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-semibold text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}

export function UserActionsMenu({ user, onChange }: { user: AuthUser; onChange: () => void }) {
  const { update } = useUsers();
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => { update(user.id, { status: user.status === "ativo" ? "inativo" : "ativo" }); onChange(); toast.success(user.status === "ativo" ? "Desativado" : "Reativado"); }}
        className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium hover:bg-accent/70"
      >
        {user.status === "ativo" ? "Desativar" : "Ativar"}
      </button>
      <button
        onClick={() => {
          const senha = gerarSenhaTemporaria();
          update(user.id, { senha });
          enviarEmail(templates.recuperarSenha(user.nome, user.email, senha));
        }}
        className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium hover:bg-accent/70"
      >
        Redefinir senha
      </button>
      <button
        onClick={() => enviarEmail(templates.boasVindas(user.nome, user.email, user.senha, user.role))}
        className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium hover:bg-accent/70"
      >
        Reenviar boas-vindas
      </button>
      <button
        onClick={() => {
          const nome = prompt("Novo nome:", user.nome);
          if (nome && nome.trim()) { update(user.id, { nome: nome.trim() }); onChange(); toast.success("Nome atualizado"); }
        }}
        className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium hover:bg-accent/70"
      >
        Editar nome
      </button>
    </div>
  );
}
