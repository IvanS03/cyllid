// src/utils/storage.ts
// ─────────────────────────────────────────
// Capa de abstracción sobre AsyncStorage
// Manejo de persistencia de datos offline
// ─────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types';

const KEYS = {
  EXPENSES: '@gastos_app:expenses',
  SETTINGS: '@gastos_app:settings',
} as const;

// ── Gastos ────────────────────────────────

export async function loadExpenses(): Promise<Expense[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EXPENSES);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[Storage] Error cargando gastos:', err);
    return [];
  }
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('[Storage] Error guardando gastos:', err);
  }
}

export async function addExpenseToStorage(expense: Expense): Promise<Expense[]> {
  const current = await loadExpenses();
  // Insertar al inicio (más reciente primero)
  const updated = [expense, ...current];
  await saveExpenses(updated);
  return updated;
}

export async function updateExpenseInStorage(
  id: string,
  updates: Partial<Expense>
): Promise<Expense[]> {
  const current = await loadExpenses();
  const updated = current.map((e) =>
    e.id === id ? { ...e, ...updates } : e
  );
  await saveExpenses(updated);
  return updated;
}

export async function deleteExpenseFromStorage(id: string): Promise<Expense[]> {
  const current = await loadExpenses();
  const updated = current.filter((e) => e.id !== id);
  await saveExpenses(updated);
  return updated;
}

// ── Settings ─────────────────────────────

export async function loadSettings<T>(defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return defaultValue;
    return { ...defaultValue, ...JSON.parse(raw) };
  } catch {
    return defaultValue;
  }
}

export async function saveSettings(settings: object): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('[Storage] Error guardando settings:', err);
  }
}

// ── Debug / Dev ───────────────────────────

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.EXPENSES, KEYS.SETTINGS]);
}
