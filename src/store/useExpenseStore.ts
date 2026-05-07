// src/store/useExpenseStore.ts
// ─────────────────────────────────────────
// Store principal de gastos con Zustand
// Persistencia automática en AsyncStorage
// ─────────────────────────────────────────

import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import uuid from 'react-native-uuid';
import { create } from 'zustand';
import { CATEGORY_CONFIG, CategoryKey } from '../theme';
import { Expense, ExpenseInput, MonthSummary } from '../types';
import {
  addExpenseToStorage,
  deleteExpenseFromStorage,
  loadExpenses,
  updateExpenseInStorage,
} from '../utils/storage';

export interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  isInitialized: boolean;

  // Acciones
  initialize: () => Promise<void>;
  addExpense: (input: ExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Selectores derivados
  getRecentExpenses: (limit?: number) => Expense[];
  getExpensesByMonth: (month: string) => Expense[]; // 'YYYY-MM'
  getMonthSummary: (month: string) => MonthSummary;
  getCurrentMonthSummary: () => MonthSummary;
  getExpensesByDateRange: (from: Date, to: Date) => Expense[];
  getExpenseById: (id: string) => Expense | undefined;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,
  isInitialized: false,

  // ── Inicialización ────────────────────────
  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const expenses = await loadExpenses();
      set({ expenses, isInitialized: true });
    } catch (err) {
      console.error('[Store] Error inicializando:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── CRUD ──────────────────────────────────
  addExpense: async (input: ExpenseInput) => {
    const now = new Date().toISOString();
    const expense: Expense = {
      id: uuid.v4() as string,
      amount: Number(input.amount.toFixed(2)),
      category: input.category,
      note: input.note?.trim() ?? '',
      date: input.date ?? now,
      createdAt: now,
    };

    // Optimistic update (UI instantáneo)
    set((state) => ({ expenses: [expense, ...state.expenses] }));

    // Persistir en background
    try {
      await addExpenseToStorage(expense);
    } catch (err) {
      // Revertir si falla
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== expense.id),
      }));
      throw err;
    }

    return expense;
  },

  updateExpense: async (id: string, updates: Partial<Expense>) => {
    const prev = get().expenses;

    // Optimistic update
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));

    try {
      await updateExpenseInStorage(id, updates);
    } catch (err) {
      // Revertir
      set({ expenses: prev });
      throw err;
    }
  },

  deleteExpense: async (id: string) => {
    const prev = get().expenses;

    // Optimistic update
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));

    try {
      await deleteExpenseFromStorage(id);
    } catch (err) {
      set({ expenses: prev });
      throw err;
    }
  },

  // ── Selectores ────────────────────────────
  getRecentExpenses: (limit = 20) => {
    return get().expenses.slice(0, limit);
  },

  getExpensesByMonth: (month: string) => {
    return get().expenses.filter((e) => {
      return format(parseISO(e.date), 'yyyy-MM') === month;
    });
  },

  getMonthSummary: (month: string): MonthSummary => {
    const expenses = get().getExpensesByMonth(month);

    const byCategory = {} as Record<CategoryKey, number>;
    // Inicializar todas las categorías en 0
    (Object.keys(CATEGORY_CONFIG) as CategoryKey[]).forEach((key) => {
      byCategory[key] = 0;
    });

    let total = 0;
    for (const e of expenses) {
      total += e.amount;
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
    }

    return {
      total: Number(total.toFixed(2)),
      byCategory,
      count: expenses.length,
      month,
    };
  },

  getCurrentMonthSummary: () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return get().getMonthSummary(currentMonth);
  },

  getExpensesByDateRange: (from: Date, to: Date) => {
    return get().expenses.filter((e) => {
      const date = parseISO(e.date);
      return isWithinInterval(date, { start: startOfMonth(from), end: endOfMonth(to) });
    });
  },

  getExpenseById: (id: string) => {
    return get().expenses.find((e) => e.id === id);
  },
}));
