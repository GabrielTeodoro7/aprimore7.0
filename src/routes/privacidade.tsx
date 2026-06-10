/**
 * /privacidade — Central de Privacidade (Onda B.2)
 * --------------------------------------------------------------------------
 * RN.45 — Consentimento granular por finalidade.
 *
 * Permite ao usuário ver suas finalidades de tratamento de dados e
 * conceder/revogar cada uma individualmente. Persiste em `consentimentos`
 * (uma linha por par profile_id + finalidade), com timestamps de
 * concessão/revogação para fins de auditoria.
 *
 * Regra Java equivalente em escola.service.ConsentimentoService:
 *   - conceder(profileId, finalidade)
 *   - revogar(profileId, finalidade)
 *   - exigir(profileId, finalidade) → ConsentimentoAusenteException
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

type Finalidade = "CADASTRO" | "IMAGEM" | "COMUNICACOES" | "COMPARTILHAMENTO";

const FINALIDADES: { id: Finalidade; titulo: string; descricao: string; obrigatorio?: boolean }[] = [
  {
    id: "CADASTRO",
    titulo: "Dados de cadastro",
    descricao: "Nome, e-mail e dados acadêmicos necessários para uso do sistema. Obrigatório.",
    obrigatorio: true,
  },
  {
    id: "IMAGEM",
    titulo: "Uso de imagem",
    descricao: "Utilização de fotos em comunicados, mural e materiais pedagógicos.",
  },
  {
    id: "COMUNICACOES",
    titulo: "Comunicações",
    descricao: "E-mails e notificações sobre atividades, eventos e novidades do sistema.",
  },
  {
    id: "COMPARTILHAMENTO",
    titulo: "Compartilhamento com responsáveis",
    descricao: "Envio de relatórios de desempenho e frequência para responsáveis cadastrados.",
  },
];

export const Route = createFileRoute("/privacidade")({
  component: PrivacidadePage,
  head: () => ({
    meta: [
      { title: "Central de Privacidade" },
      { name: "description", content: "Gerencie seus consentimentos de tratamento de dados." },
    ],
  }),
});

function PrivacidadePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfileId(data?.id ?? null));
  }, [user]);

  const { data: consentimentos = [] } = useQuery({
    queryKey: ["lgpd", "consentimentos", profileId],
    queryFn: async () => {
      const { data } = await supabase
        .from("consentimentos")
        .select("id, finalidade, concedido, concedido_em, revogado_em")
        .eq("profile_id", profileId!);
      return data ?? [];
    },
    enabled: Boolean(profileId),
  });

  const toggle = useMutation({
    mutationFn: async (vars: { finalidade: Finalidade; conceder: boolean }) => {
      if (!profileId) throw new Error("Perfil não carregado");
      const existente = consentimentos.find((c) => c.finalidade === vars.finalidade);
      const agora = new Date().toISOString();
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;

      if (existente) {
        const { error } = await supabase
          .from("consentimentos")
          .update({
            concedido: vars.conceder,
            concedido_em: vars.conceder ? agora : existente.concedido_em,
            revogado_em: vars.conceder ? null : agora,
            user_agent: ua,
          })
          .eq("id", existente.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("consentimentos").insert({
          profile_id: profileId,
          finalidade: vars.finalidade,
          concedido: vars.conceder,
          concedido_em: vars.conceder ? agora : null,
          revogado_em: vars.conceder ? null : agora,
          user_agent: ua,
        });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["lgpd", "consentimentos"] });
      toast.success(vars.conceder ? "Consentimento registrado" : "Consentimento revogado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <p>Faça login para gerenciar suas preferências de privacidade.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Central de Privacidade</h1>
        <p className="text-sm text-muted-foreground">
          Controle como seus dados são tratados no sistema, conforme a LGPD.
        </p>
      </header>

      <div className="space-y-4">
        {FINALIDADES.map((f) => {
          const c = consentimentos.find((x) => x.finalidade === f.id);
          const ativo = f.obrigatorio || Boolean(c?.concedido);
          return (
            <Card key={f.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base">{f.titulo}</CardTitle>
                  <CardDescription>{f.descricao}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`s-${f.id}`} className="sr-only">
                    {f.titulo}
                  </Label>
                  <Switch
                    id={`s-${f.id}`}
                    checked={ativo}
                    disabled={f.obrigatorio || toggle.isPending}
                    onCheckedChange={(v) =>
                      toggle.mutate({ finalidade: f.id, conceder: v })
                    }
                  />
                </div>
              </CardHeader>
              {c && (
                <CardContent className="text-xs text-muted-foreground">
                  {c.concedido && c.concedido_em && (
                    <p>Concedido em {new Date(c.concedido_em).toLocaleString("pt-BR")}</p>
                  )}
                  {!c.concedido && c.revogado_em && (
                    <p>Revogado em {new Date(c.revogado_em).toLocaleString("pt-BR")}</p>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Direitos do titular</CardTitle>
          <CardDescription>
            Exporte uma cópia dos seus dados a qualquer momento (RN.34).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/privacidade/exportar">
              <Download className="mr-2 h-4 w-4" />
              Exportar meus dados
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
