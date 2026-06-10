import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { useActivities } from "@/lib/store";
import { useAlunoPerfil } from "@/lib/student-store";
import { useState } from "react";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

export const Route = createFileRoute("/aluno/atividades")({
  head: () => ({ meta: [{ title: "Atividades — Aprimore" }] }),
  component: Atividades,
});

function Atividades() {
  const { list } = useActivities();
  const { addEstrelas } = useAlunoPerfil();
  const { playStar } = useAudioFeedback();
  const [feitas, setFeitas] = useState<Record<string, boolean>>({});

  const fazer = (id: string, title: string) => {
    if (feitas[id]) return;
    setFeitas({ ...feitas, [id]: true });
    addEstrelas(10);
    playStar();
    toast.success(`Você concluiu "${title}"! +10 estrelas ⭐`);
  };

  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Atividades
        </span>
      }
      subtitle="Escolha uma atividade para fazer hoje."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => {
          const done = feitas[a.id];
          return (
            <div key={a.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl"
                  style={{ backgroundColor: `var(--stat-${a.tone}-soft)`, color: `var(--stat-${a.tone})` }}
                >
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-foreground">{a.title}</div>
                  <div className="text-sm font-semibold" style={{ color: `var(--stat-${a.tone})` }}>{a.mat}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{a.descricao}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-accent/40 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Como fazer</div>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">
                  {a.passos.slice(0, 3).map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </div>
              <button
                disabled={done}
                onClick={() => fazer(a.id, a.title)}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  done
                    ? "bg-[oklch(0.94_0.05_155)] text-[oklch(0.45_0.16_155)]"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {done ? <><CheckCircle2 className="h-4 w-4" /> Feito!</> : <><Sparkles className="h-4 w-4" /> Fazer atividade</>}
              </button>
            </div>
          );
        })}
      </div>
    </StudentShell>
  );
}
