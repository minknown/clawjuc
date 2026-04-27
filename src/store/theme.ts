import { create } from 'zustand';
import { ThemeName, ThemeConfig } from '@/lib/types';
import { THEME_CONFIGS } from '@/lib/mock-data';

interface ThemeState {
  currentTheme: ThemeName;
  availableThemes: ThemeConfig[];
  setTheme: (name: ThemeName) => void;
  getCurrentConfig: () => ThemeConfig;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: 'cyber-dark',
  availableThemes: THEME_CONFIGS,
  setTheme: (name: ThemeName) => {
    set({ currentTheme: name });
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', name);
    }
  },
  getCurrentConfig: () => {
    const state = get();
    return state.availableThemes.find((t) => t.name === state.currentTheme) || state.availableThemes[0];
  },
}));

export function applyThemeToDocument(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const c = theme.colors;
  root.style.setProperty('--theme-primary', c.primary);
  root.style.setProperty('--theme-primary-foreground', c.primaryForeground);
  root.style.setProperty('--theme-secondary', c.secondary);
  root.style.setProperty('--theme-secondary-foreground', c.secondaryForeground);
  root.style.setProperty('--theme-accent', c.accent);
  root.style.setProperty('--theme-accent-foreground', c.accentForeground);
  root.style.setProperty('--theme-background', c.background);
  root.style.setProperty('--theme-foreground', c.foreground);
  root.style.setProperty('--theme-card', c.card);
  root.style.setProperty('--theme-card-foreground', c.cardForeground);
  root.style.setProperty('--theme-border', c.border);
  root.style.setProperty('--theme-muted', c.muted);
  root.style.setProperty('--theme-muted-foreground', c.mutedForeground);
  root.style.setProperty('--theme-destructive', c.destructive);
  root.style.setProperty('--theme-success', c.success);
  root.style.setProperty('--theme-warning', c.warning);
  root.style.setProperty('--theme-info', c.info);
  root.style.setProperty('--theme-gradient', c.gradient);
  root.style.setProperty('--theme-glow', c.glow);
  root.style.setProperty('--is-dark', theme.name === 'minimal-light' ? '0' : '1');
}
