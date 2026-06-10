import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, BookOpen, ClipboardCheck, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { gerarPlanoAula, feedbackAvaliacao, resumoTurma } from "@/lib/ai.functions";
import { useStudents } from "@/lib/store";

export const Route = createFileRoute("/professor/ia")({
  head: () => ({ meta: [{ title: "Central de IA do Professor — Aprimore" }] }),
  component: ProfessorIA,
});

function ProfessorIA() {
  return (
    <DashboardShell
      title="Central de IA do Professor"
      subtitle="Plano de aula adaptado, feedback de avaliação e resumo da turma."
    >
      <Tabs defaultValue="plano" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="plano" className="gap-2 py-3"><BookOpen className="h-4 w-4" /> Plano de aula</TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2 py-3"><ClipboardCheck className="h-4 w-4" /> Feedback</TabsTrigger>
          <TabsTrigger value="resumo" className="gap-2 py-3"><Users className="h-4 w-4" /> Resumo da turma</TabsTrigger>
        </TabsList>
        <TabsContent value="plano" className="mt-6"><PlanoAulaTab /></TabsContent>
        <TabsContent value="feedback" className="mt-6"><FeedbackTab /></TabsContent>
        <TabsContent value="resumo" className="mt-6"><ResumoTab /></TabsContent>
      </Tabs>
    </DashboardShell>
  );
}

function PlanoAulaTab() {
  const fn = useServerFn(gerarPlanoAula);
  const [materia, setMateria] = useState("Matemática");
  const [tema, setTema] = useState("");
  const [serie, setSerie] = useState("5º ano");
  const [duracao, setDuracao] = useState(50);
  const [necessidades, setNecessidades] = useState("TEA, TDAH");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<Awaited<ReturnType<typeof gerarPlanoAula>> | null>(null);

  const submit = async () => {
    if (!tema.trim()) return toast.error("Informe o tema da aula");
    setLoading(true);
    try {
      const r = await fn({ data: {
        materia, tema, serie, duracaoMinutos: duracao,
        necessidades: necessidades.split(",").map(s => s.trim()).filter(Boolean),
      }});
      setOut(r);
    } catch (e) { toast.error("Erro ao gerar plano", { description: String(e) }); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Matéria</Label><Input value={materia} onChange={e=>setMateria(e.target.value)} /></div>
          <div><Label>Série</Label><Input value={serie} onChange={e=>setSerie(e.target.value)} /></div>
        </div>
        <div><Label>Tema</Label><Input value={tema} onChange={e=>setTema(e.target.value)} placeholder="Ex.: frações equivalentes" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Duração (min)</Label><Input type="number" value={duracao} onChange={e=>setDuracao(+e.target.value)} /></div>
          <div><Label>Necessidades na turma</Label><Input value={necessidades} onChange={e=>setNecessidades(e.target.value)} placeholder="TEA, dislexia..." /></div>
        </div>
        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" />Gerar plano</>}
        </Button>
      </Card>
      <Card className="p-5">
        {!out && <p className="text-sm text-muted-foreground">O plano gerado aparecerá aqui.</p>}
        {out && (
          <div className="space-y-4 text-sm">
            <h3 className="text-lg font-bold">{out.titulo}</h3>
            <Section title="Objetivos (BNCC)" items={out.objetivosBNCC} />
            <Section title="Competências" items={out.competencias} />
            <div>
              <div className="font-bold mb-1">Etapas</div>
              <ul className="space-y-1">
                {out.etapas.map((e,i)=>(
                  <li key={i} className="rounded-lg bg-accent/40 p-2">
                    <span className="font-semibold">{e.nome}</span> <Badge variant="secondary">{e.minutos}min</Badge>
                    <div className="text-muted-foreground mt-1">{e.descricao}</div>
                  </li>
                ))}
              </ul>
            </div>
            <Section title="Materiais" items={out.recursosMateriais} />
            {out.adaptacoesInclusivas.length>0 && (
              <div>
                <div className="font-bold mb-1">Adaptações inclusivas</div>
                <ul className="space-y-1">
                  {out.adaptacoesInclusivas.map((a,i)=>(<li key={i} className="rounded-lg bg-primary/5 p-2"><span className="font-semibold">{a.necessidade}:</span> {a.adaptacao}</li>))}
                </ul>
              </div>
            )}
            <div><span className="font-bold">Avaliação:</span> {out.avaliacao}</div>
            {out.licaoDeCasa && <div><span className="font-bold">Lição de casa:</span> {out.licaoDeCasa}</div>}
          </div>
        )}
      </Card>
    </div>
  );
}

function FeedbackTab() {
  const fn = useServerFn(feedbackAvaliacao);
  const { list } = useStudents();
  const [aluno, setAluno] = useState(list[0]?.nome ?? "");
  const [texto, setTexto] = useState("");
  const [criterios, setCriterios] = useState("clareza, coesão, ortografia, argumentação");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<Awaited<ReturnType<typeof feedbackAvaliacao>> | null>(null);

  const submit = async () => {
    if (!texto.trim()) return toast.error("Cole a resposta do aluno");
    const a = list.find(s=>s.nome===aluno);
    setLoading(true);
    try {
      const r = await fn({ data: { alunoNome: aluno || "Aluno", necessidade: a?.necessidade ?? "", textoAluno: texto, criterios }});
      setOut(r);
    } catch (e) { toast.error("Erro", { description: String(e) }); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5 space-y-3">
        <div><Label>Aluno</Label>
          <select value={aluno} onChange={e=>setAluno(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {list.map(s=>(<option key={s.id} value={s.nome}>{s.nome}{s.necessidade?` — ${s.necessidade}`:""}</option>))}
          </select>
        </div>
        <div><Label>Critérios</Label><Input value={criterios} onChange={e=>setCriterios(e.target.value)} /></div>
        <div><Label>Resposta do aluno</Label><Textarea rows={8} value={texto} onChange={e=>setTexto(e.target.value)} placeholder="Cole aqui o texto/resposta..." /></div>
        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" />Gerar feedback</>}
        </Button>
      </Card>
      <Card className="p-5">
        {!out && <p className="text-sm text-muted-foreground">O feedback aparecerá aqui.</p>}
        {out && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="font-bold">Nota sugerida</span><Badge>{out.notaSugerida.toFixed(1)}</Badge></div>
            <div className="rounded-lg bg-primary/5 p-3"><div className="font-bold mb-1">Para o aluno</div>{out.feedbackAluno}</div>
            <Section title="Pontos fortes" items={out.pontosFortes} />
            <Section title="Pontos a melhorar" items={out.pontosMelhoria} />
            <div className="rounded-lg bg-accent/40 p-3"><div className="font-bold mb-1">Para o(a) professor(a)</div>{out.comentarioProfessor}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

function ResumoTab() {
  const fn = useServerFn(resumoTurma);
  const { list } = useStudents();
  const [periodo, setPeriodo] = useState("últimas duas semanas");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<Awaited<ReturnType<typeof resumoTurma>> | null>(null);

  const submit = async () => {
    setLoading(true);
    try {
      const r = await fn({ data: {
        turmaNome: "Minha turma",
        periodo,
        alunos: list.map(s=>({ nome: s.nome, media: s.media, frequencia: s.freq, tag: s.tag, necessidade: s.necessidade ?? "" })),
      }});
      setOut(r);
    } catch (e) { toast.error("Erro", { description: String(e) }); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="p-5 space-y-3">
        <div><Label>Período</Label><Input value={periodo} onChange={e=>setPeriodo(e.target.value)} /></div>
        <div className="text-xs text-muted-foreground">{list.length} alunos serão analisados.</div>
        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" />Gerar resumo</>}
        </Button>
      </Card>
      <Card className="p-5">
        {!out && <p className="text-sm text-muted-foreground">O resumo aparecerá aqui.</p>}
        {out && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-primary/5 p-3"><div className="font-bold mb-1">Panorama</div>{out.panorama}</div>
            <Section title="Destaques positivos" items={out.destaquesPositivos} />
            {out.alertas.length>0 && (
              <div>
                <div className="font-bold mb-1">Alertas individuais</div>
                <ul className="space-y-2">
                  {out.alertas.map((a,i)=>(
                    <li key={i} className="rounded-lg border border-destructive/30 bg-destructive/5 p-2">
                      <div className="font-semibold">{a.aluno}</div>
                      <div className="text-muted-foreground">{a.motivo}</div>
                      <div className="mt-1"><span className="font-semibold">Sugestão:</span> {a.sugestao}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Section title="Recomendações gerais" items={out.recomendacoesGerais} />
            <div className="rounded-lg bg-accent/40 p-3"><div className="font-bold mb-1">Mensagem para a coordenação</div>{out.mensagemCoordenacao}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="font-bold mb-1">{title}</div>
      <ul className="list-disc pl-5 space-y-0.5">{items.map((x,i)=><li key={i}>{x}</li>)}</ul>
    </div>
  );
}
