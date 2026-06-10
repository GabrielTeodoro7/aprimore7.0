import { supabase } from "@/integrations/supabase/client";

/**
 * RN.71, RN.72: Envia um documento para validação da secretaria.
 */
export async function enviarDocumento(alunoId: string, tipo: string, url: string) {
  const { data, error } = await supabase.from("documentos_aluno").insert({
    aluno_id: alunoId,
    tipo_documento: tipo,
    url_arquivo: url
  }).select().single();

  if (error) throw error;
  return data;
}

/**
 * RN.74-77: Obtém mensalidades pendentes do aluno logado.
 */
export async function obterMensalidadesPendentes(alunoId: string) {
  const { data, error } = await supabase
    .from("financeiro_mensalidades")
    .select("*")
    .eq("aluno_id", alunoId)
    .eq("status", "PENDENTE")
    .order("data_vencimento", { ascending: true });

  if (error) throw error;
  return data;
}
