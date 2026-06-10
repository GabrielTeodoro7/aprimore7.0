/**
 * Validação de CPF — Onda A.
 * Algoritmo oficial (dígitos verificadores). Aceita formatado ou apenas dígitos.
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string | null | undefined): boolean {
  if (value == null || value === "") return true; // opcional
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calc = (slice: number) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) {
      sum += parseInt(cpf[i]!, 10) * (slice + 1 - i);
    }
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };

  return calc(9) === parseInt(cpf[9]!, 10) && calc(10) === parseInt(cpf[10]!, 10);
}

export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
