import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Plus, X, Info, Sparkles, Loader2, Users, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { useActivities, useStudents, useTurmas, type Activity } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { sugerirAtividade } from "@/lib/ai.functions";

export const Route = createFileRoute("/atividades/novo")({
  head: () => ({ meta: [{ title: "Nova atividade — Aprimore" }] }),
  component: NovaAtividadePage,
});

const tones: Activity["tone"][] = ["blue", "green", "orange", "purple", "pink", "yellow"];

function NovaAtividadePage() {
  const { add } = useActivities();
  const { list: students } = useStudents();
  const { list: turmas, primeiraId: initialTurmaId } = useTurmas();
  const navigate = useNavigate();
  const sugerir = useServerFn(sugerirAtividade);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaAlunoId, setIaAlunoId] = useState<string>(students[0]?.id ?? "");
  const [form, setForm] = useState({
    title: "",
    mat: "Matemática",
    data: "",
    tone: "blue" as Activity["tone"],
    adapt: true,
    descricao: "",
    objetivos: [""] as string[],
    materiais: [""] as string[],
    passos: [""] as string[],
    alunoIds: [] as string[],
    dificuldade: undefined as Activity["dificuldade"],
    turmaId: initialTurmaId || "",
    arquivos: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setList = (k: "objetivos" | "materiais" | "passos", i: number, v: string) => {
    const arr = [...form[k]]; arr[i] = v; set(k, arr);
  };
  const addItem = (k: "objetivos" | "materiais" | "passos") => set(k, [...form[k], ""]);
  const removeItem = (k: "objetivos" | "materiais" | "passos", i: number) => set(k, form[k].filter((_, x) => x !== i));

  const toggleAluno = (id: string) => {
    set("alunoIds", form.alunoIds.includes(id)
      ? form.alunoIds.filter((x) => x !== id)
      : [...form.alunoIds, id]);
  };

  async function pedirSugestaoIA() {
    const aluno = students.find((s) => s.id === iaAlunoId);
    if (!aluno) { toast.error("Escolha um aluno para personalizar"); return; }
    setIaLoading(true);
    try {
      const out = await sugerir({ data: {
        alunoNome: aluno.nome,
        necessidade: aluno.necessidade ?? "",
        media: aluno.media,
        observacoes: aluno.observacoes ?? "",
        materia: form.mat || "Matemática",
      }});
      setForm((f) => ({
        ...f,
        title: out.title,
        mat: out.mat,
        descricao: out.descricao,
        objetivos: out.objetivos,
        materiais: out.materiais,
        passos: out.passos,
        dificuldade: out.dificuldade,
        adapt: !!aluno.necessidade,
        alunoIds: f.alunoIds.includes(aluno.id) ? f.alunoIds : [...f.alunoIds, aluno.id],
      }));
      toast.success("Sugestão pronta!", { description: `Adaptada para ${aluno.nome} (${out.dificuldade}).` });
    } catch (e) {
      toast.error("Não consegui gerar agora", { description: e instanceof Error ? e.message : "Tente novamente" });
    } finally {
      setIaLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from("atividades-anexos")
          .upload(filePath, file);

        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from("atividades-anexos")
          .getPublicUrl(data.path);
          
        newUrls.push(publicUrl);
      }
      set("arquivos", [...form.arquivos, ...newUrls]);
      toast.success("Arquivos enviados!");
    } catch (error) {
      toast.error("Erro no upload", { description: error instanceof Error ? error.message : "Tente novamente" });
    } finally {
      setUploading(false);
    }
  }


  return (
    <DashboardShell title="Nova atividade" subtitle="Crie um plano de aula inclusivo">
      <Link to="/atividades" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <div className="flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Capriche nos objetivos e no passo a passo — eles aparecem no detalhe da atividade e na versão para imprimir.
      </div>

      {/* Painel IA — sugestão por aluno */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-[oklch(0.96_0.04_270)] to-[oklch(0.95_0.05_300)] p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-foreground">Sugestão por IA</div>
            <div className="text-[11px] text-muted-foreground">
              A IA analisa a média, necessidade e observações do aluno e propõe uma atividade adaptada.
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-1 min-w-[180px] flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">Aluno foco</span>
            <select value={iaAlunoId} onChange={(e) => setIaAlunoId(e.target.value)}
              className="input">
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — média {s.media}{s.necessidade ? ` · ${s.necessidade}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-40 flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">Matéria</span>
            <input value={form.mat} onChange={(e) => set("mat", e.target.value)} className="input" />
          </label>
          <button
            type="button"
            onClick={pedirSugestaoIA}
            disabled={iaLoading || !iaAlunoId}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {iaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {iaLoading ? "Pensando…" : "Sugerir atividade"}
          </button>
        </div>
        {form.dificuldade && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" /> Dificuldade sugerida: {form.dificuldade}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.title.trim()) { toast.error("Informe o título"); return; }
          if (!form.turmaId) { toast.error("Selecione uma turma"); return; }
          add({
            ...form,
            objetivos: form.objetivos.filter(Boolean),
            materiais: form.materiais.filter(Boolean),
            passos: form.passos.filter(Boolean),
          });
          toast.success("Atividade criada!");
          navigate({ to: "/atividades" });
        }}
        className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2"
      >
        <Field label="Turma" hint="Selecione a turma para esta atividade" required>
          <select 
            value={form.turmaId} 
            onChange={(e) => set("turmaId", e.target.value)} 
            className="input"
            required
          >
            <option value="">Selecione uma turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </Field>
        <Field label="Título" hint="Nome curto e descritivo da atividade" required>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="Matéria" hint="Ex: Matemática, Português, Socioemocional">
          <input value={form.mat} onChange={(e) => set("mat", e.target.value)} className="input" />
        </Field>
        <Field label="Data prevista" hint="Quando será aplicada (dd/mm)">
          <input value={form.data} onChange={(e) => set("data", e.target.value)} placeholder="dd/mm" className="input" />
        </Field>
        <Field label="Cor" hint="Identifica a atividade visualmente">
          <div className="flex gap-2">
            {tones.map((t) => (
              <button key={t} type="button" aria-label={`Cor ${t}`} onClick={() => set("tone", t)}
                className={`h-9 w-9 rounded-full border-2 ${form.tone === t ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: `var(--stat-${t})` }} />
            ))}
          </div>
        </Field>
        <Field label="Atividade adaptada?" hint="Inclua quando há recursos para alunos com necessidades específicas">
          <button type="button" onClick={() => set("adapt", !form.adapt)}
            className={`relative h-6 w-11 rounded-full transition ${form.adapt ? "bg-primary" : "bg-border"}`}
            role="switch" aria-checked={form.adapt}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${form.adapt ? "left-5" : "left-0.5"}`} />
          </button>
        </Field>
        <Field label="Descrição" hint="Resuma a proposta em 2-3 frases" full>
          <textarea rows={3} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} className="input resize-none" />
        </Field>

        {(["objetivos", "materiais", "passos"] as const).map((k) => {
          const hints: Record<string, string> = {
            objetivos: "O que os alunos vão aprender",
            materiais: "O que será necessário em sala",
            passos: "Como conduzir a aula, em ordem",
          };
          return (
          <Field key={k} label={k} hint={hints[k]} full>
            <div className="space-y-2">
              {form[k].map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input value={item} onChange={(e) => setList(k, i, e.target.value)} className="input flex-1" placeholder={`${k.slice(0, -1)} ${i + 1}`} />
                  <button type="button" onClick={() => removeItem(k, i)} aria-label="Remover" className="rounded-lg border border-border px-3 hover:bg-accent">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addItem(k)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <Plus className="h-3 w-3" /> Adicionar
              </button>
            </div>
          </Field>
        );})}

        <Field label="Arquivos e Materiais" hint="Faça upload de PDFs, imagens ou documentos" full>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {form.arquivos.map((url, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-background p-2 pr-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium truncate max-w-[150px]">Arquivo {i + 1}</span>
                  <button type="button" onClick={() => set("arquivos", form.arquivos.filter((_, x) => x !== i))}
                    className="rounded-lg p-1 hover:bg-accent text-muted-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 transition hover:border-primary hover:bg-accent/50">
              <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="text-center">
                <div className="text-sm font-semibold">{uploading ? "Enviando..." : "Clique para enviar arquivos"}</div>
                <div className="text-[11px] text-muted-foreground">PDF, Imagens ou Documentos</div>
              </div>
            </label>
          </div>
        </Field>

        <Field label="Atribuir a alunos" hint="Marque um ou mais alunos. Vazio = vale para a turma toda." full>
          <div className="flex items-start gap-2 rounded-xl border border-border bg-background p-3">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="flex flex-wrap gap-1.5">
              {students.map((s) => {
                const on = form.alunoIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleAluno(s.id)}
                    aria-pressed={on}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    {s.nome}{s.necessidade ? ` · ${s.necessidade}` : ""}
                  </button>
                );
              })}
            </div>
          </div>
        </Field>

        <div className="md:col-span-2 flex justify-end gap-3">
          <Link to="/atividades" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent">Cancelar</Link>
          <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Criar atividade
          </button>
        </div>
      </form>
      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.75rem;padding:0.6rem 0.85rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--primary)}`}</style>
    </DashboardShell>
  );
}

function Field({ label, hint, children, required, full }: { label: string; hint?: string; children: React.ReactNode; required?: boolean; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}