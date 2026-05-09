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
  date: string;
  createdAt: string;
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

// ── Ingresos ──────────────────────────────

export type IncomeSource =
  | 'salary'
  | 'freelance'
  | 'business'
  | 'investment'
  | 'gift'
  | 'other';

export interface Income {
  id: string;
  amount: number;
  source: IncomeSource;
  note: string;
  date: string;       // ISO string
  createdAt: string;  // ISO string
  recurrent: boolean; // ¿se repite cada mes?
}

export interface IncomeInput {
  amount: number;
  source: IncomeSource;
  note?: string;
  date?: string;
  recurrent?: boolean;
}

export interface MonthBalance {
  month: string;           // 'YYYY-MM'
  totalIncome: number;
  totalExpenses: number;
  balance: number;         // totalIncome - totalExpenses
  incomeCount: number;
  expenseCount: number;
  bySource: Record<IncomeSource, number>;
}

// ── Compartidos ───────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  themeMode: ThemeMode;
  currency: string;
  isPremium: boolean;
}

export interface ChartDataPoint {
  x: string;
  y: number;
  label: string;
  color: string;
}
