import { Accessibility, Type, Contrast, Zap, BookOpen, RotateCcw, X } from "lucide-react";
import { useA11y } from "@/components/AccessibilityProvider";
import { toast } from "sonner";

export function AccessibilityPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, set, reset } = useA11y();
  if (!open) return null;

  const toggles = [
    { k: "highContrast" as const, icon: Contrast, label: "Alto contraste", sub: "Aumenta legibilidade de cores" },
    { k: "largeText" as const, icon: Type, label: "Texto grande", sub: "Aumenta o tamanho base do texto" },
    { k: "reduceMotion" as const, icon: Zap, label: "Reduzir animações", sub: "Desativa transições e movimentos" },
    { k: "dyslexicFont" as const, icon: BookOpen, label: "Fonte para dislexia", sub: "Usa fonte mais legível" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="flex-1 bg-foreground/30 backdrop-blur-sm"
      />
      <aside className="flex w-full max-w-md flex-col bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Accessibility className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Acessibilidade</h2>
              <p className="text-xs text-muted-foreground">Ajustes salvos no seu navegador</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar painel" className="rounded-lg p-2 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-1 overflow-y-auto p-4">
          {toggles.map((t) => (
            <div key={t.k} className="flex items-center gap-4 rounded-xl p-3 hover:bg-accent/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.sub}</div>
              </div>
              <button
                role="switch"
                aria-checked={settings[t.k]}
                aria-label={t.label}
                onClick={() => {
                  set(t.k, !settings[t.k]);
                  toast(t.label, { description: !settings[t.k] ? "Ativado" : "Desativado" });
                }}
                className={`relative h-6 w-11 rounded-full transition ${settings[t.k] ? "bg-primary" : "bg-border"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${settings[t.k] ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          ))}

          <div className="mt-4 rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Escala do texto</div>
                <div className="text-xs text-muted-foreground">Atual: {Math.round(settings.fontScale * 100)}%</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => set("fontScale", Math.max(0.8, +(settings.fontScale - 0.1).toFixed(2)))}
                  className="h-9 w-9 rounded-lg border border-border text-lg font-bold hover:bg-accent"
                  aria-label="Diminuir texto"
                >−</button>
                <button
                  onClick={() => set("fontScale", Math.min(1.5, +(settings.fontScale + 0.1).toFixed(2)))}
                  className="h-9 w-9 rounded-lg border border-border text-lg font-bold hover:bg-accent"
                  aria-label="Aumentar texto"
                >+</button>
              </div>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={settings.fontScale}
              onChange={(e) => set("fontScale", parseFloat(e.target.value))}
              className="w-full accent-primary"
              aria-label="Escala do texto"
            />
          </div>
        </div>

        <footer className="border-t border-border p-4">
          <button
            onClick={() => {
              reset();
              toast.success("Padrões restaurados");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" /> Restaurar padrões
          </button>
        </footer>
      </aside>
    </div>
  );
}