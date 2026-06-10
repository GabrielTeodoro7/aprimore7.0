import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { useAvaliacoes, useStudents, useTurmas, type Avaliacao } from "@/lib/store";

export const Route = createFileRoute("/avaliacoes/novo")({
  head: () => ({ meta: [{ title: "Nova avaliação — Aprimore" }] }),
  component: NovaAvaliacaoPage,
});

const tones: Avaliacao["tone"][] = ["blue", "green", "orange", "purple", "pink", "yellow"];
const materias = ["Matemática", "Português", "Ciências", "História", "Geografia", "Arte", "Educação Física", "Inglês"];

function NovaAvaliacaoPage() {
  const navigate = useNavigate();
  const { add } = useAvaliacoes();
  const { list: alunos } = useStudents();
  const { primeiraId: turmaIdAtual } = useTurmas();
  const [form, setForm] = useState({
    mat: "Matemática",
    titulo: "",
    data: new Date().toLocaleDateString("pt-BR").slice(0, 5),
    media: 7.5,
    alunos: alunos.length,
    tone: "blue" as Avaliacao["tone"],
    peso: 1,
    observacoes: "",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <DashboardShell title="Nova avaliação" subtitle="Registre uma prova, trabalho ou apresentação">
      <Link to="/avaliacoes" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.titulo.trim()) { toast.error("Informe um título"); return; }
          if (form.media < 0 || form.media > 10) { toast.error("Média deve estar entre 0 e 10"); return; }
          if (!turmaIdAtual) { toast.error("Crie uma turma antes de cadastrar avaliações"); return; }
          add({ ...form, turmaId: turmaIdAtual });
          toast.success("Avaliação registrada!", { description: form.titulo });
          navigate({ to: "/avaliacoes" });
        }}
        className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2"
      >
        <Field label="Título da avaliação" hint="Ex: Prova bimestral, Apresentação oral" required full>
          <input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} className="input" autoFocus />
        </Field>
        <Field label="Matéria" hint="Selecione a disciplina avaliada">
          <select value={form.mat} onChange={(e) => set("mat", e.target.value)} className="input">
            {materias.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Data" hint="Quando foi aplicada (dd/mm)">
          <input value={form.data} onChange={(e) => set("data", e.target.value)} className="input" placeholder="dd/mm" />
        </Field>
        <Field label="Média obtida (0 a 10)" hint="Média da turma nesta avaliação">
          <input type="number" step="0.1" min="0" max="10" value={form.media} onChange={(e) => set("media", +e.target.value)} className="input" />
        </Field>
        <Field label="Quantidade de alunos avaliados" hint={`Turma atual: ${alunos.length}`}>
          <input type="number" min="1" value={form.alunos} onChange={(e) => set("alunos", +e.target.value)} className="input" />
        </Field>
        <Field label="Peso na média final" hint="1 = peso normal, 2 = peso dobrado">
          <input type="number" min="1" max="5" value={form.peso} onChange={(e) => set("peso", +e.target.value)} className="input" />
        </Field>
        <Field label="Cor da avaliação" hint="Ajuda a identificar visualmente">
          <div className="flex gap-2">
            {tones.map((t) => (
              <button key={t} type="button" aria-label={`Cor ${t}`} onClick={() => set("tone", t)}
                className={`h-9 w-9 rounded-full border-2 ${form.tone === t ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: `var(--stat-${t})` }} />
            ))}
          </div>
        </Field>
        <Field label="Observações" hint="Anotações pedagógicas (opcional)" full>
          <textarea rows={3} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} className="input resize-none" />
        </Field>

        <div className="md:col-span-2 flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          A média geral ponderada da turma é recalculada automaticamente após salvar.
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <Link to="/avaliacoes" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent">Cancelar</Link>
          <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Registrar avaliação
          </button>
        </div>
      </form>
      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.75rem;padding:0.6rem 0.85rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--primary)}`}</style>
    </DashboardShell>
  );
}

function Field({ label, hint, required, full, children }: { label: string; hint?: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
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