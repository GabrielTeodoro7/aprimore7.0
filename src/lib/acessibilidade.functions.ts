import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * RN.37: Preferências de Acessibilidade cross-device.
 */
export const sincronizarPreferenciasAcessibilidade = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data: p }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from('preferencias_acessibilidade')
      .upsert({
        user_id: p.userId,
        alto_contraste: p.altoContraste,
        fonte_ampliada: p.fonteAmpliada,
        leitura_tela: p.leituraTela,
        atalhos_teclado: p.atalhosTeclado,
        daltonismo_tipo: p.daltonismoTipo,
        ultima_sincronizacao: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  });

/**
 * RN.24: Pranchas de Comunicação Personalizadas.
 */
export const salvarPranchaComunicacao = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data: p }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any)
      .from('pranchas_comunicacao')
      .upsert({
        id: p.id || undefined,
        user_id: p.userId,
        titulo: p.titulo,
        layout_json: p.layoutJson,
        favorita: p.favorita,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  });

export const listarPranchasUsuario = createServerFn({ method: "GET" })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any)
      .from('pranchas_comunicacao')
      .select('*')
      .eq('user_id', userId)
      .order('favorita', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });
