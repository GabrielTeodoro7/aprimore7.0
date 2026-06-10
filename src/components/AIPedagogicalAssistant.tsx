import React, { useState, useEffect } from 'react';
import { AppCard, AppCardContent } from '@/design-system/AppCard';
import { AppButton } from '@/design-system/AppButton';
import { Bot, Sparkles, MessageSquare, Brain, Lightbulb, X, Wand2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast-hook";

export const AIPedagogicalAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Olá! Sou o Aprimore IA. Como posso ajudar com sua estratégia pedagógica hoje?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userPrompt = inputValue;
    const newUserMsg = { role: 'user' as const, content: userPrompt };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('pedagogical-ai', {
        body: { 
          prompt: userPrompt,
          context: "Usuário interagindo via Chatbot flutuante no Dashboard do Aprimore Educação."
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('AI Error:', error);
      toast({
        title: "Erro na IA",
        description: "Não consegui processar sua resposta agora. Tente novamente em instantes.",
        variant: "destructive"
      });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Ops, tive um pequeno problema técnico. Pode repetir a pergunta?" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante IA */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 bg-gradient-to-br from-primary to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 animate-bounce group"
      >
        <Bot className="h-8 w-8 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-black font-black">AI</span>
      </button>

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] md:w-[400px] h-[500px] bg-background border border-primary/20 rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-primary to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="font-bold">Aprimore IA Pedagogica</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 border border-border rounded-tl-none shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-border p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                  <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Peça uma sugestão de aula..."
                className="flex-1 bg-muted border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-primary h-10"
              />
              <AppButton size="icon" onClick={handleSend} className="rounded-full h-10 w-10">
                <Wand2 className="h-4 w-4" />
              </AppButton>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
              <button 
                onClick={() => setInputValue('Ideia de aula para TDAH')}
                className="whitespace-nowrap text-[10px] bg-muted hover:bg-primary/10 px-2 py-1 rounded-full transition-colors border border-border"
              >
                💡 Aula para TDAH
              </button>
              <button 
                onClick={() => setInputValue('Sugira um jogo de Lógica')}
                className="whitespace-nowrap text-[10px] bg-muted hover:bg-primary/10 px-2 py-1 rounded-full transition-colors border border-border"
              >
                🎮 Jogo de Lógica
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
