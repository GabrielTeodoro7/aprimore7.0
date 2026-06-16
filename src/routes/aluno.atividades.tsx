import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CheckCircle2, Sparkles, Filter, User } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { useActivities } from "@/lib/store";
import { useAlunoPerfil } from "@/lib/student-store";
import { useState, useMemo } from "react";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

export const Route = createFileRoute("/aluno/atividades")({
  head: () => ({ meta: [{ title: "Atividades — Aprimore" }] }),
  component: Atividades,
});

function Atividades() {
  const { list } = useActivities();
  const { perfil } = useAlunoPerfil();
  const { addEstrelas } = useAlunoPerfil();
  const { playStar } = useAudioFeedback();
  const [feitas, setFeitas] = useState<Record<string, boolean>>({});
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");

  const filteredList = useMemo(() => {
    if (filterMode === "mine") {
      return list.filter(a => !a.alunoIds || a.alunoIds.length === 0 || a.alunoIds.includes(perfil.id));
    }
    return list;
  }, [list, filterMode, perfil.id]);

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
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-2xl bg-card p-1 shadow-sm">
          <button
            onClick={() => setFilterMode("mine")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              filterMode === "mine" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <User className="h-4 w-4" /> Para Mim
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              filterMode === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Filter className="h-4 w-4" /> Ver Todas
          </button>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Exibindo {filteredList.length} atividade{filteredList.length !== 1 ? "s" : ""}
        </div>
      </div>
      {filteredList.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <div className="mt-3 text-base font-bold">Nenhuma atividade ainda</div>
          <div className="text-sm text-muted-foreground">Quando seu professor postar uma atividade, ela aparece aqui.</div>
        </div>
      )}


      <div className="grid gap-4 md:grid-cols-2">
        {filteredList.map((a) => {
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
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-lg font-bold text-foreground">{a.title}</div>
                    {a.alunoIds?.includes(perfil.id) && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <User className="h-3 w-3" /> ESPECIAL
                      </span>
                    )}
                  </div>
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
