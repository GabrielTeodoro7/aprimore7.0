import React, { useState, useEffect } from 'react';
import { AppCard, AppCardContent } from '@/design-system/AppCard';
import { AppBadge } from '@/design-system/AppBadge';
import { Wifi, WifiOff, RefreshCcw, CloudOff } from 'lucide-react';

export const OfflineStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[90] animate-in slide-in-from-left-5">
      <AppCard className="border-orange-500/50 bg-orange-50 shadow-lg">
        <AppCardContent className="flex items-center gap-3 p-3">
          <div className="bg-orange-100 p-2 rounded-full text-orange-600 animate-pulse">
            <WifiOff className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-orange-900">Modo Offline Ativo</p>
            <p className="text-[10px] text-orange-700 leading-none">Dados salvos localmente.</p>
          </div>
          <div className="flex h-6 w-px bg-orange-200 mx-1" />
          <AppBadge variant="secondary" className="bg-white/50 text-orange-700 text-[9px] border-orange-200">
            Sincronização Pendente
          </AppBadge>
        </AppCardContent>
      </AppCard>
    </div>
  );
};
