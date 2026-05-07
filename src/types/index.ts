// src/types/index.ts
// ─────────────────────────────────────────
// Tipos globales de la aplicación
// ─────────────────────────────────────────

import { CategoryKey } from '../theme';

export interface Expense {
  id: string;
  amount: number;
  category: CategoryKey;
  note: string;
  date: string; // ISO string
  createdAt: string; // ISO string
}

export interface ExpenseInput {
  amount: number;
  category: CategoryKey;
  note?: string;
  date?: string;
}

export interface MonthSummary {
  total: number;
  byCategory: Record<CategoryKey, number>;
  count: number;
  month: string; // 'YYYY-MM'
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  themeMode: ThemeMode;
  currency: string;
  isPremium: boolean;
}

// Para gráficas
export interface ChartDataPoint {
  x: string;
  y: number;
  label: string;
  color: string;
}
