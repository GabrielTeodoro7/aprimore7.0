import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { HeartHandshake, FileText, BookOpen, Users, Sparkles, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { useStudents } from "@/lib/store";
import { sugerirAdaptacoes } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/inclusao")({
  head: () => ({ meta: [{ title: "Inclusão — Aprimore" }] }),
  component: Inclusao,
});

const recursos = [
  { icon: BookOpen, title: "Material adaptado", desc: "Banco de atividades com versões para diferentes necessidades.", tone: "blue" as const },
  { icon: HeartHandshake, title: "Plano educacional individual", desc: "Modelos prontos para PEI por aluno.", tone: "purple" as const },
  { icon: Users, title: "Estratégias por necessidade", desc: "Dicas práticas para TEA, TDAH, dislexia e outros.", tone: "green" as const },
  { icon: FileText, title: "Relatórios pedagógicos", desc: "Gere relatórios com base nas adaptações registradas.", tone: "orange" as const },
];

function Inclusao() {
  const { list } = useStudents();
  const adaptados = list.filter((s) => s.tag === "Adaptado");
  return (
    <DashboardShell title="Inclusão" subtitle="Recursos e acompanhamento dos alunos com necessidades específicas.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recursos.map((r) => (
          <div key={r.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ backgroundColor: `var(--stat-${r.tone}-soft)`, color: `var(--stat-${r.tone})` }}>
              <r.icon className="h-6 w-6" />
            </div>
            <div className="mt-3 font-bold text-foreground">{r.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" /> Alunos com adaptações ({adaptados.length})
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {adaptados.map((a) => (
            <Link key={a.id} to="/turma/$id" params={{ id: a.id }} className="rounded-xl border border-border p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, var(--stat-${a.tone}), var(--stat-purple))` }}>
                  {a.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-foreground">{a.nome}</div>
                  <div className="text-xs text-muted-foreground">{a.necessidade ?? "Plano em revisão"}</div>
                </div>
              </div>
              {a.observacoes && <p className="mt-3 text-xs text-muted-foreground">{a.observacoes}</p>}
            </Link>
          ))}
        </div>
      </div>
      <AdaptacoesIA />
    </DashboardShell>
  );
}

function AdaptacoesIA() {
  const fn = useServerFn(sugerirAdaptacoes);
  const [necessidade, setNecessidade] = useState("TEA grau 1");
  const [contexto, setContexto] = useState("");
  const [materia, setMateria] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<Awaited<ReturnType<typeof sugerirAdaptacoes>> | null>(null);

  const submit = async () => {
    if (!necessidade.trim()) return toast.error("Informe a necessidade");
    setLoading(true);
    try {
      const r = await fn({ data: { necessidade, contexto, materia } });
      setOut(r);
    } catch (e) { toast.error("Erro ao gerar", { description: String(e) }); }
    finally { setLoading(false); }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-base font-bold">
        <Wand2 className="h-5 w-5 text-primary" /> Adaptações pedagógicas com IA
      </div>
      <p className="text-sm text-muted-foreground">Gere um plano prático de adaptações para um(a) aluno(a) com necessidade específica.</p>
      <div className="grid gap-3 md:grid-cols-3">
        <div><Label>Necessidade</Label><Input value={necessidade} onChange={e=>setNecessidade(e.target.value)} placeholder="TEA, TDAH, dislexia..." /></div>
        <div><Label>Matéria (opcional)</Label><Input value={materia} onChange={e=>setMateria(e.target.value)} /></div>
        <div className="md:col-span-1"><Label>Contexto (opcional)</Label><Input value={contexto} onChange={e=>setContexto(e.target.value)} placeholder="Ex.: dificuldade de atenção" /></div>
      </div>
      <Button onClick={submit} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" />Gerar adaptações</>}
      </Button>
      {out && (
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <div className="rounded-lg bg-primary/5 p-3 md:col-span-2"><div className="font-bold mb-1">Resumo</div>{out.resumo}</div>
          <Block title="Adaptações em sala" items={out.adaptacoesSala} />
          <Block title="Estratégias de comunicação" items={out.estrategiasComunicacao} />
          <Block title="Materiais sugeridos" items={out.materiaisSugeridos} />
          <Block title="Como avaliar" items={out.comoAvaliar} />
          {out.sinalAlerta.length>0 && <Block title="Sinais de alerta" items={out.sinalAlerta} tone="destructive" />}
          {out.recursosFamilia.length>0 && <Block title="Conversa com a família" items={out.recursosFamilia} />}
        </div>
      )}
    </Card>
  );
}

function Block({ title, items, tone }: { title: string; items: string[]; tone?: "destructive" }) {
  return (
    <div className={`rounded-lg p-3 ${tone === "destructive" ? "bg-destructive/5 border border-destructive/30" : "bg-accent/40"}`}>
      <div className="font-bold mb-1">{title}</div>
      <ul className="list-disc pl-5 space-y-0.5">{items.map((x,i)=><li key={i}>{x}</li>)}</ul>
    </div>
  );
}
