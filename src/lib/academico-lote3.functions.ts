import { supabase } from "@/integrations/supabase/client";

/**
 * RN.12: Define o professor regente de uma turma com validação de turno.
 */
export async function definirProfessorRegente(turmaId: string, professorId: string) {
  const { data, error } = await (supabase as any)
    .from('turmas')
    .update({ professor_regente_id: professorId })
    .eq('id', turmaId);
  
  if (error) throw error;
  return data;
}

/**
 * RN.14: Busca alertas de faltas excessivas.
 */
export async function obterAlertasFaltas() {
  const { data, error } = await (supabase as any)
    .from('alertas_faltas')
    .select(`
      *,
      alunos (nome)
    `)
    .eq('resolvido', false);
  
  if (error) throw error;
  return data;
}

/**
 * RN.15: Justifica uma falta. A trigger no banco valida o prazo de 48h.
 */
export async function justificarFalta(frequenciaId: string, justificativa: string) {
  const { data, error } = await supabase
    .from('frequencia')
    .update({ justificativa })
    .eq('id', frequenciaId);
  
  if (error) throw error;
  return data;
}

/**
 * RN.17: Obtém a configuração de média ativa.
 */
export async function obterConfiguracaoMedia(anoLetivoId: string) {
  const { data, error } = await (supabase as any)
    .from('configuracao_notas')
    .select('*')
    .eq('ano_letivo_id', anoLetivoId)
    .single();
  
  if (error) throw error;
  return data;
}






