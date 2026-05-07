// src/store/useAppStore.ts
// ─────────────────────────────────────────
// Store de configuración de la app
// ─────────────────────────────────────────

import { create } from 'zustand';
import { AppSettings, ThemeMode } from '../types';
import { loadSettings, saveSettings } from '../utils/storage';

export interface AppState extends AppSettings {
  isSettingsLoaded: boolean;

  // Acciones
  initializeSettings: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => void;
  setCurrency: (currency: string) => void;
  setPremium: (isPremium: boolean) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  currency: '$',
  isPremium: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isSettingsLoaded: false,

  initializeSettings: async () => {
    const settings = await loadSettings<AppSettings>(DEFAULT_SETTINGS);
    set({ ...settings, isSettingsLoaded: true });
  },

  setThemeMode: (themeMode: ThemeMode) => {
    set({ themeMode });
    saveSettings({ ...get(), themeMode });
  },

  setCurrency: (currency: string) => {
    set({ currency });
    saveSettings({ ...get(), currency });
  },

  setPremium: (isPremium: boolean) => {
    set({ isPremium });
    saveSettings({ ...get(), isPremium });
  },
}));
