import React from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from '@/design-system/AppCard';
import { AppBadge } from '@/design-system/AppBadge';
import { AppButton } from '@/design-system/AppButton';
import { 
  Users, 
  UserCheck, 
  MessageCircle, 
  Calendar, 
  Handshake, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast-hook";

export const FamilySchoolPortal = () => {
  const { toast } = useToast();
  
  const handleAction = (action: string) => {
    toast({
      title: "Ação Registrada",
      description: `Iniciando processo de "${action}" no portal da família.`,
    });
  };
  const updates = [
    { id: 1, student: 'Maria Oliveira', event: 'Nova conquista no PEI', date: 'Hoje', type: 'Pedagógico' },
    { id: 2, student: 'Maria Oliveira', event: 'Presença confirmada', date: 'Hoje', type: 'Frequência' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" /> Portal Família-Escola
        </h2>
        <AppBadge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          Espaço do Responsável
        </AppBadge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Últimas Atualizações</h3>
          {updates.map((u) => (
            <div key={u.id} onClick={() => handleAction(`Detalhes de ${u.student}`)} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-xs font-bold">{u.student}</p>
                  <span className="text-[10px] text-muted-foreground">{u.date}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{u.event}</p>
                <AppBadge className="mt-2 text-[9px] h-4" variant="secondary">{u.type}</AppBadge>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Comunicação Rápida</h3>
          <AppCard className="border-primary/20 bg-primary/5">
            <AppCardContent className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Envie uma mensagem direta para a coordenação pedagógica ou para o professor regente.
              </p>
              <div className="flex gap-2">
                <AppButton onClick={() => handleAction("Chat com Professor")} size="sm" className="flex-1 gap-2">
                  <MessageCircle className="h-3.5 w-3.5" /> Chat Direto
                </AppButton>
                <AppButton onClick={() => handleAction("Agendamento")} size="sm" variant="outline" className="flex-1 gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Agendar Reunião
                </AppButton>
              </div>
            </AppCardContent>
          </AppCard>

          <div onClick={() => handleAction("Autorizações")} className="p-3 rounded-lg border border-dashed flex items-center justify-between group cursor-pointer hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-bold italic">Autorizações Pendentes</p>
                <p className="text-[10px] text-muted-foreground">1 autorização de saída de campo.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
