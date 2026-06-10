import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, BarChart3, Users, Calendar, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { useStudents } from "@/lib/store";
import { perguntarAosDados } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Aprimore" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { list } = useStudents();

  const download = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success("Download iniciado", { description: filename });
  };

  const reports = [
    {
      icon: BarChart3, title: "Boletim bimestral", sub: "Notas e médias da turma", tone: "blue",
      file: "boletim.csv",
      build: () => "Aluno,Idade,Média,Frequência,Categoria\n" + list.map((s) => `${s.nome},${s.idade},${s.media},${s.freq},${s.tag}`).join("\n"),
    },
    {
      icon: Calendar, title: "Frequência mensal", sub: "Presenças, faltas e atrasos", tone: "green",
      file: "frequencia.csv",
      build: () => "Aluno,Frequência\n" + list.map((s) => `${s.nome},${s.freq}`).join("\n"),
    },
    {
      icon: Users, title: "Planos individuais", sub: "Acompanhamento de alunos adaptados", tone: "purple",
      file: "planos.csv",
      build: () => "Aluno,Necessidade,Observações\n" + list.filter((s) => s.tag === "Adaptado").map((s) => `${s.nome},${s.necessidade ?? ""},${(s.observacoes ?? "").replace(/,/g, ";")}`).join("\n"),
    },
    {
      icon: FileText, title: "Relatório pedagógico", sub: "Observações qualitativas", tone: "orange",
      file: "pedagogico.csv",
      build: () => "Aluno,Categoria,Observações\n" + list.map((s) => `${s.nome},${s.tag},${(s.observacoes ?? "").replace(/,/g, ";")}`).join("\n"),
    },
  ] as const;

  return (
    <DashboardShell title="Relatórios" subtitle="Exporte documentos prontos para a coordenação">
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <div key={r.title} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `var(--stat-${r.tone}-soft)`, color: `var(--stat-${r.tone})` }}
            >
              <r.icon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">{r.title}</div>
              <div className="text-xs text-muted-foreground">{r.sub}</div>
            </div>
            <button
              onClick={() => download(r.file, r.build())}
              className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Baixar
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Histórico recente</h2>
        <ul className="mt-3 divide-y divide-border text-sm">
          {["Boletim 1º Bim - 28/03", "Frequência Abril - 02/05", "Plano João Silva - 10/05"].map((h) => (
            <li key={h} className="flex items-center justify-between py-3">
              <span className="text-foreground">{h}</span>
              <button
                onClick={() => toast(h, { description: "Reabrindo relatório..." })}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Abrir
              </button>
            </li>
          ))}
        </ul>
      </div>
      <PergunteAosDados />
    </DashboardShell>
  );
}

function PergunteAosDados() {
  const fn = useServerFn(perguntarAosDados);
  const { list } = useStudents();
  const [q, setQ] = useState("Quais alunos têm média abaixo de 6?");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<Awaited<ReturnType<typeof perguntarAosDados>> | null>(null);

  const submit = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await fn({ data: {
        pergunta: q,
        alunos: list.map(s=>({ nome: s.nome, media: s.media, frequencia: s.freq, tag: s.tag, necessidade: s.necessidade ?? "" })),
      }});
      setOut(r);
    } catch (e) { toast.error("Erro", { description: String(e) }); }
    finally { setLoading(false); }
  };

  const sugestoes = [
    "Quais alunos têm média abaixo de 6?",
    "Quais alunos estão com frequência menor que 80%?",
    "Quem precisa de mais atenção esta semana?",
    "Liste alunos com adaptação por necessidade.",
  ];

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2 text-base font-bold">
        <Sparkles className="h-5 w-5 text-primary" /> Pergunte aos seus dados
      </div>
      <p className="text-sm text-muted-foreground">Faça perguntas em linguagem natural sobre sua turma.</p>
      <div className="flex flex-wrap gap-2">
        {sugestoes.map(s=>(
          <button key={s} onClick={()=>setQ(s)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent">{s}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Pergunte algo sobre os alunos..." />
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Perguntar"}
        </Button>
      </div>
      {out && (
        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-primary/5 p-3">{out.resposta}</div>
          {out.alunosCitados.length>0 && (
            <div className="flex flex-wrap gap-1">
              {out.alunosCitados.map(a=>(<Badge key={a} variant="secondary">{a}</Badge>))}
            </div>
          )}
          {out.tabela.length>0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  {out.tabela.map((r,i)=>(
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-semibold bg-accent/30 w-1/3">{r.coluna}</td>
                      <td className="px-3 py-2">{r.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {out.sugestaoAcao && (
            <div className="rounded-lg bg-accent/40 p-3"><span className="font-bold">Sugestão:</span> {out.sugestaoAcao}</div>
          )}
        </div>
      )}
    </Card>
  );
}