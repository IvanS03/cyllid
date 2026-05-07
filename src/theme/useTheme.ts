// src/theme/useTheme.ts
// ─────────────────────────────────────────
// Hook para acceder a colores según modo oscuro/claro
// ─────────────────────────────────────────

import { useColorScheme } from 'react-native';
import { COLORS } from './index';
import { useAppStore } from '../store/useAppStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { themeMode } = useAppStore();

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  const palette = isDark ? COLORS.dark : COLORS.light;

  return {
    isDark,
    colors: {
      ...palette,
      primary: COLORS.primary,
      primaryLight: COLORS.primaryLight,
      primaryDark: COLORS.primaryDark,
      primarySurface: isDark ? '#2A1A4A' : COLORS.primarySurface,
      success: COLORS.success,
      warning: COLORS.warning,
      error: COLORS.error,
      info: COLORS.info,
      white: COLORS.white,
      black: COLORS.black,
      transparent: COLORS.transparent,
    },
  };
}
