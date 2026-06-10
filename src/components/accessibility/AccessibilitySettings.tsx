import React from 'react';
import { useAccessibility, AccessibilityProfile } from '@/contexts/AccessibilityContext';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from '@/design-system/AppCard';
import { AppButton } from '@/design-system/AppButton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Eye, 
  Ear, 
  Brain, 
  Type, 
  Move, 
  RotateCcw, 
  Highlighter, 
  ZapOff,
  Volume2
} from 'lucide-react';

export const AccessibilitySettings = () => {
  const { settings, updateSettings, resetSettings } = useAccessibility();

  const profiles: { id: AccessibilityProfile; label: string; icon: any; description: string }[] = [
    { id: 'none', label: 'Padrão', icon: Highlighter, description: 'Sem ajustes automáticos.' },
    { id: 'visual', label: 'Deficiência Visual', icon: Eye, description: 'Alto contraste e leitura de tela.' },
    { id: 'low-vision', label: 'Baixa Visão', icon: Type, description: 'Fontes maiores e mais nítidas.' },
    { id: 'auditory', label: 'Auditiva', icon: Ear, description: 'Foco em legendas e sinais visuais.' },
    { id: 'adhd', label: 'TDAH / Foco', icon: Brain, description: 'Modo foco e menos distrações.' },
    { id: 'dyslexia', label: 'Dislexia', icon: Type, description: 'Fonte adaptada para leitura.' },
    { id: 'motor', label: 'Motora', icon: Move, description: 'Botões maiores e cliques simples.' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1 rounded">♿</span> 
          Perfil de Acessibilidade
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <AppCard 
              key={p.id}
              className={`cursor-pointer transition-all border-2 ${settings.profile === p.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => updateSettings({ profile: p.id })}
            >
              <AppCardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
                <p.icon className={`h-6 w-6 ${settings.profile === p.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <AppCardTitle className="text-sm font-bold">{p.label}</AppCardTitle>
                  <AppCardDescription className="text-xs">{p.description}</AppCardDescription>
                </div>
              </AppCardHeader>
            </AppCard>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Ajustes de Visão</AppCardTitle>
          </AppCardHeader>
          <AppCardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="flex-1">Alto Contraste</Label>
              <Switch 
                id="high-contrast" 
                checked={settings.highContrast} 
                onCheckedChange={(v) => updateSettings({ highContrast: v })} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dyslexic-font" className="flex-1">Fonte para Dislexia</Label>
              <Switch 
                id="dyslexic-font" 
                checked={settings.dyslexicFont} 
                onCheckedChange={(v) => updateSettings({ dyslexicFont: v })} 
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Tamanho da Fonte</Label>
                <span className="text-xs font-bold">{Math.round(settings.fontSizeMultiplier * 100)}%</span>
              </div>
              <Slider 
                value={[settings.fontSizeMultiplier]} 
                min={1} 
                max={2} 
                step={0.1} 
                onValueChange={([v]) => updateSettings({ fontSizeMultiplier: v })} 
              />
            </div>
          </AppCardContent>
        </AppCard>

        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Ajustes de Foco e Som</AppCardTitle>
          </AppCardHeader>
          <AppCardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="focus-mode" className="flex items-center gap-2">
                  <ZapOff className="h-4 w-4" /> Modo Foco
                </Label>
                <p className="text-xs text-muted-foreground">Oculta distrações laterais.</p>
              </div>
              <Switch 
                id="focus-mode" 
                checked={settings.focusMode} 
                onCheckedChange={(v) => updateSettings({ focusMode: v })} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="text-to-speech" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" /> Leitura em Voz Alta
                </Label>
              </div>
              <Switch 
                id="text-to-speech" 
                checked={settings.textToSpeech} 
                onCheckedChange={(v) => updateSettings({ textToSpeech: v })} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduce-animations">Reduzir Animações</Label>
              <Switch 
                id="reduce-animations" 
                checked={settings.reduceAnimations} 
                onCheckedChange={(v) => updateSettings({ reduceAnimations: v })} 
              />
            </div>
          </AppCardContent>
        </AppCard>
      </section>

      <div className="flex justify-end gap-3">
        <AppButton variant="outline" onClick={resetSettings}>
          <RotateCcw className="h-4 w-4 mr-2" /> Restaurar Padrão
        </AppButton>
        <AppButton onClick={() => alert('Configurações salvas no perfil do aluno!')}>
          Salvar Alterações
        </AppButton>
      </div>
    </div>
  );
};
