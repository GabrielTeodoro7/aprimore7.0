import React, { useState } from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/design-system/AppCard';
import { AppButton } from '@/design-system/AppButton';
import { AppBadge } from '@/design-system/AppBadge';
import { X, Maximize2, Minimize2, Trophy, Brain } from 'lucide-react';

interface MathGameProps {
  onClose: () => void;
}

export const InternalMathGame = ({ onClose }: MathGameProps) => {
  const [score, setScore] = useState(0);
  const [num1, setNum1] = useState(Math.floor(Math.random() * 10));
  const [num2, setNum2] = useState(Math.floor(Math.random() * 10));
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === num1 + num2) {
      setScore(score + 10);
      setFeedback('Correto! +10 pts');
      setTimeout(() => {
        setNum1(Math.floor(Math.random() * 10 + score/20));
        setNum2(Math.floor(Math.random() * 10 + score/20));
        setAnswer('');
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback('Tente novamente!');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <AppCard className="w-full max-w-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-2xl">
        <AppCardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <AppCardTitle className="text-xl text-white">Mestre do Cálculo</AppCardTitle>
              <div className="flex items-center gap-2 mt-1">
                <AppBadge className="bg-white/20 text-white border-none">Matemática</AppBadge>
                <div className="flex items-center gap-1 text-xs text-blue-100">
                  <Trophy className="h-3 w-3" /> Pontos: {score}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 rounded-full p-2 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </AppCardHeader>
        <AppCardContent className="p-12 flex flex-col items-center justify-center space-y-8">
          <div className="text-7xl font-black tracking-tighter animate-bounce">
            {num1} + {num2} = ?
          </div>
          
          <form onSubmit={checkAnswer} className="flex flex-col items-center gap-4 w-full max-w-xs">
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              autoFocus
              className="w-full bg-white/10 border-2 border-white/20 rounded-2xl h-20 text-4xl text-center outline-none focus:border-white/50 transition-all"
              placeholder="?"
            />
            <AppButton size="lg" className="w-full bg-white text-blue-700 hover:bg-blue-50 text-xl h-14 rounded-2xl font-bold">
              Responder
            </AppButton>
          </form>

          {feedback && (
            <div className={`text-xl font-bold animate-in zoom-in duration-300 ${feedback.includes('Correto') ? 'text-emerald-300' : 'text-orange-300'}`}>
              {feedback}
            </div>
          )}
        </AppCardContent>
      </AppCard>
    </div>
  );
};
