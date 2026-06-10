// PasswordStrengthMeter — Medidor de força de senha (RN.01 / RN.62).
// Apenas UI: a regra autoritativa é validada no servidor (politica_senha).
import { useMemo } from "react";

export interface PasswordPolicy {
  min_tamanho: number;
  exige_maiuscula: boolean;
  exige_minuscula: boolean;
  exige_numero: boolean;
  exige_simbolo: boolean;
}

export const POLITICA_PADRAO: PasswordPolicy = {
  min_tamanho: 10,
  exige_maiuscula: true,
  exige_minuscula: true,
  exige_numero: true,
  exige_simbolo: true,
};

export function avaliarSenha(senha: string, p: PasswordPolicy = POLITICA_PADRAO) {
  const regras = [
    { ok: senha.length >= p.min_tamanho, label: `≥ ${p.min_tamanho} caracteres` },
    { ok: !p.exige_maiuscula || /[A-Z]/.test(senha), label: "Letra maiúscula" },
    { ok: !p.exige_minuscula || /[a-z]/.test(senha), label: "Letra minúscula" },
    { ok: !p.exige_numero || /\d/.test(senha), label: "Número" },
    { ok: !p.exige_simbolo || /[^A-Za-z0-9]/.test(senha), label: "Símbolo (!@#$…)" },
  ];
  const score = regras.filter((r) => r.ok).length;
  return { regras, score, max: regras.length, valida: score === regras.length };
}

export function PasswordStrengthMeter({
  senha,
  politica = POLITICA_PADRAO,
}: {
  senha: string;
  politica?: PasswordPolicy;
}) {
  const a = useMemo(() => avaliarSenha(senha, politica), [senha, politica]);
  const pct = (a.score / a.max) * 100;
  const cor =
    a.score <= 1 ? "bg-red-500" : a.score <= 3 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="space-y-2 text-xs" aria-live="polite">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${cor}`}
          style={{ width: `${pct}%` }}
          aria-label={`Força: ${a.score} de ${a.max}`}
        />
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {a.regras.map((r) => (
          <li key={r.label} className={r.ok ? "text-green-600" : "text-muted-foreground"}>
            {r.ok ? "✓" : "•"} {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
