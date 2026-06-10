import { createFileRoute } from "@tanstack/react-router";
import { CEOShell } from "@/components/CEOShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers } from "@/lib/auth-store";
import { Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ceo/observar")({
  head: () => ({ meta: [{ title: "·" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <RequireRole roles={["ceo"]}>
      <Page />
    </RequireRole>
  ),
});

function Page() {
  const { list } = useUsers();
  return (
    <CEOShell title="Modo Observador" subtitle="Veja a plataforma como qualquer usuário — sem assumir a sessão">
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-left text-xs uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {list.slice(0, 50).map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3"><div className="font-medium text-zinc-100">{u.nome}</div><div className="text-xs text-zinc-500">{u.email}</div></td>
                <td className="px-4 py-3"><span className="rounded bg-zinc-800 px-2 py-0.5 text-xs">{u.role}</span></td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toast.info("Observação ativada (somente leitura)", { description: u.nome })}
                    className="inline-flex items-center gap-1 rounded-md border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20"
                  >
                    <Eye className="h-3.5 w-3.5" /> Observar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CEOShell>
  );
}
