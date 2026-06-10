import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ShieldCheck, UserPlus, Key, Mail, User, 
  Search, ShieldAlert, CheckCircle2, AlertTriangle,
  Lock, ArrowRight, Activity, Database
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
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

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Acesso Negado — Aprimore" }] }),
  component: () => (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-2xl font-bold">Acesso restrito ao CEO</h1>
      <p className="mt-2 text-muted-foreground">Esta funcionalidade foi movida para o painel de Onda Zero.</p>
    </div>
  ),
});

function GestorSupremo() {
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
          description: `Credenciais enviadas para ${form.email}`
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
    <AdminShell 
      title="Gestor Supremo" 
      subtitle="Controle total sobre identidades e acessos da plataforma"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Lado Esquerdo: Lista de Identidades */}
        <div className="space-y-6">
          <Card className="p-1 border-none bg-card shadow-lg">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input 
                value={q} 
                onChange={e => setQ(e.target.value)}
                placeholder="Pesquisar identidade na rede..."
                className="bg-transparent border-none outline-none text-sm w-full"
              />
              <Badge variant="outline" className="ml-auto">{visible.length} Identidades</Badge>
            </div>
            
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-bold">Usuário / ID</th>
                    <th className="px-6 py-4 font-bold text-center">Nível</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {visible.map((u) => (
                    <tr key={u.id} className="hover:bg-accent/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold">
                            {u.nome[0]}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">{u.nome}</div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge 
                          className={`
                            ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-600 border-rose-200' : 
                              u.role === 'professor' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 
                              'bg-emerald-500/10 text-emerald-600 border-emerald-200'}
                          `}
                          variant="outline"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${u.status === 'ativo' ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'}`} />
                          <span className="text-xs font-medium capitalize">{u.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
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
            <Card className="p-4 border-none bg-primary/5 flex flex-col gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div className="text-2xl font-black">{list.length}</div>
              <div className="text-[10px] uppercase font-bold text-primary tracking-widest">Contas Totais</div>
            </Card>
            <Card className="p-4 border-none bg-blue-500/5 flex flex-col gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-black">100%</div>
              <div className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">Integridade</div>
            </Card>
            <Card className="p-4 border-none bg-rose-500/5 flex flex-col gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              <div className="text-2xl font-black">0</div>
              <div className="text-[10px] uppercase font-bold text-rose-500 tracking-widest">Vulnerabilidades</div>
            </Card>
          </div>
        </div>

        {/* Lado Direito: Terminal de Criação */}
        <div className="space-y-6">
          <Card className="p-6 border-none bg-card shadow-2xl relative overflow-hidden ring-1 ring-primary/20">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="h-24 w-24" />
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Nova Identidade</h3>
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Criação Direta Supabase</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase ml-1 opacity-70">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={form.nome} 
                    onChange={e => setForm({...form, nome: e.target.value})}
                    placeholder="Ex: Gabriel Gestor" 
                    className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-1 ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase ml-1 opacity-70">Email de Acesso</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email"
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="gabriel@escola.com" 
                    className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-1 ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase ml-1 opacity-70">Senha Mestra</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    value={form.senha} 
                    onChange={e => setForm({...form, senha: e.target.value})}
                    placeholder="••••••••" 
                    className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-1 ring-primary"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground px-1 italic">Mínimo 6 caracteres para autenticação segura.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2">
                <button 
                  type="button"
                  onClick={() => setForm({...form, role: 'professor'})}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.role === 'professor' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                >
                  <User className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Professor</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setForm({...form, role: 'admin'})}
                  className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${form.role === 'admin' ? 'border-rose-500 bg-rose-500/5' : 'border-border hover:bg-accent'}`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Admin</span>
                </button>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 gap-2 text-base transition-all active:scale-[0.98]"
              >
                {loading ? <Activity className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                MANIFESTAR IDENTIDADE
              </Button>
            </form>
          </Card>

          <Card className="p-5 border-none bg-amber-500/10 border-amber-200/20">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-amber-700 uppercase tracking-tighter">Protocolo Gestor Supremo</h4>
                <p className="text-[11px] text-amber-800 leading-tight mt-1 font-medium">
                  A criação de usuários via este terminal ignora o fluxo de confirmação de email, 
                  ativando a conta instantaneamente no banco de dados Supabase.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
