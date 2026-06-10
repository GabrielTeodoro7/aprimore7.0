import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CEOShell } from "@/components/CEOShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers } from "@/lib/auth-store";
import { Search } from "lucide-react";

export const Route = createFileRoute("/ceo/usuarios")({
  head: () => ({ meta: [{ title: "·" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <RequireRole roles={["ceo"]}>
      <Page />
    </RequireRole>
  ),
});

function Page() {
  const { list } = useUsers();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("todos");

  const filtered = list.filter((u) => {
    const txt = `${u.nome} ${u.email} ${u.escola ?? ""}`.toLowerCase();
    const okQ = txt.includes(q.toLowerCase());
    const okR = role === "todos" || u.role === role;
    return okQ && okR;
  });

  return (
    <CEOShell title="Usuários globais" subtitle="Visão sem filtros de escola">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nome, e-mail, escola…"
            className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-fuchsia-500/60"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="ceo">CEO</option>
          <option value="admin">Admin</option>
          <option value="professor">Professor</option>
          <option value="aluno">Aluno</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-left text-xs uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Escola</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-900/40">
                <td className="px-4 py-3 font-medium text-zinc-100">{u.nome}</td>
                <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    u.role === "ceo" ? "bg-fuchsia-500/20 text-fuchsia-200" :
                    u.role === "admin" ? "bg-indigo-500/20 text-indigo-200" :
                    u.role === "professor" ? "bg-emerald-500/20 text-emerald-200" :
                    "bg-zinc-700/40 text-zinc-200"
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{u.escola ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-400">{u.status}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">
        Total: {filtered.length} de {list.length} usuários.
      </p>
    </CEOShell>
  );
}
