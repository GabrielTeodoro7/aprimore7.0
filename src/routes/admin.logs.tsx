import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { RequireRole } from "@/components/RequireRole";
import { useLogs } from "@/lib/auth-store";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({ meta: [{ title: "Admin — Logs" }] }),
  component: () => (<RequireRole roles={["admin"]}><Page /></RequireRole>),
});

function Page() {
  const { list } = useLogs();
  return (
    <AdminShell title="Logs de acesso" subtitle={`${list.length} eventos registrados`}>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 text-muted-foreground">{new Date(l.data).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold capitalize">{l.perfil}</span></td>
                <td className="px-4 py-3 font-semibold text-foreground">{l.usuario}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.acao}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum log ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
