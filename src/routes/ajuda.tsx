import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, Mail, BookOpen, Video } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/ajuda")({
  head: () => ({ meta: [{ title: "Ajuda — Aprimore" }] }),
  component: Ajuda,
});

const faqs = [
  { q: "Como cadastrar um novo aluno?", a: "Vá em Minha Turma e clique em \"Novo aluno\". Preencha os dados básicos e salve." },
  { q: "Como adicionar uma atividade adaptada?", a: "Em Atividades, clique em \"Nova atividade\" e marque a opção \"Adaptada\"." },
  { q: "Como o aluno acessa a área dele?", a: "Na tela de entrada, escolha \"Sou Aluno(a)\". O aluno verá rotina, comunicação por imagens e conquistas." },
  { q: "Como funciona o Comunicador por Imagens?", a: "Selecione uma categoria, toque nos pictogramas para montar a frase e clique em \"Ouvir frase\" para reprodução em voz alta." },
];

function Ajuda() {
  return (
    <DashboardShell title="Central de Ajuda" subtitle="Tire suas dúvidas e aproveite ao máximo a plataforma.">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: BookOpen, t: "Guia do professor", d: "Tutorial passo a passo." },
          { icon: Video, t: "Vídeos curtos", d: "Aprenda em minutos." },
          { icon: Mail, t: "Falar com suporte", d: "suporte@aprimore.edu" },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <c.icon className="h-8 w-8 text-primary" />
            <div className="mt-3 font-bold text-foreground">{c.t}</div>
            <p className="text-sm text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
          <HelpCircle className="h-5 w-5 text-primary" /> Perguntas frequentes
        </div>
        <ul className="divide-y divide-border">
          {faqs.map((f) => (
            <li key={f.q} className="py-3">
              <details>
                <summary className="cursor-pointer font-semibold text-foreground">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </DashboardShell>
  );
}
