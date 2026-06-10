import React from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from '@/design-system/AppCard';
import { AppButton } from '@/design-system/AppButton';
import { AppBadge } from '@/design-system/AppBadge';
import { Check, Star, ShieldCheck, Zap, ArrowRight, DollarSign, Calculator } from 'lucide-react';
import { useToast } from "@/hooks/use-toast-hook";

export const PricingSimulator = () => {
  const { toast } = useToast();
  const plans = [
    {
      name: 'Essencial',
      price: 'Grátis',
      description: 'Perfeito para professores e pequenas turmas.',
      features: ['Até 30 alunos', 'Gamificação básica', 'Relatórios simples', 'Acessibilidade padrão'],
      color: 'border-slate-200',
      buttonVariant: 'outline' as const,
    },
    {
      name: 'Premium',
      price: 'R$ 49/mês',
      description: 'Ideal para escolas que buscam inclusão total.',
      features: ['Alunos ilimitados', 'IA Pedagógica (PEI)', 'Jogos customizados', 'Ranking da turma', 'Portal da Família'],
      color: 'border-primary shadow-lg scale-105 z-10',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Rede Escolar',
      price: 'Sob consulta',
      description: 'Gestão completa para redes e municípios.',
      features: ['Múltiplas unidades', 'Audit Timeline global', 'Suporte VIP 24/7', 'Customização total'],
      color: 'border-slate-200',
      buttonVariant: 'outline' as const,
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Planos e Simulação</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Escolha o plano ideal para sua escola ou simule o retorno sobre o investimento em educação inclusiva.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 items-center">
        {plans.map((plan) => (
          <AppCard key={plan.name} className={`relative flex flex-col h-full border-2 ${plan.color}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <AppBadge className="bg-primary text-white border-none px-4 py-1">MAIS ESCOLHIDO</AppBadge>
              </div>
            )}
            <AppCardHeader className="text-center space-y-2">
              <AppCardTitle className="text-2xl">{plan.name}</AppCardTitle>
              <div className="text-3xl font-bold">{plan.price}</div>
              <AppCardDescription>{plan.description}</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="flex-1 space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <AppButton onClick={() => toast({title: "Inscrição", description: `Iniciando checkout do plano ${plan.name}.`})} variant={plan.buttonVariant} className="w-full gap-2">
                Começar agora <ArrowRight className="h-4 w-4" />
              </AppButton>
            </AppCardContent>
          </AppCard>
        ))}
      </div>

      <AppCard className="bg-slate-900 text-white overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-primary">
                <Calculator className="h-6 w-6" /> Simulador de ROI
              </h3>
              <p className="text-slate-400 text-sm">
                Veja quanto tempo você economiza com o Aprimore.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Alunos com Necessidades Especiais</span>
                  <span className="text-white">15</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[40%] h-full bg-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Tempo gasto em PEIs (Sem Aprimore)</span>
                  <span className="text-white">120h / mês</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[80%] h-full bg-red-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Tempo gasto em PEIs (Com Aprimore)</span>
                  <span className="text-white">15h / mês</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[10%] h-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary/10 p-8 flex flex-col justify-center items-center text-center space-y-4 border-l border-white/5">
            <Zap className="h-12 w-12 text-yellow-500 animate-pulse" />
            <div className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">Economia Estimada</p>
              <p className="text-4xl font-black text-white">105 horas</p>
              <p className="text-slate-400 text-sm">por mês para sua equipe focar no que importa: ensinar.</p>
            </div>
            <AppButton onClick={() => toast({title: "Simulador Personalizado", description: "Abrindo formulário de dados da sua instituição."})} variant="secondary" className="mt-4">
              Simular para minha escola
            </AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  );
};
