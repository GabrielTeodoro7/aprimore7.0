/**
 * /admin/ripd — Onda B.3 / RN.46
 * --------------------------------------------------------
 * Painel DPO. Lista relatórios de Impacto à Proteção de Dados (RIPD)
 * gerados trimestralmente e permite gerar um novo sob demanda.
 *
 * Equivalente Java: escola.service.RipdService + escola.threads.JobRipd
 * (execução periódica via ScheduledExecutorService).
 */
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gerarRipd, listarRipds, obterSignedUrlRipd } from "@/lib/lgpd.functions";
import { AdminShell } from "@/components/AdminShell";
import { RequireRole } from "@/components/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/ripd")({
  head: () => ({ meta: [{ title: "Admin — RIPD (DPO)" }] }),
  component: () => (
    <RequireRole roles={["admin", "ceo"]}>
      <Page />
    </RequireRole>
  ),
});

function Page() {
  const listar = useServerFn(listarRipds);
  const gerar = useServerFn(gerarRipd);
  const link = useServerFn(obterSignedUrlRipd);
  const qc = useQueryClient();

  const { data: relatorios = [], isLoading } = useQuery({
    queryKey: ["lgpd", "ripds"],
    queryFn: () => listar({ data: undefined as never }),
  });

  const m = useMutation({
    mutationFn: () => gerar({ data: undefined as never }),
    onSuccess: () => {
      toast.success("RIPD gerado.");
      qc.invalidateQueries({ queryKey: ["lgpd", "ripds"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const baixar = async (path: string) => {
    try {
      const r = await link({ data: { path } });
      if (r?.url) window.open(r.url, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminShell title="RIPD" subtitle="Relatórios de Impacto à Proteção de Dados">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => m.mutate()} disabled={m.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          {m.isPending ? "Gerando…" : "Gerar RIPD do trimestre atual"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : relatorios.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Nenhum RIPD gerado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {relatorios.map((r: any) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {r.ano} · Q{r.trimestre}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => baixar(r.storage_path)}>
                  <FileText className="mr-2 h-4 w-4" /> Baixar JSON
                </Button>
              </CardHeader>
              <CardContent className="text-sm">
                <dl className="grid grid-cols-2 gap-2 text-muted-foreground sm:grid-cols-4">
                  <div>
                    <dt className="text-xs">Exportações</dt>
                    <dd className="text-base font-semibold text-foreground">
                      {r.resumo?.exportacoes_realizadas ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs">Acessos sensíveis</dt>
                    <dd className="text-base font-semibold text-foreground">
                      {r.resumo?.acessos_sensiveis ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs">Termos aceitos</dt>
                    <dd className="text-base font-semibold text-foreground">
                      {r.resumo?.termos_aceitos ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs">Consentimentos</dt>
                    <dd className="text-base font-semibold text-foreground">
                      {r.resumo?.consentimentos_alterados ?? 0}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">
                  Gerado em {new Date(r.gerado_em).toLocaleString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
