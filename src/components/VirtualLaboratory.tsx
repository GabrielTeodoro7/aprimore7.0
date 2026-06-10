import React, { useState, useEffect } from 'react';
import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/design-system/AppCard';
import { AppButton } from '@/design-system/AppButton';
import { AppBadge } from '@/design-system/AppBadge';
import { 
  Dna, 
  Telescope, 
  Microscope, 
  FlaskConical, 
  Wind, 
  Zap, 
  Sparkles,
  Search,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const VirtualLaboratory = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSpecimen, setSelectedSpecimen] = useState<string | null>(null);

  const specimens = [
    { id: 'cell', name: 'Célula Animal', icon: Dna, color: 'text-blue-500', info: 'Observe o núcleo e as mitocôndrias.' },
    { id: 'planet', name: 'Marte (Solo)', icon: Telescope, color: 'text-orange-500', info: 'Análise de sedimentos e possíveis vestígios de água.' },
    { id: 'atom', name: 'Átomo de Oxigênio', icon: Zap, color: 'text-yellow-500', info: 'Visualize as camadas eletrônicas em movimento.' }
  ];

  const startScan = (id: string) => {
    setSelectedSpecimen(id);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent italic">
            LABORATÓRIO MULTIVERSO
          </h2>
          <p className="text-muted-foreground font-medium">Experimentação científica em realidade aumentada simulada.</p>
        </div>
        <AppBadge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1">
          <Sparkles className="h-3 w-3 mr-1" /> AMBIENTE EXPERIMENTAL
        </AppBadge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Esquerda: Lista de Amostras */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Search className="h-4 w-4" /> Amostras Disponíveis
          </h3>
          {specimens.map((s) => (
            <button
              key={s.id}
              onClick={() => startScan(s.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group ${
                selectedSpecimen === s.id 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                  : 'border-border hover:border-primary/30 bg-card'
              }`}
            >
              <div className={`p-3 rounded-xl bg-muted group-hover:scale-110 transition-transform ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">Clique para analisar</p>
              </div>
              <ArrowRight className={`h-4 w-4 transition-transform ${selectedSpecimen === s.id ? 'translate-x-1 text-primary' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Centro/Direita: Visualizador Holográfico */}
        <div className="lg:col-span-2 relative">
          <AppCard className="h-[450px] bg-slate-950 border-slate-800 overflow-hidden relative flex flex-col items-center justify-center border-4">
            {/* Grid Tech de fundo */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            
            {selectedSpecimen ? (
              <>
                {/* Holograma */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`relative mb-8 transition-all duration-1000 ${isScanning ? 'scale-150 blur-sm opacity-50' : 'scale-100'}`}>
                    {/* Efeito de brilho circular */}
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    
                    {specimens.find(s => s.id === selectedSpecimen)?.id === 'cell' && (
                       <Dna className="h-40 w-40 text-blue-400 animate-[spin_10s_linear_infinite] drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
                    )}
                    {specimens.find(s => s.id === selectedSpecimen)?.id === 'planet' && (
                       <Telescope className="h-40 w-40 text-orange-400 animate-bounce drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]" />
                    )}
                    {specimens.find(s => s.id === selectedSpecimen)?.id === 'atom' && (
                       <Zap className="h-40 w-40 text-yellow-400 animate-pulse drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                    )}
                  </div>

                  <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h4 className="text-2xl font-black text-white italic tracking-tighter">
                      {specimens.find(s => s.id === selectedSpecimen)?.name}
                    </h4>
                    <p className="text-primary/70 font-mono text-xs uppercase tracking-[0.2em]">
                      {isScanning ? '--- ESCANEANDO ESTRUTURA ---' : specimens.find(s => s.id === selectedSpecimen)?.info}
                    </p>
                  </div>
                </div>

                {/* UI de Scanner */}
                {isScanning && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary shadow-[0_0_20px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]" />
                )}

                {/* Dados Laterais Tech */}
                <div className="absolute top-6 left-6 text-[10px] font-mono text-emerald-500 space-y-1 opacity-60">
                  <p>COORD_X: 42.981</p>
                  <p>COORD_Y: 88.102</p>
                  <p>TEMP: -12.4°C</p>
                </div>
                <div className="absolute bottom-6 right-6 text-[10px] font-mono text-primary space-y-1 opacity-60 text-right">
                  <p>STB: 99.8%</p>
                  <p>RES: 8K_HDR</p>
                  <p>LINK: STABLE</p>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 opacity-40">
                <Microscope className="h-20 w-20 mx-auto text-slate-500" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Aguardando inserção de amostra...</p>
              </div>
            )}
          </AppCard>

          <div className="mt-4 flex gap-4">
             <AppButton className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 gap-2">
               <FlaskConical className="h-4 w-4" /> Realizar Reação Química
             </AppButton>
             <AppButton variant="outline" className="flex-1 gap-2 border-slate-700 hover:bg-slate-900">
               <ExternalLink className="h-4 w-4" /> Laboratório PHET
             </AppButton>
          </div>
        </div>
      </div>

      {/* Footer Criativo: Mural de Conquistas Globais */}
      <div className="bg-slate-950 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.3)] animate-pulse">
            <Crown className="h-12 w-12 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-2xl font-black text-white italic tracking-tight">O PRÓXIMO GÊNIO PODE SER VOCÊ</h3>
            <p className="text-slate-400 font-medium">Você já completou 85% dos desafios deste semestre. A medalha "Nobel Mirim" está a apenas 3 passos de distância!</p>
          </div>
          <AppButton className="bg-white text-black hover:bg-slate-100 font-black italic px-8 h-12 rounded-full transition-transform active:scale-95">
            REIVINDICAR POSIÇÃO
          </AppButton>
        </div>
      </div>
    </div>
  );
};

import { Crown } from 'lucide-react';
