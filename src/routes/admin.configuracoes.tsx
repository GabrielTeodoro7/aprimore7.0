import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { RequireRole } from "@/components/RequireRole";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Admin — Configurações" }] }),
  component: () => (<RequireRole roles={["admin"]}><Page /></RequireRole>),
});

function Page() {
  return (
    <AdminShell title="Configurações" subtitle="Preferências da plataforma">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Sobre o ambiente</h2>
        <p className="text-sm text-muted-foreground">
          Esta instância usa autenticação e armazenamento mock (localStorage). As ações de e-mail são simuladas e impressas no console.
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Versão: 1.0.0 (mock)</li>
          <li>Provedor de e-mail: Console (mock)</li>
          <li>Idioma: Português (pt-BR)</li>
        </ul>
        <button
          onClick={() => { if (confirm("Limpar todos os dados locais e sair?")) { localStorage.clear(); location.href = "/login"; } }}
          className="rounded-xl bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/15"
        >
          Resetar plataforma (mock)
        </button>
      </div>
    </AdminShell>
  );
}
