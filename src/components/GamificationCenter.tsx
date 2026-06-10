import React from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/design-system/AppCard';
import { AppBadge } from '@/design-system/AppBadge';
import { AppProgress } from '@/components/ui/progress';
import { Trophy, Star, Target, Award, Zap } from 'lucide-react';

export const GamificationCenter = () => {
  const achievements = [
    { id: 1, title: 'Frequência de Ouro', progress: 95, icon: Star, color: 'text-yellow-500' },
    { id: 2, title: 'Super Engajado', progress: 80, icon: Zap, color: 'text-orange-500' },
    { id: 3, title: 'Mestre da Inclusão', progress: 100, icon: Award, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" /> Centro de Conquistas
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">Nível 12</span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-primary" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <AppCard key={a.id} className="relative overflow-hidden group">
            {a.progress === 100 && (
              <div className="absolute top-2 right-2">
                <div className="h-4 w-4 bg-emerald-500 rounded-full animate-ping opacity-20" />
              </div>
            )}
            <AppCardHeader className="p-4 pb-0">
              <div className={`p-2 rounded-lg bg-muted w-fit mb-2 group-hover:scale-110 transition-transform ${a.color}`}>
                <a.icon className="h-5 w-5" />
              </div>
              <AppCardTitle className="text-sm">{a.title}</AppCardTitle>
            </AppCardHeader>
            <AppCardContent className="p-4 pt-2 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-muted-foreground">Progresso</span>
                <span>{a.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    a.progress === 100 ? 'bg-emerald-500' : 'bg-primary'
                  }`} 
                  style={{ width: `${a.progress}%` }} 
                />
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>

      <AppCard className="bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/10">
        <AppCardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Target className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Próximo Desafio: Mentor de Turma</p>
            <p className="text-xs text-muted-foreground leading-tight">Ajude 3 colegas a completarem seus PDIs este mês.</p>
          </div>
          <AppButton size="sm" variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">
            Aceitar
          </AppButton>
        </AppCardContent>
      </AppCard>
    </div>
  );
};
