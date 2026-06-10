import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers } from "@/lib/auth-store";
import { NovoCadastroModal, UserActionsMenu } from "@/components/AdminCadastro";

export const Route = createFileRoute("/admin/professores")({
  head: () => ({ meta: [{ title: "Admin — Professores" }] }),
  component: () => (<RequireRole roles={["admin"]}><Page /></RequireRole>),
});

function Page() {
  const { professores } = useUsers();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [, force] = useState(0);
  const visible = professores.filter((p) => `${p.nome} ${p.email} ${p.escola ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminShell title="Professores" subtitle={`${professores.length} cadastrados`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar..."
            aria-label="Buscar professores"
            className="w-72 rounded-xl border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Novo cadastro
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Escola</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-semibold text-foreground">{p.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.escola}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.status === "ativo" ? "bg-emerald-500/15 text-emerald-700" : "bg-zinc-500/15 text-zinc-700"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.criadoEm}</td>
                <td className="px-4 py-3"><UserActionsMenu user={p} onChange={() => force((x) => x + 1)} /></td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum professor encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {modal && <NovoCadastroModal defaultRole="professor" onClose={() => setModal(false)} />}
    </AdminShell>
  );
}
