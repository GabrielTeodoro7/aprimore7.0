import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast-hook";
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from '@/design-system/AppCard';
import { AppButton } from '@/design-system/AppButton';
import { AppBadge } from '@/design-system/AppBadge';
import { 
  Gamepad2, 
  Brain, 
  Calculator, 
  Languages, 
  Palette, 
  Dna, 
  Globe, 
  Sparkles,
  Play,
  ExternalLink,
  Bot
} from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

import { InternalMathGame } from './InternalMathGame';

interface Game {

  id: string;
  title: string;
  subject: string;
  description: string;
  icon: any;
  color: string;
  url: string;
  isExternal: boolean;
  difficulty: 'Iniciante' | 'Intermediário' | 'Mestre';
}

export const StudentGamesCenter = () => {
  const { toast } = useToast();
  const { settings } = useAccessibility();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeInternalGame, setActiveInternalGame] = useState<string | null>(null);


  const games: Game[] = [
    {
      id: 'math-1',
      title: 'Desafio das Operações',
      subject: 'Matemática',
      description: 'Resolva problemas matemáticos para avançar níveis e ganhar selos.',
      icon: Calculator,
      color: 'text-blue-500',
      url: 'internal-math',
      isExternal: false,

      difficulty: 'Iniciante'
    },
    {
      id: 'lang-1',
      title: 'Mestre da Gramática',
      subject: 'Português',
      description: 'Acerte a grafia correta e complete frases em um mundo de aventura.',
      icon: Languages,
      color: 'text-purple-500',
      url: 'https://www.escolagames.com.br/jogos/mestre-da-gramatica',
      isExternal: true,
      difficulty: 'Intermediário'
    },
    {
      id: 'sci-1',
      title: 'Célula Interativa',
      subject: 'Ciências',
      description: 'Explore o interior de uma célula e identifique suas partes.',
      icon: Dna,
      color: 'text-emerald-500',
      url: 'https://phet.colorado.edu/pt_BR/',
      isExternal: true,
      difficulty: 'Mestre'
    },
    {
      id: 'logic-1',
      title: 'Labirinto de Lógica',
      subject: 'Raciocínio',
      description: 'Use a lógica para encontrar a saída e coletar recompensas.',
      icon: Brain,
      color: 'text-orange-500',
      url: '#',
      isExternal: false,
      difficulty: 'Iniciante'
    },
    {
      id: 'geo-1',
      title: 'Explorador Global',
      subject: 'Geografia',
      description: 'Descubra capitais, bandeiras e marcos históricos do mundo.',
      icon: Globe,
      color: 'text-cyan-500',
      url: 'https://www.geoguessr.com/pt',
      isExternal: true,
      difficulty: 'Intermediário'
    },
    {
      id: 'art-1',
      title: 'Estúdio Criativo',
      subject: 'Artes',
      description: 'Aprenda sobre cores e estilos artísticos através da pintura digital.',
      icon: Palette,
      color: 'text-pink-500',
      url: '#',
      isExternal: false,
      difficulty: 'Iniciante'
    },
    {
      id: 'sci-2',
      title: 'Ecossistema em Equilíbrio',
      subject: 'Ciências',
      description: 'Gerencie recursos e espécies para manter um ecossistema saudável.',
      icon: Dna,
      color: 'text-green-600',
      url: 'https://phet.colorado.edu/pt_BR/simulations/natural-selection',
      isExternal: true,
      difficulty: 'Intermediário'
    },
    {
      id: 'math-2',
      title: 'Geometria Espacial',
      subject: 'Matemática',
      description: 'Identifique formas 3D e calcule volumes em um cenário futurista.',
      icon: Calculator,
      color: 'text-indigo-500',
      url: 'https://www.geogebra.org/3d?lang=pt',
      isExternal: true,
      difficulty: 'Mestre'
    },
    {
      id: 'hist-1',
      title: 'Linha do Tempo: Brasil',
      subject: 'História',
      description: 'Organize eventos históricos na ordem correta para desbloquear capítulos.',
      icon: Globe,
      color: 'text-amber-600',
      url: 'https://www.escolagames.com.br/jogos/linha-do-tempo',
      isExternal: true,
      difficulty: 'Iniciante'
    },
    {
      id: 'eng-1',
      title: 'Vocabulário Ninja',
      subject: 'Inglês',
      description: 'Corte as palavras corretas em inglês para vencer o torneio.',
      icon: Languages,
      color: 'text-red-500',
      url: 'https://www.gamestolearnenglish.com/',
      isExternal: true,
      difficulty: 'Intermediário'
    },
    {
      id: 'ai-creative-1',
      title: 'Desafio Criativo IA',
      subject: 'Artes/Lógica',
      description: 'Use prompts de texto para que a IA gere imagens e resolva desafios visuais.',
      icon: Sparkles,
      color: 'text-indigo-600',
      url: 'https://quickdraw.withgoogle.com/',
      isExternal: true,
      difficulty: 'Mestre'
    },
    {
      id: 'music-1',
      title: 'Ritmo & Melodia',
      subject: 'Música',
      description: 'Crie suas próprias composições musicais usando blocos de som interativos.',
      icon: Palette,
      color: 'text-orange-400',
      url: 'https://musiclab.chromeexperiments.com/Song-Maker/',
      isExternal: true,
      difficulty: 'Iniciante'
    }
  ];

  const categories = ['Todos', 'Matemática', 'Português', 'Inglês', 'Ciências', 'Geografia', 'História', 'Artes', 'Música', 'Raciocínio'];

  const filteredGames = selectedCategory === 'Todos' 
    ? games 
    : games.filter(g => g.subject === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gamepad2 className="h-7 w-7 text-primary" /> Arena de Aprendizagem
          </h2>
          <p className="text-muted-foreground">Aprenda brincando e conquiste novos níveis!</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 p-2 rounded-lg border border-primary/20">
          <Bot className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-xs font-bold text-primary italic">Aprimore IA sugere: "Desafio das Operações" para hoje!</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <AppButton 
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </AppButton>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeInternalGame === 'internal-math' && (
          <InternalMathGame onClose={() => setActiveInternalGame(null)} />
        )}

        {filteredGames.map((game) => (
          <AppCard key={game.id} className="group hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden flex flex-col">
            <div className={`h-2 w-full bg-current ${game.color}`} />
            <AppCardHeader className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg bg-muted ${game.color} group-hover:scale-110 transition-transform`}>
                  <game.icon className="h-6 w-6" />
                </div>
                <AppBadge variant="outline" className="text-[10px]">{game.difficulty}</AppBadge>
              </div>
              <AppCardTitle className="text-base">{game.title}</AppCardTitle>
              <AppBadge className="mt-1 text-[9px] h-4" variant="secondary">{game.subject}</AppBadge>
            </AppCardHeader>
            <AppCardContent className="p-4 pt-0 flex-1">
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {game.description}
              </p>
            </AppCardContent>
            <div className="p-4 pt-0 mt-auto">
              <AppButton 
                className="w-full gap-2 group/btn" 
                variant={game.isExternal ? "outline" : "default"}
                onClick={() => {
                  if (game.url === 'internal-math') {
                    setActiveInternalGame('internal-math');
                  } else if (game.url !== '#') {
                    window.open(game.url, '_blank');
                  }
                }}
              >

                {game.isExternal ? (
                  <>Jogar Externo <ExternalLink className="h-3.5 w-3.5" /></>
                ) : (
                  <>Iniciar <Play className="h-3.5 w-3.5 fill-current" /></>
                )}
              </AppButton>
            </div>
          </AppCard>
        ))}
      </div>

      <AppCard className="bg-gradient-to-r from-purple-500/10 via-primary/10 to-blue-500/10 border-primary/20">
        <AppCardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-white shadow-lg flex items-center justify-center animate-bounce">
            <Sparkles className="h-10 w-10 text-yellow-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold">Desafio Especial da IA</h3>
            <p className="text-sm text-muted-foreground">Complete 3 jogos de Matemática hoje e ganhe a Badge "Mestre dos Números"!</p>
          </div>
          <AppButton onClick={() => toast({title: "Desafio Aceito!", description: "Sua jornada rumo ao 'Mestre dos Números' começou!"})} className="bg-gradient-to-r from-purple-600 to-primary text-white border-none hover:opacity-90">
            Aceitar Desafio
          </AppButton>
        </AppCardContent>
      </AppCard>
    </div>
  );
};
