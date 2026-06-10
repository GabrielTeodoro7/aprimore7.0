import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { safeGenerateObject } from "@/lib/ai-safe";

function getModel() {
  // Use a chave fornecida pelo usuário como fallback fixo para garantir estabilidade no GitHub/VSCode
  // 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
  // Chave fixa da Aprimore para garantir funcionamento no GitHub/VSCode
  const key = process.env.LOVABLE_API_KEY || "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";
  
  if (key.startsWith("gsk_")) {
    // Se for a chave Groq, usamos o provedor da Groq
    const provider = createLovableAiGatewayProvider(key, "https://api.groq.com/openai/v1");
    // @ts-ignore - llama3-70b-8192 ou llama-3.3-70b-versatile
    return provider("llama-3.3-70b-versatile");
  }

  const provider = createLovableAiGatewayProvider(key);
  return provider("google/gemini-3-flash-preview");
}

// Tom usado em vários prompts: lúdico, simples, fundamental/médio
const TOM_DIDATICO =
  "Use português do Brasil simples e acolhedor, frases curtas, com 1-2 emojis e exemplos do cotidiano (pizza, futebol, brinquedos, mochila etc.). Evite jargão técnico.";

// ============== 1) Sugerir atividade ==============
const SugerirInput = z.object({
  alunoNome: z.string().min(1),
  necessidade: z.string().optional().default(""),
  media: z.number().optional().default(7),
  observacoes: z.string().optional().default(""),
  materia: z.string().optional().default("Matemática"),
});

const SugerirSchema = z.object({
  title: z.string(),
  mat: z.string(),
  descricao: z.string(),
  objetivos: z.array(z.string()).min(2).max(5),
  materiais: z.array(z.string()).min(2).max(6),
  passos: z.array(z.string()).min(3).max(7),
  dificuldade: z.enum(["fácil", "média", "desafio"]),
  justificativa: z.string(),
});

export const sugerirAtividade = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SugerirInput.parse(data))
  .handler(async ({ data }) => {
    const necText = data.necessidade ? `com ${data.necessidade}` : "sem necessidade específica registrada";
    const nivel = data.media < 6 ? "abaixo da média (precisa reforço)" :
                  data.media < 8 ? "na média" : "acima da média (pode receber desafio)";

    const prompt = [
      `Sugira UMA atividade pedagógica para o(a) aluno(a) ${data.alunoNome}, ${necText}.`,
      `Média atual: ${data.media} — ${nivel}.`,
      data.observacoes ? `Observações do professor: ${data.observacoes}.` : "",
      `Matéria escolhida: ${data.materia}.`,
      "Adapte a dificuldade ao nível do aluno.",
      "Se houver necessidade (TEA, TDAH, dislexia, discalculia, ansiedade, deficiência visual/auditiva), inclua adaptações específicas.",
      TOM_DIDATICO,
    ].filter(Boolean).join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: SugerirSchema, prompt },
      {
        title: `Atividade de ${data.materia} para ${data.alunoNome}`,
        mat: data.materia,
        descricao: "Uma atividade prática e curta, pensada para acolher o(a) aluno(a) e dar pequenos passos.",
        objetivos: ["Praticar o conteúdo principal", "Construir confiança com pequenas vitórias"],
        materiais: ["Caderno", "Lápis colorido"],
        passos: [
          "Comece com uma conversa rápida sobre o tema.",
          "Faça 1 exemplo guiado junto com o(a) aluno(a).",
          "Peça que tente sozinho(a) 2 exemplos parecidos.",
        ],
        dificuldade: "média",
        justificativa: "Mini-plano de apoio — a IA estava lenta e devolvemos esta sugestão segura.",
      },
      { label: "sugerirAtividade" },
    );
  });

// ============== 2) Plano de estudos ==============
const PlanoInput = z.object({
  alunoNome: z.string().min(1),
  necessidade: z.string().optional().default(""),
  objetivo: z.string().min(3),
  materia: z.string().min(1),
  diasPorSemana: z.number().min(1).max(7).default(3),
  minutosPorDia: z.number().min(10).max(180).default(30),
});

const PlanoSchema = z.object({
  titulo: z.string(),
  resumo: z.string(),
  duracaoSemanas: z.number(),
  semanas: z.array(z.object({
    semana: z.number(),
    foco: z.string(),
    sessoes: z.array(z.object({
      dia: z.string(),
      tema: z.string(),
      atividade: z.string(),
      minutos: z.number(),
    })).min(1).max(7),
  })).min(2).max(8),
  dicasAdaptacao: z.array(z.string()).min(2).max(6),
});

export const gerarPlanoEstudos = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanoInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = [
      `Crie um plano de estudos personalizado para ${data.alunoNome}.`,
      data.necessidade ? `Necessidade educacional: ${data.necessidade}.` : "",
      `Matéria: ${data.materia}. Objetivo: ${data.objetivo}.`,
      `Disponibilidade: ${data.diasPorSemana} dias por semana, ${data.minutosPorDia} minutos por dia.`,
      "Plano com 3 a 6 semanas e progressão clara.",
      TOM_DIDATICO,
    ].filter(Boolean).join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: PlanoSchema, prompt },
      {
        titulo: `Plano de estudos de ${data.materia}`,
        resumo: `Roteiro inicial pensado para ${data.alunoNome}. Pequenos passos por semana.`,
        duracaoSemanas: 3,
        semanas: [
          { semana: 1, foco: "Reconhecer o tema", sessoes: [{ dia: "Seg", tema: "Introdução", atividade: "Conversa + 1 exemplo", minutos: data.minutosPorDia }] },
          { semana: 2, foco: "Praticar", sessoes: [{ dia: "Qua", tema: "Exercícios guiados", atividade: "5 questões com apoio", minutos: data.minutosPorDia }] },
        ],
        dicasAdaptacao: ["Faça pausas curtas a cada 10 minutos.", "Celebre cada pequena vitória 🎉"],
      },
      { label: "gerarPlanoEstudos" },
    );
  });

// ============== 3) Quiz adaptativo ==============
const QuizInput = z.object({
  materia: z.string().min(1),
  tema: z.string().min(1),
  nivel: z.enum(["fácil", "média", "desafio"]).default("média"),
  quantidade: z.number().min(3).max(10).default(5),
  necessidade: z.string().optional().default(""),
});

const QuizSchema = z.object({
  titulo: z.string(),
  nivel: z.enum(["fácil", "média", "desafio"]),
  questoes: z.array(z.object({
    enunciado: z.string(),
    alternativas: z.array(z.string()).length(4),
    correta: z.number().min(0).max(3),
    explicacao: z.string(),
    dica: z.string(),
  })).min(3).max(10),
});

export const gerarQuiz = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => QuizInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = [
      `Crie um quiz de ${data.quantidade} questões de múltipla escolha (4 alternativas) sobre "${data.tema}" da matéria ${data.materia}.`,
      `Nível: ${data.nivel}.`,
      data.necessidade ? `Aluno com ${data.necessidade}: enunciados curtos e exemplos concretos.` : "",
      "Cada questão deve ter explicação curta e uma dica que ajude antes de responder.",
      TOM_DIDATICO,
    ].filter(Boolean).join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: QuizSchema, prompt },
      {
        titulo: `Quiz de ${data.tema}`,
        nivel: data.nivel,
        questoes: [
          { enunciado: "Estamos preparando seu quiz! 🌱 Tente novamente em instantes.", alternativas: ["Tentar de novo", "Esperar", "Pedir ajuda", "Fechar"], correta: 0, explicacao: "Conteúdo temporário enquanto a IA carrega.", dica: "Recarregue para gerar as questões." },
          { enunciado: "Estamos preparando seu quiz!", alternativas: ["A", "B", "C", "D"], correta: 0, explicacao: "—", dica: "—" },
          { enunciado: "Estamos preparando seu quiz!", alternativas: ["A", "B", "C", "D"], correta: 0, explicacao: "—", dica: "—" },
        ],
      },
      { label: "gerarQuiz" },
    );
  });

// ============== 4) Análise de desempenho ==============
const DesempenhoInput = z.object({
  alunoNome: z.string().min(1),
  necessidade: z.string().optional().default(""),
  notas: z.array(z.object({
    materia: z.string(),
    nota: z.number().min(0).max(10),
  })).min(1).max(20),
  frequencia: z.number().min(0).max(100).default(90),
  observacoes: z.string().optional().default(""),
});

const DesempenhoSchema = z.object({
  resumoExecutivo: z.string(),
  pontosFortes: z.array(z.string()).min(1).max(5),
  pontosAtencao: z.array(z.string()).min(1).max(5),
  recomendacoes: z.array(z.object({
    titulo: z.string(),
    acao: z.string(),
    prioridade: z.enum(["alta", "média", "baixa"]),
  })).min(2).max(6),
  proximosPassos: z.array(z.string()).min(2).max(5),
  mensagemFamilia: z.string(),
});

export const analisarDesempenho = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DesempenhoInput.parse(d))
  .handler(async ({ data }) => {
    const notasTxt = data.notas.map(n => `${n.materia}: ${n.nota}`).join(", ");
    const prompt = [
      `Analise o desempenho escolar de ${data.alunoNome}, aluno do Ensino Fundamental/Médio.`,
      data.necessidade ? `Necessidade educacional: ${data.necessidade}.` : "",
      `Notas: ${notasTxt}. Frequência: ${data.frequencia}%.`,
      data.observacoes ? `Observações: ${data.observacoes}.` : "",
      "Gere diagnóstico construtivo adequado para a idade escolar (fundamental/médio), com pontos fortes, pontos de atenção, recomendações práticas e lúdicas (com prioridade), próximos passos e mensagem curta e acolhedora para a família.",
      "NUNCA diagnostique condições médicas ou use termos universitários/corporativos complexos.",
      TOM_DIDATICO,
    ].filter(Boolean).join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: DesempenhoSchema, prompt },
      {
        resumoExecutivo: `Resumo provisório de ${data.alunoNome} — a IA está atualizando os dados.`,
        pontosFortes: ["Está presente e tentando"],
        pontosAtencao: ["Acompanhar de perto nas próximas semanas"],
        recomendacoes: [
          { titulo: "Conversa de acolhimento", acao: "Bater um papo curto sobre como está se sentindo na escola.", prioridade: "média" },
          { titulo: "Reforço nas matérias mais difíceis", acao: "20 minutos por dia em casa, com apoio visual.", prioridade: "média" },
        ],
        proximosPassos: ["Reaplicar a análise em uma semana.", "Compartilhar com a família por mensagem curta."],
        mensagemFamilia: `Olá! Estamos acompanhando ${data.alunoNome} com carinho. Em breve enviaremos uma atualização completa. 💛`,
      },
      { label: "analisarDesempenho" },
    );
  });

// ============== 5) Demo público para landing ==============
const DemoInput = z.object({
  necessidade: z.string().min(2).max(200),
});
const DemoSchema = z.object({
  titulo: z.string(),
  resumo: z.string(),
  passos: z.array(z.string()).min(3).max(5),
  adaptacao: z.string(),
});
export const demoPlanoLanding = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DemoInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = [
      `Um professor descreve um aluno: "${data.necessidade}".`,
      "Gere UM mini plano de aprendizagem (teaser) que mostre como a plataforma Aprimore adapta o ensino.",
      "Resumo curto (1-2 frases), 3-5 passos práticos, e 1 dica de adaptação específica.",
      TOM_DIDATICO,
    ].join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: DemoSchema, prompt },
      {
        titulo: "Plano personalizado de aprendizagem",
        resumo: `Roteiro inicial pensado a partir de: "${data.necessidade}". Pequenos passos, muita repetição com sentido. 🌱`,
        passos: [
          "Conversar com o(a) aluno(a) para entender o que ele(a) gosta.",
          "Dividir o conteúdo em blocos curtos (10–15 min) com pausa entre eles. ⏱️",
          "Fazer uma atividade prática conectada ao cotidiano (ex: dividir uma pizza 🍕).",
          "Registrar a evolução em uma ficha simples e celebrar cada conquista. ⭐",
        ],
        adaptacao: "Use apoio visual (cards, ícones, cores) e dê um feedback positivo imediato a cada passo.",
      },
      { label: "demoPlanoLanding" },
    );
  });

// ============== 6) Tutor IA ==============
const TutorInput = z.object({
  necessidade: z.string().optional().default(""),
  serie: z.string().optional().default(""),
  historico: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(40).default([]),
  mensagem: z.string().min(1).max(2000),
});
const TutorSchema = z.object({
  resposta: z.string(),
  proximoPasso: z.string().optional(),
  sugestoes: z.array(z.string()).max(3).default([]),
});
export const tutorResponder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TutorInput.parse(d))
  .handler(async ({ data }) => {
    const sistema = [
      "Você é o Tutor Aprimore, um tutor amigável, paciente e didático para crianças e adolescentes.",
      data.necessidade ? `O aluno tem ${data.necessidade}: frases curtas, exemplos concretos, extra acolhedor.` : "",
      data.serie ? `Série/idade: ${data.serie}. Adapte o vocabulário.` : "",
      "Nunca dê a resposta pronta de tarefa: faça perguntas que guiem o raciocínio.",
      "Termine com 'proximoPasso' (o que praticar agora) e 2-3 'sugestoes' de próximas perguntas.",
      TOM_DIDATICO,
    ].filter(Boolean).join("\n");

    const hist = data.historico.map(m => `${m.role === "user" ? "Aluno" : "Tutor"}: ${m.content}`).join("\n");
    const prompt = [sistema, "", "Conversa até agora:", hist || "(início)", "", `Aluno: ${data.mensagem}`, "Tutor:"].join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: TutorSchema, prompt },
      {
        resposta: "Oi! 👋 Estou pensando aqui… Pode reformular sua pergunta com outras palavras? Assim eu te ajudo melhor.",
        proximoPasso: "Tente perguntar de novo de um jeito diferente.",
        sugestoes: ["Pode me dar um exemplo?", "Você pode explicar mais devagar?", "Pode fazer um desenho disso?"],
      },
      { label: "tutorResponder" },
    );
  });

// ============== 7) Plano de aula ==============
const PlanoAulaInput = z.object({
  materia: z.string().min(1),
  tema: z.string().min(1),
  serie: z.string().min(1),
  duracaoMinutos: z.number().min(15).max(180).default(50),
  necessidades: z.array(z.string()).max(6).default([]),
  recursos: z.string().optional().default(""),
});
const PlanoAulaSchema = z.object({
  titulo: z.string(),
  objetivosBNCC: z.array(z.string()).min(2).max(5),
  competencias: z.array(z.string()).min(1).max(4),
  etapas: z.array(z.object({
    nome: z.string(),
    minutos: z.number(),
    descricao: z.string(),
  })).min(3).max(7),
  recursosMateriais: z.array(z.string()).min(2).max(8),
  adaptacoesInclusivas: z.array(z.object({
    necessidade: z.string(),
    adaptacao: z.string(),
  })).max(6),
  avaliacao: z.string(),
  licaoDeCasa: z.string().optional(),
});
export const gerarPlanoAula = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanoAulaInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = [
      `Gere um plano de aula completo para ${data.serie} da matéria ${data.materia}.`,
      `Tema: ${data.tema}. Duração: ${data.duracaoMinutos} minutos.`,
      data.recursos ? `Recursos disponíveis: ${data.recursos}.` : "",
      data.necessidades.length
        ? `IMPORTANTE: turma com ${data.necessidades.join(", ")}. Inclua adaptações específicas em "adaptacoesInclusivas".`
        : "",
      "Use a BNCC como referência. Etapas com tempo somando o total.",
      TOM_DIDATICO,
    ].filter(Boolean).join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: PlanoAulaSchema, prompt },
      {
        titulo: `Plano de aula — ${data.tema}`,
        objetivosBNCC: ["Reconhecer o tema", "Aplicar em uma situação simples"],
        competencias: ["Comunicação", "Pensamento crítico"],
        etapas: [
          { nome: "Aquecimento", minutos: 10, descricao: "Conversa curta + exemplo do dia a dia." },
          { nome: "Desenvolvimento", minutos: Math.max(20, data.duracaoMinutos - 20), descricao: "Exploração guiada com material visual." },
          { nome: "Fechamento", minutos: 10, descricao: "Roda de conversa e síntese coletiva." },
        ],
        recursosMateriais: ["Quadro", "Cartões ilustrados"],
        adaptacoesInclusivas: data.necessidades.map((n) => ({ necessidade: n, adaptacao: "Apoio visual + tempo extra + instruções curtas." })),
        avaliacao: "Observação ativa + 1 tarefinha curta no fim da aula.",
        licaoDeCasa: "Trazer 1 exemplo do tema visto em casa.",
      },
      { label: "gerarPlanoAula" },
    );
  });

// ============== 8) Feedback de avaliação ==============
const FeedbackInput = z.object({
  alunoNome: z.string().min(1),
  necessidade: z.string().optional().default(""),
  textoAluno: z.string().min(5).max(5000),
  criterios: z.string().optional().default("clareza, coesão, ortografia, argumentação"),
  nota: z.number().min(0).max(10).optional(),
});
const FeedbackSchema = z.object({
  feedbackAluno: z.string(),
  pontosFortes: z.array(z.string()).min(1).max(5),
  pontosMelhoria: z.array(z.string()).min(1).max(5),
  comentarioProfessor: z.string(),
  notaSugerida: z.number().min(0).max(10),
});
export const feedbackAvaliacao = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FeedbackInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = [
      `Você é assistente de correção. Avalie a resposta de ${data.alunoNome}.`,
      data.necessidade ? `Necessidade: ${data.necessidade}.` : "",
      `Critérios: ${data.criterios}.`,
      data.nota !== undefined ? `Nota provisória do professor: ${data.nota}.` : "",
      "",
      `Resposta do aluno:\n"""${data.textoAluno}"""`,
      "",
      "Devolva: feedback direto AO ALUNO (2ª pessoa), pontos fortes, a melhorar, comentário interno ao professor e nota sugerida.",
      TOM_DIDATICO,
    ].filter(Boolean).join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: FeedbackSchema, prompt },
      {
        feedbackAluno: "Você caprichou! ⭐ Vamos só revisar alguns pontos juntos pra ficar ainda melhor.",
        pontosFortes: ["Tentou se expressar com clareza."],
        pontosMelhoria: ["Reler em voz alta antes de entregar."],
        comentarioProfessor: "Fallback automático — a IA está se reorganizando.",
        notaSugerida: data.nota ?? 7,
      },
      { label: "feedbackAvaliacao" },
    );
  });

// ============== 9) Resumo da turma ==============
const ResumoTurmaInput = z.object({
  turmaNome: z.string().optional().default("Turma"),
  alunos: z.array(z.object({
    nome: z.string(),
    media: z.number().min(0).max(10),
    frequencia: z.number().min(0).max(100),
    tag: z.string().optional().default(""),
    necessidade: z.string().optional().default(""),
  })).min(1).max(60),
  periodo: z.string().optional().default("últimas duas semanas"),
});
const ResumoTurmaSchema = z.object({
  panorama: z.string(),
  destaquesPositivos: z.array(z.string()).min(1).max(5),
  alertas: z.array(z.object({
    aluno: z.string(),
    motivo: z.string(),
    sugestao: z.string(),
  })).max(8),
  recomendacoesGerais: z.array(z.string()).min(2).max(5),
  mensagemCoordenacao: z.string(),
});
export const resumoTurma = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResumoTurmaInput.parse(d))
  .handler(async ({ data }) => {
    const linhas = data.alunos.map(a =>
      `- ${a.nome} | média ${a.media} | freq ${a.frequencia}% | ${a.tag}${a.necessidade ? ` | ${a.necessidade}` : ""}`
    ).join("\n");
    const prompt = [
      `Gere um resumo executivo da ${data.turmaNome} no período: ${data.periodo}.`,
      "Dados dos alunos:",
      linhas,
      "",
      "Identifique destaques positivos, alertas individuais (motivo + sugestão), recomendações gerais e mensagem para a coordenação.",
      "Português do Brasil, tom profissional e construtivo. NUNCA diagnostique.",
    ].join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: ResumoTurmaSchema, prompt },
      {
        panorama: `${data.turmaNome}: estamos coletando os dados. Resumo provisório.`,
        destaquesPositivos: ["A turma está presente e engajada."],
        alertas: [],
        recomendacoesGerais: ["Reaplicar a análise em alguns dias.", "Conversar com alunos de média mais baixa."],
        mensagemCoordenacao: "Resumo provisório — a IA atualizará o panorama em breve.",
      },
      { label: "resumoTurma" },
    );
  });

// ============== 10) Sugerir adaptações ==============
const AdaptacoesInput = z.object({
  necessidade: z.string().min(2),
  contexto: z.string().optional().default(""),
  materia: z.string().optional().default(""),
  idade: z.number().optional(),
});
const AdaptacoesSchema = z.object({
  resumo: z.string(),
  adaptacoesSala: z.array(z.string()).min(3).max(8),
  estrategiasComunicacao: z.array(z.string()).min(2).max(6),
  materiaisSugeridos: z.array(z.string()).min(2).max(6),
  comoAvaliar: z.array(z.string()).min(2).max(5),
  sinalAlerta: z.array(z.string()).max(5),
  recursosFamilia: z.array(z.string()).max(4),
});
export const sugerirAdaptacoes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AdaptacoesInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = [
      `Sugira adaptações pedagógicas práticas para aluno(a) com: ${data.necessidade}.`,
      data.idade ? `Idade aproximada: ${data.idade} anos.` : "",
      data.materia ? `Matéria: ${data.materia}.` : "",
      data.contexto ? `Contexto: ${data.contexto}.` : "",
      "Inclua adaptações de sala, comunicação, materiais, formas de avaliação, sinais de alerta e recursos para a família.",
      "NUNCA diagnostique nem prometa resultados.",
      TOM_DIDATICO,
    ].filter(Boolean).join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: AdaptacoesSchema, prompt },
      {
        resumo: `Sugestões iniciais para alunos com ${data.necessidade}.`,
        adaptacoesSala: ["Frases curtas e claras", "Apoio visual em todos os comandos", "Pausas curtas entre atividades"],
        estrategiasComunicacao: ["Use exemplos do cotidiano", "Confirme entendimento com perguntas simples"],
        materiaisSugeridos: ["Cartões ilustrados", "Lápis colorido + folhas grandes"],
        comoAvaliar: ["Observação contínua", "Tarefinhas curtas com feedback imediato"],
        sinalAlerta: ["Se houver isolamento prolongado, acione orientação."],
        recursosFamilia: ["Compartilhar rotina visual com a família."],
      },
      { label: "sugerirAdaptacoes" },
    );
  });

// ============== 11) Sentimentos ==============
const SentimentosInput = z.object({
  alunoNome: z.string().optional().default("aluno(a)"),
  registros: z.array(z.object({
    sentimento: z.string(),
    quando: z.string(),
  })).min(1).max(60),
});
const SentimentosSchema = z.object({
  humorPredominante: z.string(),
  tendencia: z.enum(["melhorando", "estável", "piorando"]),
  nivelAlerta: z.enum(["tranquilo", "atenção", "alto"]),
  observacoes: z.array(z.string()).min(1).max(5),
  mensagemAluno: z.string(),
  atividadeRegulacao: z.object({
    titulo: z.string(),
    descricao: z.string(),
    duracaoMinutos: z.number(),
  }),
  alertaProfessor: z.string().optional(),
});
export const analisarSentimentos = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SentimentosInput.parse(d))
  .handler(async ({ data }) => {
    const linhas = data.registros.map(r => `- ${r.quando}: ${r.sentimento}`).join("\n");
    const prompt = [
      `Analise o padrão emocional recente de ${data.alunoNome} com base nos registros abaixo.`,
      linhas,
      "",
      "Identifique humor predominante, tendência, nível de alerta, observações, mensagem curta e acolhedora pro aluno, e UMA atividade rápida de autorregulação (respiração, escrita, movimento).",
      "Se houver 3+ registros seguidos de tristeza/ansiedade/raiva, gere 'alertaProfessor' sugerindo acolhimento.",
      "NUNCA diagnostique nem cite condições clínicas.",
      TOM_DIDATICO,
    ].join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: SentimentosSchema, prompt },
      {
        humorPredominante: "indefinido",
        tendencia: "estável",
        nivelAlerta: "tranquilo",
        observacoes: ["Ainda estamos lendo os registros."],
        mensagemAluno: "Oi! 💛 Tudo bem? Conta pra gente como você está se sentindo hoje.",
        atividadeRegulacao: {
          titulo: "Respiração da estrelinha",
          descricao: "Inspire enquanto desenha uma ponta da estrela (4s), segura 2s, expira 6s. Repita 5 vezes. ⭐",
          duracaoMinutos: 3,
        },
      },
      { label: "analisarSentimentos" },
    );
  });

// ============== 12) Mensagem para responsáveis ==============
const MensagemInput = z.object({
  alunoNome: z.string().min(1),
  destinatario: z.string().optional().default("família"),
  objetivo: z.string().min(3),
  contexto: z.string().optional().default(""),
  tom: z.enum(["acolhedor", "informativo", "celebrar", "preocupado"]).default("acolhedor"),
  linguagemSimples: z.boolean().default(false),
});
const MensagemSchema = z.object({
  assunto: z.string(),
  mensagem: z.string(),
  versaoSimples: z.string(),
  proximosPassos: z.array(z.string()).max(4),
});
export const rascunhoMensagem = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MensagemInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = [
      `Escreva uma mensagem da escola para ${data.destinatario} de ${data.alunoNome}.`,
      `Objetivo: ${data.objetivo}.`,
      data.contexto ? `Contexto: ${data.contexto}.` : "",
      `Tom desejado: ${data.tom}.`,
      "Gere 'mensagem' completa e 'versaoSimples' em linguagem MUITO simples (frases curtas, sem jargão).",
      "Inclua próximos passos práticos quando fizer sentido. Nunca acusar a família.",
    ].filter(Boolean).join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: MensagemSchema, prompt },
      {
        assunto: `Atualização sobre ${data.alunoNome}`,
        mensagem: `Olá! Estamos entrando em contato sobre ${data.alunoNome}. Em breve compartilharemos mais detalhes. Qualquer dúvida, estamos aqui. Abraço, equipe Aprimore.`,
        versaoSimples: `Oi! Tudo bem com ${data.alunoNome}. A escola vai mandar mais notícias logo. 💛`,
        proximosPassos: ["Aguardar próxima mensagem com detalhes."],
      },
      { label: "rascunhoMensagem" },
    );
  });

// ============== 13) Pergunte aos seus dados ==============
const PerguntaInput = z.object({
  pergunta: z.string().min(3).max(500),
  alunos: z.array(z.object({
    nome: z.string(),
    media: z.number().optional(),
    frequencia: z.number().optional(),
    tag: z.string().optional(),
    necessidade: z.string().optional(),
  })).max(120),
});
const PerguntaSchema = z.object({
  resposta: z.string(),
  alunosCitados: z.array(z.string()).max(20),
  tabela: z.array(z.object({
    coluna: z.string(),
    valor: z.string(),
  })).max(20),
  sugestaoAcao: z.string().optional(),
});
export const perguntarAosDados = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PerguntaInput.parse(d))
  .handler(async ({ data }) => {
    const linhas = data.alunos.map(a =>
      `${a.nome} | média ${a.media ?? "-"} | freq ${a.frequencia ?? "-"}% | ${a.tag ?? ""}${a.necessidade ? ` | ${a.necessidade}` : ""}`
    ).join("\n");
    const prompt = [
      "Responda à pergunta do(a) professor(a) usando APENAS os dados abaixo.",
      "Se a pergunta não puder ser respondida com esses dados, diga isso explicitamente.",
      "",
      "Dados:",
      linhas,
      "",
      `Pergunta: ${data.pergunta}`,
      "",
      "Devolva: resposta em linguagem natural, alunos citados, tabela resumo (coluna/valor) e sugestão de ação opcional.",
      "Português do Brasil. Direto e objetivo.",
    ].join("\n");

    return safeGenerateObject(
      { model: getModel(), schema: PerguntaSchema, prompt },
      {
        resposta: "Ainda estou lendo seus dados — tente reformular a pergunta em alguns segundos.",
        alunosCitados: [],
        tabela: [],
        sugestaoAcao: "Tente reformular a pergunta com nomes específicos.",
      },
      { label: "perguntarAosDados" },
    );
  });

// ============== 14) Descrever imagem (acessibilidade) ==============
const DescreverInput = z.object({
  imagemBase64: z.string().min(20),
  contexto: z.string().optional().default(""),
});
const DescreverSchema = z.object({
  altCurto: z.string(),
  descricaoLonga: z.string(),
  textoExtraido: z.string().optional(),
});
export const descreverImagem = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DescreverInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");
    const model = createLovableAiGatewayProvider(key)("google/gemini-2.5-flash");

    return safeGenerateObject(
      {
        model,
        schema: DescreverSchema,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: `Descreva esta imagem para uma pessoa cega. ${data.contexto ? "Contexto: " + data.contexto + "." : ""} Gere: altCurto (até 120 caracteres), descricaoLonga (2-4 frases), e textoExtraido se houver texto visível. Português do Brasil.` },
            { type: "image", image: data.imagemBase64 },
          ],
        }],
      },
      {
        altCurto: "Imagem (descrição indisponível no momento).",
        descricaoLonga: "Não conseguimos descrever a imagem agora. Tente novamente em instantes.",
        textoExtraido: undefined,
      },
      { label: "descreverImagem" },
    );
  });
