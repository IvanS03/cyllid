// src/i18n/useTranslation.ts
// ─────────────────────────────────────────
// Hook principal de i18n — usar en todos los componentes
// ─────────────────────────────────────────

import { useI18nStore, t, tp, Language } from './index';

/**
 * Hook de traducción.
 *
 * @example
 *   const { t, tp, language, setLanguage } = useTranslation();
 *   t('common.save')                          → 'Guardar' | 'Save'
 *   tp('home.expenses_count', 3)              → '3 gastos' | '3 expenses'
 *   t('home.greeting_morning')                → '¡Buenos días! 👋' | 'Good morning! 👋'
 */
export function useTranslation() {
  const { language, setLanguage, isLoaded } = useI18nStore();

  return {
    /** Traduce una clave con soporte de interpolación */
    t: (key: string, vars?: Record<string, string | number>) =>
      t(key, language, vars),

    /** Traduce con plural (agrega _one o _other al key) */
    tp: (keyBase: string, count: number) =>
      tp(keyBase, count, language),

    /** Idioma activo */
    language,

    /** Cambiar idioma y persistir */
    setLanguage: (lang: Language) => setLanguage(lang),

    /** Si el sistema de idioma ya cargó */
    isLoaded,

    /** Helper: ¿está en español? */
    isSpanish: language === 'es',

    /** Helper: ¿está en inglés? */
    isEnglish: language === 'en',
  };
}
