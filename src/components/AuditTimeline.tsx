import React from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/design-system/AppCard';
import { History, UserCircle, FileText, CheckCircle2 } from 'lucide-react';

export const AuditTimeline = () => {
  const events = [
    { id: 1, user: 'Gestor Carlos', action: 'Validou PEI', target: 'Maria Oliveira', time: '10/06/2026 14:30', icon: CheckCircle2, color: 'text-emerald-500' },
    { id: 2, user: 'Prof. Ana', action: 'Lançou Notas', target: 'Turma 7ºA', time: '10/06/2026 12:15', icon: FileText, color: 'text-blue-500' },
    { id: 3, user: 'Secretaria', action: 'Novo Cadastro', target: 'João Silva', time: '09/06/2026 16:45', icon: UserCircle, color: 'text-purple-500' },
  ];

  return (
    <AppCard>
      <AppCardHeader>
        <AppCardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" /> Timeline de Auditoria
        </AppCardTitle>
      </AppCardHeader>
      <AppCardContent>
        <div className="relative space-y-6 before:absolute before:left-2.5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
          {events.map((e) => (
            <div key={e.id} className="relative pl-8">
              <div className={`absolute left-0 top-1 rounded-full bg-background p-1 border ${e.color}`}>
                <e.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{e.action}</span>
                  <span className="text-[10px] text-muted-foreground">{e.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{e.user}</span> em {e.target}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AppCardContent>
    </AppCard>
  );
};
