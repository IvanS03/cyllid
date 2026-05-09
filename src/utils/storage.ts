// src/utils/storage.ts
// ─────────────────────────────────────────
// Capa de abstracción sobre AsyncStorage
// Gastos + Ingresos + Settings
// ─────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Income } from '../types';

const KEYS = {
  EXPENSES: '@gastos_app:expenses',
  INCOMES: '@gastos_app:incomes',
  SETTINGS: '@gastos_app:settings',
} as const;

// ── Gastos ────────────────────────────────

export async function loadExpenses(): Promise<Expense[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EXPENSES);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  try { await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses)); } catch { }
}

export async function addExpenseToStorage(expense: Expense): Promise<Expense[]> {
  const current = await loadExpenses();
  const updated = [expense, ...current];
  await saveExpenses(updated);
  return updated;
}

export async function updateExpenseInStorage(id: string, updates: Partial<Expense>): Promise<Expense[]> {
  const current = await loadExpenses();
  const updated = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
  await saveExpenses(updated);
  return updated;
}

export async function deleteExpenseFromStorage(id: string): Promise<Expense[]> {
  const current = await loadExpenses();
  const updated = current.filter((e) => e.id !== id);
  await saveExpenses(updated);
  return updated;
}

// ── Ingresos ──────────────────────────────

export async function loadIncomes(): Promise<Income[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.INCOMES);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function saveIncomes(incomes: Income[]): Promise<void> {
  try { await AsyncStorage.setItem(KEYS.INCOMES, JSON.stringify(incomes)); } catch { }
}

export async function addIncomeToStorage(income: Income): Promise<Income[]> {
  const current = await loadIncomes();
  const updated = [income, ...current];
  await saveIncomes(updated);
  return updated;
}

export async function updateIncomeInStorage(id: string, updates: Partial<Income>): Promise<Income[]> {
  const current = await loadIncomes();
  const updated = current.map((i) => (i.id === id ? { ...i, ...updates } : i));
  await saveIncomes(updated);
  return updated;
}

export async function deleteIncomeFromStorage(id: string): Promise<Income[]> {
  const current = await loadIncomes();
  const updated = current.filter((i) => i.id !== id);
  await saveIncomes(updated);
  return updated;
}

// ── Settings ─────────────────────────────

export async function loadSettings<T>(defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return defaultValue;
    return { ...defaultValue, ...JSON.parse(raw) };
  } catch { return defaultValue; }
}

export async function saveSettings(settings: object): Promise<void> {
  try { await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)); } catch { }
}

// ── Debug / Dev ───────────────────────────

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.EXPENSES, KEYS.INCOMES, KEYS.SETTINGS]);
}
