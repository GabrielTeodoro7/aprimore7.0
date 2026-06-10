import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, TrendingUp, Award, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardShell } from "@/components/DashboardShell";
import { useAvaliacoes } from "@/lib/store";

export const Route = createFileRoute("/avaliacoes")({
  head: () => ({ meta: [{ title: "Avaliações — Aprimore" }] }),
  component: AvaliacoesPage,
});

function AvaliacoesPage() {
  const { list, remove } = useAvaliacoes();
  const chartData = list.map((p) => ({ name: p.mat.slice(0, 4), media: p.media }));
  const geral = list.length ? (list.reduce((a, b) => a + b.media * b.peso, 0) / list.reduce((a, b) => a + b.peso, 0)).toFixed(1) : "—";

  return (
    <DashboardShell title="Avaliações" subtitle="Acompanhe o desempenho da turma por matéria">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Média geral ponderada</div>
          <div className="text-2xl font-extrabold text-primary">{geral}</div>
        </div>
        <Link
          to="/avaliacoes/novo"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nova avaliação
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Médias por matéria</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="media" fill="var(--stat-blue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `var(--stat-${p.tone}-soft)`, color: `var(--stat-${p.tone})` }}
              >
                <Award className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--stat-green)" }}>
                <TrendingUp className="h-3 w-3" /> peso {p.peso}
              </span>
            </div>
            <div className="mt-3 text-sm font-semibold text-foreground">{p.titulo}</div>
            <div className="text-xs text-muted-foreground">{p.mat} · {p.data}</div>
            <div className="mt-3 text-3xl font-extrabold" style={{ color: `var(--stat-${p.tone})` }}>{p.media.toFixed(1)}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{p.alunos} alunos</span>
              <button
                onClick={() => { if (confirm(`Excluir "${p.titulo}"?`)) { remove(p.id); toast.success("Excluída"); } }}
                aria-label={`Excluir ${p.titulo}`}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhuma avaliação ainda. Clique em "Nova avaliação" para começar.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}