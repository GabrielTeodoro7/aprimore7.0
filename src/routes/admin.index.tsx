import { createFileRoute } from "@tanstack/react-router";
import { 
  ShieldCheck, Users, GraduationCap, 
  BarChart3, Settings, ShieldAlert,
  Server, Globe, Database, Lock,
  Activity, AlertCircle, FileText
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers } from "@/lib/auth-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Dashboard" }] }),
  component: () => (<RequireRole roles={["admin"]}><AdminDashboard /></RequireRole>),
});

function AdminDashboard() {
  const { list, professores, alunos } = useUsers();

  const stats = [
    { label: "Corpo Docente", val: professores.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Alunos Ativos", val: alunos.length, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Turmas Criadas", val: "12", icon: Globe, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Sessões Ativas", val: "24", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <AdminShell title="Visão Geral" subtitle="Gestão operacional do ambiente escolar">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={i} className="p-5 border-none shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.val}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px] mt-6">
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" /> Recursos da Unidade
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { t: "Configuração de Turmas", d: "Defina séries, horários e períodos letivos.", icon: Globe },
                { t: "Gestão de Avaliações", d: "Monitore o progresso acadêmico da unidade.", icon: BarChart3 },
                { t: "Logs de Professores", d: "Histórico de atividades dos docentes.", icon: FileText },
                { t: "Backup de Dados", d: "Exportação segura de registros escolares.", icon: Database },
              ].map((r, i) => (
                <div key={i} className="group p-4 rounded-2xl border border-border hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer">
                  <r.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary mb-2" />
                  <div className="font-bold text-sm">{r.t}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.d}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm bg-rose-500/5">
            <h3 className="text-lg font-bold text-rose-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" /> Alertas Críticos
            </h3>
            <div className="space-y-3">
              {[
                { t: "Frequência Baixa", d: "Alunos com mais de 3 faltas consecutivas na semana.", level: "Crítico" },
                { t: "Relatório de Inclusão", d: "3 novas atividades aguardando revisão técnica.", level: "Atenção" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-rose-100">
                  <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-rose-900">{a.t}</span>
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none text-[10px] uppercase font-bold">{a.level}</Badge>
                    </div>
                    <p className="text-xs text-rose-800/70 mt-0.5">{a.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-6 border-none shadow-sm">
            <h3 className="text-base font-bold mb-4">Segurança da Unidade</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" /> 2FA Docentes
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" /> Auditoria RRL
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">Ok</Badge>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-3 text-center">Status da Rede Local</p>
              <div className="flex justify-center gap-1">
                {[1,1,1,1,1,1,1,1,1,0].map((v, i) => (
                  <div key={i} className={`h-6 w-2 rounded-full ${v ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                ))}
              </div>
            </div>
          </Card>

          <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20">
            <h4 className="font-bold text-sm mb-2">Suporte ao Administrador</h4>
            <p className="text-xs opacity-90 leading-relaxed mb-4">Dúvidas sobre o sistema de gestão ou novos módulos? Fale com a rede central.</p>
            <button className="w-full py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all">
              Abrir Ticket Técnico
            </button>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
