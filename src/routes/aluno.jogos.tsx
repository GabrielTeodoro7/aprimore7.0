import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Gamepad2, Trophy, Star, Target } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlunoPerfil } from "@/lib/student-store";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

export const Route = createFileRoute("/aluno/jogos")({
  head: () => ({ meta: [{ title: "Central de Jogos — Aprimore" }] }),
  component: CentralJogos,
});

const jogos = [
  { id: "1", title: "Corrida das Letras", emoji: "🏎️", color: "blue", tags: ["Português", "Agilidade"], stars: 50 },
  { id: "2", title: "Memória Espacial", emoji: "🌌", color: "purple", tags: ["Memória", "Foco"], stars: 30 },
  { id: "3", title: "Matemática Ninja", emoji: "🥷", color: "orange", tags: ["Matemática", "Raciocínio"], stars: 100 },
  { id: "4", title: "Quebra-Cabeça Natural", emoji: "🧩", color: "green", tags: ["Ciências", "Lógica"], stars: 40 },
];

function CentralJogos() {
  const { addEstrelas } = useAlunoPerfil();
  const { playStar } = useAudioFeedback();
  const jogar = (jogo: { title: string; stars: number }) => {
    addEstrelas(jogo.stars);
    playStar();
    toast.success(`Você jogou "${jogo.title}"! +${jogo.stars} ⭐`, { description: "Novos níveis em breve." });
  };
  const verRanking = () => toast.info("Ranking do torneio", { description: "Em breve você verá sua posição aqui!" });
  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Central de Jogos
        </span>
      }
      subtitle="Aprenda brincando e ganhe muitas estrelas!"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jogos.map(jogo => (
          <Card key={jogo.id} className="p-0 overflow-hidden flex flex-col group hover:shadow-xl transition-shadow border-none bg-card">
            <div 
              className="h-40 grid place-items-center text-7xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `var(--stat-${jogo.color}-soft)` }}
            >
              {jogo.emoji}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{jogo.title}</h3>
                <div className="flex items-center gap-1 text-yellow-600 font-bold">
                  <Star className="h-4 w-4 fill-current" />
                  {jogo.stars}
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                {jogo.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
              <Button className="w-full rounded-2xl font-bold mt-auto group-hover:bg-primary transition-colors">
                <Gamepad2 className="mr-2 h-4 w-4" /> Jogar Agora
              </Button>
            </div>
          </Card>
        ))}

        <Card className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex flex-col items-center justify-center text-center border-none">
          <Trophy className="h-16 w-16 mb-4 animate-bounce" />
          <h3 className="text-2xl font-black">Torneio da Semana</h3>
          <p className="opacity-90 mb-6">Participe e concorra a 500 estrelas extras!</p>
          <Button variant="secondary" className="w-full rounded-2xl font-bold text-orange-600">
            <Target className="mr-2 h-4 w-4" /> Ver Ranking
          </Button>
        </Card>
      </div>
    </StudentShell>
  );
}
