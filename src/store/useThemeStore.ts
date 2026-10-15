import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ThemeMode, ACCENT_PRESETS, applyTheme } from '../styles/themeEngine';

interface ThemeState {
  themeMode: ThemeMode;
  accentColor: string;
  customAccentHex: string | null;

  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  setAccentColor: (color: string) => void;
  setCustomAccentHex: (hex: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'dark',
      accentColor: 'cyan',
      customAccentHex: null,

      setThemeMode: (mode) => {
        set({ themeMode: mode });
        const { accentColor, customAccentHex } = get();
        applyTheme(mode, customAccentHex || accentColor);
      },

      toggleThemeMode: () => {
        const nextMode: ThemeMode = get().themeMode === 'dark' ? 'light' : 'dark';
        set({ themeMode: nextMode });
        const { accentColor, customAccentHex } = get();
        applyTheme(nextMode, customAccentHex || accentColor);
      },

      setAccentColor: (color) => {
        set({ accentColor: color, customAccentHex: null });
        const { themeMode } = get();
        applyTheme(themeMode, color);
      },

      setCustomAccentHex: (hex) => {
        set({ customAccentHex: hex, accentColor: hex });
        const { themeMode } = get();
        applyTheme(themeMode, hex);
      },
    }),
    {
      name: 'nexus-theme-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.themeMode, state.customAccentHex || state.accentColor);
        }
      },
    }
  )
);
