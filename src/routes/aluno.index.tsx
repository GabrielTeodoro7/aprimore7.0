import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MessageCircle, Star, Puzzle, Heart, ShoppingBag, Trophy, Sparkles, Gamepad2, BookOpen, Accessibility, Info } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { useAlunoPerfil, useRotina, useMedalhas } from "@/lib/student-store";
import { useActivities } from "@/lib/store";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/aluno/")({
  head: () => ({ meta: [{ title: "Aprimore — Aluno" }] }),
  component: AlunoHome,
});

const cards = [
  { to: "/aluno/rotina", label: "Minha Rotina", icon: Calendar, bg: "bg-[oklch(0.96_0.04_255)]", color: "text-[oklch(0.5_0.18_255)]" },
  { to: "/aluno/atividades", label: "Atividades", icon: Puzzle, bg: "bg-[oklch(0.95_0.04_305)]", color: "text-[oklch(0.5_0.2_305)]" },
  { to: "/aluno/jogos", label: "Jogos", icon: Gamepad2, bg: "bg-[oklch(0.96_0.07_90)]", color: "text-[oklch(0.55_0.15_85)]" },
  { to: "/aluno/biblioteca", label: "Biblioteca", icon: BookOpen, bg: "bg-[oklch(0.95_0.06_155)]", color: "text-[oklch(0.5_0.16_155)]" },
  { to: "/aluno/sentimentos", label: "Como estou?", icon: Heart, bg: "bg-[oklch(0.95_0.04_5)]", color: "text-[oklch(0.55_0.18_5)]" },
  { to: "/aluno/comunicacao", label: "Mensagens", icon: MessageCircle, bg: "bg-slate-100", color: "text-slate-600" },
];

function AlunoHome() {
  const { perfil } = useAlunoPerfil();
  const { data: meuAluno } = useMeuAluno();
  const { total, concluidas } = useRotina();
  const { list: medalhas } = useMedalhas();
  const { list: atividades } = useActivities();

  const conquistasCount = medalhas.filter(m => m.conquistada).length;
  const progress = total > 0 ? (concluidas / total) * 100 : 0;

  return (
    <StudentShell title={<>Olá, {perfil.nome}! 👋</>} subtitle="Que bom te ver por aqui!">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card de Progresso da Rotina */}
        <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[oklch(0.96_0.04_255)] text-[oklch(0.5_0.18_255)]">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Resumo da sua Rotina</h2>
                <p className="text-sm text-muted-foreground">Você já concluiu {concluidas} de {total} tarefas.</p>
              </div>
            </div>
            <div className="text-2xl font-black text-[oklch(0.5_0.18_255)]">{Math.round(progress)}%</div>
          </div>
          <Progress value={progress} className="h-4 bg-slate-100" />
          <div className="mt-4 flex justify-between items-center">
             <div className="flex -space-x-2">
               {Array.from({length: Math.min(concluidas, 5)}).map((_, i) => (
                 <div key={i} className="h-8 w-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs">✅</div>
               ))}
             </div>
             <Link to="/aluno/rotina" className="text-sm font-bold text-primary hover:underline">Ver rotina completa →</Link>
          </div>
        </div>

        {/* Card de Estrelas Rápido */}
        <div className="rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 p-6 shadow-lg text-white flex flex-col items-center justify-center text-center">
          <Star className="h-16 w-16 fill-white animate-pulse mb-2" />
          <div className="text-4xl font-black">{perfil.estrelas}</div>
          <div className="font-bold opacity-90">Estrelas Acumuladas</div>
          <Link to="/aluno/loja" className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-colors">
            Ir para a Loja
          </Link>
        </div>
      </div>

      {/* Seção de Diagnóstico e Apoio (Visível apenas se houver info) */}
      {(meuAluno?.diagnostico && Object.values(meuAluno.diagnostico).some(v => v === true || (typeof v === 'string' && v.length > 0))) && (
        <div className="rounded-3xl bg-blue-50/50 border border-blue-100 p-4 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-white text-blue-500 shadow-sm">
            <Info className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 text-sm">Meu Perfil de Apoio</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(meuAluno.diagnostico).map(([key, value]) => {
                if (value === true) {
                  const labels: Record<string, string> = {
                    tea: "TEA", dcd: "DCD/TDC", motor: "Motor", cognitivo: "Cognitivo", visual: "Visual", auditivo: "Auditivo"
                  };
                  return (
                    <span key={key} className="px-2 py-1 rounded-lg bg-white text-[10px] font-black uppercase text-blue-600 border border-blue-200 shadow-sm">
                      {labels[key] || key}
                    </span>
                  );
                }
                return null;
              })}
              {meuAluno.diagnostico.outros && (
                <span className="text-xs text-blue-700/70 italic italic-none font-medium">
                  "{meuAluno.diagnostico.outros}"
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {cards.map(({ to, label, icon: Icon, bg, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-3 rounded-3xl ${bg} p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-white/50`}
          >
            <div className={`p-3 rounded-2xl bg-white/50 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-foreground text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Atividades Recentes */}
        <div className="rounded-3xl bg-card p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><Puzzle className="h-5 w-5 text-primary" /> Novas Atividades</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">{atividades.length}</span>
          </div>
          <div className="space-y-3">
            {atividades.slice(0, 3).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl bg-accent/30 border border-transparent hover:border-primary/20 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{a.title}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black">{a.mat}</div>
                </div>
                <Link to="/aluno/atividades" className="text-xs font-bold text-primary">Ver</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Conquistas Recentes */}
        <div className="rounded-3xl bg-card p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-orange-500" /> Suas Medalhas</h3>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold">{conquistasCount}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {medalhas.filter(m => m.conquistada).slice(0, 4).map(m => (
              <div key={m.id} title={m.nome} className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl border border-border hover:scale-110 transition-transform">
                {m.emoji}
              </div>
            ))}
            {conquistasCount > 4 && (
               <Link to="/aluno/conquistas" className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-bold text-muted-foreground border border-dashed border-slate-300">
                 +{conquistasCount - 4}
               </Link>
            )}
            {conquistasCount === 0 && (
              <p className="text-sm text-muted-foreground py-4">Você ainda não conquistou medalhas. Faça atividades para ganhar!</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-3xl bg-[oklch(0.96_0.04_255)] p-6 shadow-sm border border-border/50">
        <div className="text-5xl animate-bounce">🧒</div>
        <div className="flex-1">
          <div className="text-2xl font-black text-foreground">Você está brilhando, {perfil.nome.split(' ')[0]}!</div>
          <div className="text-base text-muted-foreground">Cada estrelinha que você ganha mostra o quanto você é capaz.</div>
        </div>
        <div className="hidden gap-3 text-3xl md:flex">⭐ 🌟 ✨</div>
      </div>
    </StudentShell>
  );
}
