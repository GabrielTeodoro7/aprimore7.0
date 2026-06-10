/**
 * TermsGate
 * --------------------------------------------------------------------------
 * Onda B.2 — Aceite de Termos (RN.05)
 *
 * Após o login, busca a versão vigente de cada `documentos_legais.tipo`
 * obrigatório e bloqueia a UI com um modal não dispensável até o usuário
 * aceitar a versão vigente. Registra o aceite na tabela `termos_aceitos`
 * com `profile_id`, `documento_id`, `aceito_em`, `ip` e `user_agent`,
 * permitindo auditoria e reaceite quando uma nova versão for publicada.
 *
 * Regras suportadas pelo backend Java (escola.service.TermosService):
 *   - exigirAceiteVigente(profileId, tipo) → TermosNaoAceitosException
 *   - aceitar(profileId, documentoId, ip, userAgent)
 *
 * No frontend não chamamos Java diretamente (Java é standalone, executado
 * localmente em VS Code). A persistência aqui é via Supabase, que é a
 * camada compartilhada da arquitetura. As regras Java espelham as RLS
 * policies e podem ser executadas localmente para auditoria.
 */
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-store";

type DocumentoLegal = {
  id: string;
  tipo: "TERMOS_USO" | "POLITICA_PRIVACIDADE";
  versao: string;
  texto: string;
  vigente_em: string;
  obrigatorio: boolean;
};

const TITULOS: Record<DocumentoLegal["tipo"], string> = {
  TERMOS_USO: "Termos de Uso",
  POLITICA_PRIVACIDADE: "Política de Privacidade",
};

async function carregarProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

async function carregarPendentes(profileId: string): Promise<DocumentoLegal[]> {
  // Versão vigente (mais recente) por tipo, somente obrigatórias.
  const { data: docs } = await supabase
    .from("documentos_legais")
    .select("id, tipo, versao, texto, vigente_em, obrigatorio")
    .eq("obrigatorio", true)
    .order("vigente_em", { ascending: false });
  if (!docs) return [];
  // Mantém apenas a versão mais recente de cada tipo.
  const vigentes = new Map<string, DocumentoLegal>();
  for (const d of docs as DocumentoLegal[]) {
    if (!vigentes.has(d.tipo)) vigentes.set(d.tipo, d);
  }
  const vigentesArr = [...vigentes.values()];

  // Quais desses já estão em termos_aceitos para este profile?
  const ids = vigentesArr.map((d) => d.id);
  if (ids.length === 0) return [];
  const { data: aceitos } = await supabase
    .from("termos_aceitos")
    .select("documento_id")
    .eq("profile_id", profileId)
    .in("documento_id", ids);
  const aceitosSet = new Set((aceitos ?? []).map((a) => a.documento_id));
  return vigentesArr.filter((d) => !aceitosSet.has(d.id));
}

export function TermsGate() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileId(null);
      return;
    }
    carregarProfileId(user.id).then(setProfileId);
  }, [user]);

  const { data: pendentes = [] } = useQuery({
    queryKey: ["lgpd", "termos-pendentes", profileId],
    queryFn: () => carregarPendentes(profileId!),
    enabled: Boolean(profileId),
    staleTime: 60_000,
  });

  const aceitarMut = useMutation({
    mutationFn: async (documentoId: string) => {
      if (!profileId) throw new Error("Perfil não carregado");
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
      const { error } = await supabase.from("termos_aceitos").insert({
        profile_id: profileId,
        documento_id: documentoId,
        user_agent: ua,
        // IP é registrado server-side em projetos com edge; aqui deixamos null
        // (RN.05 exige apenas rastreabilidade — profile + timestamp + UA).
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["lgpd", "termos-pendentes"] }),
  });

  const aberto = useMemo(() => Boolean(user && pendentes.length > 0), [user, pendentes]);
  const atual = pendentes[0];

  if (!aberto || !atual) return null;

  return (
    <Dialog open={aberto}>
      <DialogContent
        className="max-w-2xl"
        // bloqueia fechamento por ESC ou clique fora — RN.05 não permite recusar
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{TITULOS[atual.tipo]} — versão {atual.versao}</DialogTitle>
          <DialogDescription>
            Para continuar usando o sistema, é necessário ler e aceitar este documento.
            Faltam {pendentes.length} documento{pendentes.length > 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] rounded-md border p-4 text-sm">
          <pre className="whitespace-pre-wrap font-sans">{atual.texto}</pre>
        </ScrollArea>

        <DialogFooter>
          <Button
            disabled={aceitarMut.isPending}
            onClick={() => aceitarMut.mutate(atual.id)}
          >
            {aceitarMut.isPending ? "Registrando..." : "Li e aceito"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
