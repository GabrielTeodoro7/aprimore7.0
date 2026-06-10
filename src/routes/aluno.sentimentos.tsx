import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, History, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { sentimentosCatalogo, useSentimentos, useAlunoPerfil } from "@/lib/student-store";
import { analisarSentimentos } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/aluno/sentimentos")({
  head: () => ({ meta: [{ title: "Como estou me sentindo — Aprimore" }] }),
  component: Sentimentos,
});

function Sentimentos() {
  const { list, registrar } = useSentimentos();
  const { addEstrelas } = useAlunoPerfil();

  const escolher = (s: { label: string; emoji: string }) => {
    registrar(s.label, s.emoji);
    addEstrelas(2);
    toast.success(`Obrigada por compartilhar! Você está se sentindo ${s.label.toLowerCase()} ${s.emoji}`);
  };

  return (
    <StudentShell
      title={
        <span className="flex items-center gap-3">
          <Link to="/aluno" className="rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-6 w-6" /></Link>
          Como estou me sentindo?
        </span>
      }
      subtitle="Toque no rostinho que mais combina com você agora."
    >
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {sentimentosCatalogo.map((s) => (
          <button
            key={s.id}
            onClick={() => escolher(s)}
            className="flex flex-col items-center gap-2 rounded-3xl p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            style={{ backgroundColor: `var(--stat-${s.tone}-soft)` }}
          >
            <span className="text-6xl">{s.emoji}</span>
            <span className="text-base font-bold text-foreground">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <History className="h-4 w-4" /> Como me senti recentemente
        </div>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda não há registros. Conte como você está se sentindo!</p>
        ) : (
          <ul className="space-y-2">
            {list.slice(0, 8).map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-xl bg-accent/40 p-3">
                <span className="text-2xl">{r.emoji}</span>
                <span className="flex-1 font-semibold text-foreground">{r.sentimento}</span>
                <span className="text-xs text-muted-foreground">{r.data}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnaliseIA />
    </StudentShell>
  );
}

function AnaliseIA() {
  const { list } = useSentimentos();
  const { perfil } = useAlunoPerfil();
  const fn = useServerFn(analisarSentimentos);
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<Awaited<ReturnType<typeof analisarSentimentos>> | null>(null);

  const submit = async () => {
    if (list.length === 0) return toast("Registre como você está antes!");
    setLoading(true);
    try {
      const r = await fn({ data: {
        alunoNome: perfil.nome ?? "amigo(a)",
        registros: list.slice(0, 20).map(x=>({ sentimento: x.sentimento, quando: x.data })),
      }});
      setOut(r);
    } catch (e) { toast.error("Erro", { description: String(e) }); }
    finally { setLoading(false); }
  };

  const toneByAlerta = { tranquilo: "bg-green-500/10 text-green-700", "atenção": "bg-yellow-500/10 text-yellow-700", alto: "bg-red-500/10 text-red-700" } as const;

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-base font-bold">
          <Sparkles className="h-5 w-5 text-primary" /> Como tem sido sua semana?
        </div>
        <Button onClick={submit} disabled={loading} size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analisar"}
        </Button>
      </div>
      {out && (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-1 font-semibold">Humor: {out.humorPredominante}</span>
            <span className="rounded-full bg-accent px-3 py-1">Tendência: {out.tendencia}</span>
            <span className={`rounded-full px-3 py-1 font-semibold ${toneByAlerta[out.nivelAlerta]}`}>Alerta: {out.nivelAlerta}</span>
          </div>
          <div className="rounded-xl bg-primary/5 p-4 text-base">{out.mensagemAluno}</div>
          <div className="rounded-xl border border-border p-4">
            <div className="font-bold mb-1">💡 Atividade para agora ({out.atividadeRegulacao.duracaoMinutos} min)</div>
            <div className="font-semibold">{out.atividadeRegulacao.titulo}</div>
            <div className="text-muted-foreground text-sm mt-1">{out.atividadeRegulacao.descricao}</div>
          </div>
          {out.alertaProfessor && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div><span className="font-bold">Para o(a) professor(a):</span> {out.alertaProfessor}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
