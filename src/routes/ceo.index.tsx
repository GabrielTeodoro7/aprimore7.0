import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, Users2, Activity, Brain, Eye, KeyRound } from "lucide-react";
import { CEOShell } from "@/components/CEOShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers, useLogs } from "@/lib/auth-store";

export const Route = createFileRoute("/ceo/")({
  // título genérico e sem indexação implícita
  head: () => ({
    meta: [
      { title: "·" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireRole roles={["ceo"]}>
      <CEOHome />
    </RequireRole>
  ),
});

function CEOHome() {
  const { list } = useUsers();
  const { list: logs } = useLogs();
  const total = list.length;
  const por = (role: string) => list.filter((u) => u.role === role).length;

  const cards = [
    { to: "/ceo/usuarios", icon: Users2, title: "Usuários globais", desc: "Todas as escolas, todos os perfis" },
    { to: "/ceo/auditoria", icon: Activity, title: "Auditoria total", desc: "Trilha de cada ação no sistema" },
    { to: "/ceo/insights-ia", icon: Brain, title: "Insights de IA", desc: "Análise estratégica gerada por IA" },
    { to: "/ceo/override", icon: KeyRound, title: "Override de admins", desc: "Sobrescrever decisões de admins" },
    { to: "/ceo/observar", icon: Eye, title: "Modo observador", desc: "Ver o sistema como qualquer usuário" },
  ] as const;

  return (
    <CEOShell title="Onda Zero" subtitle="Camada estratégica · clearance CEO">
      <div className="rounded-xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/5 to-transparent p-5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-fuchsia-300" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
            Confidencial
          </h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Esta área não está listada em nenhum menu da plataforma. Sua existência
          é desconhecida para admins, professores e alunos. Toda ação aqui fica
          registrada na auditoria com selo <code className="text-fuchsia-300">ceo.override</code>.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Usuários" value={total} />
        <Metric label="Admins" value={por("admin")} />
        <Metric label="Professores" value={por("professor")} />
        <Metric label="Alunos" value={por("aluno")} />
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-fuchsia-500/40 hover:bg-zinc-900/70"
            >
              <Icon className="h-5 w-5 text-fuchsia-300" />
              <h3 className="mt-3 text-base font-semibold">{c.title}</h3>
              <p className="mt-1 text-xs text-zinc-400">{c.desc}</p>
            </Link>
          );
        })}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Últimos eventos
        </h3>
        {logs.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum evento registrado.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {logs.slice(0, 8).map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-semibold text-zinc-100">{l.usuario}</div>
                  <div className="text-xs text-zinc-500">
                    [{l.perfil}] {l.acao}
                  </div>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(l.data).toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </CEOShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-1 text-3xl font-black text-zinc-100">{value}</div>
    </div>
  );
}
