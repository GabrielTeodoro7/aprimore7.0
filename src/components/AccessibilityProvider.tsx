import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type A11ySettings = {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  dyslexicFont: boolean;
  fontScale: number;
};

const DEFAULT: A11ySettings = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  dyslexicFont: false,
  fontScale: 1,
};

const KEY = "aprimore.a11y";

const Ctx = createContext<{
  settings: A11ySettings;
  set: <K extends keyof A11ySettings>(k: K, v: A11ySettings[K]) => void;
  reset: () => void;
} | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("a11y-contrast", settings.highContrast);
    root.classList.toggle("a11y-large", settings.largeText);
    root.classList.toggle("a11y-motion", settings.reduceMotion);
    root.classList.toggle("a11y-dyslexic", settings.dyslexicFont);
    root.style.fontSize = `${settings.fontScale * 100}%`;
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  return (
    <Ctx.Provider
      value={{
        settings,
        set: (k, v) => setSettings((s) => ({ ...s, [k]: v })),
        reset: () => setSettings(DEFAULT),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useA11y() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useA11y must be used inside AccessibilityProvider");
  return v;
}