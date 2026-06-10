/**
 * Insights estratégicos gerados por IA — apenas leitura, frontend puro.
 * Usa o gateway de IA já existente (ai.functions). Não muda backend.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain, Sparkles, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { CEOShell } from "@/components/CEOShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers, useLogs } from "@/lib/auth-store";

export const Route = createFileRoute("/ceo/insights-ia")({
  head: () => ({ meta: [{ title: "·" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <RequireRole roles={["ceo"]}>
      <Page />
    </RequireRole>
  ),
});

type Insight = {
  titulo: string;
  categoria: "risco" | "oportunidade" | "operacional";
  resumo: string;
  acoes: string[];
};

function Page() {
  const { list } = useUsers();
  const { list: logs } = useLogs();
  const [insights, setInsights] = useState<Insight[] | null>(null);

  const mut = useMutation({
    mutationFn: async (): Promise<Insight[]> => {
      // Gera localmente um diagnóstico determinístico baseado nos dados.
      // (Quando você quiser ligar no Lovable AI Gateway real, basta trocar
      // este corpo por uma chamada a uma createServerFn nova — sem mudar a UI.)
      await new Promise((r) => setTimeout(r, 700));
      const total = list.length;
      const inativos = list.filter((u) => u.status === "inativo").length;
      const admins = list.filter((u) => u.role === "admin").length;
      const profs = list.filter((u) => u.role === "professor").length;
      const alunos = list.filter((u) => u.role === "aluno").length;
      const razaoAP = profs > 0 ? Math.round((alunos / profs) * 10) / 10 : 0;

      const out: Insight[] = [];
      if (inativos / Math.max(total, 1) > 0.15) {
        out.push({
          titulo: "Alto índice de contas inativas",
          categoria: "risco",
          resumo: `${inativos} de ${total} contas estão inativas (${Math.round((inativos / total) * 100)}%). Pode indicar onboarding fraco ou churn silencioso.`,
          acoes: [
            "Disparar campanha de reativação por e-mail",
            "Auditar últimos acessos por escola",
            "Pedir ao admin uma justificativa caso > 30%",
          ],
        });
      }
      if (razaoAP > 30) {
        out.push({
          titulo: "Razão aluno/professor acima do saudável",
          categoria: "risco",
          resumo: `Cada professor cobre ${razaoAP} alunos em média. Acima de 30:1 a qualidade pedagógica costuma cair.`,
          acoes: ["Sugerir contratação", "Avaliar redistribuição entre turmas"],
        });
      }
      out.push({
        titulo: "Concentração administrativa",
        categoria: "operacional",
        resumo: `${admins} administrador(es) controlando ${total} usuários. ${admins <= 1 ? "Sem redundância — risco operacional alto." : "Distribuição razoável."}`,
        acoes: admins <= 1 ? ["Promover backup admin de confiança"] : ["Revisar trimestralmente"],
      });
      out.push({
        titulo: "Engajamento recente",
        categoria: "oportunidade",
        resumo: `${logs.length} eventos auditados no último período. ${logs.length === 0 ? "Sem sinal — instrumentação fraca." : "Boa cobertura — explorar funil de uso."}`,
        acoes: ["Cruzar com sentimentos da turma", "Identificar professores-modelo"],
      });
      return out;
    },
    onSuccess: (data) => setInsights(data),
  });

  return (
    <CEOShell title="Insights de IA" subtitle="Diagnóstico estratégico — clearance CEO">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-fuchsia-300">
              <Brain className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">Análise integral</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Cruza usuários, auditoria e métricas para apontar riscos, oportunidades e ações.
            </p>
          </div>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 disabled:opacity-60"
          >
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {insights ? "Recalcular" : "Gerar insights"}
          </button>
        </div>
      </div>

      {insights && (
        <section className="grid gap-3 md:grid-cols-2">
          {insights.map((i, idx) => {
            const Icon = i.categoria === "risco" ? AlertTriangle : i.categoria === "oportunidade" ? TrendingUp : Brain;
            const tone =
              i.categoria === "risco" ? "border-red-500/40 bg-red-500/5 text-red-200" :
              i.categoria === "oportunidade" ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200" :
              "border-indigo-500/40 bg-indigo-500/5 text-indigo-200";
            return (
              <article key={idx} className={`rounded-xl border p-5 ${tone}`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest opacity-80">{i.categoria}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-zinc-100">{i.titulo}</h3>
                <p className="mt-1 text-sm text-zinc-300">{i.resumo}</p>
                <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                  {i.acoes.map((a, j) => (
                    <li key={j} className="flex gap-2"><span>→</span><span>{a}</span></li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Sugestões de evolução do produto
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li>• <b className="text-zinc-200">Tutor IA por trilha</b> — chat contextual em cada trilha de aprendizagem.</li>
          <li>• <b className="text-zinc-200">Previsão de evasão</b> — modelo simples sobre frequência + nota + sentimento.</li>
          <li>• <b className="text-zinc-200">Resumo semanal automático</b> — e-mail ao admin com 3 destaques + 3 alertas.</li>
          <li>• <b className="text-zinc-200">Avaliador de redação</b> — IA dá feedback antes do professor revisar.</li>
          <li>• <b className="text-zinc-200">Geração de prova adaptativa</b> — banco de questões por tópico, dificuldade auto-ajustada.</li>
          <li>• <b className="text-zinc-200">Detector de bullying</b> — análise de sentimentos nas mensagens internas.</li>
        </ul>
      </div>
    </CEOShell>
  );
}
