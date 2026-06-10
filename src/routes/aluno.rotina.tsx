import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle, Lock, Trophy } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { useRotina, useAlunoPerfil } from "@/lib/student-store";

export const Route = createFileRoute("/aluno/rotina")({
  head: () => ({ meta: [{ title: "Minha Rotina — Aprimore" }] }),
  component: Rotina,
});

function Rotina() {
  const { list, concluir, total, concluidas } = useRotina();
  const { addEstrelas } = useAlunoPerfil();
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  const handleConcluir = (id: string, titulo: string) => {
    concluir(id);
    addEstrelas(5);
    toast.success(`${titulo} concluída! +5 estrelas ⭐`);
  };

  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Minha Rotina de Hoje
        </span>
      }
    >
      <div className="rounded-3xl bg-[oklch(0.96_0.04_255)] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌞</span>
            <div>
              <div className="font-bold capitalize text-foreground">{hoje}</div>
              <div className="text-sm text-muted-foreground">Hoje você já concluiu {concluidas} atividades!</div>
            </div>
          </div>
          <div className="text-lg font-bold text-foreground">{concluidas} / {total}</div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
          <div className="h-full bg-[oklch(0.62_0.16_155)] transition-all" style={{ width: `${(concluidas / total) * 100}%` }} />
        </div>
      </div>

      <ul className="space-y-3">
        {list.map((r) => {
          const done = r.status === "concluida";
          const locked = r.status === "bloqueada";
          return (
            <li
              key={r.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="w-16 shrink-0 text-base font-bold text-foreground">{r.hora}</div>
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-3xl">{r.emoji}</div>
              <div className="flex-1">
                <div className="font-bold text-foreground">{r.titulo}</div>
                <div className="text-sm text-muted-foreground">{r.descricao}</div>
              </div>
              {done ? (
                <span className="flex items-center gap-2 rounded-full bg-[oklch(0.94_0.05_155)] px-3 py-1.5 text-sm font-semibold text-[oklch(0.45_0.16_155)]">
                  <CheckCircle2 className="h-4 w-4" /> Concluída
                </span>
              ) : locked ? (
                <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" /> Pendente
                </span>
              ) : (
                <button
                  onClick={() => handleConcluir(r.id, r.titulo)}
                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Circle className="h-4 w-4" /> Concluir
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-4 rounded-3xl bg-[oklch(0.95_0.06_155)] p-5 shadow-sm">
        <Trophy className="h-12 w-12 text-[oklch(0.55_0.16_85)]" />
        <div className="flex-1">
          <div className="text-lg font-bold text-foreground">Parabéns! Você está indo muito bem! 💚</div>
          <div className="text-sm text-muted-foreground">Falta pouco para concluir todas as atividades!</div>
        </div>
      </div>
    </StudentShell>
  );
}
