import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, UserPlus, Mail, Phone } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { SentimentAlertsPanel } from "@/components/SentimentAlertsPanel";
import { useStudents } from "@/lib/store";

export const Route = createFileRoute("/turma")({
  head: () => ({ meta: [{ title: "Minha Turma — Aprimore" }] }),
  component: TurmaPage,
});

function TurmaPage() {
  const [q, setQ] = useState("");
  const { list } = useStudents();
  const filtered = list.filter((a) => a.nome.toLowerCase().includes(q.toLowerCase()));
  return (
    <DashboardShell title="Minha Turma" subtitle={`5º Ano A · ${list.length} alunos`}>
      <SentimentAlertsPanel alunos={list} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar aluno..."
            className="w-full bg-transparent text-sm outline-none"
            aria-label="Buscar aluno"
          />
        </div>
        <Link
          to="/turma/novo"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" /> Novo aluno
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Link
            key={a.id}
            to="/turma/$id"
            params={{ id: a.id }}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, var(--stat-${a.tone}), var(--stat-purple))` }}
            >
              {a.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-foreground">{a.nome}</div>
              <div className="text-xs text-muted-foreground">{a.idade} anos · Média {a.media}</div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: `var(--stat-${a.tone}-soft)`, color: `var(--stat-${a.tone})` }}
                >
                  {a.tag}
                </span>
                <span className="text-[11px] text-muted-foreground">{a.freq} freq.</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}