import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ShieldCheck, UserPlus, Key, Mail, User, 
  Search, ShieldAlert, CheckCircle2, AlertTriangle,
  Lock, ArrowRight, Activity, Database
} from "lucide-react";
import { CEOShell } from "@/components/CEOShell";
import { RequireRole } from "@/components/RequireRole";
import { useUsers } from "@/lib/auth-store";
import { criarUsuarioReal } from "@/lib/users.functions";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/ceo/usuarios")({
  head: () => ({ meta: [{ title: "Gestor Supremo (Onda Zero) — Aprimore" }] }),
  component: () => (<RequireRole roles={["ceo"]}><GestorSupremoCEO /></RequireRole>),
});

function GestorSupremoCEO() {
  const { list } = useUsers();
  const criarFn = useServerFn(criarUsuarioReal);
  
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "professor" as any,
    escola: "",
    turma: ""
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha) {
      return toast.error("Preencha todos os campos obrigatórios");
    }

    setLoading(true);
    try {
      const res = await criarFn({ data: form });
      if (res.ok) {
        toast.success("Usuário criado com sucesso!", {
          description: `Credenciais ativas para ${form.email}`
        });
        setForm({ nome: "", email: "", senha: "", role: "professor", escola: "", turma: "" });
      } else {
        toast.error(res.error || "Erro ao criar usuário");
      }
    } catch (err) {
      toast.error("Erro na comunicação com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const visible = list.filter(u => 
    `${u.nome} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <CEOShell 
      title="Usuários Globais" 
      subtitle="Controle total sobre identidades (Acesso Clearance CEO)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Lado Esquerdo: Lista de Identidades */}
        <div className="space-y-6">
          <Card className="p-1 border-zinc-800 bg-zinc-900/50 shadow-lg">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50">
              <Search className="h-4 w-4 text-zinc-500" />
              <input 
                value={q} 
                onChange={e => setQ(e.target.value)}
                placeholder="Pesquisar identidade na rede global..."
                className="bg-transparent border-none outline-none text-sm w-full text-zinc-100"
              />
              <Badge variant="outline" className="ml-auto border-fuchsia-500/30 text-fuchsia-400">{visible.length} Identidades</Badge>
            </div>
            
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800/30 text-left text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Usuário / ID</th>
                    <th className="px-6 py-4 font-bold text-center">Nível</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {visible.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-fuchsia-500/20 to-indigo-500/10 flex items-center justify-center text-fuchsia-400 font-bold">
                            {u.nome[0]}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-100">{u.nome}</div>
                            <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge 
                          className={`
                            ${u.role === 'ceo' ? 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30' :
                              u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' : 
                              u.role === 'professor' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 
                              'bg-zinc-700/40 text-zinc-200 border-zinc-600'}
                          `}
                          variant="outline"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${u.status === 'ativo' ? 'bg-fuchsia-500 animate-pulse' : 'bg-zinc-600'}`} />
                          <span className="text-xs font-medium capitalize text-zinc-400">{u.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-fuchsia-400">
                          <Key className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 border-zinc-800 bg-fuchsia-500/5 flex flex-col gap-2">
              <Activity className="h-5 w-5 text-fuchsia-500" />
              <div className="text-2xl font-black text-zinc-100">{list.length}</div>
              <div className="text-[10px] uppercase font-bold text-fuchsia-500 tracking-widest">Contas Totais</div>
            </Card>
            <Card className="p-4 border-zinc-800 bg-indigo-500/5 flex flex-col gap-2">
              <Database className="h-5 w-5 text-indigo-500" />
              <div className="text-2xl font-black text-zinc-100">100%</div>
              <div className="text-[10px] uppercase font-bold text-indigo-500 tracking-widest">Integridade</div>
            </Card>
            <Card className="p-4 border-zinc-800 bg-zinc-800/20 flex flex-col gap-2">
              <ShieldAlert className="h-5 w-5 text-zinc-500" />
              <div className="text-2xl font-black text-zinc-100">0</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Brechas</div>
            </Card>
          </div>
        </div>

        {/* Lado Direito: Terminal de Criação */}
        <div className="space-y-6">
          <Card className="p-6 border-zinc-800 bg-zinc-950/80 shadow-2xl relative overflow-hidden ring-1 ring-fuchsia-500/20">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="h-24 w-24 text-fuchsia-500" />
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-zinc-100">Nova Identidade</h3>
                <p className="text-[11px] text-fuchsia-400 font-bold uppercase tracking-wider">Override Onda Zero</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase ml-1 opacity-70 text-zinc-400">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    value={form.nome} 
                    onChange={e => setForm({...form, nome: e.target.value})}
                    placeholder="Nome do usuário" 
                    className="pl-10 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-1 ring-fuchsia-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase ml-1 opacity-70 text-zinc-400">Email de Acesso</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    type="email"
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="email@escola.com" 
                    className="pl-10 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-1 ring-fuchsia-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase ml-1 opacity-70 text-zinc-400">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    type="password"
                    value={form.senha} 
                    onChange={e => setForm({...form, senha: e.target.value})}
                    placeholder="••••••••" 
                    className="pl-10 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus-visible:ring-1 ring-fuchsia-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2">
                <button 
                  type="button"
                  onClick={() => setForm({...form, role: 'professor'})}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.role === 'professor' ? 'border-fuchsia-500 bg-fuchsia-500/10 text-zinc-100' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}
                >
                  <User className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Professor</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setForm({...form, role: 'admin'})}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.role === 'admin' ? 'border-fuchsia-500 bg-fuchsia-500/10 text-zinc-100' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Admin</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <button 
                  type="button"
                  onClick={() => setForm({...form, role: 'aluno'})}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.role === 'aluno' ? 'border-fuchsia-500 bg-fuchsia-500/10 text-zinc-100' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}
                >
                  <Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center text-[8px]">A</Badge>
                  <span className="text-[10px] font-black uppercase">Aluno</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setForm({...form, role: 'ceo'})}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.role === 'ceo' ? 'border-fuchsia-500 bg-fuchsia-500/10 text-zinc-100' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800/50'}`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">CEO</span>
                </button>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black shadow-lg shadow-fuchsia-500/20 gap-2 text-base transition-all active:scale-[0.98]"
              >
                {loading ? <Activity className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                ATIVAR IDENTIDADE
              </Button>
            </form>
          </Card>

          <Card className="p-5 border-zinc-800 bg-zinc-900/50">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-fuchsia-500 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-fuchsia-400 uppercase tracking-tighter">Protocolo Onda Zero</h4>
                <p className="text-[11px] text-zinc-400 leading-tight mt-1 font-medium">
                  Controle global de acessos. Ações registradas em auditoria sigilosa.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </CEOShell>
  );
}
