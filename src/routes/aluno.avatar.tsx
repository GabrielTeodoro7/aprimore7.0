import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, User, Palette, Camera, Sparkles, Wand2 } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { useAlunoPerfil } from "@/lib/student-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/aluno/avatar")({
  head: () => ({ meta: [{ title: "Meu Avatar — Aprimore" }] }),
  component: MeuAvatar,
});

const cores = [
  { name: "Azul Calmo", value: "oklch(0.6_0.15_250)" },
  { name: "Verde Alegria", value: "oklch(0.6_0.15_150)" },
  { name: "Laranja Energia", value: "oklch(0.6_0.15_50)" },
  { name: "Rosa Amizade", value: "oklch(0.6_0.15_10)" },
  { name: "Roxo Poder", value: "oklch(0.6_0.15_300)" },
];

const emojis = ["👦", "👧", "🦊", "🦁", "🐼", "🤖", "🚀", "🦄"];

function MeuAvatar() {
  const { perfil } = useAlunoPerfil();
  const [selectedEmoji, setSelectedEmoji] = useState("👦");
  const [selectedColor, setSelectedColor] = useState(cores[0].value);

  const salvar = () => {
    toast.success("Avatar salvo!", { description: "Seus amigos agora verão seu novo estilo." });
  };

  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Meu Avatar
        </span>
      }
      subtitle="Crie um visual que seja a sua cara!"
    >
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="aspect-square relative overflow-hidden rounded-3xl border-none shadow-xl flex items-center justify-center text-[120px]" style={{ backgroundColor: selectedColor }}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            <span className="relative z-10">{selectedEmoji}</span>
            <div className="absolute bottom-4 right-4 bg-white/30 backdrop-blur-md rounded-full p-2">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </Card>
          
          <Button onClick={salvar} className="w-full h-12 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
            Salvar Estilo
          </Button>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Escolha seu personagem</h3>
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
              {emojis.map(e => (
                <button
                  key={e}
                  onClick={() => setSelectedEmoji(e)}
                  className={`aspect-square rounded-2xl text-3xl grid place-items-center transition-all ${selectedEmoji === e ? "bg-primary text-white scale-110 shadow-lg ring-4 ring-primary/20" : "bg-card border-2 border-border hover:border-primary/50"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Cor de fundo</h3>
            <div className="flex flex-wrap gap-4">
              {cores.map(c => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`h-12 w-12 rounded-full transition-all ${selectedColor === c.value ? "ring-4 ring-primary ring-offset-4 scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </section>

          <Card className="p-6 bg-accent/30 border-none">
            <h4 className="font-bold flex items-center gap-2 mb-2 text-primary"><Sparkles className="h-4 w-4" /> Itens Especiais</h4>
            <p className="text-sm text-muted-foreground mb-4">Você ainda não tem itens da loja. Vá até a Loja de Prêmios para comprar capas, coroas e muito mais!</p>
            <Link to="/aluno/loja">
              <Button variant="outline" className="rounded-xl gap-2"><Wand2 className="h-4 w-4" /> Ir para a Loja</Button>
            </Link>
          </Card>
        </div>
      </div>
    </StudentShell>
  );
}
