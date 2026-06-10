import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles, Brain, MessageCircle, BarChart3, Heart, ShieldCheck,
  ArrowRight, Loader2, Wand2, Check, Star, Quote,
} from "lucide-react";
import { useAuth, homeForRole } from "@/lib/auth-store";
import { demoPlanoLanding } from "@/lib/ai.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aprimore Educação — IA que adapta o ensino a cada aluno" },
      { name: "description", content: "Plataforma de ensino inclusivo com IA. Plano de estudos, tutor 24/7, quiz adaptativo e análise de desempenho — feita para TEA, TDAH, dislexia e cada jeito de aprender." },
      { property: "og:title", content: "Aprimore Educação — IA que adapta o ensino" },
      { property: "og:description", content: "IA pedagógica para alunos neurodivergentes e escolas inclusivas." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHydrated(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.97_0.03_240)] via-white to-[oklch(0.96_0.04_220)] text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center" aria-label="Aprimore Educação — início">
            <span className="bg-gradient-to-r from-[oklch(0.55_0.2_290)] via-[oklch(0.6_0.2_240)] to-[oklch(0.6_0.18_180)] bg-clip-text text-lg font-extrabold tracking-tight text-transparent md:text-xl">
              Aprimore Educação
            </span>
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold md:flex">
            <a href="#features" className="hover:text-primary">Recursos</a>
            <a href="#demo" className="hover:text-primary">Demonstração IA</a>
            <a href="#depoimentos" className="hover:text-primary">Depoimentos</a>
            <a href="#planos" className="hover:text-primary">Planos</a>
          </nav>
          {hydrated && user ? (
            <button
              onClick={() => navigate({ to: homeForRole(user.role) })}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow hover:brightness-110"
            >
              Entrar no painel <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow hover:brightness-110">
              Entrar <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[oklch(0.85_0.15_300)] opacity-30 blur-3xl" />
          <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-[oklch(0.85_0.15_200)] opacity-30 blur-3xl" />
        </div>
        {/* Animated blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-20 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.7_0.22_300)] opacity-40 blur-3xl motion-safe:animate-pulse" />
          <div className="absolute -right-32 top-32 h-[32rem] w-[32rem] rounded-full bg-[oklch(0.7_0.22_200)] opacity-40 blur-3xl motion-safe:animate-pulse [animation-delay:1s]" />
          <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-[oklch(0.78_0.2_145)] opacity-30 blur-3xl motion-safe:animate-pulse [animation-delay:2s]" />
          {/* Grid overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.4_0.2_280) 1px, transparent 1px), linear-gradient(90deg, oklch(0.4_0.2_280) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            }}
          />
        </div>
        <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col items-center justify-center px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/80 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-700">
              <Sparkles className="h-3.5 w-3.5" /> IA pedagógica brasileira
            </span>
            <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl lg:text-8xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-1000">
              Toda criança
              <br />
              <span className="relative inline-block">
                <span className="relative bg-gradient-to-r from-[oklch(0.55_0.25_300)] via-[oklch(0.6_0.24_240)] to-[oklch(0.65_0.22_180)] bg-clip-text text-transparent">
                  aprende do seu jeito.
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-[oklch(0.55_0.25_300)] via-[oklch(0.6_0.24_240)] to-[oklch(0.65_0.22_180)] opacity-20 blur-md"
                />
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000 motion-safe:delay-200">
              A IA do Aprimore descobre como cada aluno aprende melhor — pensada para
              <strong className="text-foreground"> TEA, TDAH, dislexia, discalculia, ansiedade</strong> e todo jeito de aprender.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000 motion-safe:delay-300">
              <Link
                to="/login"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[oklch(0.6_0.22_290)] to-[oklch(0.6_0.2_220)] px-8 py-4 text-base font-bold text-white shadow-2xl shadow-[oklch(0.5_0.2_280/0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-10px_oklch(0.5_0.2_280/0.6)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                Testar gratuitamente <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-full border-2 border-foreground/10 bg-white/80 px-8 py-4 text-base font-bold text-foreground shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white"
              >
                Ver IA funcionando <Wand2 className="h-5 w-5 text-primary" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000 motion-safe:delay-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> LGPD em conformidade</span>
              <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4 text-rose-500" /> Acessibilidade A11Y</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Sem cartão de crédito</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Uma IA para cada momento da jornada</h2>
          <p className="mt-3 text-muted-foreground">5 super-poderes que substituem 5 ferramentas que você usaria separadas.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-3xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg}`}>
                <f.icon className={`h-6 w-6 ${f.color}`} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO AO VIVO */}
      <section id="demo" className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.95_0.05_280)] to-[oklch(0.95_0.06_210)] py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
              <Wand2 className="h-3.5 w-3.5" /> Demonstração ao vivo
            </span>
            <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">Descreva um aluno. Veja a IA criar um plano em 5 segundos.</h2>
            <p className="mt-3 text-muted-foreground">Sem cadastro, sem cartão. É a IA de verdade rodando agora.</p>
          </div>
          <LiveDemo />
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Educadores que confiam no Aprimore</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.nome} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <Quote className="h-6 w-6 text-primary/40" />
              <p className="mt-3 text-sm leading-relaxed text-foreground">"{t.texto}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-full ${t.bg} text-sm font-bold text-white`}>{t.iniciais}</div>
                <div>
                  <p className="text-sm font-bold">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.papel}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="mx-auto max-w-5xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Planos para o futuro</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.nome} className={`flex flex-col rounded-3xl border p-7 ${p.destaque ? "border-primary bg-gradient-to-br from-primary/5 to-white shadow-xl ring-2 ring-primary/20" : "border-border bg-white shadow-sm"}`}>
              {p.destaque && <span className="mb-3 inline-block w-fit rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Mais escolhido</span>}
              <h3 className="text-xl font-extrabold">{p.nome}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-black">{p.preco}</span>
                <span className="text-sm text-muted-foreground">{p.periodo}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {p.itens.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {i}
                  </li>
                ))}
              </ul>
              <Link to="/login" className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${p.destaque ? "bg-primary text-primary-foreground shadow hover:brightness-110" : "border border-foreground/15 bg-white text-foreground hover:border-foreground/30"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-4 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-[oklch(0.5_0.2_280)] to-[oklch(0.5_0.2_220)] p-10 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-extrabold md:text-4xl">Pronto para personalizar o ensino?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Junte-se a centenas de educadores que já transformaram a sala de aula com a IA do Aprimore.</p>
          <Link to="/login" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-foreground shadow-xl hover:scale-105 transition">
            Começar agora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-white/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aprimore Educação — Feito com 💜 para cada jeito de aprender.
      </footer>
    </div>
  );
}

function LiveDemo() {
  const fn = useServerFn(demoPlanoLanding);
  const [necessidade, setNecessidade] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<Awaited<ReturnType<typeof demoPlanoLanding>> | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const exemplos = [
    "Aluno do 5º ano com TDAH, dificuldade em frações",
    "Criança com TEA nível 1, gosta de dinossauros, lê bem mas trava em interpretação",
    "Aluna com dislexia, 8 anos, alfabetização em andamento",
  ];

  async function gerar(texto?: string) {
    const input = (texto ?? necessidade).trim();
    if (input.length < 3) return;
    setNecessidade(input);
    setLoading(true); setErro(null); setResultado(null);
    try {
      const r = await fn({ data: { necessidade: input } });
      setResultado(r);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar");
    } finally { setLoading(false); }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-2xl backdrop-blur">
      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <label className="text-xs font-bold uppercase tracking-wide text-primary">Descreva o aluno</label>
        <div className="mt-2 flex flex-col gap-3 md:flex-row">
          <input
            value={necessidade}
            onChange={(e) => setNecessidade(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && gerar()}
            placeholder="Ex.: Aluno de 9 anos com TDAH, ama desenhar..."
            className="flex-1 rounded-2xl border border-input bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => gerar()}
            disabled={loading || necessidade.trim().length < 3}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Pensando…</> : <><Sparkles className="h-4 w-4" /> Gerar plano</>}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {exemplos.map((ex) => (
            <button key={ex} onClick={() => gerar(ex)} disabled={loading} className="rounded-full border border-border bg-white px-3 py-1 text-[11px] text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50">
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[260px] p-6">
        {!resultado && !loading && !erro && (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Brain className="h-12 w-12 text-primary/30" />
            <p className="mt-3 text-sm">O resultado da IA aparecerá aqui.</p>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm font-semibold text-muted-foreground">A IA está montando o plano…</p>
          </div>
        )}
        {erro && (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 border border-amber-200">
            🤔 Desculpe, estou aprendendo… Quer tentar outra pergunta?
          </div>
        )}
        {resultado && (
          <div className="space-y-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Plano sugerido</p>
              <h3 className="mt-1 text-xl font-extrabold">{resultado.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{resultado.resumo}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Passos práticos</p>
              <ol className="space-y-2">
                {resultado.passos.map((p, i) => (
                  <li key={i} className="flex gap-3 rounded-xl bg-muted/40 p-3 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{i + 1}</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-4 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Adaptação personalizada</p>
              <p className="mt-1">{resultado.adaptacao}</p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow hover:brightness-110">
              Quero o plano completo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const features = [
  { title: "Tutor IA 24/7", desc: "Chat conversacional com memória que guia o aluno sem dar resposta pronta. Adapta-se à necessidade.", icon: MessageCircle, bg: "bg-violet-100", color: "text-violet-600" },
  { title: "Plano de estudos personalizado", desc: "Em 30s a IA monta semanas de aprendizado com adaptação para TEA, TDAH, dislexia e mais.", icon: Brain, bg: "bg-sky-100", color: "text-sky-600" },
  { title: "Quiz adaptativo", desc: "Questões com dicas e explicações, com nível ajustado e enunciado adaptado à necessidade.", icon: Wand2, bg: "bg-amber-100", color: "text-amber-600" },
  { title: "Análise de desempenho", desc: "Diagnóstico construtivo, recomendações priorizadas e mensagem pronta para a família.", icon: BarChart3, bg: "bg-emerald-100", color: "text-emerald-600" },
  { title: "Acolhimento socioemocional", desc: "Monitora como o aluno está se sentindo e sugere intervenções para professor e família.", icon: Heart, bg: "bg-rose-100", color: "text-rose-600" },
  { title: "Painel para escola", desc: "Visão da turma, alertas de quem precisa atenção, logs e relatórios prontos para enviar.", icon: ShieldCheck, bg: "bg-indigo-100", color: "text-indigo-600" },
];

const testimonials = [
  { nome: "Profª Ana Carvalho", papel: "Pedagoga, EMEF Aprimore", texto: "Em duas semanas vi alunos com TDAH engajados como nunca. A IA propõe o que eu não teria tempo de criar.", iniciais: "AC", bg: "bg-violet-500" },
  { nome: "Carlos Mendes", papel: "Coordenador, Colégio Sirius", texto: "Reduzimos 40% do tempo de planejamento. A análise de desempenho virou o coração das reuniões com pais.", iniciais: "CM", bg: "bg-sky-500" },
  { nome: "Mariana Souza", papel: "Mãe de aluno com TEA", texto: "Pela primeira vez meu filho pediu para fazer 'só mais uma'. Isso vale tudo.", iniciais: "MS", bg: "bg-rose-500" },
];

const plans = [
  { nome: "Família", tagline: "Para um aluno em casa", preco: "Grátis", periodo: "(Beta)", itens: ["Tutor IA com 30 mensagens/mês", "Plano de estudos personalizado", "Acesso aluno + responsável"], cta: "Acessar Beta", destaque: false },
  { nome: "Escola Pro", tagline: "Para professores e turmas", preco: "Futuro", periodo: "", itens: ["Tutor IA ilimitado", "Painel professor + turma", "Quiz e plano adaptativos", "Análise + relatórios PDF"], cta: "Lista de espera", destaque: true },
  { nome: "Rede de ensino", tagline: "Multi-escolas, integrações", preco: "Futuro", periodo: "", itens: ["Tudo do Pro", "SSO e API", "Dashboard de rede", "Onboarding dedicado"], cta: "Lista de espera", destaque: false },
];
