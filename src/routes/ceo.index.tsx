import { createFileRoute } from "@tanstack/react-router";
import { 
  ShieldAlert, Activity, Users2, Brain, 
  Eye, KeyRound, Globe, Server, Database,
  TrendingUp, AlertTriangle, ShieldCheck
} from "lucide-react";
import { CEOShell } from "@/components/CEOShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers } from "@/lib/auth-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/ceo")({
  head: () => ({ meta: [{ title: "Onda Zero — Acesso Clearance" }] }),
  component: () => (<RequireRole roles={["ceo"]}><CEODashboard /></RequireRole>),
});

function CEODashboard() {
  const { list } = useUsers();

  const stats = [
    { label: "Usuários na Rede", val: list.length, icon: Users2, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
    { label: "Unidades Escolares", val: "12", icon: Globe, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Requisições/dia", val: "1.2k", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Saúde da Rede", val: "99.9%", icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <CEOShell title="Onda Zero" subtitle="Controle central e visão global da infraestrutura">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={i} className="p-5 border-zinc-800 bg-zinc-900/50 shadow-lg flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-100">{s.val}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card className="p-6 border-zinc-800 bg-zinc-900/50 shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-100">
            <Server className="h-5 w-5 text-fuchsia-500" /> Infraestrutura Crítica
          </h3>
          <div className="space-y-4">
            {[
              { t: "Clusters Supabase", s: "Operacional", icon: Database },
              { t: "Gateway de IA", s: "Latência Baixa", icon: Brain },
              { t: "Node Engine", s: "Estável", icon: Activity },
            ].map((infra, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <infra.icon className="h-4 w-4 text-zinc-500" /> {infra.t}
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">{infra.s}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-zinc-800 bg-zinc-900/50 shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-100">
            <TrendingUp className="h-5 w-5 text-indigo-500" /> Crescimento da Rede
          </h3>
          <div className="flex h-40 items-end justify-between gap-2 px-2">
            {[40, 65, 30, 85, 50, 90, 75].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-500/20 to-fuchsia-500/40" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-fuchsia-500/20 bg-fuchsia-500/5 shadow-2xl mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <KeyRound className="h-24 w-24 text-fuchsia-400" />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-fuchsia-400" />
          <h3 className="text-lg font-black text-fuchsia-100 tracking-tight uppercase">Protocolo de Override Ativo</h3>
        </div>
        <p className="text-sm text-fuchsia-200/70 leading-relaxed max-w-2xl">
          Como CEO de Onda Zero, você possui autoridade suprema sobre o banco de dados e as identidades. 
          Qualquer alteração feita nesta camada ignora validações de nível admin e é registrada em logs de auditoria sigilosos.
        </p>
        <div className="mt-6 flex gap-3">
          <button className="px-6 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-black transition-all shadow-lg shadow-fuchsia-500/20">
            EXECUTAR OVERRIDE GLOBAL
          </button>
          <button className="px-6 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-800 transition-all">
            CONSULTAR AUDITORIA
          </button>
        </div>
      </Card>
    </CEODashboard>
  );
}
