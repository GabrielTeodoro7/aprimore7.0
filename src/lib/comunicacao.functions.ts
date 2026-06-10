import { createServerFn } from "@tanstack/react-start";

/**
 * RN.25: Moderação de Conteúdo.
 */
export const denunciarConteudo = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data: p }) => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;

    const { error } = await supabaseAdmin
      .from('denuncias_mensagem')
      .insert({
        mensagem_id: p.mensagemId,
        denunciante_id: p.denuncianteId || null,
        motivo: p.motivo,
        detalhes: p.detalhes,
        status: 'PENDENTE'
      });

    if (error) throw error;
    return { success: true };
  });

/**
 * RN.26: Preferência de Canal de Notificação.
 */
export const atualizarCanalNotificacao = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data: p }) => {
    const { supabaseAdmin: _sb } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = _sb as any;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ canal_preferido: p.canal } as any)
      .eq('id', p.userId);

    if (error) throw error;
    return { success: true };
  });
