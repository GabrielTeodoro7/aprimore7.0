import { createFileRoute } from "@tanstack/react-router";
import { CEOShell } from "@/components/CEOShell";
import { RequireRole } from "@/components/RequireRole";
import { useLogs } from "@/lib/auth-store";

export const Route = createFileRoute("/ceo/auditoria")({
  head: () => ({ meta: [{ title: "·" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <RequireRole roles={["ceo"]}>
      <Page />
    </RequireRole>
  ),
});

function Page() {
  const { list } = useLogs();
  return (
    <CEOShell title="Auditoria total" subtitle="Trilha completa de eventos">
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-left text-xs uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {list.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-900/40">
                <td className="px-4 py-3 text-zinc-400">{new Date(l.data).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3"><span className="rounded bg-zinc-800 px-2 py-0.5 text-xs">{l.perfil}</span></td>
                <td className="px-4 py-3 text-zinc-200">{l.usuario}</td>
                <td className="px-4 py-3 text-zinc-300">{l.acao}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">Sem eventos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </CEOShell>
  );
}
