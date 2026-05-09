// src/theme/index.ts
// ─────────────────────────────────────────
// Design System — Gastos App
// Color principal: #7119c3
// ─────────────────────────────────────────

export const COLORS = {
  // Brand
  primary: '#7119c3',
  primaryLight: '#9b4de0',
  primaryDark: '#520d94',
  primarySurface: '#f0e6ff',

  // Categorías
  food: '#FF6B6B',
  transport: '#4ECDC4',
  leisure: '#FFE66D',
  health: '#A8E6CF',
  shopping: '#FF8B94',
  other: '#C7C7C7',

  // Neutros — Modo claro
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceAlt: '#F4F0FA',
    border: '#EBEBEB',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B6B8D',
    textMuted: '#AEAEC2',
    divider: '#F0F0F5',
  },

  // Neutros — Modo oscuro
  dark: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceAlt: '#22223A',
    border: '#2E2E4A',
    textPrimary: '#F0F0FF',
    textSecondary: '#A0A0C0',
    textMuted: '#5A5A7A',
    divider: '#2A2A3E',
  },

  // Semánticos
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const CATEGORY_CONFIG = {
  food: {
    label: 'Comida',
    emoji: '🍔',
    color: COLORS.food,
    bgColor: '#FFF0F0',
    darkBgColor: '#3D1A1A',
  },
  transport: {
    label: 'Transporte',
    emoji: '🚌',
    color: COLORS.transport,
    bgColor: '#F0FFFE',
    darkBgColor: '#0F2E2C',
  },
  leisure: {
    label: 'Ocio',
    emoji: '🎮',
    color: '#D4A017',
    bgColor: '#FFFBF0',
    darkBgColor: '#2E2710',
  },
  health: {
    label: 'Salud',
    emoji: '💊',
    color: '#22A66A',
    bgColor: '#F0FFF8',
    darkBgColor: '#0F2E1E',
  },
  shopping: {
    label: 'Compras',
    emoji: '🛍️',
    color: COLORS.shopping,
    bgColor: '#FFF0F2',
    darkBgColor: '#3D1A1E',
  },
  other: {
    label: 'Otros',
    emoji: '📦',
    color: '#6B6B8D',
    bgColor: '#F5F5FA',
    darkBgColor: '#1E1E2E',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORY_CONFIG;

// ── Configuración de fuentes de ingreso ───

export const INCOME_SOURCE_CONFIG = {
  salary: {
    label: 'Salario',
    icon: 'briefcase',       // nombre del icono Lucide
    color: '#10B981',         // verde esmeralda
    bgColor: '#ECFDF5',
    darkBgColor: '#052e1a',
  },
  freelance: {
    label: 'Freelance',
    icon: 'laptop',
    color: '#6366F1',         // índigo
    bgColor: '#EEF2FF',
    darkBgColor: '#1e1b4b',
  },
  business: {
    label: 'Negocio',
    icon: 'building-2',
    color: '#F59E0B',         // ámbar
    bgColor: '#FFFBEB',
    darkBgColor: '#2d1f00',
  },
  investment: {
    label: 'Inversión',
    icon: 'trending-up',
    color: '#3B82F6',         // azul
    bgColor: '#EFF6FF',
    darkBgColor: '#0f1f4a',
  },
  gift: {
    label: 'Regalo',
    icon: 'gift',
    color: '#EC4899',         // rosa
    bgColor: '#FDF2F8',
    darkBgColor: '#3b0a26',
  },
  other: {
    label: 'Otro',
    icon: 'circle-dot',
    color: '#6B7280',         // gris
    bgColor: '#F9FAFB',
    darkBgColor: '#1f2937',
  },
} as const;

export type IncomeSourceKey = keyof typeof INCOME_SOURCE_CONFIG;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 36,
  display: 48,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#7119c3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#7119c3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7119c3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    shadowColor: '#7119c3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
};

// Animaciones
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 15,
    stiffness: 300,
    mass: 0.8,
  },
  springBouncy: {
    damping: 10,
    stiffness: 250,
    mass: 0.7,
  },
};
