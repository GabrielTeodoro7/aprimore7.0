import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * O QUE: Funções de servidor para Vida Acadêmica.
 * POR QUE: Implementar regras RN.11 a RN.49 no backend TypeScript.
 */

// Usamos any para evitar erros de tipos do Supabase enquanto as novas tabelas 
// da Onda C.2 não são refletidas no schema gerado (src/integrations/supabase/types.ts).

export const transferirAluno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => 
    z.object({
      alunoId: z.string().uuid(),
      turmaOrigemId: z.string().uuid().nullable(),
      turmaDestinoId: z.string().uuid(),
      motivo: z.string().max(500).optional(),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;

    // 1. Registrar histórico (RN.11)
    const { error: histError } = await supabase
      .from("historico_transferencias")
      .insert({
        aluno_id: data.alunoId,
        turma_origem_id: data.turmaOrigemId,
        turma_destino_id: data.turmaDestinoId,
        motivo: data.motivo
      });
    
    if (histError) throw new Error(histError.message);

    // 2. Atualizar perfil do aluno
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ turma_id: data.turmaDestinoId })
      .eq("id", data.alunoId);

    if (updateError) throw new Error(updateError.message);

    return { success: true };
  });

export const listarBimestres = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ anoLetivoId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const { data: rows, error } = await supabase
      .from("bimestres")
      .select("*")
      .eq("ano_letivo_id", data.anoLetivoId)
      .order("numero");
    
    if (error) throw new Error(error.message);
    return rows;
  });

export const lancarNotaConsistente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => 
    z.object({
      alunoId: z.string().uuid(),
      materia: z.string(),
      valor: z.number().min(0).max(10),
      bimestreId: z.string().uuid(),
      avaliacaoId: z.string().uuid().optional(),
    }).parse(i)
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;

    // 1. Verificar se bimestre está aberto (RN.16)
    const { data: bim, error: bimError } = await supabase
      .from("bimestres")
      .select("aberto")
      .eq("id", data.bimestreId)
      .single();

    if (bimError || !bim) throw new Error("Bimestre não encontrado");
    if (!bim.aberto) throw new Error("Não é possível lançar nota em bimestre fechado (RN.16)");

    // 2. Persistir nota (RN.47)
    const { data: row, error } = await supabase
      .from("notas")
      .insert({
        aluno_id: data.alunoId,
        materia: data.materia,
        valor: data.valor,
        bimestre_id: data.bimestreId,
        avaliacao_id: data.avaliacaoId
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row;
  });


