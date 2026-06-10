/**
 * /privacidade/exportar — Onda B.3 / RN.34
 * -------------------------------------------------------
 * Direito à portabilidade. Usuário solicita ZIP/JSON com seus dados;
 * sistema gera arquivo em Storage privado (`lgpd-exports`) e devolve
 * Signed URL com validade de 7 dias.
 *
 * Equivalente Java: escola.service.ExportacaoLgpdService.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { solicitarExportacaoDados, listarMinhasExportacoes } from "@/lib/lgpd.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download } from "lucide-react";

export const Route = createFileRoute("/privacidade/exportar")({
  component: ExportarPage,
  head: () => ({
    meta: [
      { title: "Exportar meus dados" },
      { name: "description", content: "Solicite a portabilidade dos seus dados (LGPD)." },
    ],
  }),
});

function ExportarPage() {
  const solicitar = useServerFn(solicitarExportacaoDados);
  const listar = useServerFn(listarMinhasExportacoes);
  const qc = useQueryClient();

  const { data: exportacoes = [], isLoading } = useQuery({
    queryKey: ["lgpd", "exportacoes"],
    queryFn: () => listar({ data: undefined as never }),
  });

  const m = useMutation({
    mutationFn: () => solicitar({ data: undefined as never }),
    onSuccess: (r) => {
      toast.success("Exportação gerada. Link válido por 7 dias.");
      qc.invalidateQueries({ queryKey: ["lgpd", "exportacoes"] });
      if (r?.url) window.open(r.url, "_blank");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Exportar meus dados</h1>
        <p className="text-sm text-muted-foreground">
          Você pode solicitar uma cópia de todos os dados que mantemos sobre você.
          O arquivo ficará disponível por 7 dias (RN.34).
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Solicitar nova exportação</CardTitle>
          <CardDescription>
            Geramos um arquivo JSON contendo seu cadastro, termos aceitos e consentimentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => m.mutate()} disabled={m.isPending}>
            <Download className="mr-2 h-4 w-4" />
            {m.isPending ? "Gerando…" : "Solicitar exportação"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : exportacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma exportação solicitada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {exportacoes.map((e: any) => (
                <li key={e.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{new Date(e.created_at).toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {e.status} · Expira em {new Date(e.expira_em).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
