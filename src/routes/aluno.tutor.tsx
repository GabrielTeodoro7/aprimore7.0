import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Sparkles, Loader2, Trash2, Lightbulb, ArrowRight, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { useAuth } from "@/lib/auth-store";
import { tutorResponder } from "@/lib/ai.functions";
import { useVoiceIO } from "@/hooks/useVoiceIO";

export const Route = createFileRoute("/aluno/tutor")({
  head: () => ({ meta: [{ title: "Tutor IA — Aprimore" }] }),
  component: TutorPage,
});

type Msg = { role: "user" | "assistant"; content: string; sugestoes?: string[]; proximoPasso?: string };

function storageKey(userId?: string) {
  return `aprimore.tutor.${userId ?? "anon"}`;
}

function TutorPage() {
  const { user } = useAuth();
  const fn = useServerFn(tutorResponder);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [autoFalar, setAutoFalar] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const voice = useVoiceIO({
    onTranscript: (t) => enviar(t),
  });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(user?.id));
      if (raw) setMsgs(JSON.parse(raw));
    } catch { /* noop */ }
  }, [user?.id]);

  // Persist
  useEffect(() => {
    try { localStorage.setItem(storageKey(user?.id), JSON.stringify(msgs)); } catch { /* noop */ }
  }, [msgs, user?.id]);

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  async function enviar(texto?: string) {
    const txt = (texto ?? input).trim();
    if (!txt || loading) return;
    setInput("");
    setErro(null);
    const userMsg: Msg = { role: "user", content: txt };
    const novaHist = [...msgs, userMsg];
    setMsgs(novaHist);
    setLoading(true);
    try {
      const r = await fn({
        data: {
          necessidade: "",
          serie: user?.turma ?? "",
          historico: novaHist.slice(-12).map(m => ({ role: m.role, content: m.content })),
          mensagem: txt,
        },
      });
      const resposta = { role: "assistant" as const, content: r.resposta, sugestoes: r.sugestoes, proximoPasso: r.proximoPasso };
      setMsgs([...novaHist, resposta]);
      if (autoFalar) voice.speak(r.resposta);
    } catch (e) {
      console.error("[tutor]", e);
      setErro("🤔 Ops! Estou com dificuldade pra responder agora. Tente perguntar de outro jeito em alguns segundos.");
    } finally { setLoading(false); }
  }

  function limpar() {
    if (confirm("Apagar toda a conversa com o tutor?")) {
      setMsgs([]);
      try { localStorage.removeItem(storageKey(user?.id)); } catch { /* noop */ }
    }
  }

  const sugestoesIniciais = [
    "Me explica frações como se eu tivesse 9 anos",
    "Como faço para decorar a tabuada sem ficar com sono?",
    "Me ajuda a entender o que é fotossíntese",
    "Quero treinar interpretação de texto",
  ];

  return (
    <StudentShell>
      <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-4xl flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Tutor IA</h1>
              <p className="text-sm text-muted-foreground">Tira dúvidas, ensina passo a passo, lembra de tudo que vocês conversaram.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {voice.supported.tts && (
              <button
                onClick={() => { setAutoFalar((v) => !v); if (autoFalar) voice.cancel(); }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${autoFalar ? "border-primary bg-primary/10 text-primary" : "border-border bg-white text-muted-foreground hover:text-primary"}`}
                aria-pressed={autoFalar}
                title={autoFalar ? "Desativar leitura em voz alta" : "Ler as respostas em voz alta"}
              >
                {autoFalar ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                {autoFalar ? "Lendo" : "Ouvir"}
              </button>
            )}
            {msgs.length > 0 && (
              <button onClick={limpar} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Limpar
              </button>
            )}
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto rounded-3xl border border-border bg-gradient-to-b from-white to-[oklch(0.98_0.02_240)] p-4 md:p-6">
          {msgs.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-xl">
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="mt-4 text-xl font-extrabold">Oi {user?.nome?.split(" ")[0] ?? "estudante"}! 👋</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Sou seu tutor pessoal. Pode me perguntar qualquer coisa de qualquer matéria — vou te ajudar a entender, não só dar a resposta.
              </p>
              <div className="mt-6 grid w-full max-w-md gap-2">
                {sugestoesIniciais.map((s) => (
                  <button key={s} onClick={() => enviar(s)} className="rounded-xl border border-border bg-white px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                    💡 {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${m.role === "user" ? "rounded-3xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground shadow" : ""}`}>
                {m.role === "assistant" ? (
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-white">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{m.content}</div>
                      {voice.supported.tts && (
                        <button
                          onClick={() => (voice.speaking ? voice.cancel() : voice.speak(m.content))}
                          className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                          aria-label={voice.speaking ? "Parar leitura" : "Ouvir esta resposta"}
                          title={voice.speaking ? "Parar leitura" : "Ouvir esta resposta"}
                        >
                          {voice.speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    {m.proximoPasso && (
                      <div className="ml-11 mt-3 flex items-start gap-2 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-3 text-sm">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div><strong className="text-amber-700">Próximo passo:</strong> {m.proximoPasso}</div>
                      </div>
                    )}
                    {m.sugestoes && m.sugestoes.length > 0 && (
                      <div className="ml-11 mt-3 flex flex-wrap gap-2">
                        {m.sugestoes.map((s) => (
                          <button key={s} onClick={() => enviar(s)} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10">
                            {s} <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-muted-foreground shadow">
                  <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
                </div>
              </div>
            </div>
          )}

          {erro && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">{erro}</div>}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="mt-4 flex items-end gap-2 rounded-3xl border border-border bg-white p-2 shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
            }}
            placeholder="Pergunta o que você quiser…"
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          {voice.supported.stt && (
            <button
              onClick={() => (voice.listening ? voice.stop() : voice.start())}
              disabled={loading}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow transition disabled:opacity-40 ${voice.listening ? "animate-pulse bg-rose-500 text-white" : "bg-white text-primary border border-border hover:bg-primary/5"}`}
              aria-label={voice.listening ? "Parar gravação" : "Falar com o tutor"}
              title={voice.listening ? "Estou ouvindo… clique para parar" : "Falar com o tutor"}
            >
              {voice.listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
          <button
            onClick={() => enviar()}
            disabled={loading || !input.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow transition hover:brightness-110 disabled:opacity-40"
            aria-label="Enviar"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </StudentShell>
  );
}
