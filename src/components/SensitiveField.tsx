/**
 * SensitiveField — Onda B.3 / RN.63 / RNF.22 (privacidade por padrão)
 * --------------------------------------------------------------------
 * Componente que mascara dados sensíveis (ex.: CPF) e exige justificativa
 * textual para revelar. A ação é registrada em `logs_acesso_sensiveis`
 * via server function `registrarAcessoSensivel`.
 *
 * Equivalente Java: regra reforçada também no backend (ver
 * escola.service.AnonimizacaoService e logs de acesso).
 */
import { useState } from "react";
import { Eye } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { registrarAcessoSensivel } from "@/lib/lgpd.functions";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Props = {
  alunoId: string;
  campo: string; // ex: "CPF", "nota_individual"
  valor: string | null | undefined;
  mascara?: (v: string) => string;
};

function defaultMask(v: string) {
  if (v.length <= 4) return "•".repeat(v.length);
  return v.slice(0, 3) + "•".repeat(Math.max(1, v.length - 5)) + v.slice(-2);
}

export function SensitiveField({ alunoId, campo, valor, mascara }: Props) {
  const [open, setOpen] = useState(false);
  const [revelado, setRevelado] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [carregando, setCarregando] = useState(false);
  const registrar = useServerFn(registrarAcessoSensivel);

  if (!valor) return <span className="text-muted-foreground">—</span>;

  const masked = (mascara ?? defaultMask)(valor);

  const confirmar = async () => {
    if (justificativa.trim().length < 10) {
      toast.error("Justificativa deve ter ao menos 10 caracteres.");
      return;
    }
    setCarregando(true);
    try {
      await registrar({ data: { alunoId, campo, justificativa: justificativa.trim() } });
      setRevelado(true);
      setOpen(false);
      toast.success("Acesso registrado para auditoria (RN.63).");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <span className="inline-flex items-center gap-2 font-mono">
        {revelado ? valor : masked}
        {!revelado && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-muted-foreground hover:text-primary"
            aria-label={`Revelar ${campo}`}
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revelar dado sensível ({campo})</DialogTitle>
            <DialogDescription>
              O acesso a este dado será registrado em log de auditoria conforme a LGPD
              (RN.63). Informe a justificativa do acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="just">Justificativa</Label>
            <Textarea
              id="just"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex.: Verificação cadastral solicitada pelo responsável."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={confirmar} disabled={carregando}>
              {carregando ? "Registrando…" : "Confirmar e revelar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
