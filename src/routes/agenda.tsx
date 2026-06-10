import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Bell, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda Visual Digital — Aprimore" }] }),
  component: Agenda,
});

type Item = { id: string; hora: string; titulo: string; descricao: string; emoji: string };

const seed: Item[] = [
  { id: "1", hora: "07:30", titulo: "Chegada", descricao: "Cumprimentar os colegas e organizar seus materiais.", emoji: "🌞" },
  { id: "2", hora: "08:00", titulo: "Aula de Português", descricao: "Atividades de leitura e escrita com apoio visual.", emoji: "📖" },
  { id: "3", hora: "09:30", titulo: "Lanche", descricao: "Hora de lanchar e recarregar as energias.", emoji: "🍎" },
  { id: "4", hora: "10:00", titulo: "Recreio", descricao: "Momento de brincar, socializar e se divertir.", emoji: "🤸" },
  { id: "5", hora: "11:30", titulo: "Saída", descricao: "Organizar seus pertences e se preparar para ir para casa.", emoji: "🚌" },
];

function Agenda() {
  const [list, setList] = useState<Item[]>(seed);
  const [form, setForm] = useState({ hora: "", titulo: "", descricao: "", emoji: "📌" });

  const add = () => {
    if (!form.hora || !form.titulo) return toast("Preencha hora e título");
    setList([...list, { id: Date.now().toString(), ...form }].sort((a, b) => a.hora.localeCompare(b.hora)));
    setForm({ hora: "", titulo: "", descricao: "", emoji: "📌" });
    toast.success("Atividade adicionada à rotina");
  };

  return (
    <DashboardShell title="Agenda Visual Digital" subtitle="Veja a rotina do dia e personalize as atividades.">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 text-sm font-bold text-foreground">Rotina de Hoje</div>
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={r.id} className="flex items-center gap-4 rounded-xl border border-border p-3">
                <span className="w-14 shrink-0 text-sm font-bold text-foreground">{r.hora}</span>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-2xl">{r.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{r.titulo}</div>
                  <div className="text-xs text-muted-foreground">{r.descricao}</div>
                </div>
                <button className="rounded-full p-2 text-muted-foreground hover:bg-accent" aria-label="Editar"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => setList(list.filter((i) => i.id !== r.id))} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10" aria-label="Excluir">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 text-sm font-bold text-foreground">Adicionar atividade</div>
            <div className="space-y-2">
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              <textarea className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <button onClick={add} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
          </div>
          <button className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:bg-accent">
            <ImageIcon className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-bold text-foreground">Personalizar imagens</div>
              <div className="text-xs text-muted-foreground">Editar ícones da rotina</div>
            </div>
          </button>
          <button className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:bg-accent">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-bold text-foreground">Lembretes e alertas</div>
              <div className="text-xs text-muted-foreground">Configurar sons e avisos</div>
            </div>
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
