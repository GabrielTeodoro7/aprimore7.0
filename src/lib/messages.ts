import { toast } from "sonner";

/**
 * Catálogo de Mensagens Centralizado - Fase 406 Mensagens
 * Garante consistência visual e textual em todo o sistema.
 */
export const AppMessages = {
  // SUCESSO
  SUCCESS: {
    ALUNO_CADASTRADO: "Aluno cadastrado com sucesso.",
    TURMA_CRIADA: "Turma criada com sucesso.",
    NOTAS_SALVAS: "Notas salvas com sucesso.",
    FREQUENCIA_REGISTRADA: "Frequência do dia registrada com sucesso.",
    META_ADICIONADA: "Meta adicionada ao plano com sucesso.",
  },
  
  // ERRO
  ERROR: {
    SENHA_DIVERGENTE: "A senha informada e a confirmação de senha não coincidem. Digite novamente.",
    SENHA_FRACA: "A senha não atende aos requisitos mínimos de segurança.",
    REUTILIZACAO_SENHA: "A nova senha não pode ser igual a nenhuma das suas últimas 5 senhas.",
    CPF_INVALIDO: "CPF inválido. Verifique os dígitos e tente novamente.",
    TERMOS_OBRIGATORIOS: "É necessário aceitar os Termos de Uso e a Política de Privacidade para prosseguir.",
  },

  // ACESSIBILIDADE (Fase Assistiva)
  ACCESSIBILITY: {
    MODO_LEITURA_ATIVO: "Modo de leitura otimizado ativado.",
    AGENDA_VISUAL_INICIO: "Início do dia. Confira suas atividades planejadas.",
  }
};

/**
 * Helper para exibir Toasts padronizados
 */
export const showAppMessage = (id: keyof typeof AppMessages.SUCCESS | keyof typeof AppMessages.ERROR | string, type: 'success' | 'error' | 'info' = 'success') => {
  // Busca por ID ou usa string direta
  let message = id;
  
  if (AppMessages.SUCCESS[id as keyof typeof AppMessages.SUCCESS]) {
    message = AppMessages.SUCCESS[id as keyof typeof AppMessages.SUCCESS];
    type = 'success';
  } else if (AppMessages.ERROR[id as keyof typeof AppMessages.ERROR]) {
    message = AppMessages.ERROR[id as keyof typeof AppMessages.ERROR];
    type = 'error';
  }

  toast[type](message);
};
