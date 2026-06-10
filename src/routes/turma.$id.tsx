import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, Heart, Trash2, TrendingUp, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { useStudents } from "@/lib/store";

export const Route = createFileRoute("/turma/$id")({
  head: () => ({ meta: [{ title: "Aluno — Aprimore" }] }),
  component: AlunoDetailPage,
});

function AlunoDetailPage() {
  const { id } = Route.useParams();
  const { get, remove } = useStudents();
  const navigate = useNavigate();
  const a = get(id);

  if (!a) {
    return (
      <DashboardShell title="Aluno não encontrado">
        <Link to="/turma" className="text-primary hover:underline">Voltar para turma</Link>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={a.nome} subtitle={`${a.idade} anos · ${a.tag}`}>
      <Link to="/turma" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ background: `linear-gradient(135deg, var(--stat-${a.tone}), var(--stat-purple))` }}
          >
            {a.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-bold text-foreground">{a.nome}</div>
            <span
              className="mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: `var(--stat-${a.tone}-soft)`, color: `var(--stat-${a.tone})` }}
            >
              {a.tag}
            </span>
          </div>
          <ul className="mt-5 space-y-2 text-sm">
            {a.responsavel && <li className="flex items-center gap-2"><Heart className="h-4 w-4 text-muted-foreground" />{a.responsavel}</li>}
            {a.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{a.email}</li>}
            {a.telefone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{a.telefone}</li>}
          </ul>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Média" value={a.media.toString()} tone="blue" icon={TrendingUp} />
            <Stat label="Frequência" value={a.freq} tone="green" icon={CalendarCheck} />
            <Stat label="Idade" value={`${a.idade} anos`} tone="orange" icon={Heart} />
          </div>

          {a.necessidade && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Plano adaptado</h3>
              <p className="mt-1 text-sm text-muted-foreground">Necessidade: {a.necessidade}</p>
            </div>
          )}

          {a.observacoes && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Observações</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.observacoes}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => toast("Mensagem", { description: `Abrindo chat com responsável de ${a.nome}` })}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >Enviar mensagem</button>
            <button
              onClick={() => {
                if (confirm(`Remover ${a.nome}?`)) {
                  remove(a.id);
                  toast.success("Aluno removido");
                  navigate({ to: "/turma" });
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="h-4 w-4" /> Remover
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value, tone, icon: Icon }: { label: string; value: string; tone: string; icon: typeof Heart }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `var(--stat-${tone}-soft)`, color: `var(--stat-${tone})` }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-extrabold text-foreground">{value}</div>
    </div>
  );
}