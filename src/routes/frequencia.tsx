import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import {
  useStudents,
  useFrequencia,
  type FrequenciaStatus,
  type FrequenciaDia,
} from "@/lib/store";

export const Route = createFileRoute("/frequencia")({
  head: () => ({ meta: [{ title: "Frequência — Aprimore" }] }),
  component: FrequenciaPage,
});

function FrequenciaPage() {
  const dateKey = new Date().toISOString().slice(0, 10);
  const today = new Date().toLocaleDateString("pt-BR");
  const { list } = useStudents();
  const { today: marc, set, setMany } = useFrequencia(dateKey);

  // Agrupa alunos por turma para lançamentos por turma (RLS exige turmaId).
  const turmasIndex = useMemo(() => {
    const m = new Map<string, typeof list>();
    for (const a of list) {
      if (!a.turmaId) continue;
      const arr = m.get(a.turmaId) ?? [];
      arr.push(a);
      m.set(a.turmaId, arr);
    }
    return m;
  }, [list]);

  const setStatus = (a: (typeof list)[number], s: FrequenciaStatus) => {
    if (!a.turmaId) {
      toast.error("Aluno sem turma vinculada");
      return;
    }
    set(a.id, s, a.turmaId);
    toast(a.nome, { description: s === "p" ? "Presente" : s === "f" ? "Falta" : "Atraso" });
  };

  const counts = (val: FrequenciaStatus) =>
    list.filter((a) => marc[a.id] === val).length;
  const presentes = counts("p");

  const marcarTodosPresentes = async () => {
    for (const [tid, alunos] of turmasIndex) {
      const entries: FrequenciaDia = Object.fromEntries(
        alunos.map((a) => [a.id, "p" as const]),
      );
      await setMany(entries, tid);
    }
    toast.success("Todos presentes");
  };

  return (
    <DashboardShell title="Frequência" subtitle={`Chamada de ${today}`}>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={marcarTodosPresentes}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent"
        >Marcar todos presentes</button>
        <button
          onClick={() => toast("Para limpar, marque cada aluno manualmente")}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent"
        >Limpar</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Presentes</div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "var(--stat-green)" }}>{presentes}/{list.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Faltas</div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "var(--stat-pink)" }}>
            {counts("f")}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Atrasos</div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "var(--stat-orange)" }}>
            {counts("a")}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {list.map((a) => (
          <div key={a.id} className="flex items-center justify-between border-b border-border px-5 py-3 last:border-0">
            <span className="font-medium text-foreground">{a.nome}</span>
            <div className="flex gap-2">
              {([
                { s: "p" as FrequenciaStatus, icon: Check, color: "var(--stat-green)", label: "Presente" },
                { s: "a" as FrequenciaStatus, icon: Clock, color: "var(--stat-orange)", label: "Atraso" },
                { s: "f" as FrequenciaStatus, icon: X, color: "var(--stat-pink)", label: "Falta" },
              ]).map(({ s, icon: I, color }) => {
                const active = marc[a.id] === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(a, s)}
                    aria-label={`Marcar ${a.nome} como ${s === "p" ? "presente" : s === "a" ? "atrasado" : "ausente"}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition"
                    style={active ? { backgroundColor: color, color: "white", borderColor: color } : {}}
                  >
                    <I className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => toast.success("Chamada salva!", { description: `${presentes} presentes registrados.` })}
        className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm hover:opacity-90"
      >
        Salvar chamada
      </button>
    </DashboardShell>
  );
}