import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SyncItem = Database["public"]["Tables"]["sync_queue"]["Insert"];

/**
 * RN.53, RN.54: Adiciona uma operação à fila de sincronização offline.
 */
export async function queueOfflineOperation(item: SyncItem): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("sync_queue").insert(item);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao enfileirar operação offline:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * RN.56-60: Funções simuladas para o SGE (Sistema de Gestão Educacional Inteligente).
 * Em um ambiente real, estas funções chamariam a Lovable AI Gateway ou Edge Functions.
 */

export async function gerarSugestaoPlanoAula(professorId: string, turmaId: string, tema: string) {
  // Simulação de chamada de IA
  const sugestao = `Plano de aula sugerido para ${tema}: 
  1. Introdução contextualizada.
  2. Atividade prática em grupo.
  3. Debate final.`;

  const { data, error } = await supabase.from("ia_sugestoes").insert({
    professor_id: professorId,
    turma_id: turmaId,
    tipo_sugestao: "PLANO_AULA",
    conteudo_original: tema,
    sugestao_ia: sugestao
  }).select().single();

  if (error) throw error;
  return data;
}

export async function analisarRiscoEvasao(alunoId: string) {
  // Simulação de lógica preditiva
  const { data, error } = await supabase.from("ia_analise_aluno").insert({
    aluno_id: alunoId,
    risco_evasao: 0.15,
    pontos_fortes: ["Participação", "Lógica"],
    pontos_melhoria: ["Frequência"],
    plano_acao_sugerido: "Reunião de acolhimento com os responsáveis."
  }).select().single();

  if (error) throw error;
  return data;
}
