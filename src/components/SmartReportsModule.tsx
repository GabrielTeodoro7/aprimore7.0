import React, { useState } from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/design-system/AppCard';
import { AppBadge } from '@/design-system/AppBadge';
import { AppButton } from '@/design-system/AppButton';
import { 
  FileText, 
  Download, 
  Share2, 
  Printer, 
  Clock, 
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast-hook";

export const SmartReportsModule = () => {
  const { toast } = useToast();
  const [reports] = useState([
    { id: 1, name: 'Desempenho por Turma', type: 'Pedagógico', date: 'Hoje', status: 'Pronto' },
    { id: 2, name: 'Frequência Consolidada', type: 'Administrativo', date: 'Ontem', status: 'Processando' },
    { id: 3, name: 'Relatório de Inclusão (PEI)', type: 'Assistivo', date: '10/06/2026', status: 'Pronto' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Central de Relatórios Inteligentes
        </h2>
        <div className="flex gap-2">
          <AppButton onClick={() => toast({title: "Filtros", description: "Abrindo painel de filtros avançados."})} variant="outline" size="sm" className="gap-1">
            <Filter className="h-3.5 w-3.5" /> Filtrar
          </AppButton>
          <AppButton onClick={() => toast({title: "Exportar", description: "Preparando todos os relatórios para download."})} size="sm" className="gap-1">
            <Download className="h-3.5 w-3.5" /> Exportar Todos
          </AppButton>
        </div>
      </div>

      <div className="grid gap-4">
        {reports.map((r) => (
          <AppCard key={r.id} className="hover:border-primary/30 transition-all group">
            <AppCardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none mb-1">{r.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    <span className="text-primary">{r.type}</span>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {r.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AppBadge variant={r.status === 'Pronto' ? 'success' : 'secondary'} className="text-[10px]">
                  {r.status}
                </AppBadge>
                <div className="h-8 w-px bg-border" />
                <div className="flex gap-1">
                  <AppButton onClick={() => toast({title: "Visualizar", description: `Visualizando relatório: ${r.name}`})} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Eye className="h-4 w-4" />
                  </AppButton>
                  <AppButton onClick={() => toast({title: "Imprimir", description: `Enviando para impressora: ${r.name}`})} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Printer className="h-4 w-4" />
                  </AppButton>
                  <AppButton onClick={() => toast({title: "Compartilhar", description: `Compartilhando relatório: ${r.name}`})} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Share2 className="h-4 w-4" />
                  </AppButton>
                </div>
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>

      <AppCard className="bg-gradient-to-r from-primary/5 to-transparent border-dashed">
        <AppCardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <Download className="h-6 w-6 text-primary animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold">Solicitar Relatório Customizado</h4>
              <p className="text-xs text-muted-foreground">A nossa IA pode cruzar dados específicos para você.</p>
            </div>
          </div>
          <AppButton onClick={() => toast({title: "Solicitação IA", description: "Conectando ao assistente pedagógico para relatório customizado."})} className="gap-2">
            Iniciar Solicitação <ChevronRight className="h-4 w-4" />
          </AppButton>
        </AppCardContent>
      </AppCard>
    </div>
  );
};
