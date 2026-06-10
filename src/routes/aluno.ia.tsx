import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, BookOpen, Brain, LineChart, CheckCircle2, XCircle, Lightbulb, Loader2 } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { useAlunoPerfil } from "@/lib/student-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { gerarPlanoEstudos, gerarQuiz, analisarDesempenho } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/aluno/ia")({
  head: () => ({ meta: [{ title: "Aprimore — Central de IA" }] }),
  component: AlunoIA,
});

function AlunoIA() {
  const { perfil } = useAlunoPerfil();
  return (
    <StudentShell
      title={<><Sparkles className="inline h-7 w-7 text-primary" /> Central de IA</>}
      subtitle="Ferramentas inteligentes para estudar do seu jeito"
    >
      <Tabs defaultValue="plano" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="plano" className="gap-2 py-3"><BookOpen className="h-4 w-4" /> Plano de estudos</TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2 py-3"><Brain className="h-4 w-4" /> Quiz adaptativo</TabsTrigger>
          <TabsTrigger value="analise" className="gap-2 py-3"><LineChart className="h-4 w-4" /> Análise</TabsTrigger>
        </TabsList>
        <TabsContent value="plano" className="mt-6"><PlanoTab nome={perfil.nome} /></TabsContent>
        <TabsContent value="quiz" className="mt-6"><QuizTab /></TabsContent>
        <TabsContent value="analise" className="mt-6"><AnaliseTab nome={perfil.nome} /></TabsContent>
      </Tabs>
    </StudentShell>
  );
}

// ---------- Plano ----------
function PlanoTab({ nome }: { nome: string }) {
  const fn = useServerFn(gerarPlanoEstudos);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Awaited<ReturnType<typeof fn>> | null>(null);
  const [form, setForm] = useState({ materia: "Matemática", objetivo: "", necessidade: "", dias: 3, minutos: 30 });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.objetivo.trim()) return toast.error("Diga seu objetivo");
    setLoading(true);
    try {
      const r = await fn({ data: { alunoNome: nome, materia: form.materia, objetivo: form.objetivo, necessidade: form.necessidade, diasPorSemana: form.dias, minutosPorDia: form.minutos } });
      setRes(r);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar plano");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-lg">Monte seu plano</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <div><Label>Matéria</Label><Input value={form.materia} onChange={e => setForm({ ...form, materia: e.target.value })} /></div>
          <div><Label>Seu objetivo</Label><Textarea rows={3} placeholder="Ex: Aprender frações e melhorar na prova" value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} /></div>
          <div><Label>Alguma dificuldade? (opcional)</Label><Input placeholder="TEA, TDAH, dislexia..." value={form.necessidade} onChange={e => setForm({ ...form, necessidade: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dias/semana</Label><Input type="number" min={1} max={7} value={form.dias} onChange={e => setForm({ ...form, dias: +e.target.value })} /></div>
            <div><Label>Minutos/dia</Label><Input type="number" min={10} max={180} value={form.minutos} onChange={e => setForm({ ...form, minutos: +e.target.value })} /></div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Gerando...</> : <><Sparkles className="h-4 w-4 mr-2" /> Gerar plano</>}
          </Button>
        </form>
      </Card>
      <div>
        {!res && !loading && <EmptyState icon={BookOpen} text="Preencha ao lado e a IA monta seu plano personalizado" />}
        {loading && <SkeletonBlock />}
        {res && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold">{res.titulo}</h2>
              <p className="text-muted-foreground mt-1">{res.resumo}</p>
              <Badge className="mt-2">{res.duracaoSemanas} semanas</Badge>
            </div>
            <div className="space-y-4">
              {res.semanas.map(s => (
                <div key={s.semana} className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold">Semana {s.semana}: {s.foco}</h4>
                  <ul className="mt-2 space-y-1">
                    {s.sessoes.map((ses, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <Badge variant="outline" className="shrink-0">{ses.dia}</Badge>
                        <span><strong>{ses.tema}</strong> — {ses.atividade} <em className="text-muted-foreground">({ses.minutos}min)</em></span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-accent/50 rounded-xl p-4">
              <h4 className="font-bold mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Dicas para você</h4>
              <ul className="space-y-1 text-sm">{res.dicasAdaptacao.map((d, i) => <li key={i}>• {d}</li>)}</ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------- Quiz ----------
function QuizTab() {
  const fn = useServerFn(gerarQuiz);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Awaited<ReturnType<typeof fn>> | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState({ materia: "Matemática", tema: "", nivel: "média" as "fácil" | "média" | "desafio", quantidade: 5, necessidade: "" });

  const onGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tema.trim()) return toast.error("Digite o tema");
    setLoading(true); setRevealed(false); setAnswers({}); setShowHint({});
    try {
      const r = await fn({ data: form });
      setQuiz(r);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally { setLoading(false); }
  };

  const acertos = quiz ? quiz.questoes.filter((q, i) => answers[i] === q.correta).length : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-lg">Gere um quiz</h3>
        <form onSubmit={onGenerate} className="space-y-3">
          <div><Label>Matéria</Label><Input value={form.materia} onChange={e => setForm({ ...form, materia: e.target.value })} /></div>
          <div><Label>Tema</Label><Input placeholder="Ex: Frações, Verbos, Sistema solar" value={form.tema} onChange={e => setForm({ ...form, tema: e.target.value })} /></div>
          <div><Label>Nível</Label>
            <div className="flex gap-2 mt-1">
              {(["fácil", "média", "desafio"] as const).map(n => (
                <Button key={n} type="button" size="sm" variant={form.nivel === n ? "default" : "outline"} onClick={() => setForm({ ...form, nivel: n })}>{n}</Button>
              ))}
            </div>
          </div>
          <div><Label>Quantas questões</Label><Input type="number" min={3} max={10} value={form.quantidade} onChange={e => setForm({ ...form, quantidade: +e.target.value })} /></div>
          <div><Label>Alguma dificuldade?</Label><Input placeholder="TEA, TDAH, dislexia..." value={form.necessidade} onChange={e => setForm({ ...form, necessidade: e.target.value })} /></div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Gerando...</> : <><Brain className="h-4 w-4 mr-2" /> Criar quiz</>}
          </Button>
        </form>
      </Card>
      <div>
        {!quiz && !loading && <EmptyState icon={Brain} text="A IA cria questões adaptadas ao seu nível e necessidade" />}
        {loading && <SkeletonBlock />}
        {quiz && (
          <Card className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{quiz.titulo}</h2>
                <Badge className="mt-1">Nível {quiz.nivel}</Badge>
              </div>
              {revealed && <Badge variant="outline" className="text-base px-3 py-1">{acertos}/{quiz.questoes.length}</Badge>}
            </div>
            <div className="space-y-5">
              {quiz.questoes.map((q, qi) => (
                <div key={qi} className="border rounded-xl p-4 space-y-3">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{qi + 1}. {q.enunciado}</p>
                    {!revealed && (
                      <Button size="sm" variant="ghost" onClick={() => setShowHint({ ...showHint, [qi]: !showHint[qi] })}>
                        <Lightbulb className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {showHint[qi] && !revealed && <p className="text-xs bg-amber-50 dark:bg-amber-950/30 p-2 rounded">💡 {q.dica}</p>}
                  <div className="grid gap-2">
                    {q.alternativas.map((a, ai) => {
                      const selected = answers[qi] === ai;
                      const correct = revealed && ai === q.correta;
                      const wrong = revealed && selected && ai !== q.correta;
                      return (
                        <button key={ai} type="button" disabled={revealed} onClick={() => setAnswers({ ...answers, [qi]: ai })}
                          className={`text-left text-sm rounded-lg border-2 p-3 transition ${
                            correct ? "border-green-500 bg-green-50 dark:bg-green-950/30" :
                            wrong ? "border-red-500 bg-red-50 dark:bg-red-950/30" :
                            selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}>
                          <span className="font-bold mr-2">{String.fromCharCode(65 + ai)})</span>{a}
                          {correct && <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />}
                          {wrong && <XCircle className="inline h-4 w-4 ml-2 text-red-600" />}
                        </button>
                      );
                    })}
                  </div>
                  {revealed && <p className="text-sm bg-accent/50 p-3 rounded">📚 {q.explicacao}</p>}
                </div>
              ))}
            </div>
            {!revealed ? (
              <Button onClick={() => setRevealed(true)} disabled={Object.keys(answers).length < quiz.questoes.length} className="w-full" size="lg">
                Ver resultado
              </Button>
            ) : (
              <Button onClick={() => { setRevealed(false); setAnswers({}); }} variant="outline" className="w-full">Refazer</Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------- Análise ----------
function AnaliseTab({ nome }: { nome: string }) {
  const fn = useServerFn(analisarDesempenho);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Awaited<ReturnType<typeof fn>> | null>(null);
  const [notas, setNotas] = useState([
    { materia: "Português", nota: 7 },
    { materia: "Matemática", nota: 6 },
    { materia: "Ciências", nota: 8 },
  ]);
  const [freq, setFreq] = useState(90);
  const [obs, setObs] = useState("");
  const [need, setNeed] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // @ts-ignore - Temporary bypass for return type mismatch during transition
      const r = await fn({ data: { alunoNome: nome, notas, frequencia: freq, observacoes: obs, necessidade: need } });
      setRes(r);
    } catch (err) {
      console.error("Erro na análise:", err);
      toast.error("Erro na análise. Verifique os dados e tente novamente.");
    } finally { setLoading(false); }
  };

  const cores: Record<string, string> = {
    alta: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200",
    "média": "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
    baixa: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-lg">Seus dados</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Notas por matéria</Label>
            {notas.map((n, i) => (
              <div key={i} className="flex gap-2">
                <Input value={n.materia} onChange={e => { const c = [...notas]; c[i].materia = e.target.value; setNotas(c); }} />
                <Input type="number" min={0} max={10} step={0.1} className="w-20" value={n.nota} onChange={e => { const c = [...notas]; c[i].nota = +e.target.value; setNotas(c); }} />
              </div>
            ))}
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setNotas([...notas, { materia: "", nota: 7 }])}>+ Matéria</Button>
              {notas.length > 1 && <Button type="button" size="sm" variant="outline" onClick={() => setNotas(notas.slice(0, -1))}>− Remover</Button>}
            </div>
          </div>
          <div><Label>Frequência (%)</Label><Input type="number" min={0} max={100} value={freq} onChange={e => setFreq(+e.target.value)} /></div>
          <div><Label>Necessidade (opcional)</Label><Input placeholder="TEA, TDAH..." value={need} onChange={e => setNeed(e.target.value)} /></div>
          <div><Label>Observações</Label><Textarea rows={2} value={obs} onChange={e => setObs(e.target.value)} /></div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analisando...</> : <><LineChart className="h-4 w-4 mr-2" /> Analisar</>}
          </Button>
        </form>
      </Card>
      <div>
        {!res && !loading && <EmptyState icon={LineChart} text="Receba um diagnóstico com pontos fortes, atenção e plano de ação" />}
        {loading && <SkeletonBlock />}
        {res && (
          <Card className="p-6 space-y-5">
            <div>
              <h3 className="text-xl font-bold mb-2">Resumo</h3>
              <p className="text-muted-foreground">{res.resumoExecutivo}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4">
                <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">✅ Pontos fortes</h4>
                <ul className="space-y-1 text-sm">{res.pontosFortes.map((p, i) => <li key={i}>• {p}</li>)}</ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
                <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">⚠️ Atenção</h4>
                <ul className="space-y-1 text-sm">{res.pontosAtencao.map((p, i) => <li key={i}>• {p}</li>)}</ul>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-2">🎯 Recomendações</h4>
              <div className="space-y-2">
                {res.recomendacoes.map((r, i) => (
                  <div key={i} className="border rounded-lg p-3 flex gap-3 items-start">
                    <Badge className={cores[r.prioridade] ?? ""}>{r.prioridade}</Badge>
                    <div><p className="font-semibold text-sm">{r.titulo}</p><p className="text-xs text-muted-foreground">{r.acao}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-accent/50 rounded-xl p-4">
              <h4 className="font-bold mb-2">🚀 Próximos passos</h4>
              <ol className="space-y-1 text-sm list-decimal list-inside">{res.proximosPassos.map((p, i) => <li key={i}>{p}</li>)}</ol>
            </div>
            <div className="border-l-4 border-primary pl-4 italic text-sm">
              <p className="font-semibold not-italic mb-1">💌 Para a família:</p>
              <p>{res.mensagemFamilia}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------- Helpers ----------
function EmptyState({ icon: Icon, text }: { icon: typeof Sparkles; text: string }) {
  return (
    <Card className="p-12 text-center">
      <Icon className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">{text}</p>
    </Card>
  );
}

function SkeletonBlock() {
  return (
    <Card className="p-12 text-center">
      <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">A IA está pensando...</p>
    </Card>
  );
}
