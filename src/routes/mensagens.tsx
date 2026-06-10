import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Search, Sparkles, Loader2, Wand2, Plus, MessageSquare, Phone, X, Users } from "lucide-react";
import { toast } from "sonner";
import { rascunhoMensagem } from "@/lib/ai.functions";
import { DashboardShell } from "@/components/DashboardShell";
import { useConversas, useContatosExternos, useStudents } from "@/lib/store";

export const Route = createFileRoute("/mensagens")({
  head: () => ({ meta: [{ title: "Mensagens — Aprimore" }] }),
  component: MensagensPage,
});

function MensagensPage() {
  const { list, get, send } = useConversas();
  const { list: contatosExternos, add: addContato } = useContatosExternos();
  const { list: alunos } = useStudents();
  const [activeId, setActiveId] = useState(list[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);

  const waConversas = contatosExternos.map(c => ({
    id: `wa:${c.whatsapp}`,
    nome: c.nome,
    papel: c.parentesco || "Contato Externo",
    tone: c.tone,
    mensagens: [],
    whatsapp: c.whatsapp
  }));

  const allConversas = [...list, ...waConversas];
  const active = allConversas.find(c => c.id === activeId) || allConversas[0];
  const filtered = allConversas.filter((c) => c.nome.toLowerCase().includes(q.toLowerCase()));

  return (
    <DashboardShell title="Mensagens" subtitle="Converse com famílias e equipe">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-3 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar contato..."
                className="w-full bg-transparent text-sm outline-none"
                aria-label="Buscar contato"
              />
            </div>
            <button 
              onClick={() => setShowAddContact(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              title="Novo Contato WhatsApp"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <ul className="space-y-1">
            {filtered.map((c) => {
              const last = c.mensagens[c.mensagens.length - 1];
              return (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                    active?.id === c.id ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, var(--stat-${c.tone}), var(--stat-purple))` }}
                  >
                    {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-semibold text-foreground flex items-center gap-1">
                        {c.id.startsWith("wa:") && <Phone className="h-3 w-3 text-green-500" />}
                        {c.nome}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{last?.time ?? ""}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{last?.text ?? "Sem mensagens"}</div>
                  </div>
                </button>
              </li>
            );})}
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted-foreground">Nenhum contato encontrado</li>}
          </ul>
        </div>

        <div className="flex min-h-[520px] flex-col rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, var(--stat-${active?.tone}), var(--stat-purple))` }}>
              {active?.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                {active?.nome}
                {active?.id?.startsWith("wa:") && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">WhatsApp</span>}
              </div>
              <div className="text-xs text-muted-foreground">{active?.papel}</div>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {active?.mensagens.map((m) => (
              <div key={m.id} className={m.from === "me" ? "ml-auto max-w-xs" : "max-w-xs"}>
                <div className={`rounded-2xl px-4 py-2 text-sm ${
                  m.from === "me"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-accent text-foreground"
                }`}>{m.text}</div>
                <div className={`mt-1 text-[10px] text-muted-foreground ${m.from === "me" ? "text-right" : ""}`}>{m.time}</div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = msg.trim();
              if (!text || !active) return;
              send(active.id, text);
              setMsg("");
            }}
            className="flex items-center gap-2 border-t border-border p-4"
          >
            <RascunhoIA destinatario={active?.nome ?? "responsável"} onApply={(t)=>setMsg(t)} />
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Escreva uma mensagem..."
              aria-label="Mensagem"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button type="submit" aria-label="Enviar" className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40" disabled={!msg.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      {showAddContact && (
        <ModalNovoContato 
          alunos={alunos} 
          onClose={() => setShowAddContact(false)} 
          onSave={async (c) => {
            await addContato(c);
            setShowAddContact(false);
            toast.success("Contato adicionado!");
          }} 
        />
      )}
    </DashboardShell>
  );
}

function ModalNovoContato({ alunos, onClose, onSave }: { alunos: any[], onClose: () => void, onSave: (c: any) => Promise<void> }) {
  const [form, setForm] = useState({ nome: "", whatsapp: "", parentesco: "Pai", alunoId: "" });
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Novo Contato WhatsApp</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try { await onSave(form); } finally { setLoading(false); }
        }} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase text-muted-foreground">Nome</span>
            <input required value={form.nome} onChange={e=>setForm(f=>({...f, nome: e.target.value}))} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold uppercase text-muted-foreground">WhatsApp</span>
            <input required type="tel" placeholder="(00) 00000-0000" value={form.whatsapp} onChange={e=>setForm(f=>({...f, whatsapp: e.target.value}))} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase text-muted-foreground">Parentesco</span>
              <select value={form.parentesco} onChange={e=>setForm(f=>({...f, parentesco: e.target.value}))} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm">
                <option value="Pai">Pai</option>
                <option value="Mãe">Mãe</option>
                <option value="Tutor">Tutor</option>
                <option value="Outro">Outro</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-bold uppercase text-muted-foreground">Aluno vinculado</span>
              <select value={form.alunoId} onChange={e=>setForm(f=>({...f, alunoId: e.target.value}))} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm">
                <option value="">Nenhum</option>
                {alunos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {loading ? "Salvando..." : "Salvar Contato"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RascunhoIA({ destinatario, onApply }: { destinatario: string; onApply: (t: string) => void }) {
  const fn = useServerFn(rascunhoMensagem);
  const [open, setOpen] = useState(false);
  const [objetivo, setObjetivo] = useState("");
  const [tom, setTom] = useState<"acolhedor" | "informativo" | "celebrar" | "preocupado">("acolhedor");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<Awaited<ReturnType<typeof rascunhoMensagem>> | null>(null);

  const gerar = async () => {
    if (!objetivo.trim()) return toast.error("Diga o objetivo da mensagem");
    setLoading(true);
    try {
      const r = await fn({ data: { alunoNome: destinatario, destinatario, objetivo, tom, linguagemSimples: true }});
      setOut(r);
    } catch (e) { toast.error("Erro", { description: String(e) }); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative">
      <button type="button" onClick={()=>setOpen(o=>!o)} aria-label="Rascunho com IA" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-accent">
        <Wand2 className="h-4 w-4 text-primary" />
      </button>
      {open && (
        <div className="absolute bottom-12 left-0 z-30 w-[360px] rounded-2xl border border-border bg-card p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-primary" /> Rascunho com IA</div>
          <input value={objetivo} onChange={e=>setObjetivo(e.target.value)} placeholder="Objetivo (ex.: avisar sobre reunião)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={tom} onChange={e=>setTom(e.target.value as typeof tom)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="acolhedor">Acolhedor</option>
            <option value="informativo">Informativo</option>
            <option value="celebrar">Celebrar conquista</option>
            <option value="preocupado">Conversa difícil</option>
          </select>
          <button type="button" onClick={gerar} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar"}
          </button>
          {out && (
            <div className="space-y-2 text-xs">
              <div className="font-semibold">{out.assunto}</div>
              <div className="rounded-lg bg-accent/40 p-2 whitespace-pre-wrap">{out.mensagem}</div>
              <details><summary className="cursor-pointer font-semibold">Versão em linguagem simples</summary>
                <div className="mt-1 rounded-lg bg-accent/40 p-2 whitespace-pre-wrap">{out.versaoSimples}</div>
              </details>
              <div className="flex gap-2">
                <button type="button" onClick={()=>{onApply(out.mensagem); setOpen(false); toast.success("Aplicado");}} className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-primary-foreground">Usar completa</button>
                <button type="button" onClick={()=>{onApply(out.versaoSimples); setOpen(false); toast.success("Aplicado");}} className="flex-1 rounded-lg border border-border px-2 py-1.5">Usar simples</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}