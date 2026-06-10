import React from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/design-system/AppCard';
import { AppBadge } from '@/design-system/AppBadge';
import { AppButton } from '@/design-system/AppButton';
import { Trophy, Star, Target, Award, Zap, Users, Crown, Medal, TrendingUp } from 'lucide-react';

export const GamificationCenter = () => {
  const achievements = [
    { id: 1, title: 'Frequência de Ouro', progress: 95, icon: Star, color: 'text-yellow-500', level: 'Ouro' },
    { id: 2, title: 'Super Engajado', progress: 80, icon: Zap, color: 'text-orange-500', level: 'Prata' },
    { id: 3, title: 'Mestre da Inclusão', progress: 100, icon: Award, color: 'text-purple-500', level: 'Diamante' },
    { id: 4, title: 'Cientista Júnior', progress: 45, icon: Medal, color: 'text-emerald-500', level: 'Bronze' },
  ];

  const ranking = [
    { rank: 1, name: 'Lucas Silva', points: 12450, avatar: 'LS', trend: 'up' },
    { rank: 2, name: 'Beatriz Costa', points: 11820, avatar: 'BC', trend: 'down' },
    { rank: 3, name: 'Ana Oliveira', points: 10900, avatar: 'AO', trend: 'stable' },
    { rank: 4, name: 'Você', points: 9540, avatar: 'ME', trend: 'up', isUser: true },
    { rank: 5, name: 'Pedro Santos', points: 8200, avatar: 'PS', trend: 'stable' },
  ];

  const medals = [
    { id: 'm1', name: 'Primeiros Passos', date: '10/06', icon: '🌱' },
    { id: 'm2', name: 'Matemático Pro', date: '12/06', icon: '🔢' },
    { id: 'm3', name: 'Leitor Voraz', date: '15/06', icon: '📚' },
    { id: 'm4', name: 'Socializador', date: '18/06', icon: '🤝' },
  ];

  return (
    <div className="space-y-8">
      {/* Header com Nível Principal */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-2xl border border-primary/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Crown className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Nível 12</h2>
              <p className="text-muted-foreground font-medium">Lendário Aprendiz</p>
            </div>
          </div>
          <div className="flex-1 max-w-md w-full space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span>XP: 8.450 / 10.000</span>
              <span className="text-primary">84%</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-primary/10">
              <div className="w-[84%] h-full bg-gradient-to-r from-primary to-purple-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Achievements e Medalhas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" /> Suas Conquistas
            </h3>
            <AppButton variant="ghost" size="sm" className="text-xs">Ver Todas</AppButton>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((a) => (
              <AppCard key={a.id} className="relative overflow-hidden group border-primary/5 hover:border-primary/20 transition-all">
                <AppCardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-muted/50 ${a.color} group-hover:scale-110 transition-transform`}>
                    <a.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold leading-none">{a.title}</p>
                      <AppBadge variant="outline" className="text-[9px] px-1 py-0">{a.level}</AppBadge>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full transition-all duration-1000 ${a.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                        style={{ width: `${a.progress}%` }} 
                      />
                    </div>
                  </div>
                </AppCardContent>
              </AppCard>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Medal className="h-5 w-5 text-purple-500" /> Galeria de Medalhas
            </h3>
            <div className="flex flex-wrap gap-4">
              {medals.map((m) => (
                <div key={m.id} className="flex flex-col items-center gap-2 group cursor-help" title={`Ganha em ${m.date}`}>
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform shadow-sm group-hover:shadow-md border border-primary/5">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-bold text-center w-16 leading-tight">{m.name}</span>
                </div>
              ))}
              <div className="h-14 w-14 rounded-full border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground/30 text-xl">
                ?
              </div>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" /> Ranking da Turma
          </h3>
          <AppCard className="border-primary/10 shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {ranking.map((user) => (
                <div 
                  key={user.rank} 
                  className={`p-4 flex items-center gap-3 transition-colors ${user.isUser ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                >
                  <div className="w-6 text-center font-bold text-sm">
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold border border-primary/20">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${user.isUser ? 'text-primary' : ''}`}>
                      {user.name} {user.isUser && '(Você)'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{user.points} pts</p>
                  </div>
                  {user.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                </div>
              ))}
            </div>
            <div className="p-3 bg-muted/30 text-center">
              <AppButton variant="link" size="sm" className="text-xs h-auto p-0">Ver Ranking Global</AppButton>
            </div>
          </AppCard>

          <AppCard className="bg-emerald-500/5 border-emerald-500/20">
            <AppCardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-emerald-700">Modo Cooperativo</p>
                <p className="text-[10px] text-emerald-600">Junte-se a um grupo para ganhar 2x mais XP!</p>
              </div>
            </AppCardContent>
          </AppCard>
        </div>
      </div>
    </div>
  );
};
