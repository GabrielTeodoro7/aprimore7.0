import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Volume2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { pictogramas, type PictoCategoria } from "@/lib/student-store";

export const Route = createFileRoute("/aluno/comunicacao")({
  head: () => ({ meta: [{ title: "Comunicação por Imagens — Aprimore" }] }),
  component: Comunicacao,
});

type Picto = { id: string; label: string; emoji: string };

const cats = Object.keys(pictogramas) as PictoCategoria[];
const catColors: Record<string, string> = {
  Sentimentos: "bg-[oklch(0.95_0.06_90)] text-[oklch(0.5_0.15_85)]",
  Necessidades: "bg-[oklch(0.95_0.04_5)] text-[oklch(0.55_0.18_5)]",
  "Ações": "bg-[oklch(0.96_0.04_255)] text-[oklch(0.5_0.18_255)]",
  Lugares: "bg-[oklch(0.95_0.05_155)] text-[oklch(0.45_0.16_155)]",
  Pessoas: "bg-[oklch(0.95_0.04_305)] text-[oklch(0.5_0.2_305)]",
  Alimentos: "bg-[oklch(0.95_0.05_70)] text-[oklch(0.55_0.17_55)]",
  Cortesia: "bg-[oklch(0.95_0.04_5)] text-[oklch(0.55_0.18_5)]",
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    toast("Áudio indisponível neste navegador");
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "pt-BR";
  utter.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function Comunicacao() {
  const [cat, setCat] = useState<PictoCategoria>("Sentimentos");
  const [frase, setFrase] = useState<Picto[]>([]);
  const itens = pictogramas[cat];

  const add = (p: Picto) => setFrase((f) => (f.length >= 6 ? f : [...f, p]));
  const remove = (i: number) => setFrase((f) => f.filter((_, idx) => idx !== i));
  const ouvir = () => {
    if (!frase.length) return toast("Monte uma frase primeiro");
    speak(frase.map((p) => p.label).join(" "));
  };

  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Comunicação por Imagens
        </span>
      }
      subtitle="Toque nos ícones para montar sua mensagem."
      showStars={false}
    >
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              cat === c ? "bg-primary text-primary-foreground shadow" : "bg-card text-foreground hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {itens.map((p) => (
          <button
            key={p.id}
            onClick={() => add(p)}
            className={`flex flex-col items-center gap-2 rounded-2xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${catColors[cat]}`}
          >
            <span className="text-5xl">{p.emoji}</span>
            <span className="text-sm font-semibold text-foreground">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 text-sm font-bold text-foreground">Monte sua frase</div>
        <div className="flex flex-wrap items-center gap-2">
          {frase.map((p, i) => (
            <button
              key={`${p.id}-${i}`}
              onClick={() => remove(i)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-accent px-3 py-2 hover:bg-destructive/10"
              title="Remover"
            >
              <span className="text-3xl">{p.emoji}</span>
              <span className="text-xs font-semibold">{p.label}</span>
            </button>
          ))}
          {Array.from({ length: Math.max(0, 5 - frase.length) }).map((_, i) => (
            <div key={i} className="grid h-16 w-16 place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground">
              <Plus className="h-5 w-5" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={ouvir}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Volume2 className="h-4 w-4" /> Ouvir frase
          </button>
          <button
            onClick={() => setFrase([])}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <Trash2 className="h-4 w-4" /> Limpar tudo
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">O sistema irá ler sua frase em voz alta com pausas entre as palavras.</p>
      </div>
    </StudentShell>
  );
}
