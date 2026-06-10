import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppButton } from "@/design-system/AppButton";
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription, AppCardFooter } from "@/design-system/AppCard";
import { AppInput } from "@/design-system/AppInput";
import { AppPasswordPolicy } from "@/design-system/AppPasswordPolicy";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { showAppMessage } from "@/lib/messages";
import { ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/alunos")({
  component: CadastroAluno,
});

function CadastroAluno() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    matricula: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de cadastro
    showAppMessage("ALUNO_CADASTRADO_1", "success");
    setTimeout(() => navigate({ to: "/" }), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <AppButton variant="ghost" onClick={() => navigate({ to: "/" })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </AppButton>

        <AppCard>
          <AppCardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <AppCardTitle className="text-2xl">Novo Cadastro de Aluno</AppCardTitle>
                <AppCardDescription>Preencha os dados abaixo para registrar um novo estudante.</AppCardDescription>
              </div>
            </div>
          </AppCardHeader>
          <form onSubmit={handleSubmit}>
            <AppCardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <AppInput id="nome" placeholder="Ex: João Silva" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <AppInput id="cpf" placeholder="000.000.000-00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Institucional</Label>
                  <AppInput id="email" type="email" placeholder="aluno@escola.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <AppInput id="matricula" placeholder="2026-XXXX" required />
                </div>
              </div>

              <div className="h-px bg-border my-2" />

              <div className="space-y-4">
                <Label htmlFor="password">Definir Senha de Acesso</Label>
                <AppInput 
                  id="password" 
                  type="password" 
                  placeholder="Digite uma senha forte" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <AppPasswordPolicy value={password} />
              </div>
            </AppCardContent>
            <AppCardFooter className="flex justify-end gap-3 bg-muted/20 p-6">
              <AppButton variant="outline" type="button" onClick={() => navigate({ to: "/" })}>Cancelar</AppButton>
              <AppButton type="submit" disabled={password.length < 8}>
                Finalizar Cadastro
              </AppButton>
            </AppCardFooter>
          </form>
        </AppCard>

        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>
            Após o cadastro, o aluno receberá um e-mail de confirmação para ativar sua conta. 
            <strong> (Requer configuração de domínio de e-mail)</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
