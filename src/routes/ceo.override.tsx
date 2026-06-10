import { createFileRoute } from "@tanstack/react-router";
import { CEOShell } from "@/components/CEOShell";
import { RequireRole } from "@/components/RequireRole";
import { KeyRound, ShieldAlert } from "lucide-react";
import { registrarLog, useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/ceo/override")({
  head: () => ({ meta: [{ title: "·" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <RequireRole roles={["ceo"]}>
      <Page />
    </RequireRole>
  ),
});

function Page() {
  const { user } = useAuth();
  function fire(acao: string) {
    registrarLog({ perfil: "ceo", usuario: user?.email ?? "ceo", acao: `ceo.override · ${acao}` });
    toast.success("Override registrado na auditoria", { description: acao });
  }
  return (
    <CEOShell title="Override de admins" subtitle="Use com discrição — toda ação é auditada">
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-red-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">Zona crítica</span>
        </div>
        <p className="mt-2 text-sm text-red-100/90">
          Operações abaixo passam por cima de qualquer decisão de admin. Toda ação é
          registrada com selo <code className="text-red-200">ceo.override</code> e
          notificação interna ao admin afetado.
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        <ActionCard title="Forçar reativação de conta" desc="Reativa uma conta desativada por admin." onClick={() => fire("reativar conta")} />
        <ActionCard title="Trocar admin de uma escola" desc="Substitui o admin titular sem aviso prévio." onClick={() => fire("trocar admin")} />
        <ActionCard title="Kill-switch de escola" desc="Pausa imediatamente todos os acessos de uma escola." onClick={() => fire("kill-switch escola")} />
        <ActionCard title="Revogar sessão de usuário" desc="Encerra todas as sessões ativas de um usuário." onClick={() => fire("revogar sessão")} />
        <ActionCard title="Purgar Auditoria Local" desc="Remove logs de uma unidade específica da visão do admin." onClick={() => fire("purgar logs unidade")} />
        <ActionCard title="Injetar Créditos de IA" desc="Aumenta o limite de uso de IA para uma conta docente." onClick={() => fire("injetar créditos")} />
      </section>

      <p className="text-xs text-zinc-500">
        * Esta UI é o painel sigiloso. As mutações reais devem ser feitas via server functions
        protegidas por <code className="text-zinc-300">is_ceo()</code> — já há base no schema.
      </p>
    </CEOShell>
  );
}

function ActionCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-center gap-2 text-fuchsia-300"><KeyRound className="h-4 w-4" /><span className="text-[10px] uppercase tracking-widest">override</span></div>
      <h3 className="mt-2 text-base font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{desc}</p>
      <button onClick={onClick} className="mt-3 rounded-md border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20">
        Executar
      </button>
    </article>
  );
}
