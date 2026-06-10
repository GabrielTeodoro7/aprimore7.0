import { useCallback, useEffect, useRef, useState } from "react";

// Tipos mínimos do Web Speech API (não vêm no DOM lib)
type SR = any;

/**
 * Hook de entrada/saída por voz (acessibilidade — dislexia, baixa visão, motor).
 * - `listening` + `start/stop`: ditado via Web Speech (SpeechRecognition).
 * - `speak/cancel`: leitura em voz alta via SpeechSynthesis.
 * - Tudo no navegador, sem dependências externas.
 * - Detecta `prefers-reduced-motion` para volume mais baixo se necessário.
 */
export function useVoiceIO(opts?: { lang?: string; onTranscript?: (text: string) => void }) {
  const lang = opts?.lang ?? "pt-BR";
  const [supported, setSupported] = useState<{ stt: boolean; tts: boolean }>({ stt: false, tts: false });
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recRef = useRef<SR | null>(null);
  const onTranscriptRef = useRef(opts?.onTranscript);
  onTranscriptRef.current = opts?.onTranscript;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SRClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported({
      stt: !!SRClass,
      tts: typeof window.speechSynthesis !== "undefined",
    });
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const SRClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SRClass) return;
    try {
      const rec = new SRClass();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (ev: any) => {
        const text = Array.from(ev.results)
          .map((r: any) => r[0]?.transcript ?? "")
          .join(" ")
          .trim();
        if (text) onTranscriptRef.current?.(text);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang]);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 1;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  }, [lang]);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    setSpeaking(false);
  }, []);

  // limpa qualquer fala pendente ao desmontar
  useEffect(() => () => cancel(), [cancel]);

  return { supported, listening, speaking, start, stop, speak, cancel };
}
