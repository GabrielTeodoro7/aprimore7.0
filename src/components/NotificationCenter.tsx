import React, { useState, useEffect } from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/design-system/AppCard';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AppBadge } from '@/design-system/AppBadge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationCenter = () => {
  const [notifications] = useState([
    { id: 1, type: 'info', title: 'Novo Aviso', message: 'Reunião de pais agendada para sexta-feira.', time: '10 min atrás' },
    { id: 2, type: 'warning', title: 'Alerta de Frequência', message: 'Aluno João Silva atingiu 15% de faltas.', time: '1 hora atrás' },
    { id: 3, type: 'success', title: 'PEI Atualizado', message: 'Plano de Maria Oliveira foi validado pelo gestor.', time: '2 horas atrás' },
  ]);

  return (
    <AppCard className="w-full max-w-sm shadow-xl">
      <AppCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <AppCardTitle className="text-sm font-bold flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notificações
        </AppCardTitle>
        <AppBadge variant="secondary">{notifications.length}</AppBadge>
      </AppCardHeader>
      <AppCardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3 border-b pb-3 last:border-0">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  n.type === 'warning' ? 'bg-orange-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
                <div className="space-y-1">
                  <p className="text-xs font-bold leading-none">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{n.message}</p>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground pt-1">
                    <Clock className="h-2 w-2" /> {n.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </AppCardContent>
    </AppCard>
  );
};
