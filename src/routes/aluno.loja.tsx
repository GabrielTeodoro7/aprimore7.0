import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingBag, Star, Zap, Gift, Trophy } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { useAlunoPerfil } from "@/lib/student-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

export const Route = createFileRoute("/aluno/loja")({
  head: () => ({ meta: [{ title: "Loja de Prêmios — Aprimore" }] }),
  component: LojaDePremios,
});

const itensLoja = [
  { id: "skin-1", nome: "Capa de Herói", preco: 50, emoji: "🦸‍♂️", categoria: "Avatar", cor: "purple" },
  { id: "skin-2", nome: "Óculos Maneiro", preco: 30, emoji: "😎", categoria: "Avatar", cor: "blue" },
  { id: "skin-3", nome: "Coroa Real", preco: 100, emoji: "👑", categoria: "Avatar", cor: "yellow" },
  { id: "power-1", nome: "Dobro de Estrelas", preco: 150, emoji: "⚡", categoria: "Poder", cor: "orange" },
  { id: "tema-1", nome: "Tema Galáxia", preco: 200, emoji: "🌌", categoria: "Tema", cor: "purple" },
  { id: "bonus-1", nome: "Figurinha Especial", preco: 20, emoji: "🦄", categoria: "Coleção", cor: "pink" },
];

function LojaDePremios() {
  const { perfil, addEstrelas } = useAlunoPerfil();

  const comprar = (item: typeof itensLoja[0]) => {
    if (perfil.estrelas < item.preco) {
      toast.error("Estrelas insuficientes!", { description: `Faltam ${item.preco - perfil.estrelas} estrelas.` });
      return;
    }
    
    // Na Onda C isso seria persistido no banco
    addEstrelas(-item.preco);
    toast.success(`Você comprou: ${item.nome}!`, {
      description: "Item adicionado à sua coleção.",
      icon: <span>{item.emoji}</span>
    });
  };

  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Loja de Prêmios
        </span>
      }
      subtitle="Troque suas estrelas por itens incríveis!"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3 p-6 bg-gradient-to-r from-[oklch(0.55_0.2_255)] to-[oklch(0.6_0.2_300)] text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="h-6 w-6" /> Mercado do Aprimore</h2>
              <p className="opacity-90">Use o que você conquistou estudando!</p>
            </div>
            <div className="flex items-center gap-3 bg-white/20 rounded-2xl px-6 py-4 backdrop-blur-md">
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              <div className="text-4xl font-black">{perfil.estrelas}</div>
            </div>
          </div>
        </Card>

        {itensLoja.map((item) => (
          <Card key={item.id} className="p-5 flex flex-col gap-4 hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/20 group">
            <div 
              className="aspect-square rounded-2xl grid place-items-center text-6xl group-hover:scale-110 transition-transform"
              style={{ backgroundColor: `var(--stat-${item.cor}-soft)` }}
            >
              {item.emoji}
            </div>
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-1">{item.categoria}</Badge>
                  <h3 className="font-bold text-lg">{item.nome}</h3>
                </div>
                <div className="flex items-center gap-1 font-bold text-yellow-600">
                  <Star className="h-4 w-4 fill-current" />
                  {item.preco}
                </div>
              </div>
            </div>
            <Button 
              className="w-full rounded-xl font-bold" 
              onClick={() => comprar(item)}
              disabled={perfil.estrelas < item.preco}
              variant={perfil.estrelas < item.preco ? "secondary" : "default"}
            >
              {perfil.estrelas < item.preco ? "Bloqueado" : "Comprar"}
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 py-8 border-t border-border">
        <Trophy className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground text-center max-w-sm">Novos itens aparecem toda semana. Continue estudando para não perder nada!</p>
      </div>
    </StudentShell>
  );
}
