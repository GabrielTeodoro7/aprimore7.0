import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Volume2, Plus, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { pictogramas, type PictoCategoria } from "@/lib/student-store";

export const Route = createFileRoute("/comunicacao")({
  head: () => ({ meta: [{ title: "Comunicador por Imagens — Aprimore" }] }),
  component: Comunicacao,
});

type P = { id: string; label: string; emoji: string };

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return toast("Áudio indisponível");
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR"; u.rate = 0.9;
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
}

function Comunicacao() {
  const cats = Object.keys(pictogramas) as PictoCategoria[];
  const [cat, setCat] = useState<PictoCategoria>("Sentimentos");
  const [frase, setFrase] = useState<P[]>([]);
  return (
    <DashboardShell title="Comunicador por Imagens" subtitle="Construa frases escolhendo imagens e ouça sua mensagem.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${cat === c ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent"}`}>
              {c}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">
          <Settings className="h-4 w-4" /> Configurações
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {pictogramas[cat].map((p) => (
          <button key={p.id} onClick={() => setFrase((f) => (f.length >= 6 ? f : [...f, p]))}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="text-4xl">{p.emoji}</span>
            <span className="text-xs font-semibold text-foreground">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 text-sm font-bold text-foreground">Frase montada</div>
        <div className="flex flex-wrap items-center gap-2">
          {frase.map((p, i) => (
            <button key={`${p.id}-${i}`} onClick={() => setFrase((f) => f.filter((_, idx) => idx !== i))}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-accent px-3 py-2 hover:bg-destructive/10">
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-xs">{p.label}</span>
            </button>
          ))}
          {!frase.length && <span className="text-sm text-muted-foreground">Clique nos pictogramas acima para montar.</span>}
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={() => speak(frase.map((p) => p.label).join(" "))}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Volume2 className="h-4 w-4" /> Ouvir frase
          </button>
          <button onClick={() => setFrase([])}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold hover:bg-accent">
            <Trash2 className="h-4 w-4" /> Limpar
          </button>
          <button className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold hover:bg-accent">
            <Plus className="h-4 w-4" /> Novo pictograma
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
