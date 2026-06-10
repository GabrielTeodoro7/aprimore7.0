import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CalendarCheck, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useActivities } from "@/lib/store";

export const Route = createFileRoute("/atividades")({
  head: () => ({ meta: [{ title: "Atividades — Aprimore" }] }),
  component: AtividadesPage,
});

function AtividadesPage() {
  const [filter, setFilter] = useState<"todas" | "adaptadas">("todas");
  const { list } = useActivities();
  const visible = list.filter((a) => (filter === "todas" ? true : a.adapt));

  return (
    <DashboardShell title="Atividades" subtitle="Planeje aulas inclusivas e adaptadas">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 rounded-xl bg-card p-1 shadow-sm">
          {(["todas", "adaptadas"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Link
          to="/atividades/novo"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nova atividade
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => (
          <Link
            key={a.id}
            to="/atividades/$id"
            params={{ id: a.id }}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `var(--stat-${a.tone}-soft)`, color: `var(--stat-${a.tone})` }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              {a.adapt && (
                <span
                  className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: "var(--stat-purple-soft)", color: "var(--stat-purple)" }}
                >
                  Adaptada
                </span>
              )}
            </div>
            <div>
              <div className="font-semibold text-foreground">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.mat}</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarCheck className="h-3.5 w-3.5" /> {a.data}
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}