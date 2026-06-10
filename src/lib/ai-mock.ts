import type { Role } from "./auth-store";

export type AIAction = { label: string; to: string };
export type AIResponse = { text: string; actions?: AIAction[] };

export const suggestionsByRole: Record<Role, string[]> = {
  ceo: [
    "Visão executiva da instituição",
    "Saúde de uso por escola",
    "Auditoria das últimas ações",
    "Promover/rebaixar administradores",
  ],
  admin: [
    "Cadastre um novo professor",
    "Liste alunos com baixo acesso",
    "Reenvie e-mail de boas-vindas",
    "Qual a média de alunos por professor?",
  ],
  professor: [
    "Resuma o progresso da turma",
    "Quais alunos estão com baixa frequência?",
    "Sugira 3 atividades para alunos com TDAH",
    "Gere um plano de aula inclusivo",
    "Mostre o relatório do João Silva",
  ],
  aluno: [
    "Qual é a minha próxima atividade?",
    "Me ajude a montar uma frase",
    "Conte uma história sobre persistência",
    "Explique a atividade de Matemática",
  ],
};

const tdahAtividades = [
  "🧩 Quebra-cabeça com tempo curto (5min) e recompensa imediata.",
  "🎯 Caça ao tesouro de objetos pela sala — movimento + foco.",
  "🎨 Mandalas de pintura por etapas, com pausas a cada 10 minutos.",
];

export function responder(role: Role, mensagem: string, ctx?: { nomeAluno?: string }): AIResponse {
  const m = mensagem.toLowerCase().trim();

  // navegação
  if (m.includes("rotina")) {
    return { text: "Vamos dar uma olhada na sua rotina de hoje! 🌞", actions: [{ label: "Abrir Rotina", to: "/aluno/rotina" }] };
  }
  if (m.includes("atividade") && role === "aluno") {
    return { text: "Veja as atividades que estão te esperando!", actions: [{ label: "Ver atividades", to: "/aluno/atividades" }] };
  }
  if (m.includes("frase") || m.includes("comunic")) {
    if (role === "aluno") return {
      text: "Posso te ajudar! Vá à Comunicação por Imagens, escolha um cartão e eu monto a frase com você. Ex.: 'Eu quero água' 💧",
      actions: [{ label: "Comunicação", to: "/aluno/comunicacao" }],
    };
  }
  if (m.includes("história") || m.includes("historia") || m.includes("persistên")) {
    return {
      text: "Era uma vez uma criança que tentava amarrar o tênis. Errou várias vezes, mas a cada tentativa aprendia algo novo. Num dia comum, conseguiu! E descobriu que persistir é dar um passo de cada vez. ⭐",
    };
  }
  if (m.includes("matemát") || m.includes("matemat")) {
    return {
      text: "Vamos simplificar: pense em frações como pedaços de uma pizza 🍕. Se a pizza tem 4 pedaços e você come 1, comeu 1/4. Quer ver a atividade?",
      actions: [{ label: "Atividades", to: role === "aluno" ? "/aluno/atividades" : "/atividades" }],
    };
  }

  // professor
  if (role === "professor") {
    if (m.includes("progresso") || m.includes("resuma") || m.includes("turma")) {
      return { text: "Sua turma teve média 7,8 nesta semana (↑ 0,6). 92% de frequência. 3 alunos precisam de atenção: João Silva, Maria Oliveira e Pedro Santos.", actions: [{ label: "Ver turma", to: "/turma" }] };
    }
    if (m.includes("frequên") || m.includes("frequen") || m.includes("falta")) {
      return { text: "Alunos com frequência abaixo de 90%: Diego Alves (85%), Henrique Dias (82%), João Silva (78%), Pedro Santos (80%).", actions: [{ label: "Frequência", to: "/frequencia" }] };
    }
    if (m.includes("tdah")) {
      return { text: "Aqui vão 3 atividades para alunos com TDAH:\n\n" + tdahAtividades.join("\n") };
    }
    if (m.includes("plano de aula") || m.includes("inclusiv")) {
      return { text: "Plano sugerido (Português, 50min):\n1) Aquecimento com imagens (5min)\n2) Leitura compartilhada com pausas (15min)\n3) Atividade prática em duplas com material adaptado (20min)\n4) Roda de conversa e estrelas (10min)" };
    }
    if (m.includes("relatório") || m.includes("relatorio") || m.includes("joão") || m.includes("joao")) {
      const nome = ctx?.nomeAluno ?? "João Silva";
      return {
        text: `Relatório de ${nome}:\n• Média atual: 5,2\n• Frequência: 78%\n• Conquistas: Leitura, Amizade\n• Observações: precisa de apoio em leitura.`,
        actions: [{ label: "Imprimir / PDF", to: "/turma" }],
      };
    }
  }

  // admin
  if (role === "admin") {
    if (m.includes("cadastre") || m.includes("novo professor") || m.includes("novo aluno")) {
      return { text: "Posso te levar até o cadastro. Use o botão 'Novo cadastro' e escolha entre professor ou aluno.", actions: [{ label: "Professores", to: "/admin/professores" }, { label: "Alunos", to: "/admin/alunos" }] };
    }
    if (m.includes("baixo acesso") || m.includes("inativ")) {
      return { text: "Vou abrir os logs de acesso para você revisar quem entrou nos últimos dias.", actions: [{ label: "Logs", to: "/admin/logs" }] };
    }
    if (m.includes("reenvi") && m.includes("e-mail")) {
      return { text: "Vá até a lista de professores, clique no menu da linha e selecione 'Reenviar boas-vindas'.", actions: [{ label: "Professores", to: "/admin/professores" }] };
    }
    if (m.includes("média") || m.includes("media")) {
      return { text: "A média atual é de 2 alunos por professor (mock). Adicione mais cadastros para ver a evolução." };
    }
  }

  return {
    text: "Posso te ajudar com cadastros, relatórios, atividades e navegação. Escolha uma das sugestões abaixo ou descreva o que precisa.",
  };
}
