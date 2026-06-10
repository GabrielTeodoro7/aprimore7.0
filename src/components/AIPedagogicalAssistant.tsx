import React, { useState } from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/design-system/AppCard';
import { AppButton } from '@/design-system/AppButton';
import { AppBadge } from '@/design-system/AppBadge';
import { Sparkles, Bot, BrainCircuit, Lightbulb, Wand2, X } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export const AIPedagogicalAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useAccessibility();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:scale-110 transition-transform animate-bounce"
        aria-label="Assistente Pedagógico IA"
      >
        <Bot className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-[350px] max-w-[90vw] animate-in slide-in-from-bottom-5">
      <AppCard className={`border-2 shadow-2xl ${settings.highContrast ? 'border-primary' : 'border-primary/20'}`}>
        <AppCardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 fill-current" />
            <AppCardTitle className="text-base font-bold italic">Aprimore IA</AppCardTitle>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </AppCardHeader>
        <AppCardContent className="p-4 space-y-4">
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
            <p className="text-xs font-medium text-primary flex items-center gap-1 mb-1">
              <Lightbulb className="h-3 w-3" /> Insight do Dia:
            </p>
            <p className="text-[11px] leading-relaxed italic text-muted-foreground">
              "Baseado nos últimos PEIs, 15% dos alunos com TDAH apresentaram melhor evolução com o uso do Modo Foco matinal."
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Ações de Inteligência</p>
            
            <button className="flex w-full items-center gap-3 rounded-md border p-2 text-left text-xs hover:bg-accent transition-colors">
              <div className="bg-blue-100 p-1.5 rounded text-blue-600"><BrainCircuit className="h-3 w-3" /></div>
              <div>
                <p className="font-bold">Adaptar Material</p>
                <p className="text-[10px] text-muted-foreground">Simplificar texto para Dislexia.</p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-md border p-2 text-left text-xs hover:bg-accent transition-colors">
              <div className="bg-purple-100 p-1.5 rounded text-purple-600"><Wand2 className="h-3 w-3" /></div>
              <div>
                <p className="font-bold">Gerar Metas SMART</p>
                <p className="text-[10px] text-muted-foreground">Auto-preencher novo plano PEI.</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t mt-4">
            <div className="flex-1 bg-muted h-8 rounded-full px-3 flex items-center text-[10px] text-muted-foreground italic">
              Pergunte algo ao assistente...
            </div>
            <AppButton size="sm" className="h-8 w-8 rounded-full p-0">
              <Sparkles className="h-3.5 w-3.5" />
            </AppButton>
          </div>
        </AppCardContent>
      </AppCard>
    </div>
  );
};
