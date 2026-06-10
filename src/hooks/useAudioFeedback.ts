import { useEffect, useRef } from 'react';

// Sons suaves e amigáveis para feedback
const SOUNDS = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2013/success-win-gleam-2955.wav',
  star: 'https://assets.mixkit.co/active_storage/sfx/2018/magic-marimba-notif-2960.wav',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/pop-click-2568.wav',
  error: 'https://assets.mixkit.co/active_storage/sfx/2513/alert-2513.wav',
  buy: 'https://assets.mixkit.co/active_storage/sfx/2017/gold-coin-prize-2959.wav'
};

export function useAudioFeedback() {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Pré-carregar sons
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRefs.current[key] = audio;
    });
  }, []);

  const play = (key: keyof typeof SOUNDS) => {
    const audio = audioRefs.current[key];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn('Audio play blocked by browser policy', e));
    }
  };

  return {
    playSuccess: () => play('success'),
    playStar: () => play('star'),
    playClick: () => play('click'),
    playError: () => play('error'),
    playBuy: () => play('buy'),
  };
}
