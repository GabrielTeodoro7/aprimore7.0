import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Star, Trophy } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { useMedalhas, useAlunoPerfil } from "@/lib/student-store";

export const Route = createFileRoute("/aluno/conquistas")({
  head: () => ({ meta: [{ title: "Minhas Conquistas — Aprimore" }] }),
  component: Conquistas,
});

function Conquistas() {
  const { list } = useMedalhas();
  const { perfil } = useAlunoPerfil();
  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Minhas Conquistas
        </span>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-[oklch(0.95_0.06_90)] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Trophy className="h-20 w-20 text-[oklch(0.55_0.16_85)]" />
            <div>
              <div className="text-xl font-extrabold text-foreground">Você é um campeão!</div>
              <div className="text-sm text-muted-foreground">Continue assim!</div>
            </div>
          </div>
          <div className="absolute right-4 top-4 text-3xl">🎉</div>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-sm">
          <div className="text-sm font-bold text-muted-foreground">Minhas estrelas</div>
          <div className="mt-2 flex items-center gap-3">
            <Star className="h-16 w-16 fill-yellow-400 text-yellow-400" />
            <div className="text-5xl font-extrabold text-foreground">{perfil.estrelas}</div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Continue realizando suas atividades para ganhar mais estrelas!</p>
        </div>
      </div>

      <div>
        <div className="mb-3 text-lg font-bold text-foreground">Medalhas conquistadas</div>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {list.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-sm">
              <div
                className={`grid h-20 w-20 place-items-center rounded-full text-4xl ${
                  m.conquistada ? "" : "opacity-40"
                }`}
                style={{ backgroundColor: m.conquistada ? `var(--stat-${m.tone}-soft)` : "var(--muted)" }}
              >
                {m.conquistada ? m.emoji : <Lock className="h-8 w-8 text-muted-foreground" />}
              </div>
              <div className="text-sm font-bold text-foreground">{m.nome}</div>
              <div className={`text-xs font-semibold ${m.conquistada ? "text-[oklch(0.5_0.18_255)]" : "text-muted-foreground"}`}>
                {m.conquistada ? "Conquistada" : m.descricao}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
