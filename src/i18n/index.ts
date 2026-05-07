// src/i18n/index.ts
// ─────────────────────────────────────────
// Motor de internacionalización (i18n)
// Soporta: Español (es) y English (en)
// Sin dependencias externas — liviano y offline
// ─────────────────────────────────────────

import { create } from 'zustand';
import { getLocales } from 'expo-localization';
import es, { TranslationKeys } from './es';
import en from './en';
import { saveSettings, loadSettings } from '../utils/storage';

// ── Tipos ─────────────────────────────────

export type Language = 'es' | 'en';

const TRANSLATIONS: Record<Language, TranslationKeys> = { es, en };

const LANG_STORAGE_KEY = 'app_language';

// ── Detección automática del idioma ───────

function detectSystemLanguage(): Language {
  try {
    const locales = getLocales();
    const code = locales[0]?.languageCode ?? 'es';
    return code === 'en' ? 'en' : 'es'; // Default ES para cualquier otro
  } catch {
    return 'es';
  }
}

// ── Store de idioma (Zustand) ─────────────

interface I18nState {
  language: Language;
  isLoaded: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  initLanguage: () => Promise<void>;
}

export const useI18nStore = create<I18nState>((set) => ({
  language: 'es',
  isLoaded: false,

  initLanguage: async () => {
    try {
      const saved = await loadSettings<{ language?: Language }>({});
      const lang = saved.language ?? detectSystemLanguage();
      set({ language: lang, isLoaded: true });
    } catch {
      set({ language: detectSystemLanguage(), isLoaded: true });
    }
  },

  setLanguage: async (lang: Language) => {
    set({ language: lang });
    await saveSettings({ language: lang });
  },
}));

// ── Función de traducción ─────────────────

/**
 * Obtiene una traducción usando notación de punto.
 * Soporta interpolación con {variable}.
 *
 * @example
 *   t('common.save', 'es')          → 'Guardar'
 *   t('home.expenses_count_other', 'es', { count: 5 }) → '5 gastos'
 */
export function t(
  key: string,
  language: Language = 'es',
  vars?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[language] ?? TRANSLATIONS.es;

  // Navegación por notación de punto
  const value = key.split('.').reduce<unknown>((obj, k) => {
    if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
    return undefined;
  }, dict);

  if (typeof value !== 'string') {
    // Fallback al español si no existe la clave en inglés
    const fallback = key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
      return undefined;
    }, TRANSLATIONS.es);

    if (typeof fallback === 'string') {
      return interpolate(fallback, vars);
    }

    // Key no encontrada — devolver la key para debug
    if (__DEV__) console.warn(`[i18n] Missing key: "${key}" (lang: ${language})`);
    return key;
  }

  return interpolate(value, vars);
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

// ── Helper para plural simple ─────────────

/**
 * Selecciona entre forma singular y plural basado en count.
 * Usa las claves `key_one` y `key_other`.
 *
 * @example
 *   tp('home.expenses_count', count, 'es') → '1 gasto' o '3 gastos'
 */
export function tp(
  keyBase: string,
  count: number,
  language: Language = 'es',
): string {
  const suffix = count === 1 ? 'one' : 'other';
  return t(`${keyBase}_${suffix}`, language, { count });
}
