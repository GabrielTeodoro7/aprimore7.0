import React, { createContext, useContext, useEffect, useState } from 'react';

export type AccessibilityProfile = 'none' | 'visual' | 'low-vision' | 'auditory' | 'adhd' | 'dyslexia' | 'motor';

interface AccessibilitySettings {
  profile: AccessibilityProfile;
  highContrast: boolean;
  focusMode: boolean;
  textToSpeech: boolean;
  reduceAnimations: boolean;
  fontSizeMultiplier: number; // 1 to 2
  dyslexicFont: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  profile: 'none',
  highContrast: false,
  focusMode: false,
  textToSpeech: false,
  reduceAnimations: false,
  fontSizeMultiplier: 1,
  dyslexicFont: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('accessibility-settings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar classes baseadas no perfil e configurações
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('focus-mode', settings.focusMode);
    root.classList.toggle('reduce-animations', settings.reduceAnimations);
    root.classList.toggle('dyslexic-font', settings.dyslexicFont);
    
    // Aplicar tamanho de fonte
    root.style.setProperty('--font-size-multiplier', settings.fontSizeMultiplier.toString());
    root.style.fontSize = `${16 * settings.fontSizeMultiplier}px`;

    // Lógica automática por perfil
    if (settings.profile === 'visual') {
      root.classList.add('high-contrast');
    } else if (settings.profile === 'adhd') {
      root.classList.add('focus-mode', 'reduce-animations');
    } else if (settings.profile === 'dyslexia') {
      root.classList.add('dyslexic-font');
    }
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      <div className={`accessibility-root profile-${settings.profile}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};
