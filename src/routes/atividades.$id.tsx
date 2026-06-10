import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck, Sparkles, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { useActivities } from "@/lib/store";

export const Route = createFileRoute("/atividades/$id")({
  head: () => ({ meta: [{ title: "Atividade — Aprimore" }] }),
  component: AtividadeDetailPage,
});

function AtividadeDetailPage() {
  const { id } = Route.useParams();
  const { get, remove } = useActivities();
  const navigate = useNavigate();
  const a = get(id);

  if (!a) {
    return (
      <DashboardShell title="Atividade não encontrada">
        <Link to="/atividades" className="text-primary hover:underline">Voltar</Link>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={a.title} subtitle={`${a.mat} · ${a.data}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/atividades" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex gap-2">
          <button onClick={() => { window.print(); toast("Imprimindo..."); }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-accent">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
          <button onClick={() => { if (confirm("Excluir?")) { remove(a.id); toast.success("Excluída"); navigate({ to: "/atividades" }); } }}
            className="flex items-center gap-2 rounded-xl border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5">
            <Trash2 className="h-4 w-4" /> Excluir
          </button>
        </div>
      </div>

      <div
        className="rounded-2xl border border-border p-6 shadow-sm"
        style={{ background: `linear-gradient(135deg, var(--stat-${a.tone}-soft), var(--card))` }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
            style={{ backgroundColor: `var(--stat-${a.tone})` }}
          >
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{a.title}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{a.mat}</span>
              <span className="flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" />{a.data}</span>
              {a.adapt && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                  style={{ backgroundColor: "var(--stat-purple-soft)", color: "var(--stat-purple)" }}>
                  Adaptada
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground">{a.descricao}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Section title="Objetivos" items={a.objetivos} tone="blue" />
        <Section title="Materiais" items={a.materiais} tone="orange" />
        <Section title="Passo a passo" items={a.passos} tone="green" numbered />
      </div>
    </DashboardShell>
  );
}

function Section({ title, items, tone, numbered }: { title: string; items: string[]; tone: string; numbered?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: `var(--stat-${tone})` }}>{title}</h3>
      <ol className="mt-3 space-y-2 text-sm text-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: `var(--stat-${tone}-soft)`, color: `var(--stat-${tone})` }}
            >
              {numbered ? i + 1 : "•"}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}