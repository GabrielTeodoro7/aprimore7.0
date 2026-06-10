import { useState, useRef, useEffect, useCallback } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Send, X, GripVertical, Sparkles, Check } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useAuth } from "@/lib/auth-store";
import { useStudents } from "@/lib/store";
import { Mascot, MASCOT_OPTIONS, useMascotChoice } from "@/components/Mascot";

type LinkSuggestion = { label: string; to: string };


function extractText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
}

function extractLinks(text: string): LinkSuggestion[] {
  const found = new Set<string>();
  const out: LinkSuggestion[] = [];
  const regex = /(\/(?:aluno|admin|turma|atividades|relatorios|comunicacao|configuracoes|agenda|avaliacoes|frequencia|mensagens|inclusao|ajuda|sentimentos|rotina|conquistas)(?:\/[\w\-$.]+)*)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const path = match[1].replace(/[.,;:!?)]$/, "");
    if (!found.has(path)) {
      found.add(path);
      out.push({ label: path, to: path });
    }
  }
  return out;
}

const POS_KEY = "aprimore.assistant.pos";

export function AIAssistant() {
  const { user } = useAuth();
  if (!user) return null;
  return <AIAssistantInner />;
}

function AIAssistantInner() {
  const { user } = useAuth();
  const { location } = useRouterState();
  const navigate = useNavigate();
  const { list: students } = useStudents();


  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  /* Floating position (persisted) */
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") return { x: 24, y: 24 };
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {/* noop */}
    return { x: 24, y: 24 };
  });
  const dragState = useRef<{ dragging: boolean; offX: number; offY: number; moved: boolean }>({
    dragging: false, offX: 0, offY: 0, moved: false,
  });

  /* Discover necessidade for current aluno by matching name */
  const necessidade = user?.role === "aluno"
    ? students.find((s) => s.nome.toLowerCase() === user.nome.toLowerCase())?.necessidade
    : undefined;

  const transport = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({
        profile: {
          role: user?.role,
          nome: user?.nome,
          necessidade,
        },
      }),
    }),
  );

  const { messages, sendMessage, status, error } = useChat({
    id: user?.id ?? "anon",
    transport: transport.current,
  });

  /* Greeting on first open */
  const greetedRef = useRef(false);
  useEffect(() => {
    if (!open || greetedRef.current || !user) return;
    greetedRef.current = true;
  }, [open, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, open]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!launcherRef.current) return;
    launcherRef.current.setPointerCapture(e.pointerId);
    const rect = launcherRef.current.getBoundingClientRect();
    dragState.current = {
      dragging: true,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragState.current.dragging) return;
    const newLeft = e.clientX - dragState.current.offX;
    const newTop = e.clientY - dragState.current.offY;
    const size = 64;
    const margin = 8;
    const maxX = window.innerWidth - size - margin;
    const maxY = window.innerHeight - size - margin;
    // store as distance from right/bottom so it stays anchored
    const x = Math.min(Math.max(margin, window.innerWidth - newLeft - size), maxX);
    const y = Math.min(Math.max(margin, window.innerHeight - newTop - size), maxY);
    if (Math.abs(newLeft - (window.innerWidth - pos.x - size)) > 3 ||
        Math.abs(newTop - (window.innerHeight - pos.y - size)) > 3) {
      dragState.current.moved = true;
    }
    setPos({ x, y });
  }, [pos.x, pos.y]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    try { launcherRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* noop */ }
    if (!dragState.current.moved) {
      setOpen((o) => !o);
    }
  }, [pos]);

  const [mascotId, setMascotId] = useMascotChoice();
  const [showPicker, setShowPicker] = useState(false);

  if (!user || location.pathname === "/login") return null;

  const suggestionsByRole: Record<string, string[]> = {
    aluno: ["Me ajude a me acalmar 🌬️", "Monte uma frase com imagens", "Explique a atividade em passos"],
    professor: ["Plano de aula adaptado para TEA nível 2", "Resuma a turma hoje", "Sugira atividades inclusivas"],
    admin: ["Quantos alunos têm dislexia?", "Liste professores inativos", "Resumo de logs da semana"],
  };

  function submit(text: string) {
    const t = text.trim();
    if (!t || status === "submitted" || status === "streaming") return;
    sendMessage({ text: t });
    setInput("");
  }

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <>
      <button
        ref={launcherRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label={open ? "Fechar assistente Aprimore" : "Abrir assistente Aprimore"}
        aria-expanded={open}
        style={{ right: pos.x, bottom: pos.y }}
        className="fixed z-50 flex h-16 w-16 cursor-grab touch-none select-none items-center justify-center rounded-full bg-gradient-to-br from-white to-[oklch(0.95_0.04_270)] shadow-[0_10px_30px_-8px_oklch(0.55_0.2_285/.55)] ring-2 ring-white transition active:cursor-grabbing hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {open ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <Mascot id={mascotId} size={60} mood={isBusy ? "thinking" : "happy"} />
        )}
        {!open && isBusy && (
          <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-[oklch(0.7_0.18_85)]" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Assistente Aprimore"
          style={{ right: pos.x, bottom: pos.y + 80 }}
          className="fixed z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95"
        >
          <header className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-[oklch(0.65_0.16_260)] to-[oklch(0.58_0.18_290)] p-4 text-white">
            <Mascot id={mascotId} size={36} mood={isBusy ? "thinking" : "happy"} />
            <div className="flex-1 leading-tight">
              <div className="text-sm font-bold">Assistente Aprimore</div>
              <div className="text-[11px] opacity-90">
                {isBusy ? "Pensando…" : `Olá, ${user.nome.split(" ")[0]}!`}
                {necessidade ? ` · modo ${necessidade}` : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPicker((s) => !s)}
              aria-label="Personalizar mascote"
              title="Trocar visual do assistente"
              className="rounded-full p-1.5 transition hover:bg-white/20"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <GripVertical className="h-4 w-4 opacity-60" aria-hidden />
          </header>

          {showPicker && (
            <div className="border-b border-border bg-[oklch(0.97_0.02_270)] p-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Escolha o visual do assistente
              </div>
              <div className="grid grid-cols-5 gap-2">
                {MASCOT_OPTIONS.map((opt) => {
                  const selected = opt.id === mascotId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => { setMascotId(opt.id); }}
                      aria-pressed={selected}
                      title={`${opt.nome} — ${opt.descricao}`}
                      className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition ${
                        selected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-transparent bg-white hover:border-primary/40"
                      }`}
                    >
                      <Mascot id={opt.id} size={40} mood="happy" />
                      <span className="text-[9px] font-semibold text-foreground">{opt.nome}</span>
                      {selected && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}


          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[oklch(0.985_0.005_260)] p-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-foreground shadow-sm">
                {user.role === "aluno"
                  ? `Oi, ${user.nome.split(" ")[0]}! 👋 Posso te ajudar com a sua rotina, atividades e como você está se sentindo. O que vamos fazer hoje?`
                  : user.role === "professor"
                  ? `Olá, ${user.nome}! Posso sugerir planos adaptados, resumir a turma ou criar relatórios. Por onde começamos?`
                  : `Olá, ${user.nome}! Pergunte sobre alunos, professores, logs ou relatórios.`}
              </div>
            )}
            {messages.map((m) => {
              const text = extractText(m);
              const links = m.role === "assistant" ? extractLinks(text) : [];
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-foreground"
                    }`}
                  >
                    {text || (isUser ? "" : "…")}
                    {links.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {links.map((l) => (
                          <button
                            key={l.to}
                            type="button"
                            onClick={() => { setOpen(false); navigate({ to: l.to }); }}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
                          >
                            Ir para {l.label} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isBusy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
                🤔 Desculpe, estou aprendendo… Quer tentar outra pergunta?
              </div>
            )}
          </div>

          <div className="border-t border-border bg-card p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggestionsByRole[user.role]?.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  disabled={isBusy}
                  className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-accent/70 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); submit(input); }}
              className="flex items-center gap-2"
            >
              <label htmlFor="ai-input" className="sr-only">Pergunte ao assistente</label>
              <input
                id="ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo…"
                disabled={isBusy}
                autoFocus
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
              />
              <button
                type="submit"
                aria-label="Enviar"
                disabled={isBusy || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
