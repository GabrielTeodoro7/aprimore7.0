import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Heart, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { listarSentimentos } from "@/lib/sentimentos.functions";
import { analisarSentimentos } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import type { Student } from "@/lib/store";

const NEGATIVAS = new Set(["triste", "bravo", "preocupado", "com medo", "medo", "cansado", "ansioso", "frustrado"]);

type Registro = {
  id: string;
  aluno_id: string;
  emocao: string;
  emoji: string | null;
  intensidade: number | null;
  nota: string | null;
  created_at: string;
};

type AlunoResumo = {
  aluno: Student;
  registros: Registro[];
  negSeguidas: number;
  ultimo: Registro;
  nivel: "tranquilo" | "atencao" | "alto";
};

function nivelDe(neg: number): "tranquilo" | "atencao" | "alto" {
  if (neg >= 3) return "alto";
  if (neg >= 2) return "atencao";
  return "tranquilo";
}

export function SentimentAlertsPanel({ alunos }: { alunos: Student[] }) {
  const { data: registros = [], isLoading } = useQuery({
    queryKey: ["sentimentos", "turma"],
    queryFn: () => listarSentimentos({ data: { limit: 200 } }),
    staleTime: 30_000,
  });

  const resumos = useMemo<AlunoResumo[]>(() => {
    const byAluno = new Map<string, Registro[]>();
    for (const r of registros as Registro[]) {
      const arr = byAluno.get(r.aluno_id) ?? [];
      arr.push(r);
      byAluno.set(r.aluno_id, arr);
    }
    const out: AlunoResumo[] = [];
    for (const aluno of alunos) {
      const regs = byAluno.get(aluno.id);
      if (!regs || regs.length === 0) continue;
      let neg = 0;
      for (const r of regs) {
        if (NEGATIVAS.has(r.emocao.toLowerCase())) neg++;
        else break;
      }
      out.push({
        aluno,
        registros: regs,
        negSeguidas: neg,
        ultimo: regs[0],
        nivel: nivelDe(neg),
      });
    }
    out.sort((a, b) => b.negSeguidas - a.negSeguidas);
    return out;
  }, [registros, alunos]);

  const alertas = resumos.filter((r) => r.nivel !== "tranquilo");

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pink-100 p-2.5 text-pink-600 dark:bg-pink-950 dark:text-pink-300">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Alertas de bem-estar</h2>
            <p className="text-xs text-muted-foreground">
              Padrões emocionais recentes dos seus alunos — gerados a partir dos registros de sentimento.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {alertas.length} alerta{alertas.length === 1 ? "" : "s"}
        </span>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando registros…
        </div>
      ) : alertas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tudo tranquilo por aqui. Nenhum aluno com padrão emocional preocupante nos últimos registros. 💚
        </p>
      ) : (
        <ul className="space-y-3">
          {alertas.map((r) => (
            <AlertaItem key={r.aluno.id} resumo={r} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AlertaItem({ resumo }: { resumo: AlunoResumo }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState<Awaited<ReturnType<typeof analisarSentimentos>> | null>(null);
  const fn = useServerFn(analisarSentimentos);

  const cor = resumo.nivel === "alto"
    ? { bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-900", text: "text-red-700 dark:text-red-300" }
    : { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-900", text: "text-amber-700 dark:text-amber-300" };

  async function gerar() {
    setLoading(true);
    try {
      const res = await fn({
        data: {
          alunoNome: resumo.aluno.nome,
          registros: resumo.registros.slice(0, 20).map((r) => ({
            sentimento: `${r.emocao}${r.emoji ? ` ${r.emoji}` : ""}`,
            quando: new Date(r.created_at).toLocaleString("pt-BR"),
          })),
        },
      });
      setAnalise(res);
      setOpen(true);
    } catch (e) {
      toast.error("Não foi possível gerar a análise agora.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className={`rounded-2xl border ${cor.border} ${cor.bg} p-4`}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, var(--stat-${resumo.aluno.tone}), var(--stat-purple))` }}
        >
          {resumo.aluno.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{resumo.aluno.nome}</span>
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cor.text}`}>
              <AlertTriangle className="h-3 w-3" />
              {resumo.nivel === "alto" ? "Atenção alta" : "Acompanhar"}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {resumo.negSeguidas} registro{resumo.negSeguidas === 1 ? "" : "s"} difícil{resumo.negSeguidas === 1 ? "" : "eis"} seguido{resumo.negSeguidas === 1 ? "" : "s"}
            {" · "}último: {resumo.ultimo.emoji ?? ""} {resumo.ultimo.emocao}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={gerar} disabled={loading} className="shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span className="ml-1.5 hidden sm:inline">Analisar com IA</span>
        </Button>
        {analise && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-1.5 hover:bg-background/60"
            aria-label={open ? "Recolher" : "Expandir"}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {open && analise && (
        <div className="mt-4 space-y-3 rounded-xl bg-background/70 p-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-3">
            <Info label="Humor" value={analise.humorPredominante} />
            <Info label="Tendência" value={analise.tendencia} />
            <Info label="Nível" value={analise.nivelAlerta} />
          </div>
          {analise.alertaProfessor && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <strong className="block text-xs uppercase tracking-wide">Sugestão de acolhimento</strong>
              {analise.alertaProfessor}
            </div>
          )}
          <div>
            <strong className="block text-xs uppercase tracking-wide text-muted-foreground">Observações</strong>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-foreground">
              {analise.observacoes.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <strong className="block text-xs uppercase tracking-wide text-muted-foreground">
              Atividade sugerida ({analise.atividadeRegulacao.duracaoMinutos} min)
            </strong>
            <div className="font-semibold text-foreground">{analise.atividadeRegulacao.titulo}</div>
            <p className="text-muted-foreground">{analise.atividadeRegulacao.descricao}</p>
          </div>
          <p className="text-xs italic text-muted-foreground">
            “{analise.mensagemAluno}” — mensagem que você pode compartilhar com {resumo.aluno.nome.split(" ")[0]}.
          </p>
        </div>
      )}
    </li>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold capitalize text-foreground">{value}</div>
    </div>
  );
}
