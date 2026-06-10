import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MessageCircle, Star, Puzzle, Heart } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { useAlunoPerfil } from "@/lib/student-store";

export const Route = createFileRoute("/aluno/")({
  head: () => ({ meta: [{ title: "Aprimore — Aluno" }] }),
  component: AlunoHome,
});

const cards = [
  { to: "/aluno/rotina", label: "Minha Rotina", icon: Calendar, bg: "bg-[oklch(0.96_0.04_255)]", color: "text-[oklch(0.5_0.18_255)]" },
  { to: "/aluno/comunicacao", label: "Comunicação", icon: MessageCircle, bg: "bg-[oklch(0.95_0.06_155)]", color: "text-[oklch(0.5_0.16_155)]" },
  { to: "/aluno/conquistas", label: "Minhas Conquistas", icon: Star, bg: "bg-[oklch(0.96_0.07_90)]", color: "text-[oklch(0.55_0.15_85)]" },
  { to: "/aluno/atividades", label: "Atividades", icon: Puzzle, bg: "bg-[oklch(0.95_0.04_305)]", color: "text-[oklch(0.5_0.2_305)]" },
  { to: "/aluno/sentimentos", label: "Como estou me sentindo?", icon: Heart, bg: "bg-[oklch(0.95_0.04_5)]", color: "text-[oklch(0.55_0.18_5)]" },
];

function AlunoHome() {
  const { perfil } = useAlunoPerfil();
  return (
    <StudentShell title={<>Olá, {perfil.nome}! 👋</>} subtitle="Que bom te ver por aqui!">
      <div className="grid gap-5 md:grid-cols-3">
        {cards.slice(0, 3).map(({ to, label, icon: Icon, bg, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex aspect-square flex-col items-center justify-center gap-4 rounded-3xl ${bg} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
          >
            <Icon className={`h-20 w-20 ${color}`} />
            <span className="text-xl font-bold text-foreground">{label}</span>
          </Link>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {cards.slice(3).map(({ to, label, icon: Icon, bg, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex h-44 flex-col items-center justify-center gap-3 rounded-3xl ${bg} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
          >
            <Icon className={`h-14 w-14 ${color}`} />
            <span className="text-xl font-bold text-foreground">{label}</span>
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4 rounded-3xl bg-[oklch(0.96_0.04_255)] p-6 shadow-sm">
        <div className="text-5xl">🧒</div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-foreground">Você é incrível!</div>
          <div className="text-base text-muted-foreground">Vamos juntos aprender e conquistar o dia!</div>
        </div>
        <div className="hidden gap-2 text-2xl md:flex">⭐ 🌟 ✨</div>
      </div>
    </StudentShell>
  );
}
