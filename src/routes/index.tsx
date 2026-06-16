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
    <div className="min-h-screen bg-[oklch(0.985_0.005_250)] text-foreground antialiased selection:bg-primary/20">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <Link to="/" className="flex items-center" aria-label="Aprimore Educação — início">
            <span className="text-[15px] font-semibold tracking-tight text-foreground md:text-base">
              Aprimore<span className="text-primary"> Educação</span>
            </span>
          </Link>
          <nav className="hidden gap-8 text-[13px] font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Recursos</a>
            <a href="#demo" className="transition-colors hover:text-foreground">Demonstração</a>
            <a href="#depoimentos" className="transition-colors hover:text-foreground">Depoimentos</a>
            <a href="#planos" className="transition-colors hover:text-foreground">Planos</a>
          </nav>
          {hydrated && user ? (
            <button
              onClick={() => navigate({ to: homeForRole(user.role) })}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background transition hover:opacity-90"
            >
              Painel <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background transition hover:opacity-90">
              Entrar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.85_0.12_270/0.55),transparent_70%)]" />
          <div className="absolute right-[-10%] top-[-10%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,oklch(0.85_0.10_210/0.40),transparent_70%)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.2_0.05_260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.2_0.05_260) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-24 md:min-h-[88vh] md:py-32">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-foreground/8 bg-white/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 shadow-elegant backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> IA pedagógica brasileira
          </span>

          <h1
            className="reveal mt-10 text-balance text-[clamp(2.5rem,1.5rem+4.5vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.035em] text-foreground"
            style={{ animationDelay: "100ms" }}
          >
            Toda criança
            <br />
            <span className="text-gradient-premium font-semibold italic">aprende do seu jeito.</span>
          </h1>

          <p
            className="reveal mx-auto mt-8 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground md:text-lg"
            style={{ animationDelay: "220ms" }}
          >
            A IA do Aprimore descobre como cada aluno aprende melhor — pensada para
            <span className="text-foreground"> TEA, TDAH, dislexia, discalculia, ansiedade</span> e todo jeito de aprender.
          </p>

          <div
            className="reveal mt-12 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "340ms" }}
          >
            <Link
              to="/login"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-7 py-3.5 text-[14px] font-semibold text-background shadow-premium-lg transition-all duration-500 hover:-translate-y-0.5"
            >
              <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Testar gratuitamente <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-7 py-3.5 text-[14px] font-semibold text-foreground backdrop-blur transition-all duration-500 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-white"
            >
              Ver IA funcionando <Wand2 className="h-4 w-4 text-primary" />
            </a>
          </div>

          <div
            className="reveal mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] font-medium text-muted-foreground"
            style={{ animationDelay: "480ms" }}
          >
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> LGPD em conformidade</span>
            <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-rose-500" /> Acessibilidade A11Y</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Sem cartão de crédito</span>
          </div>
        </div>
      </section>

      {/* FEATURES — Bento */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Recursos</p>
          <h2 className="mt-3 text-balance text-2xl font-medium tracking-[-0.02em] sm:text-3xl md:text-5xl">
            Uma IA para cada momento <span className="text-muted-foreground">da jornada.</span>
          </h2>
        </div>
        <div className="grid auto-rows-[minmax(180px,auto)] gap-3 sm:grid-cols-2 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group reveal relative overflow-hidden rounded-3xl border border-foreground/5 bg-white p-6 shadow-elegant transition-all duration-500 hover:-translate-y-1 sm:p-7 ${
                i === 0 ? "md:col-span-2" : i === 3 ? "md:col-span-2" : ""
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${f.bg} ring-1 ring-foreground/5`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em]">{f.title}</h3>
              <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-gradient-to-tr from-primary/10 to-transparent opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* DEMO AO VIVO */}
      <section id="demo" className="relative overflow-hidden border-y border-foreground/5 bg-[oklch(0.97_0.01_250)] py-16 sm:py-20 md:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Demonstração ao vivo</p>
            <h2 className="mt-3 text-balance text-2xl font-medium tracking-[-0.02em] sm:text-3xl md:text-5xl">
              Descreva um aluno. <span className="text-muted-foreground">A IA cria um plano em 5 segundos.</span>
            </h2>
          </div>
          <LiveDemo />
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Depoimentos</p>
          <h2 className="mt-3 text-balance text-2xl font-medium tracking-[-0.02em] sm:text-3xl md:text-5xl">
            Educadores que confiam <span className="text-muted-foreground">no Aprimore.</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">

          {testimonials.map((t, i) => (
            <figure
              key={t.nome}
              className="reveal flex flex-col rounded-3xl border border-foreground/5 bg-white p-7 shadow-elegant"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Quote className="h-5 w-5 text-primary/40" />
              <blockquote className="mt-4 grow text-[15px] leading-relaxed text-foreground">"{t.texto}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-foreground/5 pt-4">
                <div className={`grid h-10 w-10 place-items-center rounded-full ${t.bg} text-xs font-semibold text-white`}>{t.iniciais}</div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{t.nome}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{t.papel}</p>
                </div>
                <div className="ml-auto flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, idx) => <Star key={idx} className="h-3 w-3 fill-current" />)}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Planos</p>
          <h2 className="mt-3 text-balance text-2xl font-medium tracking-[-0.02em] sm:text-3xl md:text-5xl">
            Planos para <span className="text-muted-foreground">o futuro.</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {plans.map((p, i) => (
            <div
              key={p.nome}
              className={`reveal relative flex flex-col rounded-3xl p-6 transition-all duration-500 sm:p-7 ${
                p.destaque
                  ? "border border-foreground/10 bg-foreground text-background shadow-premium-lg sm:col-span-2 md:col-span-1"
                  : "border border-foreground/5 bg-white shadow-elegant hover:-translate-y-1"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {p.destaque && (
                <span className="absolute -top-2.5 left-7 inline-block rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
                  Mais escolhido
                </span>
              )}
              <h3 className="text-[15px] font-semibold tracking-tight">{p.nome}</h3>
              <p className={`mt-1 text-[13px] ${p.destaque ? "text-background/60" : "text-muted-foreground"}`}>{p.tagline}</p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-medium tracking-tight">{p.preco}</span>
                <span className={`text-[13px] ${p.destaque ? "text-background/60" : "text-muted-foreground"}`}>{p.periodo}</span>
              </div>
              <ul className={`mt-7 space-y-3 border-t pt-6 text-[14px] ${p.destaque ? "border-background/10" : "border-foreground/5"}`}>
                {p.itens.map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.destaque ? "text-emerald-400" : "text-emerald-600"}`} /> <span>{it}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold transition ${
                  p.destaque
                    ? "bg-background text-foreground hover:opacity-90"
                    : "border border-foreground/15 bg-white text-foreground hover:border-foreground/30"
                }`}
              >
                {p.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="grain-overlay relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,oklch(0.55_0.18_240),oklch(0.30_0.12_250)_60%,oklch(0.20_0.08_250))] p-8 text-center text-white shadow-premium-lg sm:p-14">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,white/10,transparent_70%)]" />
          <h2 className="relative text-balance text-2xl font-medium tracking-[-0.02em] sm:text-3xl md:text-5xl">
            Pronto para personalizar o ensino?
          </h2>

          <p className="relative mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">
            Junte-se a centenas de educadores que já transformaram a sala de aula com a IA do Aprimore.
          </p>
          <Link
            to="/login"
            className="relative mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold text-foreground shadow-xl transition hover:-translate-y-0.5"
          >
            Começar agora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-foreground/5 bg-white/60 py-8 text-center text-[12px] text-muted-foreground">
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
