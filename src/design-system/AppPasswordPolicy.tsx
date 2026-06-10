import * as React from "react"
import { Check, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface PasswordRule {
  id: string
  label: string
  test: (pass: string) => boolean
}

const rules: PasswordRule[] = [
  { id: "min", label: "Mínimo 8 caracteres", test: (p) => p.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "Uma letra minúscula", test: (p) => /[a-z]/.test(p) },
  { id: "num", label: "Um número", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "Um caractere especial (@#$!%*?)", test: (p) => /[@#$!%*?]/.test(p) },
]

export const AppPasswordPolicy = ({ value }: { value: string }) => {
  const score = rules.filter(r => r.test(value)).length
  const percentage = (score / rules.length) * 100

  const getStrengthLabel = () => {
    if (score === 0) return { label: "Muito Fraca", color: "text-destructive" }
    if (score <= 2) return { label: "Fraca", color: "text-orange-500" }
    if (score <= 3) return { label: "Média", color: "text-yellow-500" }
    if (score <= 4) return { label: "Forte", color: "text-green-500" }
    return { label: "Muito Forte", color: "text-emerald-500" }
  }

  const { label, color } = getStrengthLabel()

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold">Força da Senha: <span className={cn(color)}>{label}</span></span>
        <span className="text-xs text-muted-foreground">{score}/{rules.length}</span>
      </div>
      
      <Progress value={percentage} className={cn("h-2 transition-all", {
        "bg-destructive/20 [&>div]:bg-destructive": score <= 1,
        "bg-orange-500/20 [&>div]:bg-orange-500": score === 2,
        "bg-yellow-500/20 [&>div]:bg-yellow-500": score === 3,
        "bg-green-500/20 [&>div]:bg-green-500": score === 4,
        "bg-emerald-500/20 [&>div]:bg-emerald-500": score === 5,
      })} />

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {rules.map(rule => {
          const isValid = rule.test(value)
          return (
            <li key={rule.id} className="flex items-center gap-2 text-xs">
              {isValid ? (
                <Check className="h-3 w-3 text-emerald-500 shrink-0" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              )}
              <span className={cn(isValid ? "text-emerald-700 font-medium" : "text-muted-foreground")}>
                {rule.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
