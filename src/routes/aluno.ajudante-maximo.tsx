import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Brain, Lightbulb, Compass, MessageCircle, Heart, Zap, ShieldCheck } from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/aluno/ajudante-maximo")({
  head: () => ({ meta: [{ title: "Ajudante Máximo — Aprimore" }] }),
  component: AjudanteMaximo,
});

function AjudanteMaximo() {
  return (
    <StudentShell
      title={<><Sparkles className="inline h-7 w-7 text-[oklch(0.6_0.2_300)]" /> Ajudante Máximo</>}
      subtitle="Seu assistente pessoal para tudo o que você precisar"
    >
      <Tabs defaultValue="hoje" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="hoje" className="gap-2 py-3"><Zap className="h-4 w-4" /> Plano do Dia</TabsTrigger>
          <TabsTrigger value="estudo" className="gap-2 py-3"><Brain className="h-4 w-4" /> Dicas de Estudo</TabsTrigger>
          <TabsTrigger value="socio" className="gap-2 py-3"><Heart className="h-4 w-4" /> Bem-estar</TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2 py-3"><ShieldCheck className="h-4 w-4" /> Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hoje" className="mt-6">
          <PlanoDoDia />
        </TabsContent>
        
        <TabsContent value="estudo" className="mt-6">
          <DicasEstudo />
        </TabsContent>
        
        <TabsContent value="socio" className="mt-6">
          <BemEstar />
        </TabsContent>
        
        <TabsContent value="seguranca" className="mt-6">
          <SegurancaPrivacidade />
        </TabsContent>
      </Tabs>
    </StudentShell>
  );
}

function PlanoDoDia() {
  const tarefas = [
    { hora: "08:00", tarefa: "Início das aulas", status: "ok" },
    { hora: "10:00", tarefa: "Pausa para lanche", status: "pendente" },
    { hora: "14:00", tarefa: "Atividade de Matemática", status: "pendente" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Compass className="h-5 w-5 text-primary" /> Foco de Hoje
        </h3>
        <p className="text-muted-foreground mb-4">Hoje o seu maior objetivo é concluir os exercícios de frações!</p>
        <div className="space-y-3">
          {tarefas.map((t, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-accent/30">
              <Badge variant="outline">{t.hora}</Badge>
              <span className="font-semibold flex-1">{t.tarefa}</span>
              {t.status === "ok" ? <Badge className="bg-green-500">OK</Badge> : <Badge variant="secondary">Próximo</Badge>}
            </div>
          ))}
        </div>
      </Card>
      
      <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-sky-500/10 border-none shadow-none">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-violet-700">
          <Sparkles className="h-5 w-5" /> Super Dica do Ajudante
        </h3>
        <p className="text-lg font-medium italic text-violet-900 leading-relaxed">
          "Lembre-se de respirar fundo antes de começar Matemática. Você já venceu desafios maiores antes!"
        </p>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-violet-200 grid place-items-center text-2xl">🤖</div>
          <div className="text-sm font-bold text-violet-700">Seu Ajudante Máximo está torcendo por você!</div>
        </div>
      </Card>
    </div>
  );
}

function DicasEstudo() {
  const dicas = [
    { titulo: "Técnica Pomodoro", desc: "Estude por 25 minutos e descanse 5. Isso ajuda o cérebro a não cansar." },
    { titulo: "Mapas Mentais", desc: "Desenhe o que você aprendeu. Cores e desenhos ajudam a lembrar melhor." },
    { titulo: "Explique para alguém", desc: "Se você consegue explicar para um amigo, você realmente aprendeu!" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {dicas.map((d, i) => (
        <Card key={i} className="p-5 hover:border-primary transition cursor-default">
          <Lightbulb className="h-8 w-8 text-yellow-500 mb-3" />
          <h4 className="font-bold mb-2">{d.titulo}</h4>
          <p className="text-sm text-muted-foreground">{d.desc}</p>
        </Card>
      ))}
    </div>
  );
}

function BemEstar() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-pink-500" /> Como falar o que sente
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Se algo estiver difícil, use estas frases para pedir ajuda aos seus professores:</p>
        <ul className="space-y-2">
          <li className="p-3 bg-pink-50 rounded-xl border border-pink-100 text-sm font-medium">"Professor, pode me explicar de um jeito diferente?"</li>
          <li className="p-3 bg-pink-50 rounded-xl border border-pink-100 text-sm font-medium">"Eu preciso de um minuto para me organizar, tudo bem?"</li>
          <li className="p-3 bg-pink-50 rounded-xl border border-pink-100 text-sm font-medium">"Esta tarefa está muito longa, posso dividir em partes?"</li>
        </ul>
      </Card>
      
      <Card className="p-6 flex flex-col items-center text-center justify-center">
        <div className="text-6xl mb-4">🧘</div>
        <h3 className="text-xl font-bold mb-2">Momento de Calma</h3>
        <p className="text-muted-foreground text-sm max-w-xs">Feche os olhos, inspire pelo nariz contando até 4 e solte pela boca contando até 6.</p>
        <Button className="mt-4 rounded-full px-8 bg-[oklch(0.55_0.18_5)] hover:brightness-110">Começar exercício</Button>
      </Card>
    </div>
  );
}

function SegurancaPrivacidade() {
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 bg-green-100 text-green-700 rounded-2xl grid place-items-center">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Sua Segurança em Primeiro Lugar</h3>
          <p className="text-sm text-muted-foreground">Aqui você está em um ambiente protegido.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <h4 className="font-bold flex items-center gap-2 mb-1"><span className="text-xl">🤫</span> Seus dados são seus</h4>
          <p className="text-sm text-muted-foreground">Tudo o que você conversa com a IA é privado e serve apenas para te ajudar a aprender melhor.</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <h4 className="font-bold flex items-center gap-2 mb-1"><span className="text-xl">🚫</span> Sem julgamentos</h4>
          <p className="text-sm text-muted-foreground">Sinta-se livre para errar e perguntar quantas vezes quiser. A IA nunca vai ficar brava ou te julgar.</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <h4 className="font-bold flex items-center gap-2 mb-1"><span className="text-xl">📞</span> Apoio Humano</h4>
          <p className="text-sm text-muted-foreground">Se você vir algo estranho ou se sentir desconfortável, avise imediatamente um professor ou seus pais.</p>
        </div>
      </div>
    </Card>
  );
}
