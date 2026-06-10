import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Accessibility, Volume2, Image as ImageIcon, Loader2, Sparkles, Square } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { descreverImagem } from "@/lib/ai.functions";

export const Route = createFileRoute("/acessibilidade-ia")({
  head: () => ({ meta: [{ title: "Acessibilidade com IA — Aprimore" }] }),
  component: AcessibilidadeIA,
});

function AcessibilidadeIA() {
  return (
    <DashboardShell title="Acessibilidade com IA" subtitle="Leitura em voz alta e descrição automática de imagens.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Leitor />
        <Descritor />
      </div>
    </DashboardShell>
  );
}

function Leitor() {
  const [texto, setTexto] = useState("Cole aqui qualquer texto e ouça em voz alta.");
  const [taxa, setTaxa] = useState(0.95);
  const [falando, setFalando] = useState(false);

  const ouvir = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return toast.error("TTS indisponível");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR"; u.rate = taxa;
    u.onend = () => setFalando(false);
    u.onerror = () => setFalando(false);
    setFalando(true);
    window.speechSynthesis.speak(u);
  };
  const parar = () => { window.speechSynthesis.cancel(); setFalando(false); };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2 text-base font-bold"><Volume2 className="h-5 w-5 text-primary" /> Leitor em voz alta</div>
      <Textarea rows={8} value={texto} onChange={e=>setTexto(e.target.value)} />
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground">Velocidade: {taxa.toFixed(2)}x</label>
        <input type="range" min={0.5} max={1.5} step={0.05} value={taxa} onChange={e=>setTaxa(+e.target.value)} className="flex-1 accent-primary" />
      </div>
      <div className="flex gap-2">
        {!falando ? (
          <Button onClick={ouvir} className="flex-1"><Volume2 className="h-4 w-4 mr-2" />Ouvir</Button>
        ) : (
          <Button onClick={parar} variant="destructive" className="flex-1"><Square className="h-4 w-4 mr-2" />Parar</Button>
        )}
      </div>
    </Card>
  );
}

function Descritor() {
  const fn = useServerFn(descreverImagem);
  const [preview, setPreview] = useState<string | null>(null);
  const [b64, setB64] = useState<string | null>(null);
  const [contexto, setContexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<Awaited<ReturnType<typeof descreverImagem>> | null>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return toast.error("Imagem grande demais (máx 4MB)");
    const reader = new FileReader();
    reader.onload = () => {
      const d = reader.result as string;
      setPreview(d);
      setB64(d);
      setOut(null);
    };
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    if (!b64) return toast.error("Envie uma imagem");
    setLoading(true);
    try {
      const r = await fn({ data: { imagemBase64: b64, contexto } });
      setOut(r);
    } catch (e) { toast.error("Erro ao descrever", { description: String(e) }); }
    finally { setLoading(false); }
  };

  const ouvir = (txt: string) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(txt); u.lang = "pt-BR"; u.rate = 0.95;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2 text-base font-bold"><ImageIcon className="h-5 w-5 text-primary" /> Descrever imagem</div>
      <p className="text-sm text-muted-foreground">Gera alt-text e descrição longa para alunos com deficiência visual.</p>
      <input type="file" accept="image/*" onChange={e=>onFile(e.target.files?.[0] ?? null)} className="text-sm" />
      {preview && <img src={preview} alt="prévia" className="max-h-48 rounded-lg border border-border object-contain" />}
      <input value={contexto} onChange={e=>setContexto(e.target.value)} placeholder="Contexto (opcional, ex.: aula de ciências)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      <Button onClick={submit} disabled={loading || !b64} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" />Descrever</>}
      </Button>
      {out && (
        <div className="space-y-2 text-sm">
          <div className="rounded-lg bg-accent/40 p-3">
            <div className="font-bold text-xs mb-1">Alt curto</div>{out.altCurto}
            <button onClick={()=>ouvir(out.altCurto)} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"><Volume2 className="h-3 w-3" />Ouvir</button>
          </div>
          <div className="rounded-lg bg-primary/5 p-3">
            <div className="font-bold text-xs mb-1">Descrição longa</div>{out.descricaoLonga}
            <button onClick={()=>ouvir(out.descricaoLonga)} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"><Volume2 className="h-3 w-3" />Ouvir</button>
          </div>
          {out.textoExtraido && (
            <div className="rounded-lg bg-accent/40 p-3">
              <div className="font-bold text-xs mb-1">Texto extraído</div>{out.textoExtraido}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Accessibility className="h-3 w-3" /> Útil para legendar materiais antes de enviar à turma.
      </div>
    </Card>
  );
}
