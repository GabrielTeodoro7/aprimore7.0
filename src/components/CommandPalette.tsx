import React, { useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Search, Command, Zap, User, GraduationCap, Settings as SettingsIcon, MessageSquare } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { settings } = useAccessibility();
  const navigate = useNavigate();

  const actions = [
    { id: 'dashboard', title: 'Ir para Dashboard', icon: Zap, action: () => navigate({ to: '/' }) },
    { id: 'alunos', title: 'Cadastrar Novo Aluno', icon: User, action: () => navigate({ to: '/alunos' }) },
    { id: 'pei', title: 'Gerenciar PEIs (Inclusão)', icon: GraduationCap, action: () => {} },
    { id: 'msgs', title: 'Ver Mensagens', icon: MessageSquare, action: () => {} },
    { id: 'acc', title: 'Configurar Acessibilidade', icon: SettingsIcon, action: () => {} },
  ];

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-0">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)} 
      />
      <div className={`relative w-full max-w-lg overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl transition-all ${settings.highContrast ? 'border-2 border-primary' : ''}`}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            autoFocus
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="O que você deseja fazer? (Esc para fechar)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
          ) : (
            <div className="space-y-1">
              {filteredActions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-left"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="flex-1 font-medium">{item.title}</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-50">Atalho</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t bg-muted/30 px-4 py-2 flex justify-between items-center">
           <p className="text-[10px] text-muted-foreground">Utilize as setas para navegar e Enter para selecionar.</p>
           <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
             <Command className="h-3 w-3" /> + K
           </div>
        </div>
      </div>
    </div>
  );
};
