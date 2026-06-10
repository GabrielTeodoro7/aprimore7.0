import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, GraduationCap, UserCheck, UserX, ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers, useLogs } from "@/lib/auth-store";
import { StatCard } from "@/components/StatCard";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Visão Geral" }] }),
  component: () => (<RequireRole roles={["admin"]}><AdminHome /></RequireRole>),
});

function AdminHome() {
  const { professores, alunos, list } = useUsers();
  const { list: logs } = useLogs();
  const ativos = list.filter((u) => u.status === "ativo").length;
  const inativos = list.length - ativos;

  return (
    <AdminShell title="Visão Geral" subtitle="Painel do administrador">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Users} value={String(professores.length)} label="Professores" tone="blue" />
        <StatCard icon={GraduationCap} value={String(alunos.length)} label="Alunos" tone="purple" />
        <StatCard icon={UserCheck} value={String(ativos)} label="Contas ativas" tone="green" />
        <StatCard icon={UserX} value={String(inativos)} label="Contas inativas" tone="orange" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link to="/admin/professores" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Gerenciar professores</h2>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Cadastrar, editar, desativar e reenviar e-mails.</p>
        </Link>
        <Link to="/admin/alunos" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Gerenciar alunos</h2>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Vincular alunos a professores e turmas.</p>
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Últimos acessos</h2>
          <Link to="/admin/logs" className="text-xs font-semibold text-primary hover:underline">Ver todos →</Link>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum acesso registrado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {logs.slice(0, 6).map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-semibold text-foreground">{l.usuario}</div>
                  <div className="text-xs text-muted-foreground">{l.acao}</div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(l.data).toLocaleString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
