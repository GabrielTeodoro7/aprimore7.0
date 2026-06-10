import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Beaker } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers, useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import { NovoCadastroModal, UserActionsMenu } from "@/components/AdminCadastro";

export const Route = createFileRoute("/admin/alunos")({
  head: () => ({ meta: [{ title: "Admin — Alunos" }] }),
  component: () => (<RequireRole roles={["admin"]}><Page /></RequireRole>),
});


function Page() {
  const { alunos, professores, byId } = useUsers();
  const { impersonate } = useAuth();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [profId, setProfId] = useState("");
  const [modal, setModal] = useState(false);
  const [, force] = useState(0);

  const visible = alunos.filter((a) => {
    if (profId && a.professorId !== profId) return false;
    return `${a.nome} ${a.email} ${a.turma ?? ""}`.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <AdminShell title="Alunos" subtitle={`${alunos.length} cadastrados`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..." aria-label="Buscar alunos"
              className="w-64 rounded-xl border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <select value={profId} onChange={(e) => setProfId(e.target.value)} aria-label="Filtrar por professor"
            className="rounded-xl border border-input bg-card px-3 py-2 text-sm">
            <option value="">Todos os professores</option>
            {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo cadastro
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Professor</th>
              <th className="px-4 py-3">Turma</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-semibold text-foreground">{a.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.professorId ? byId(a.professorId)?.nome ?? "—" : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.turma}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.status === "ativo" ? "bg-emerald-500/15 text-emerald-700" : "bg-zinc-500/15 text-zinc-700"}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        impersonate(a.id);
                        toast.success(`Entrando como ${a.nome}`, { description: "Modo sandbox ativo" });
                        navigate({ to: "/aluno" });
                      }}
                      title="Entrar no modo sandbox como este aluno"
                      aria-label={`Entrar no modo sandbox como ${a.nome}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground hover:bg-accent"
                    >
                      <Beaker className="h-3.5 w-3.5" /> Sandbox
                    </button>
                    <UserActionsMenu user={a} onChange={() => force((x) => x + 1)} />
                  </div>
                </td>

              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum aluno encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {modal && <NovoCadastroModal defaultRole="aluno" onClose={() => setModal(false)} />}
    </AdminShell>
  );
}
