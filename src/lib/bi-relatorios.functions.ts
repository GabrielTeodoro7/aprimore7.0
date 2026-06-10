import { supabase } from "@/integrations/supabase/client";

/**
 * RN.65, RN.67: Obtém o resumo analítico de uma turma.
 */
export async function obterConsolidadoTurma(turmaId: string) {
  const { data, error } = await supabase
    .from("bi_consolidado_turma")
    .select("*")
    .eq("turma_id", turmaId)
    .order("referencia_mes_ano", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * RN.68: Registra um log de exportação para fins de auditoria BI.
 */
export async function registrarExportacaoBI(userId: string, tipo: string, formato: string, registros: number) {
  const { error } = await supabase.from("bi_logs_exportacao").insert({
    user_id: userId,
    tipo_dados: tipo,
    formato_exportacao: formato,
    registros_afetados: registros
  });

  if (error) throw error;
  return { success: true };
}

/**
 * RN.70: Obtém o comparativo de desempenho entre escolas (BI).
 */
export async function obterComparativoEscolas() {
  const { data, error } = await supabase
    .from("v_bi_comparativo_escolas")
    .select("*");

  if (error) throw error;
  return data;
}
